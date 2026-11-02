import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasElement } from '~/domain/utils/CanvasElement';
import { useDebounce } from '~/domain/utils/useDebounce';
import type { CanvasData, Coord } from '~/domain/types';

// React requires this flag for tests that flush rendering with act().
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Returning a Promise selects React's async act overload and flushes effects.
function flushReact(callback: () => void): Promise<void> {
  return act(() => {
    callback();
    return Promise.resolve();
  });
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await flushReact(() => {
    root.unmount();
  });
  host.remove();
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('updates the local value immediately and emits only the last value after the default delay', async () => {
    vi.useFakeTimers();
    let current = '';
    let update: (value: string) => void = () => {
      throw new Error('Hook not mounted');
    };
    const emitted: Array<string> = [];
    function Harness() {
      [current, update] = useDebounce({
        value: 'initial',
        onChange: (value) => {
          emitted.push(value);
        },
      });
      return <span>{current}</span>;
    }
    await flushReact(() => {
      root.render(<Harness />);
    });
    expect(host.textContent).toBe('initial');
    await flushReact(() => {
      update('first');
    });
    await flushReact(() => vi.advanceTimersByTime(100));
    await flushReact(() => {
      update('last');
    });
    expect(host.textContent).toBe('last');
    await flushReact(() => vi.advanceTimersByTime(199));
    expect(emitted).toEqual([]);
    await flushReact(() => vi.advanceTimersByTime(1));
    expect(emitted).toEqual(['last']);
  });

  it('accepts external value changes without emitting onChange and honors a custom delay', async () => {
    vi.useFakeTimers();
    const emitted: Array<number> = [];
    let update: (value: number) => void = () => {
      throw new Error('Hook not mounted');
    };
    function Harness({ value }: { value: number }) {
      const [local, setLocal] = useDebounce({
        value,
        debounceMillis: 50,
        onChange: (next) => {
          emitted.push(next);
        },
      });
      update = setLocal;
      return <span>{local}</span>;
    }
    await flushReact(() => {
      root.render(<Harness value={1} />);
    });
    await flushReact(() => {
      root.render(<Harness value={2} />);
    });
    expect(host.textContent).toBe('2');
    await flushReact(() => vi.advanceTimersByTime(100));
    expect(emitted).toEqual([]);
    await flushReact(() => {
      update(3);
    });
    await flushReact(() => vi.advanceTimersByTime(49));
    expect(emitted).toEqual([]);
    await flushReact(() => vi.advanceTimersByTime(1));
    expect(emitted).toEqual([3]);
  });
});

describe('CanvasElement', () => {
  it('mounts a usable canvas once and updates dimensions and cursor on rerender', async () => {
    const mounts: Array<CanvasData> = [];
    const onCanvasMount = (data: CanvasData) => {
      mounts.push(data);
    };
    await flushReact(() => {
      root.render(
        <CanvasElement
          width={3}
          height={2}
          cursorIsPointer
          onCanvasMount={onCanvasMount}
        />,
      );
    });
    const canvas = host.querySelector('canvas');
    if (!canvas) throw new Error('Canvas not mounted');
    expect(canvas.width).toBe(3);
    expect(canvas.height).toBe(2);
    expect(canvas.style.cursor).toBe('pointer');
    expect(mounts).toHaveLength(1);
    expect(mounts[0].canvas).toBe(canvas);
    mounts[0].ctx.fillStyle = '#FF0000';
    mounts[0].ctx.fillRect(0, 0, 1, 1);
    expect(Array.from(mounts[0].ctx.getImageData(0, 0, 1, 1).data)).toEqual([
      255, 0, 0, 255,
    ]);
    await flushReact(() => {
      root.render(
        <CanvasElement
          width={4}
          height={5}
          onCanvasMount={(data) => {
            mounts.push(data);
          }}
        />,
      );
    });
    expect(mounts).toHaveLength(1);
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(5);
    expect(canvas.style.cursor).toBe('');
  });

  it('defers mouse callbacks and reports canvas-relative coordinates in event order', async () => {
    vi.useFakeTimers();
    const events: Array<[string, Coord]> = [];
    await flushReact(() => {
      root.render(
        <CanvasElement
          width={100}
          height={100}
          onCanvasMount={() => undefined}
          onMouseDown={(coord) => {
            events.push(['down', coord]);
          }}
          onMouseMove={(coord) => {
            events.push(['move', coord]);
          }}
          onMouseUp={(coord) => {
            events.push(['up', coord]);
          }}
          onMouseLeave={(coord) => {
            events.push(['leave', coord]);
          }}
        />,
      );
    });
    const canvas = host.querySelector('canvas');
    if (!canvas) throw new Error('Canvas not mounted');
    const rect = canvas.getBoundingClientRect();
    for (const type of ['mousedown', 'mousemove', 'mouseup', 'mouseout']) {
      canvas.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          clientX: rect.left + 12,
          clientY: rect.top + 34,
        }),
      );
    }
    expect(events).toEqual([]);
    await flushReact(() => vi.runAllTimers());
    expect(events).toEqual([
      ['down', [12, 34]],
      ['move', [12, 34]],
      ['up', [12, 34]],
      ['leave', [12, 34]],
    ]);
  });
});
