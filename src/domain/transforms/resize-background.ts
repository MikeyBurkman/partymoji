import { buildTransform, Color, Dimensions } from '../types';
import { assert, getPixelFromSource, writePixel } from '../utils';
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

    const newDimensions: Dimensions = [newWidth, newHeight];

    const xPadding = (newWidth - width) / 2;
    const yPadding = (newHeight - height) / 2;

    const newFrames = image.frames.map((frame) => {
      const transformedImageData = new Uint8Array(newWidth * newHeight * 4);
      for (let y = 0; y < newHeight; y += 1) {
        for (let x = 0; x < newWidth; x += 1) {
          const pixel: Color =
            x > xPadding &&
            x < newWidth - xPadding &&
            y > yPadding &&
            y < newHeight - yPadding
              ? getPixelFromSource(image.dimensions, frame.data, [
                  x - xPadding,
                  y - yPadding,
                ])
              : [0, 0, 0, 0];
          writePixel({
            color: pixel,
            coord: [x, y],
            dimensions: newDimensions,
            image: transformedImageData,
          });
        }
      }
      return {
        data: transformedImageData,
      };
    });

    return {
      frames: newFrames,
      dimensions: newDimensions,
    };
  },
});
