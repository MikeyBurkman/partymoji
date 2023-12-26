import bezier from 'bezier-easing';
import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { bezierParam, BezierTuple } from '../params';

export const fade = buildEffect({
  name: 'Fade',
  description: 'Fades the image in or out',
  applyBackgroundColor: true,
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

  const b = bezier.apply(undefined, [...curve[0], ...curve[1]]);

  const opacity =
    progress < 0.5
      ? Math.round(b(progress * 2) * 100)
      : Math.round(b(1 - 2 * (progress - 0.5)) * 100);

  return opacity;
};
