import { BezierTuple } from '~/domain/types';
import { canvasUtil, imageUtil, miscUtil } from '~/domain/utils';
import { bezierParam } from '~/params';
import { buildEffect } from './utils';

export const fade = buildEffect({
  name: 'Fade',
  group: 'Misc',
  description: 'Fades the image in or out',
  params: [
    bezierParam({
      name: 'Curve',
      defaultValue: [
        [0.25, 0.75],
        [0.75, 0.25],
      ],
    }),
  ] as const,
  fn: ({ image, parameters: [curve] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          canvasUtil.applyFilter(canvasData, {
            opacity: getOpacityAmount({
              frameCount,
              frameIndex,
              curve,
            }),
          }),
      })
    ),
});

const getOpacityAmount = ({
  frameIndex,
  frameCount,
  curve,
}: {
  frameIndex: number;
  frameCount: number;
  curve: BezierTuple;
}): number => {
  const progress = frameIndex / (frameCount - 1);

  return Math.round(miscUtil.bezierCurve(curve, true)(progress) * 100);
};
