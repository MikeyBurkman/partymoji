import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const partyBackground = buildEffect({
  name: 'Party Background',
  group: 'Party',
  description:
    'Smoothly cycles through background colors over the course of the animation',
  params: [
    sliderParam({
      name: 'Shift Speed',
      description: 'Controls how quickly it shifts through the various colors',
      min: 1,
      max: 12,
      defaultValue: 1,
    }),
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [shiftSpeed, opacity] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const newH = (animationProgress * shiftSpeed * 360) % 360;
      const bgColor = colorUtil.colorFromHue(newH);

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
        background: imageUtil.mapCoords(image.dimensions, () => bgColor),
        foreground,
      });
    }),
});
