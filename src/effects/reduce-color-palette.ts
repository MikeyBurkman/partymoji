import { minBy, sortBy } from 'remeda';
import type { Color } from '~/domain/types';
import { colorUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const reduceColorPalette = buildEffect({
  name: 'Reduce Color Palette',
  group: 'Colors',
  description:
    'Reduce the number of unique colors in the gif, to reduce the file size.',
  secondaryDescription:
    'This can be a slow operation depending on the number of final colors',
  params: [
    sliderParam({
      name: 'Percent Reduction',
      description:
        '0% will have no effect, 100% will result in just one unique color in the result',
      defaultValue: 70,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [percentReduction] }) => {
    // RGB keys deliberately ignore alpha, just like the original hex keys.
    // Insertion order preserves palette ranking and nearest-color tie-breaking.
    const allColorsSet = new Set<number>();
    const byteLength = image.dimensions[0] * image.dimensions[1] * 4;
    const keyAt = (frame: Uint8ClampedArray, offset: number) =>
      (frame[offset] << 16) | (frame[offset + 1] << 8) | frame[offset + 2];
    for (const frame of image.frames) {
      for (let offset = 0; offset < byteLength; offset += 4) {
        allColorsSet.add(keyAt(frame, offset));
      }
    }
    const allColors: Array<Color> = Array.from(allColorsSet, (key) => [
      key >>> 16,
      (key >>> 8) & 255,
      key & 255,
      255,
    ]);
    const numColors = Math.max(
      Math.floor((allColors.length * (100 - percentReduction)) / 100),
      1,
    );
    const colorMap = allColors.map((color) => ({ color, numClosestColors: 0 }));
    // Preserve the original omission of the first color's vote.
    for (let i = 1; i < allColors.length; i += 1) {
      let closestColorIdx = 0;
      let closestColorDist = colorUtil.colorDiff(allColors[i], allColors[0]);
      for (let k = 0; k < allColors.length; k += 1) {
        if (k === i) continue;
        const dist = colorUtil.colorDiff(allColors[k], allColors[i]);
        if (dist < closestColorDist) {
          closestColorIdx = k;
          closestColorDist = dist;
        }
      }
      colorMap[closestColorIdx].numClosestColors += 1;
    }
    const colorPalette = sortBy(colorMap, [(c) => c.numClosestColors, 'desc'])
      .slice(0, numColors)
      .map(({ color }) => color);
    const replacements = new Map<number, Color>();
    let colorIndex = 0;
    for (const key of allColorsSet) {
      const color = allColors[colorIndex++];
      replacements.set(
        key,
        minBy(colorPalette, (top) => colorUtil.colorDiff(top, color)) ?? [
          0, 0, 0, 0,
        ],
      );
    }
    return imageUtil.mapFrames(image, (frame) => {
      const output = new Uint8ClampedArray(byteLength);
      for (let offset = 0; offset < byteLength; offset += 4) {
        const color =
          replacements.get(keyAt(frame, offset)) ?? colorUtil.TRANSPARENT_COLOR;
        output[offset] = color[0];
        output[offset + 1] = color[1];
        output[offset + 2] = color[2];
        output[offset + 3] = color[3];
      }
      return output;
    });
  },
});
