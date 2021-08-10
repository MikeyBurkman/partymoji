import { ImageData, buildTransform } from '../types';
import { getPixelFromSource } from '../utils';
import { intParam } from './params/intParam';

export const resize = buildTransform({
  name: 'Resize',
  params: [
    intParam({
      name: 'Width',
      defaultValue: 128,
      min: 1,
    }),
    intParam({
      name: 'Height',
      defaultValue: 128,
      min: 1,
    }),
  ] as const,
  fn: ({ image, parameters }) => {
    const [width, height] = image.dimensions;
    const [newWidth, newHeight] = parameters;
    const xRatio = width / newWidth;
    const yRatio = height / newHeight;

    const newFrames = image.frames.map((frame) => {
      const transformedImageData: ImageData = [];
      for (let y = 0; y < newHeight; y += 1) {
        for (let x = 0; x < newWidth; x += 1) {
          // Simple nearest-neighbor image scaling.
          // Arguably the worst of the scaling algorithms, but it's quick,
          //  and we're generally dealing with small images anyhow.
          const srcX = Math.floor(x * xRatio);
          const srcY = Math.floor(y * yRatio);
          transformedImageData.push(
            ...getPixelFromSource(image.dimensions, frame.data, [srcX, srcY])
          );
        }
      }
      return {
        data: transformedImageData,
      };
    });

    return {
      frames: newFrames,
      dimensions: [newWidth, newHeight],
    };
  },
});
