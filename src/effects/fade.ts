import bezier from 'bezier-easing';
import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame, applyFilter } from '../domain/utils/canvas';
import { mapFrames } from '../domain/utils/image';
import { radioParam } from '../params';

type Curve = 'linear' | 'fast' | 'slow';

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
    radioParam({
      name: 'Curve',
      options: [
        {
          name: 'Linear',
          value: 'linear',
        },
        {
          name: 'Fast',
          value: 'fast',
        },
        {
          name: 'Slow',
          value: 'slow',
        },
      ],
      defaultValue: 'linear',
    } as const),
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

// TODO work on these curves, particularly for pulse
const CURVES: Record<Curve, [number, number, number, number]> = {
  linear: [0.5, 0.5, 0.5, 0.5],
  slow: [0.5, 0.0, 1.0, 0.5],
  fast: [0.0, 0.5, 0.5, 1.0],
};

const getOpacityAmount = ({
  frameIndex,
  frameCount,
  curve,
  kind,
}: {
  frameIndex: number;
  frameCount: number;
  curve: Curve;
  kind: 'in' | 'out' | 'pulse';
}): number => {
  const progress = frameIndex / (frameCount - 1);

  const b = bezier.apply(undefined, CURVES[curve]);

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
