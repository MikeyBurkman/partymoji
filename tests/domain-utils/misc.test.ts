import { describe, expect, it } from 'vitest';
import type { BezierTuple } from '~/domain/types';
import * as misc from '~/domain/utils/misc';

describe('numeric utilities', () => {
  it('clamps boundaries and retains fractional values', () => {
    expect([-2, 0, 2.5, 10, 12].map((n) => misc.clamp(n, 0, 10))).toEqual([
      0, 0, 2.5, 10, 10,
    ]);
    expect(misc.clamp(NaN, 0, 10)).toBeNaN();
  });

  it('weights values at endpoints, between them, and beyond them', () => {
    expect(
      [0, 25, 100, 150].map((percent) => misc.weightedValue(percent, 20, 100)),
    ).toEqual([20, 40, 100, 140]);
  });

  it('measures angles in all quadrants and Euclidean distance', () => {
    expect(misc.calculateAngle([0, 0], [1, 0])).toBe(0);
    expect(misc.calculateAngle([0, 0], [0, 1])).toBe(90);
    expect(misc.calculateAngle([0, 0], [-1, 0])).toBe(180);
    expect(misc.calculateAngle([0, 0], [0, -1])).toBe(270);
    expect(misc.pointDistance([-1, -1], [2, 3])).toBe(5);
  });
});

describe('Bézier evaluation', () => {
  it('retains old evaluators after many different curves and does not mix mirrored wrappers', () => {
    const points: BezierTuple = [
      [1 / 3, 0],
      [2 / 3, 0],
    ];
    const retained = misc.bezierCurve(points);
    const mirrored = misc.bezierCurve(points, true);
    for (let i = 0; i < 100; i++) {
      // x(t) = t; y(t) has control points (0, 0), (1/3, 0),
      // (2/3, i/100), (1, 1), hence y(1/2) = 3/8*i/100 + 1/8.
      const curve = misc.bezierCurve([
        [1 / 3, 0],
        [2 / 3, i / 100],
      ]);
      expect(curve(0.5)).toBeCloseTo((0.375 * i) / 100 + 0.125, 10);
    }
    expect(retained(0.5)).toBeCloseTo(0.125, 10);
    expect(mirrored(0.5)).toBe(1);
    expect(
      misc.bezierCurve([
        [1 / 3, 0],
        [2 / 3, 0],
      ])(0.5),
    ).toBeCloseTo(0.125, 10);
  });

  it('evaluates linear and mirrored curves at endpoints and midpoints', () => {
    const linear = misc.bezierCurve(misc.LINEAR_BEZIER);
    const mirror = misc.bezierCurve(misc.LINEAR_BEZIER, true);
    expect([0, 0.25, 0.5, 0.75, 1].map(linear)).toEqual([
      0, 0.25, 0.5, 0.75, 1,
    ]);
    expect([0, 0.25, 0.5, 0.75, 1].map(mirror)).toEqual([0, 0.5, 1, 0.5, 0]);
  });

  it('evaluates a nonlinear curve against hand-derived values', () => {
    // x(t) = t and y(t) = t^3 for these control points.
    const curve = misc.bezierCurve([
      [1 / 3, 0],
      [2 / 3, 0],
    ]);
    expect(curve(0)).toBe(0);
    expect(curve(0.25)).toBeCloseTo(0.015625, 10);
    expect(curve(0.5)).toBeCloseTo(0.125, 10);
    expect(curve(0.75)).toBeCloseTo(0.421875, 10);
    expect(curve(1)).toBe(1);
  });

  it('captures control-point values at creation but observes edits on later calls', () => {
    const points: BezierTuple = [
      [1 / 3, 0],
      [2 / 3, 0],
    ];
    const before = misc.bezierCurve(points);
    points[0][1] = 1 / 3;
    points[1][1] = 2 / 3;
    const after = misc.bezierCurve(points);
    expect(before(0.5)).toBeCloseTo(0.125, 10);
    expect(after(0.5)).toBeCloseTo(0.5, 10);
    expect(
      misc.bezierCurve([
        [1 / 3, 0],
        [2 / 3, 0],
      ])(0.5),
    ).toBeCloseTo(0.125, 10);
  });

  it('rejects invalid x control points when creating the evaluator', () => {
    expect(() =>
      misc.bezierCurve([
        [-0.1, 0],
        [1, 1],
      ]),
    ).toThrow();
    expect(() =>
      misc.bezierCurve([
        [0, 0],
        [1.1, 1],
      ]),
    ).toThrow();
  });
});

describe('array utilities', () => {
  it('replaces only the selected item without mutating the array', () => {
    const input = [1, 2, 3];
    const visited: Array<number> = [];
    expect(
      misc.replaceIndex(input, 1, (value) => {
        visited.push(value);
        return value * 10;
      }),
    ).toEqual([1, 20, 3]);
    expect(visited).toEqual([2]);
    expect(input).toEqual([1, 2, 3]);
    expect(misc.replaceIndex(input, -1, () => 99)).toEqual(input);
  });

  it('inserts and removes items while keeping the original array intact', () => {
    const input = [1, 2, 3];
    expect(misc.insertInto(input, 1, 9)).toEqual([1, 9, 2, 3]);
    expect(misc.insertInto(input, -1, 9)).toEqual([1, 2, 9, 3]);
    expect(misc.removeIndex(input, 1)).toEqual([1, 3]);
    expect(misc.removeIndex(input, 99)).toEqual([1, 2, 3]);
    expect(input).toEqual([1, 2, 3]);
    expect(misc.getLast(input)).toBe(3);
    expect(misc.getLast([])).toBeNull();
  });
});

describe('assertions and data conversion', () => {
  it('throws only for falsy conditions and includes supplied metadata', () => {
    expect(() => {
      misc.assert({});
    }).not.toThrow();
    expect(() => {
      misc.assert(false, 'missing', { frame: 2 });
    }).toThrow('AssertionFailure: missing - {"frame":2}');
    expect(() => {
      misc.assert(null);
    }).toThrow('Unexpected falsy value');
  });

  it('recognizes HTTP URLs and rejects plain text', () => {
    expect(misc.isUrl('https://example.com/image.gif?foo=1')).toBe(true);
    expect(misc.isUrl('http://example.com')).toBe(true);
    expect(misc.isUrl('image.gif')).toBe(false);
  });

  it('round-trips binary data including zero and high bytes through a data URI', async () => {
    const uri = 'data:application/octet-stream;base64,AAF/gP8=';
    const blob = misc.dataURItoBlob(uri);
    expect(blob.type).toBe('application/octet-stream');
    expect(Array.from(new Uint8Array(await blob.arrayBuffer()))).toEqual([
      0, 1, 127, 128, 255,
    ]);
    expect(await misc.blobOrFileToDataUrl(blob)).toBe(uri);
    expect(
      await misc.blobOrFileToDataUrl(
        new File([blob], 'bytes.bin', { type: blob.type }),
      ),
    ).toBe(uri);
  });
});
