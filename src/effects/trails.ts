import { canvasUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';
import type { CanvasData, FrameData } from '~/domain/types';

export const trails = buildEffect({
  name: 'Trails',
  group: 'Misc',
  description: 'Adds a trail of previous animation frames',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Number of Trails',
      description: 'How many previous frames to draw',
      min: 1,
      max: 10,
      defaultValue: 3,
    }),
    sliderParam({
      name: 'Trail Opacity',
      description: 'Controls how transparent each trail is',
      min: 1,
      max: 100,
      defaultValue: 50,
    }),
    sliderParam({
      name: 'Trail Blur',
      description: 'Blurs each the trails, can make things look smoother',
      defaultValue: 0,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image, parameters: [numTrails, trailOpacity, blur] }) => {
    const blurCoefficient =
      (Math.max(image.dimensions[0], image.dimensions[1]) / 10000) * blur;

    // Retain only the source canvases needed by the current history window.
    const sources = new Map<number, CanvasData>();
    const sourceCanvas = (index: number) => {
      let canvas = sources.get(index);
      if (!canvas) {
        canvas = canvasUtil.frameToCanvas({
          dimensions: image.dimensions,
          frame: image.frames[index],
        });
        sources.set(index, canvas);
      }
      return canvas;
    };
    let canvas: CanvasData | undefined;
    const frames: Array<FrameData> = [];
    for (let i = 0; i < image.frames.length; i += 1) {
      canvas ??= canvasUtil.createCanvas(image.dimensions);
      canvas.ctx.clearRect(0, 0, image.dimensions[0], image.dimensions[1]);
      for (const index of sources.keys()) {
        if (index < Math.max(i - numTrails + 1, 0)) sources.delete(index);
      }
      for (let n = numTrails; n > 0; n -= 1) {
        const idx = Math.max(i - n + 1, 0);
        const frameIdx = idx >= 0 ? idx : image.frames.length + idx;

        const frameToCopy = sourceCanvas(frameIdx);
        canvasUtil.applyFilter(canvas, {
          opacity: Math.floor((n / numTrails) * trailOpacity),
          blur: Math.floor(n * blurCoefficient),
        });
        canvas.ctx.drawImage(frameToCopy.canvas, 0, 0);
      }
      canvasUtil.applyFilter(canvas, {
        opacity: 100,
        blur: 0,
      });
      canvas.ctx.drawImage(sourceCanvas(i).canvas, 0, 0);
      frames.push(canvasUtil.canvasToFrame(canvas));
    }

    return {
      dimensions: image.dimensions,
      frames,
    };
  },
});
