import bezier from 'bezier-easing';
import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { radioParam, bezierParam, BezierTuple } from '../params';

export const fade = buildEffect({
  name: 'Fade',
  description: 'Fades the image in or out',
  applyBackgroundColor: true,
  params: [
    radioParam({
      name: 'Fade',
      options: [
        {
          name: 'In',
          value: 'in',
        },
        {
          name: 'Out',
          value: 'out',
        },
        {
          name: 'Pulse',
          value: 'pulse',
        },
      ],
      defaultValue: 'pulse',
    } as const),
    bezierParam({
      name: 'Curve',
      defaultValue: [
        [0.25, 0.75],
        [0.75, 0.25],
      ],
    }),
  ] as const,
  fn: ({ image, parameters: [kind, curve] }) =>
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
              kind,
            }),
          }),
      })
    ),
});

const getOpacityAmount = ({
  frameIndex,
  frameCount,
  curve,
  kind,
}: {
  frameIndex: number;
  frameCount: number;
  curve: BezierTuple;
  kind: 'in' | 'out' | 'pulse';
}): number => {
  const progress = frameIndex / (frameCount - 1);

  const b = bezier.apply(undefined, [...curve[0], ...curve[1]]);

  const opacity = (() => {
    if (kind === 'pulse') {
      if (progress < 0.5) {
        return Math.round(b(progress) * 100);
      } else {
        return Math.round(b(1 - progress) * 100);
      }
    }

    const amount = Math.round(b(progress) * 100);
    if (kind === 'in') {
      return amount;
    } else {
      return 100 - amount;
    }
  })();

  return opacity;
};
