import { describe, expect, it } from 'vitest';
import seedrandom from 'seedrandom';
import type { Color, Coord, Image } from '~/domain/types';
import * as imageUtil from '~/domain/utils/image';

const red: Color = [255, 0, 0, 255];
const green: Color = [0, 255, 0, 255];
const blue: Color = [0, 0, 255, 255];

function sample(): Image {
  return {
    dimensions: [2, 2],
    frames: [
      new Uint8ClampedArray([...red, ...green, ...blue, 10, 20, 30, 64]),
    ],
  };
}

describe('pixel access', () => {
  it('uses row-major RGBA indexing and returns independent color arrays', () => {
    const image = sample();
    expect(imageUtil.getImageIndex(image.dimensions, 1, 1)).toBe(12);
    const pixel = imageUtil.getPixel({ image, frameIndex: 0, coord: [0, 1] });
    expect(pixel).toEqual(blue);
    pixel[0] = 12;
    expect(Array.from(image.frames[0].slice(8, 12))).toEqual(blue);
  });

  it.each<Coord>([
    [-1, 0],
    [0, -1],
    [2, 0],
    [0, 2],
  ])('returns transparent black for out-of-bounds coordinates %j', (x, y) => {
    const image = sample();
    expect(
      imageUtil.getPixelFromSource(image.dimensions, image.frames[0], [x, y]),
    ).toEqual([0, 0, 0, 0]);
  });

  it('sets only the selected pixel and clamps and rounds channel values', () => {
    const image = sample();
    imageUtil.setPixel({
      image,
      frameIndex: 0,
      coord: [1, 0],
      color: [-1, 300, 2.5, 3.5],
    });
    expect(Array.from(image.frames[0])).toEqual([
      ...red,
      0,
      255,
      2,
      4,
      ...blue,
      10,
      20,
      30,
      64,
    ]);
  });
});

describe('coordinate and frame mapping', () => {
  it('visits coordinates row by row and provides independently retainable coordinates', () => {
    const coords: Array<Coord> = [];
    const frame = imageUtil.mapCoords([2, 2], (coord) => {
      coords.push(coord);
      return [coord[0], coord[1], 0, 255];
    });
    expect(coords).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
    expect(new Set(coords).size).toBe(4);
    expect(Array.from(frame)).toEqual([
      0, 0, 0, 255, 1, 0, 0, 255, 0, 1, 0, 255, 1, 1, 0, 255,
    ]);
  });

  it.each([
    { input: [-100, 300, 2.5, 3.5], expected: [0, 255, 2, 4] },
    { input: [NaN, Infinity, -Infinity, 127.5], expected: [0, 255, 0, 128] },
    { input: [0.5, 1.5, 254.5, 255.5], expected: [0, 2, 254, 255] },
  ])('clamps and rounds mapped channels: $input', ({ input, expected }) => {
    expect(
      Array.from(imageUtil.mapCoords([1, 1], () => input as Color)),
    ).toEqual(expected);
  });

  it('does not invoke the mapper for empty dimensions', () => {
    expect(
      imageUtil.mapCoords([0, 3], () => {
        throw new Error('unexpected callback');
      }),
    ).toHaveLength(0);
  });

  it('passes each source frame, index, and total to mapFrames in order', () => {
    const image: Image = {
      dimensions: [1, 1],
      frames: [new Uint8ClampedArray(red), new Uint8ClampedArray(blue)],
    };
    const seen: Array<number> = [];
    const result = imageUtil.mapFrames(image, (frame, index, count) => {
      seen.push(index, count);
      return new Uint8ClampedArray([frame[0], frame[1], frame[2], index]);
    });
    expect(seen).toEqual([0, 2, 1, 2]);
    expect(result.dimensions).toBe(image.dimensions);
    expect(result.frames.map((frame) => Array.from(frame))).toEqual([
      [255, 0, 0, 0],
      [0, 0, 255, 1],
    ]);
    expect(image.frames.map((frame) => Array.from(frame))).toEqual([red, blue]);
  });

  it('mapImage exposes the correct source frame and metadata without mutating input', async () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [
        new Uint8ClampedArray([...red, ...green]),
        new Uint8ClampedArray([...blue, ...red]),
      ],
    };
    const original = image.frames.map((frame) => Array.from(frame));
    const random = seedrandom('mapping');
    const parameters = { amount: 7 };
    const retained: Array<
      Parameters<Parameters<typeof imageUtil.mapImage>[0]>[0]
    > = [];
    const effect = imageUtil.mapImage<typeof parameters>((args) => {
      retained.push(args);
      expect(args.image).toBe(image);
      expect(args.random).toBe(random);
      expect(args.parameters).toBe(parameters);
      expect(args.dimensions).toBe(image.dimensions);
      expect(args.getSrcPixel([-1, 0])).toEqual([0, 0, 0, 0]);
      return args.getSrcPixel([1 - args.coord[0], 0]);
    });
    const result = await effect({ image, random, parameters });
    expect(result.frames.map((frame) => Array.from(frame))).toEqual([
      [...green, ...red],
      [...red, ...blue],
    ]);
    expect(
      retained.map(({ frameIndex, frameCount, animationProgress, coord }) => [
        frameIndex,
        frameCount,
        animationProgress,
        ...coord,
      ]),
    ).toEqual([
      [0, 2, 0, 0, 0],
      [0, 2, 0, 1, 0],
      [1, 2, 0.5, 0, 0],
      [1, 2, 0.5, 1, 0],
    ]);
    expect(retained[0].getSrcPixel([0, 0])).toEqual(red);
    expect(retained[2].getSrcPixel([0, 0])).toEqual(blue);
    expect(image.frames.map((frame) => Array.from(frame))).toEqual(original);
    expect(result.frames[0]).not.toBe(image.frames[0]);
  });

  it('precomputes once per frame before mapping and keeps computed values frame-specific', async () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [
        new Uint8ClampedArray([...red, ...green]),
        new Uint8ClampedArray([...blue, ...red]),
      ],
    };
    const events: Array<string> = [];
    const effect = imageUtil.mapImageWithPrecompute<null, { alpha: number }>(
      ({ frameIndex, frameCount, animationProgress }) => {
        events.push(`compute ${frameIndex}`);
        expect(frameCount).toBe(2);
        expect(animationProgress).toBe(frameIndex / 2);
        return { alpha: 100 + frameIndex };
      },
      ({ computed, frameIndex, coord, getSrcPixel }) => {
        events.push(`pixel ${frameIndex}:${coord[0]}`);
        const [r, g, b] = getSrcPixel(coord);
        return [r, g, b, computed.alpha];
      },
    );
    const result = await effect({
      image,
      random: seedrandom('precompute'),
      parameters: null,
    });
    expect(events).toEqual([
      'compute 0',
      'pixel 0:0',
      'pixel 0:1',
      'compute 1',
      'pixel 1:0',
      'pixel 1:1',
    ]);
    expect(result.frames.map((frame) => Array.from(frame))).toEqual([
      [255, 0, 0, 100, 0, 255, 0, 100],
      [0, 0, 255, 101, 255, 0, 0, 101],
    ]);
  });

  it('preserves seeded random consumption in frame then row order', async () => {
    const effect = imageUtil.mapImage<null>(({ random }) => [
      Math.floor(random() * 256),
      0,
      0,
      255,
    ]);
    const result = await effect({
      image: sample(),
      random: seedrandom('hello.'),
      parameters: null,
    });
    expect(Array.from(result.frames[0])).toEqual([
      237, 0, 0, 255, 96, 0, 0, 255, 187, 0, 0, 255, 60, 0, 0, 255,
    ]);
  });
});

describe('image allocation and frame counts', () => {
  it('creates zero-filled, independent frames', () => {
    const image = imageUtil.createNewImage({
      dimensions: [2, 1],
      frameCount: 2,
    });
    expect(image.frames.map((frame) => Array.from(frame))).toEqual([
      Array(8).fill(0),
      Array(8).fill(0),
    ]);
    image.frames[0][0] = 123;
    expect(image.frames[1][0]).toBe(0);
    expect(
      imageUtil.createNewImage({ dimensions: [2, 1], frameCount: 0 }).frames,
    ).toEqual([]);
  });

  it('duplicates frame buffers without aliasing the source', () => {
    const image = sample();
    const copy = imageUtil.duplicateImage(image);
    expect(copy).toEqual(image);
    copy.frames[0][0] = 12;
    expect(image.frames[0][0]).toBe(255);
    expect(copy.dimensions).toBe(image.dimensions);
  });

  it('resamples frame references and returns the original image when the count matches', () => {
    const frames = [0, 1, 2, 3].map(
      (value) => new Uint8ClampedArray([value, 0, 0, 255]),
    );
    const image: Image = { dimensions: [1, 1], frames };
    expect(imageUtil.changeFrameCount(image, 4)).toBe(image);
    expect(imageUtil.changeFrameCount(image, 2).frames).toEqual([
      frames[0],
      frames[2],
    ]);
    const expanded = imageUtil.changeFrameCount(image, 6);
    expect(expanded.frames.map((frame) => frame[0])).toEqual([
      0, 0, 1, 2, 2, 3,
    ]);
    expect(expanded.frames[0]).toBe(frames[0]);
    expect(imageUtil.changeFrameCount(image, 0).frames).toEqual([]);
  });
});

describe('pixel predicates', () => {
  it('scans only the declared pixels of a typed-array view', () => {
    const bytes = new Uint8ClampedArray([
      0, 0, 0, 0, 10, 20, 30, 255, 0, 0, 0, 64,
    ]);
    const image: Image = { dimensions: [1, 1], frames: [bytes.subarray(4)] };
    expect(imageUtil.hasTransparentPixels(image)).toBe(false);
    expect(imageUtil.isPartiallyTransparent(image)).toBe(false);
    image.frames[0][3] = 64;
    expect(imageUtil.isPartiallyTransparent(image)).toBe(true);
    image.frames[0][3] = 63;
    expect(imageUtil.hasTransparentPixels(image)).toBe(true);
    expect(bytes[7]).toBe(63);
  });

  it('does not classify missing alpha bytes in a truncated frame as transparent', () => {
    const image: Image = {
      dimensions: [2, 1],
      frames: [new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60])],
    };
    expect(imageUtil.hasTransparentPixels(image)).toBe(false);
    expect(imageUtil.isPartiallyTransparent(image)).toBe(false);
  });

  it('somePixel visits columns first and stops at the first matching pixel', () => {
    const visited: Array<Color> = [];
    expect(
      imageUtil.somePixel(sample(), (pixel) => {
        visited.push(pixel);
        return pixel[2] === 255;
      }),
    ).toBe(true);
    expect(visited).toEqual([red, blue]);
  });

  it('somePixel visits all frames and gives callbacks independent colors', () => {
    const image = sample();
    image.frames.push(new Uint8ClampedArray(image.frames[0]));
    const colors: Array<Color> = [];
    expect(
      imageUtil.somePixel(image, (pixel) => {
        colors.push(pixel);
        pixel[0] = 0;
        return false;
      }),
    ).toBe(false);
    expect(colors).toHaveLength(8);
    expect(new Set(colors).size).toBe(8);
    expect(image.frames[0][0]).toBe(255);
  });

  it.each([
    [0, true, false],
    [63, true, false],
    [64, false, true],
    [127, false, true],
    [128, false, false],
    [255, false, false],
  ])(
    'classifies alpha %i at both thresholds',
    (alpha, transparent, partial) => {
      const image: Image = {
        dimensions: [1, 1],
        frames: [new Uint8ClampedArray([1, 2, 3, Number(alpha)])],
      };
      expect(imageUtil.hasTransparentPixels(image)).toBe(transparent);
      expect(imageUtil.isPartiallyTransparent(image)).toBe(partial);
    },
  );

  it('finds transparency in the final pixel of a later frame', () => {
    const image = sample();
    image.frames[0][15] = 255;
    image.frames.push(new Uint8ClampedArray(image.frames[0]));
    image.frames[1][15] = 63;
    expect(imageUtil.hasTransparentPixels(image)).toBe(true);
    expect(imageUtil.isPartiallyTransparent(image)).toBe(false);
    image.frames[1][15] = 64;
    expect(imageUtil.hasTransparentPixels(image)).toBe(false);
    expect(imageUtil.isPartiallyTransparent(image)).toBe(true);
  });

  it('returns false for empty images', () => {
    for (const image of [
      { dimensions: [1, 1], frames: [] },
      { dimensions: [0, 0], frames: [new Uint8ClampedArray()] },
    ] satisfies Array<Image>) {
      expect(imageUtil.hasTransparentPixels(image)).toBe(false);
      expect(imageUtil.isPartiallyTransparent(image)).toBe(false);
    }
  });
});
