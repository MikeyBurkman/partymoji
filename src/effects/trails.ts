import { canvasUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';
import { FrameData } from '~/domain/types';

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

    /*
    // assume numTrails = 3, numFrames = 6
    frames[0] = src[4]*25% > src[5]*25% > src[0]
    frames[1] = src[5]*25% > src[0]*25% > src[1]
    frames[2] = src[0]*25% > src[1]*25% > src[2]
    frames[3] = src[1]*25% > src[2]*25% > src[3]
    frames[4] = src[2]*25% > src[3]*25% > src[4]
    frames[5] = src[3]*25% > src[4]*25% > src[5]
    ...
    */
    const frames: FrameData[] = [];
    for (let i = 0; i < image.frames.length; i += 1) {
      const canvas = canvasUtil.createCanvas(image.dimensions);
      for (let n = numTrails; n > 0; n -= 1) {
        const idx = i - n + 1;
        const frameIdx = idx >= 0 ? idx : image.frames.length + idx;

        const frameToCopy = image.frames[frameIdx];
        if (frameToCopy != null) {
          canvasUtil.applyFilter(canvas, {
            opacity: Math.floor((n / numTrails) * trailOpacity),
            blur: Math.floor(n * blurCoefficient),
          });
          canvasUtil.drawImageOnCanvas({
            ctx: canvas.ctx,
            dimensions: image.dimensions,
            frame: frameToCopy,
          });
        }
      }
      canvasUtil.applyFilter(canvas, {
        opacity: 100,
        blur: 0,
      });
      canvasUtil.drawImageOnCanvas({
        ctx: canvas.ctx,
        dimensions: image.dimensions,
        frame: image.frames[i],
      });
      frames.push(canvasUtil.canvasToFrame(canvas));
    }

    return {
      dimensions: image.dimensions,
      frames,
    };
  },
});
