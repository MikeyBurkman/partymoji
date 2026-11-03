import { describe, expect, it } from 'vitest';
import type { Color } from '~/domain/types';
import * as color from '~/domain/utils/color';

describe('color conversion', () => {
  it('formats uppercase, padded hex and parses lowercase hex with opaque alpha', () => {
    expect(color.toHexColor([0, 15, 255, 64])).toBe('#000FFF');
    expect(color.fromHexColor('#ab09ef')).toEqual([171, 9, 239, 255]);
  });

  it.each([
    ['#ABCDEF', true],
    ['#abcdef', false],
    ['#123456', true],
    ['#123', false],
    ['123456', false],
  ])('validates the existing hex format %s', (value, valid) => {
    expect(color.isHexColor(String(value))).toBe(valid);
  });

  it('parses RGB and integer-alpha RGBA and rejects unrecognized strings', () => {
    expect(color.rgbaStringToColor('rgb(221, 17, 17)')).toEqual([
      221, 17, 17, 255,
    ]);
    expect(color.rgbaStringToColor('rgba(170, 5, 228, 0)')).toEqual([
      170, 5, 228, 0,
    ]);
    expect(color.rgbaStringToColor('rgba(170, 5, 228, 1)')).toEqual([
      170, 5, 228, 255,
    ]);
    expect(() => color.rgbaStringToColor('invalid')).toThrow(
      'Could not match rgb string',
    );
  });

  it('maps primary hues in both directions', () => {
    expect(color.colorFromHue(0)).toEqual([255, 0, 0, 255]);
    expect(color.colorFromHue(120)).toEqual([0, 255, 0, 255]);
    expect(color.colorFromHue(240)).toEqual([0, 0, 255, 255]);
    expect(color.hueFromColor([0, 255, 0, 12])).toBe(120);
  });
});

describe('color arithmetic', () => {
  it('clamps without rounding or mutating the input', () => {
    const input: Color = [-10, 300, 2.5, 64];
    expect(color.clampColor(input)).toEqual([0, 255, 2.5, 64]);
    expect(input).toEqual([-10, 300, 2.5, 64]);
    expect(color.getAveragePixelValue([0, 1, 1, 0])).toBe(1);
  });

  it('shifts hue and preserves alpha', () => {
    expect(color.shiftHue([255, 0, 0, 64], 120)).toEqual([0, 255, 0, 64]);
    expect(color.shiftHue([0, 0, 255, 64], 240)).toEqual([0, 255, 0, 64]);
    expect(color.shiftTowardsHue([255, 0, 0, 64], 120, 0)).toEqual([
      255, 0, 0, 64,
    ]);
    expect(color.shiftTowardsHue([255, 0, 0, 64], 120, 100)).toEqual([
      0, 255, 0, 64,
    ]);
  });

  it('adjusts brightness, saturation, and contrast with channel clamping', () => {
    expect(color.setBrightness([255, 0, 0, 77], 50)).toEqual([255, 0, 0, 77]);
    expect(color.setBrightness([255, 0, 0, 77], 100)).toEqual([
      255, 255, 255, 77,
    ]);
    expect(color.adjustSaturation([255, 0, 0, 77], -100)).toEqual([
      128, 128, 128, 77,
    ]);
    expect(color.adjustBrightness([200, 100, 0, 77], 100)).toEqual([
      255, 228, 128, 77,
    ]);
    expect(color.adjustBrightness([200, 100, 0, 77], -100)).toEqual([
      72, 0, 0, 77,
    ]);
    expect(color.adjustContrast([0, 128, 255, 77], -100)).toEqual([
      128, 128, 128, 77,
    ]);
    expect(color.adjustContrast([0, 128, 255, 77], 100)).toEqual([
      0, 128, 255, 77,
    ]);
  });

  it('floors interpolated channels and produces opaque colors', () => {
    const c1: Color = [0, 10, 20, 0];
    const c2: Color = [255, 21, 31, 32];
    expect(color.linearInterpolation({ c1, c2, amount: 0 })).toEqual([
      0, 10, 20, 255,
    ]);
    expect(color.linearInterpolation({ c1, c2, amount: 0.5 })).toEqual([
      127, 15, 25, 255,
    ]);
    expect(color.linearInterpolation({ c1, c2, amount: 1 })).toEqual([
      255, 21, 31, 255,
    ]);
  });

  it('computes symmetric color distance independently of alpha', () => {
    const a: Color = [255, 0, 0, 0];
    const b: Color = [0, 255, 0, 255];
    expect(color.colorDiff(a, [255, 0, 0, 255])).toBe(0);
    expect(color.colorDiff(a, b)).toBeCloseTo(0.7450647809, 8);
    expect(color.colorDiff(a, b)).toBe(color.colorDiff(b, a));
  });
});
