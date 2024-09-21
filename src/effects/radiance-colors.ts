import { range } from 'remeda';
import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import {
  colorPickerParam,
  intParam,
  sliderParam,
  variableLengthParam,
} from '~/params';
import { buildEffect } from './utils';

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
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const [width, height] = image.dimensions;

      const colorList = range(0, groupCount).flatMap(() => colors);
      const centerX = width / 2;
      const centerY = height / 2;

      const background = imageUtil.mapCoords(image.dimensions, ([x, y]) => {
        const xRelCenter = x - centerX - offsetX;
        const yRelCenter = y - centerY + offsetY;

        const maxDist = Math.sqrt(
          (width / 2) * (width / 2) + (height / 2) * (height / 2)
        );
        const distFromCenter = Math.sqrt(
          yRelCenter * yRelCenter + xRelCenter * xRelCenter
        );

        const colorIdx =
          Math.floor((1 - distFromCenter / maxDist) * colorList.length) %
          colorList.length;

        // Increment colorIdx based on current frame progress
        const idx =
          (Math.floor(animationProgress * colorList.length) + colorIdx) %
          colorList.length;
        return colorList[idx];
      });

      const foreground =
        opacity === 100
          ? frame
          : canvasUtil.applyCanvasFromFrame({
              dimensions: image.dimensions,
              frame,
              preEffect: (canvasData) =>
                canvasUtil.applyFilter(canvasData, { opacity }),
            });

      return canvasUtil.combineImages({
        dimensions: image.dimensions,
        background,
        foreground,
      });
    });
  },
});
