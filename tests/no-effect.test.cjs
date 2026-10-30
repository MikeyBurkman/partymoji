const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { transpileModule, ModuleKind } = require('typescript');

// Isolate the browser/worker rendering boundary so these tests run in Node.
function loadModule(render) {
  const filename = resolve(__dirname, '../src/domain/computeGifs.ts');
  const { outputText } = transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ModuleKind.CommonJS },
  });
  const dependencies = {
    './run': { runEffects: render },
    './runAsync': { runEffectsAsync: render },
    './utils/isMobile': { IS_MOBILE: false },
    './utils': {
      IS_DEV: true,
      logger: { debug() {} },
      miscUtil: { assert: (value, message) => assert.ok(value, message) },
    },
  };
  const module = { exports: {} };
  new Function('require', 'exports', outputText)((name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, module.exports);
  return module.exports;
}

const loadCompute = (render) => loadModule(render).computeGifsForState;

const source = {
  image: {
    dimensions: [1, 1],
    frames: [new Uint8ClampedArray([1, 2, 3, 128])],
  },
  gif: 'source.gif',
  partiallyTransparent: true,
  gifWithBackgroundColor: 'source-preview.gif',
};
const pending = (effectName) => ({
  effectName,
  paramsValues: [],
  state: { status: 'init' },
});
const stateWith = (effects) => ({
  version: 9,
  baseImage: source,
  fps: 20,
  frameCount: 1,
  effects,
});

for (const status of ['init', 'computing']) {
  test(`prepending an unfinished empty row (${status}) computes from the state diff`, async () => {
    const { computeGifsForState, getStateDiff } = loadModule(() =>
      assert.fail('Empty rows must skip rendering'),
    );
    const completed = {
      ...pending(null),
      state: { status: 'done', image: source },
    };
    const previousState = stateWith([completed]);
    const state = stateWith([
      { ...pending(null), state: { status } },
      completed,
    ]);
    const diff = getStateDiff({ currState: state, prevState: previousState });
    assert.deepEqual(diff, { changed: true, index: 0 });
    const result = await computeGifsForState({
      state,
      previousState,
      startEffectIndex: diff.index,
    });
    assert.ok(result.effects.every((effect) => effect.state.status === 'done'));
    assert.equal(result.effects[0].state.image, source);
    assert.equal(result.effects[1].state.image, source);
  });
}

test('consecutive no effects reuse the source result without rendering', async () => {
  const compute = loadCompute(() =>
    assert.fail('No effect must skip rendering'),
  );
  const result = await compute({
    state: stateWith([pending(null), pending(null)]),
    startEffectIndex: 0,
  });
  for (const effect of result.effects) {
    assert.equal(effect.state.status, 'done');
    assert.equal(effect.state.image, source);
  }
});

test('a no effect in the middle passes the previous result to the next renderer', async () => {
  const previous = {
    ...source,
    image: { dimensions: [2, 1], frames: [new Uint8ClampedArray(8)] },
    gif: 'previous.gif',
  };
  const rendered = { ...source, gif: 'rendered.gif' };
  const compute = loadCompute(async ({ image, effectInput }) => {
    assert.equal(image, previous.image);
    assert.equal(effectInput.effectName, 'Party');
    return rendered;
  });
  const completed = {
    ...pending('Party'),
    state: { status: 'done', image: previous },
  };
  const result = await compute({
    state: stateWith([completed, pending(null), pending('Party')]),
    startEffectIndex: 1,
  });
  assert.equal(result.effects[0], completed);
  assert.equal(result.effects[1].state.image, previous);
  assert.equal(result.effects[2].state.image, rendered);
});

for (const index of [0, 1]) {
  test(`inserting an empty entry at index ${index} reuses completed results`, async () => {
    const firstResult = {
      ...source,
      image: { ...source.image },
      gif: 'first.gif',
    };
    const secondResult = {
      ...source,
      image: { ...source.image },
      gif: 'second.gif',
    };
    const first = {
      ...pending('Party'),
      state: { status: 'done', image: firstResult },
    };
    const second = {
      ...pending('Blur'),
      state: { status: 'done', image: secondResult },
    };
    const previousState = stateWith([first, second]);
    const compute = loadCompute(() =>
      assert.fail('Unchanged effects must not render'),
    );
    const effects = [first, second];
    effects.splice(index, 0, pending(null));
    const result = await compute({
      previousState,
      state: stateWith(effects),
      startEffectIndex: index,
    });
    assert.equal(
      result.effects[index].state.image,
      index === 0 ? source : firstResult,
    );
    assert.equal(result.effects[index === 0 ? 1 : 0].state.image, firstResult);
    assert.equal(result.effects[2].state.image, secondResult);
  });
}

for (const change of ['fps', 'frameCount', 'source', 'params', 'upstream']) {
  test(`completed effects render again when ${change} changes`, async () => {
    const oldResult = { ...source, image: { ...source.image }, gif: 'old.gif' };
    const freshResult = {
      ...source,
      image: { ...source.image },
      gif: 'fresh.gif',
    };
    const completed = {
      ...pending('Party'),
      state: { status: 'done', image: oldResult },
    };
    const previousState = stateWith([completed]);
    const state = stateWith([pending(null), completed]);
    if (change === 'fps') state.fps = 30;
    if (change === 'frameCount') state.frameCount = 2;
    if (change === 'source')
      state.baseImage = {
        ...source,
        image: { ...source.image },
        gif: 'new-source.gif',
      };
    if (change === 'params')
      state.effects[1] = {
        ...completed,
        paramsValues: [42],
        state: { status: 'computing' },
      };
    if (change === 'upstream') state.effects[0] = pending('Blur');
    const compute = loadCompute(async () => freshResult);
    const result = await compute({ previousState, state, startEffectIndex: 0 });
    assert.equal(result.effects[1].state.image, freshResult);
  });
}

for (const format of ['png', 'jpeg', 'gif']) {
  test(`empty rows with a ${format} upload cannot export an unencoded source`, async () => {
    const { computeGifsForState, getGifForExport } = loadModule(() =>
      assert.fail('Empty rows must skip rendering'),
    );
    const state = {
      ...stateWith([pending(null), pending(null)]),
      baseImage: { ...source, gif: `data:image/${format};base64,original` },
      fps: 30,
      frameCount: 2,
    };
    const result = await computeGifsForState({ state, startEffectIndex: 0 });
    assert.equal(result.effects[1].state.image, state.baseImage);
    assert.equal(getGifForExport(result), null);
  });
}

test('GIF export uses an encoded effect result through trailing empty rows', async () => {
  const encoded = { ...source, gif: 'data:image/gif;base64,encoded' };
  const { computeGifsForState, getGifForExport } = loadModule(async () => encoded);
  const result = await computeGifsForState({
    state: stateWith([pending(null), pending('Party'), pending(null)]),
    startEffectIndex: 0,
  });
  assert.equal(getGifForExport(result), encoded.gif);
});

test('GIF export is unavailable without rows or while any row is unfinished', () => {
  const { getGifForExport } = loadModule();
  const completed = {
    ...pending('Party'),
    state: { status: 'done', image: source },
  };
  assert.equal(getGifForExport(stateWith([])), null);
  assert.equal(getGifForExport(stateWith([completed, pending(null)])), null);
  assert.equal(getGifForExport(stateWith([pending('Party'), completed])), null);
});
