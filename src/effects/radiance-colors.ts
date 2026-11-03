import { range } from 'remeda';
import { colorUtil, imageUtil } from '~/domain/utils';
import {
  colorPickerParam,
  intParam,
  sliderParam,
  variableLengthParam,
} from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';
import { createBackgroundCompositor } from './background-compositor';

const DEFAULT_COLORS = [
  '#FF0000',
  '#FF9600',
  '#FFFF00',
  '#00FF00',
  '#00FF96',
  '#00FFFF',
  '#0000FF',
  '#B400FF',
].map(colorUtil.fromHexColor);

export const radianceColors = buildEffect({
  name: 'Radiance Colors',
  group: 'Party',
  description: 'Radiate background colors of your choosing out in rings',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each color is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    variableLengthParam({
      name: 'Colors',
      newParamText: 'New Color',
      description: 'The colors that make up each ring',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
          defaultValue: DEFAULT_COLORS[0],
        }),
    }),
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the radiance',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the radiance',
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({
    image,
    parameters: [groupCount, colors, offsetX, offsetY, opacity],
  }) => {
    const [width, height] = image.dimensions;
    const composite = createBackgroundCompositor(image.dimensions, opacity);
    const colorList = range(0, groupCount).flatMap(() => colors);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(
      (width / 2) * (width / 2) + (height / 2) * (height / 2),
    );
    const baseValues =
      image.frames.length === 0
        ? []
        : precomputeValues(image.dimensions, (coord) => {
            const [x, y] = coord;
            const xRelCenter = x - centerX - offsetX;
            const yRelCenter = y - centerY + offsetY;
            const distance = Math.sqrt(
              yRelCenter * yRelCenter + xRelCenter * xRelCenter,
            );
            // calculate which ring a pixel belongs to
            const ringIndex = Math.floor(
              (1 - distance / maxDist) * colorList.length,
            );
            // Some pixels can be beyond maxDist, making rings negative. Need to guarantee positive
            return (
              ((ringIndex % colorList.length) + colorList.length) %
              colorList.length
            );
          });
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const shift = Math.floor(animationProgress * colorList.length);
      const background = imageUtil.mapCoords(
        image.dimensions,
        ([x, y]) =>
          colorList[(shift + baseValues[y * width + x]) % colorList.length],
      );
      return composite(background, frame);
    });
  },
});
