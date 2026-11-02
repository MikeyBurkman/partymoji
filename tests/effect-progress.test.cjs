const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');

// Run the real TypeScript modules without a bundler or test framework. Transpile
// to CommonJS so require() can substitute selected dependencies; all other imports
// use Node's normal loader. The VM isolates each module's exports and globals.
function load(file, dependencies) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    output,
    {
      exports,
      require: (name) => dependencies[name] ?? require(name),
      setTimeout,
      clearTimeout,
    },
    { filename: file },
  );
  return exports;
}

const logger = { debug() {}, info() {} };
// Give the test control over when an asynchronous computation finishes. Until
// resolve() is called, the pipeline must leave this effect in its active state.
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
// Allow promise callbacks and the pipeline's timer-based browser yield to run.
// This is a short scheduling window, not a guarantee that all work has finished.
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));
const result = (id) => ({
  gif: id,
  image: { id, frames: [], dimensions: [120, 120] },
});
const stateFor = () => ({
  baseImage: result('source'),
  fps: 20,
  effects: ['first', 'second', 'third'].map((effectName) => ({
    effectName,
    paramsValues: [1],
    state: { status: 'init' },
  })),
});

// Replace expensive image processing with a controllable computation while
// keeping the real sequencing, progress publication, and state-diff logic.
// Both execution paths use the same fake, with IS_DEV selecting runEffects.
function pipeline(computeGif) {
  return load('src/domain/computeGifs.ts', {
    './run': { runEffects: computeGif },
    './runAsync': { runEffectsAsync: computeGif },
    './utils/isMobile': { IS_MOBILE: false },
    './utils': {
      IS_DEV: true,
      logger,
      miscUtil: {
        assert: assert.ok,
        replaceIndex: (items, index, replace) =>
          items.map((item, i) => (i === index ? replace(item) : item)),
      },
    },
  });
}

test('publishes each result before subsequent effects finish, preserving snapshots', async () => {
  // One deferred job per effect lets us inspect progress between completions,
  // rather than only checking the final state after the entire pipeline resolves.
  const jobs = [deferred(), deferred(), deferred()];
  const inputs = [];
  const { computeGifsForState } = pipeline((args) => {
    inputs.push(args);
    return jobs[inputs.length - 1].promise;
  });
  const state = stateFor();
  const progress = [];
  const run = computeGifsForState({
    state,
    startEffectIndex: 0,
    onProgress: (s) => progress.push(s),
  });
  await tick();
  assert.ok(
    progress.length > 0,
    'must publish progress before the first result',
  );
  assert.equal(
    progress
      .at(-1)
      .effects.map((e) => e.state.status)
      .join(','),
    'computing,queued,queued',
  );
  // Finish only the first job: its GIF should already be available while the
  // second job is unresolved, and its output must become the second job's input.
  jobs[0].resolve(result('first-result'));
  await tick();
  assert.equal(
    progress
      .at(-1)
      .effects.map((e) => e.state.status)
      .join(','),
    'done,computing,queued',
  );
  assert.equal(progress.at(-1).effects[0].state.image.gif, 'first-result');
  assert.equal(inputs[1].image.id, 'first-result');
  // Publishing later progress must not mutate snapshots React may still hold,
  // or the caller's original state.
  assert.equal(
    progress[0].effects[0].state.status,
    'computing',
    'prior snapshots must stay immutable',
  );
  assert.equal(
    state.effects[0].state.status,
    'init',
    'input state must stay immutable',
  );
  jobs[1].resolve(result('second-result'));
  await tick();
  assert.equal(
    progress
      .at(-1)
      .effects.map((e) => e.state.status)
      .join(','),
    'done,done,computing',
  );
  jobs[2].resolve(result('third-result'));
  const finished = await run;
  assert.equal(
    finished.effects.map((e) => e.state.status).join(','),
    'done,done,done',
  );
});

test('retains upstream results when starting partway through the pipeline', async () => {
  const inputs = [];
  const { computeGifsForState } = pipeline(async (args) => {
    inputs.push(args);
    return result(args.effectInput.effectName);
  });
  const state = stateFor();
  state.effects[0].state = { status: 'done', image: result('cached') };
  const progress = [];
  const finished = await computeGifsForState({
    state,
    startEffectIndex: 1,
    onProgress: (s) => progress.push(s),
  });
  assert.ok(progress.length > 0);
  assert.equal(inputs.length, 2);
  assert.equal(inputs[0].image.id, 'cached');
  assert.equal(finished.effects[0], state.effects[0]);
  assert.ok(progress.every((s) => s.effects[0] === state.effects[0]));
});

test('restarts an unfinished prefix in an edit captured before the latest progress', () => {
  const { getStateDiff } = pipeline(() => {});
  const prevState = stateFor();
  prevState.effects[0].state = {
    status: 'done',
    image: result('first-result'),
  };
  // Simulate an edit built from an older render: the latest state has finished
  // effect zero, but the edit still carries its earlier "computing" snapshot.
  const currState = {
    ...prevState,
    effects: prevState.effects.map((effect, index) =>
      index === 0 ? { ...effect, state: { status: 'computing' } } : effect,
    ),
  };
  currState.effects[1] = { ...currState.effects[1], paramsValues: [2] };
  // Restart at the unfinished prefix; starting at the edited effect would try
  // to read an upstream result that is absent from this proposed state.
  assert.equal(getStateDiff({ prevState, currState }).index, 0);
});

test('ignores superseded progress and completion, and supports cancellation', async () => {
  const { useProcessingQueue } = load('src/components/useProcessingQueue.tsx', {
    '~/domain/utils': { logger },
  });
  const jobs = [];
  const progress = [];
  const completed = [];
  let queue;
  // A server render provides a real React hook context without a DOM. The
  // captured callbacks and refs are enough to test run identity; this does not
  // exercise rerenders, effect cleanup, or browser painting.
  function Probe() {
    queue = useProcessingQueue({
      processFn: (_args, report) => {
        const job = { ...deferred(), report };
        jobs.push(job);
        return job.promise;
      },
      onProgress: (s) => progress.push(s),
      onComplete: (s) => completed.push(s),
    });
    return null;
  }
  renderToString(React.createElement(Probe));
  // Keep both runs in flight and report from both. Once the new run starts,
  // neither progress nor completion from the old run may reach the consumer.
  queue.compute('old');
  queue.compute('new');
  jobs[0].report('old progress');
  jobs[1].report('new progress');
  jobs[0].resolve('old result');
  jobs[1].resolve('new result');
  await tick();
  assert.deepEqual(progress, ['new progress']);
  assert.deepEqual(completed, ['new result']);
  // Cancellation must invalidate the active run even without a replacement.
  queue.compute('cancelled');
  queue.cancel();
  jobs[2].report('cancelled progress');
  jobs[2].resolve('cancelled result');
  await tick();
  assert.deepEqual(progress, ['new progress']);
  assert.deepEqual(completed, ['new result']);
});
