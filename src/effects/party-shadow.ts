import type { CanvasData } from '~/domain/types';
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
  fn: ({ image, parameters: [layers, blurRadius, offsetX, offsetY] }) => {
    let source: CanvasData | undefined;
    let target: CanvasData | undefined;
    const [width, height] = image.dimensions;
    const hueSize = 360 / layers;
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      source ??= canvasUtil.createCanvas(image.dimensions);
      target ??= canvasUtil.createCanvas(image.dimensions);
      const startHue = (frameIndex / frameCount) * 360;
      let result = frame;
      for (let i = 0; i < layers; i += 1) {
        source.ctx.putImageData(new ImageData(result, width, height), 0, 0);
        target.ctx.clearRect(0, 0, width, height);
        // Some negative hues produce an invalid CSS color. A rejected filter
        // assignment must leave the fresh-canvas default, not the previous layer.
        target.ctx.filter = 'none';
        canvasUtil.applyFilter(target, {
          dropShadow: {
            offsetX,
            offsetY,
            blurRadius,
            color: colorUtil.colorFromHue((startHue - hueSize * i) % 360),
          },
        });
        target.ctx.drawImage(source.canvas, 0, 0);
        // Keep the intermediate readback/upload: it defines alpha rounding
        // between layers. Drawing canvas-to-canvas would change those pixels.
        result = canvasUtil.canvasToFrame(target);
      }
      return result;
    });
  },
});
