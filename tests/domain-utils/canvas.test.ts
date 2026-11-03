import { describe, expect, it } from 'vitest';
import type { Color, Image } from '~/domain/types';
import * as canvas from '~/domain/utils/canvas';
import { resizeImage, scaleImage } from '~/domain/utils/image';

const red: Color = [255, 0, 0, 255];
const green: Color = [0, 255, 0, 255];
const blue: Color = [0, 0, 255, 255];
const clear: Color = [0, 0, 0, 0];

describe('real canvas pixel conversion', () => {
  it('uses OffscreenCanvas inside a real worker and round-trips its pixels', async () => {
    const worker = new Worker(new URL('./canvas.worker.ts', import.meta.url), {
      type: 'module',
    });
    try {
      const result = await new Promise<unknown>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<unknown>) => {
          resolve(event.data);
        };
        worker.onerror = (event) => {
          reject(new Error(event.message));
        };
        worker.postMessage(null);
      });
      expect(result).toEqual({
        isWorker: true,
        isOffscreen: true,
        pixels: [255, 0, 0, 255, 0, 0, 0, 0],
      });
    } finally {
      worker.terminate();
    }
  });

  it('round-trips opaque and transparent pixels with independent readbacks', () => {
    const input = new Uint8ClampedArray([...red, ...clear, ...blue, ...green]);
    const data = canvas.frameToCanvas({ dimensions: [2, 2], frame: input });
    expect(data.canvas.width).toBe(2);
    expect(data.canvas.height).toBe(2);
    const output = canvas.canvasToFrame(data);
    expect(Array.from(output)).toEqual([...red, ...clear, ...blue, ...green]);
    output[0] = 1;
    expect(canvas.canvasToFrame(data)[0]).toBe(255);
    expect(input[0]).toBe(255);
  });

  it('drawImageOnCanvas respects transforms and preserves existing pixels', () => {
    const data = canvas.frameToCanvas({
      dimensions: [2, 1],
      frame: new Uint8ClampedArray([...blue, ...clear]),
    });
    canvas.applyTransform(data, { horizontalTranslation: 1 });
    canvas.drawImageOnCanvas({
      ctx: data.ctx,
      dimensions: [1, 1],
      frame: new Uint8ClampedArray(red),
    });
    expect(Array.from(canvas.canvasToFrame(data))).toEqual([...blue, ...red]);
  });

  it('restores preEffect state before postEffect and leaves source pixels untouched', () => {
    const input = new Uint8ClampedArray([...red, ...clear, ...clear]);
    const events: Array<string> = [];
    const result = canvas.applyCanvasFromFrame({
      dimensions: [3, 1],
      frame: input,
      preEffect: (data) => {
        events.push('pre');
        canvas.applyTransform(data, { horizontalTranslation: 1 });
      },
      postEffect: (data) => {
        events.push('post');
        data.ctx.fillStyle = '#0000FF';
        data.ctx.fillRect(0, 0, 1, 1);
      },
    });
    expect(events).toEqual(['pre', 'post']);
    expect(Array.from(result)).toEqual([...blue, ...red, ...clear]);
    expect(Array.from(input)).toEqual([...red, ...clear, ...clear]);
  });

  it('does not leak canvas filters or pixels between calls', () => {
    const first = canvas.applyCanvasFromFrame({
      dimensions: [1, 1],
      frame: new Uint8ClampedArray(red),
      preEffect: (data) => {
        canvas.applyFilter(data, { invert: 100 });
      },
    });
    const second = canvas.applyCanvasFromFrame({
      dimensions: [1, 1],
      frame: new Uint8ClampedArray(clear),
    });
    expect(Array.from(first)).toEqual([0, 255, 255, 255]);
    expect(Array.from(second)).toEqual(clear);
  });

  it('combines frames without changing their source buffers', () => {
    const background = new Uint8ClampedArray([...blue, ...blue]);
    const foreground = new Uint8ClampedArray([...clear, ...red]);
    const combined = canvas.combineImages({
      dimensions: [2, 1],
      background,
      foreground,
    });
    expect(Array.from(combined)).toEqual([...blue, ...red]);
    expect(Array.from(background)).toEqual([...blue, ...blue]);
    expect(Array.from(foreground)).toEqual([...clear, ...red]);
  });

  it('mutates an explicitly supplied background canvas and composites partial alpha', () => {
    const background = canvas.frameToCanvas({
      dimensions: [1, 1],
      frame: new Uint8ClampedArray(blue),
    });
    const foreground = canvas.frameToCanvas({
      dimensions: [1, 1],
      frame: new Uint8ClampedArray([255, 0, 0, 128]),
    });
    expect(
      Array.from(
        canvas.combineImages({ dimensions: [1, 1], background, foreground }),
      ),
    ).toEqual([128, 0, 127, 255]);
    expect(Array.from(canvas.canvasToFrame(background))).toEqual([
      128, 0, 127, 255,
    ]);
    expect(Array.from(canvas.canvasToFrame(foreground))).toEqual([
      255, 0, 0, 128,
    ]);
  });

  it('applies scale and rotation around the canvas center', () => {
    const data = canvas.createCanvas([4, 2]);
    expect(canvas.applyScale(data, [2, 3])).toBe(data);
    expect(Array.from(data.ctx.getTransform().toFloat64Array())).toEqual([
      2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
    const rotated = canvas.createCanvas([4, 2]);
    canvas.applyRotation(rotated, 90);
    const transform = rotated.ctx.getTransform();
    expect(transform.a).toBeCloseTo(0);
    expect(transform.b).toBeCloseTo(-1);
    expect(transform.c).toBeCloseTo(1);
    expect(transform.d).toBeCloseTo(0);
    expect(transform.e).toBeCloseTo(1);
    expect(transform.f).toBeCloseTo(3);
  });
});

describe('resizing and scaling', () => {
  it('returns the new dimensions for an empty image without creating frames', () => {
    expect(
      resizeImage({
        image: { dimensions: [0, 0], frames: [] },
        newWidth: 0,
        newHeight: 0,
        keepScale: true,
      }),
    ).toEqual({ dimensions: [0, 0], frames: [] });
  });

  it('centers pixels when expanding without scaling and keeps frames independent', () => {
    const image: Image = {
      dimensions: [1, 1],
      frames: [new Uint8ClampedArray(red), new Uint8ClampedArray(clear)],
    };
    const result = resizeImage({
      image,
      newWidth: 3,
      newHeight: 3,
      keepScale: false,
    });
    expect(result.dimensions).toEqual([3, 3]);
    expect(Array.from(result.frames[0])).toEqual([
      ...clear,
      ...clear,
      ...clear,
      ...clear,
      ...red,
      ...clear,
      ...clear,
      ...clear,
      ...clear,
    ]);
    expect(Array.from(result.frames[1])).toEqual(Array(36).fill(0));
    expect(Array.from(result.frames[0].slice(16, 20))).toEqual(red);
    expect(Array.from(image.frames[0])).toEqual(red);
  });

  it('crops from the center when shrinking without scaling', () => {
    const image: Image = {
      dimensions: [3, 1],
      frames: [new Uint8ClampedArray([...red, ...green, ...blue])],
    };
    const result = resizeImage({
      image,
      newWidth: 1,
      newHeight: 1,
      keepScale: false,
    });
    expect(Array.from(result.frames[0])).toEqual(green);
  });

  it('scales successive opaque and transparent frames without leaking pixels or buffers', () => {
    const image: Image = {
      dimensions: [1, 1],
      frames: [
        new Uint8ClampedArray(red),
        new Uint8ClampedArray(clear),
        new Uint8ClampedArray(blue),
      ],
    };
    const result = resizeImage({
      image,
      newWidth: 2,
      newHeight: 2,
      keepScale: true,
    });
    expect(result.frames.map((frame) => Array.from(frame))).toEqual([
      [...red, ...red, ...red, ...red],
      [...clear, ...clear, ...clear, ...clear],
      [...blue, ...blue, ...blue, ...blue],
    ]);
    result.frames[0][0] = 12;
    expect(result.frames[2][0]).toBe(0);
    expect(image.frames.map((frame) => Array.from(frame))).toEqual([
      red,
      clear,
      blue,
    ]);
  });

  it('identity resize and scale produce new frames without changing pixel values', () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [new Uint8ClampedArray([...red, ...blue])],
    };
    for (const result of [
      resizeImage({ image, newWidth: 2, newHeight: 1, keepScale: true }),
      scaleImage({ image }),
    ]) {
      expect(result).toEqual(image);
      expect(result.frames[0]).not.toBe(image.frames[0]);
    }
  });

  it('scales around the center rather than the origin', () => {
    const image: Image = {
      dimensions: [4, 1],
      frames: [new Uint8ClampedArray([...red, ...red, ...red, ...red])],
    };
    expect(
      Array.from(scaleImage({ image, horizontalScale: 0.5 }).frames[0]),
    ).toEqual([...clear, ...red, ...red, ...clear]);
  });
});
