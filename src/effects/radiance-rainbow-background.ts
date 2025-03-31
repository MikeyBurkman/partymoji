import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const radianceRainbowBackground = buildEffect({
  name: 'Radiance Rainbow Background',
  group: 'Party',
  description: 'Radiate rainbow colors out in rings',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
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
  fn: ({ image, parameters: [groupCount, offsetX, offsetY, opacity] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const [width, height] = image.dimensions;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(
        (width / 2) * (width / 2) + (height / 2) * (height / 2),
      );

      const background = imageUtil.mapCoords(image.dimensions, ([x, y]) => {
        const xRelCenter = x - centerX - offsetX;
        const yRelCenter = y - centerY + offsetY;

        const distFromCenter = Math.sqrt(
          yRelCenter * yRelCenter + xRelCenter * xRelCenter,
        );

        const newH =
          ((1 - distFromCenter / maxDist) * 360 * groupCount +
            360 * animationProgress) %
          360;

        return colorUtil.colorFromHue(newH);
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
    }),
});
