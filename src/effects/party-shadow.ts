import type { Color, Dimensions, FrameData } from '~/domain/types';
import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import { intParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

export const partyShadow = buildEffect({
  name: 'Party Shadow',
  group: 'Party',
  description: 'Apply a party shadow effect',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Layers',
      defaultValue: 4,
      min: 1,
      max: 30,
    }),
    sliderParam({
      name: 'Blur Radius',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 2,
    }),
    intParam({
      name: 'Offset X',
      defaultValue: 10,
    }),
    intParam({
      name: 'Offset Y',
      defaultValue: 10,
    }),
  ] as const,
  fn: ({ image, parameters: [layers, blurRadius, offsetX, offsetY] }) =>
    imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const colors: Array<Color> = [];
      const startHue = animationProgress * 360;
      const hueSize = 360 / layers;
      for (let i = 0; i < layers; i += 1) {
        colors.push(colorUtil.colorFromHue((startHue - hueSize * i) % 360));
      }

      return applyShadows({
        frame,
        colors,
        blurRadius,
        dimensions: image.dimensions,
        offsetX,
        offsetY,
      });
    }),
});

const applyShadows = ({
  frame,
  dimensions,
  colors,
  offsetX,
  offsetY,
  blurRadius,
}: {
  frame: FrameData;
  dimensions: Dimensions;
  colors: Array<Color>;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
}): FrameData => {
  const [color, ...rest] = colors;
  const newFrame = canvasUtil.applyCanvasFromFrame({
    dimensions,
    frame,
    preEffect: (canvasData) =>
      canvasUtil.applyFilter(canvasData, {
        dropShadow: {
          offsetX,
          offsetY,
          blurRadius,
          color,
        },
      }),
  });

  if (rest.length === 0) {
    return newFrame;
  } else {
    // Apply it recursively but with more offset
    return applyShadows({
      frame: newFrame,
      colors: rest,
      dimensions,
      blurRadius,
      offsetX,
      offsetY,
    });
  }
};
