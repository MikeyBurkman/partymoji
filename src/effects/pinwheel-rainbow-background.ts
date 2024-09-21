import type { Coord } from '~/domain/types';
import { canvasUtil, colorUtil, miscUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const pinwheelRainbowBackground = buildEffect({
  name: 'Pinwheel Rainbow Background',
  group: 'Party',
  description: 'Create a background pinwheel of rainbow colors',
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
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
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
      const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];

      const background = imageUtil.mapCoords(image.dimensions, (coord) => {
        const pointAngle = miscUtil.calculateAngle(coord, center);
        const newH = (pointAngle * groupCount + animationProgress * 360) % 360;
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
