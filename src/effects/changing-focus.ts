import { canvasUtil, imageUtil } from '~/domain/utils';
import { bezierParam, sliderParam } from '~/params';
import { miscUtil } from '~/domain/utils';
import { buildEffect } from './utils';

export const changingFocus = buildEffect({
  name: 'Changing Focus',
  group: 'Image',
  description: 'Changes the focus of the image over time',
  params: [
    sliderParam({
      name: 'Max Blur',
      defaultValue: 50,
      min: 0,
      max: 100,
    }),
    bezierParam({
      name: 'Curve',
      defaultValue: [
        [0.25, 0.75],
        [0.75, 0.25],
      ],
    }),
  ] as const,
  fn: ({ image, parameters: [amount, curve] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) => {
          const progress = frameIndex / (frameCount - 1);
          const blur = Math.round(
            miscUtil.bezierCurve(curve, true)(progress) * (amount / 10),
          );
          return canvasUtil.applyFilter(canvasData, { blur });
        },
      }),
    ),
});
