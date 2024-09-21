import { canvasUtil, imageUtil } from '~/domain/utils';
import { buildEffect } from './utils';

// NOTE: This is not intended as an end-user effect!
// This is just to display behind a picture when there are partially-transparent pixels,
//  as GIFs do not support partial transparency.

const COLORS = ['#111111', '#888888'];

export const fakeTransparency = buildEffect({
  name: 'Fake Transparency',
  group: 'Image',
  description:
    'This is just to display behind a picture when there are partially-transparent pixels,' +
    ' as GIFs do not support partial transparency',
  params: [] as const,
  disabled: true,
  fn: ({ image }) => {
    const createBackground = () => {
      const canvas = canvasUtil.createCanvas(image.dimensions);
      const ctx = canvas.ctx;

      const numBlocks = 10;
      const blockWidth = image.dimensions[0] / numBlocks;
      const blockHeight = image.dimensions[1] / numBlocks;
      for (let i = 0; i < numBlocks; i += 1) {
        for (let j = 0; j < numBlocks; j += 1) {
          ctx.fillStyle = COLORS[(i + j) % 2];
          ctx.fillRect(
            i * blockWidth,
            j * blockHeight,
            (i + 1) * blockWidth,
            (j + 1) * blockHeight
          );
        }
      }
      return canvas;
    };

    return imageUtil.mapFrames(image, (imageData) =>
      canvasUtil.combineImages({
        dimensions: image.dimensions,
        background: createBackground(),
        foreground: imageData,
      })
    );
  },
});
