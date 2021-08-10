import { buildTransform } from '../types';
import { ImageData } from '../types';
import { assert, getPixelFromSource } from '../utils';
import { intParam } from './params/intParam';

export const resizeBackground = buildTransform({
  name: 'Resize Background',
  params: [
    intParam({ name: 'Width', defaultValue: 128, min: 0 }),
    intParam({ name: 'Height', defaultValue: 128, min: 0 }),
  ],
  fn: ({ image, parameters }) => {
    const [width, height] = image.dimensions;
    const [newWidth, newHeight] = parameters;
    assert(
      newWidth >= width,
      'New width for resize-background needs to be greater than or equal to the original'
    );
    assert(
      newHeight >= height,
      'New height for resize-background needs to be greater than or equal to the original'
    );

    const xPadding = (newWidth - width) / 2;
    const yPadding = (newHeight - height) / 2;

    const newFrames = image.frames.map((frame) => {
      const transformedImageData: ImageData = [];
      for (let y = 0; y < newHeight; y += 1) {
        for (let x = 0; x < newWidth; x += 1) {
          const pixel =
            x > xPadding &&
            x < newWidth - xPadding &&
            y > yPadding &&
            y < newHeight - yPadding
              ? getPixelFromSource(image.dimensions, frame.data, [
                  x - xPadding,
                  y - yPadding,
                ])
              : [0, 0, 0, 0];
          transformedImageData.push(...pixel);
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
