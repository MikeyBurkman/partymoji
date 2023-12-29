import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { bezierCurve } from '../domain/utils/misc';
import { bezierParam, BezierTuple } from '../params';

export const fade = buildEffect({
  name: 'Fade',
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
    mapFrames(image, (frame, frameIndex, frameCount) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        preEffect: (canvasData) =>
          applyFilter(canvasData, {
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

  return Math.round(bezierCurve(curve, true)(progress) * 100);
};
