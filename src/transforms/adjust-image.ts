import { buildTransform, Color, Frame, Image } from '../domain/types';
import {
  clampColor,
  getPixelFromSource,
  mapCoords,
  mapFrames,
  repeat,
  resizeImage,
} from '../domain/utils';
import * as convert from 'color-convert';
import { sliderParam } from '../params/sliderParam';
import { intParam } from '../params/intParam';

export const adjustImage = buildTransform({
  name: 'Adjust Image',
  description: 'Leave a parameter at 0 if you want to not change it',
  params: [
    sliderParam({
      name: 'Number of Frames',
      description:
        'Set how many frames of animation there will be. Leave at 0 to not change the current frame count.',
      defaultValue: 0,
      min: 0,
      max: 60,
    }),
    intParam({
      name: 'Width',
      description: 'Leave at 0 to not change the image',
      defaultValue: 0,
      min: 0,
    }),
    intParam({
      name: 'Height',
      description: 'Leave at 0 to not change the image',
      defaultValue: 0,
      min: 0,
    }),
    sliderParam({
      name: 'Brightness',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Contrast',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
  ],
  fn: ({ image, parameters }) => {
    const [frameCount, newWidth, newHeight, brightness, contrast] = parameters;

    const averageValue = contrast !== 0 ? calculateAverageValue(image) : 0;

    let currImage = image;

    if (newWidth !== 0 && newHeight !== 0) {
      currImage = resizeImage({ image: currImage, newWidth, newHeight });
    }

    currImage = mapFrames(currImage, (imageData) =>
      mapCoords(currImage.dimensions, (coord) => {
        let currColor = getPixelFromSource(
          currImage.dimensions,
          imageData,
          coord
        );

        if (brightness !== 0) {
          currColor = adjustBrightness(currColor, brightness);
        }

        if (contrast !== 0) {
          currColor = adjustContrast(currColor, averageValue, contrast);
        }

        return currColor;
      })
    );

    if (frameCount) {
      currImage = setFrameCount(currImage, frameCount);
    }

    return currImage;
  },
});

const setFrameCount = (image: Image, frameCount: number): Image => {
  const currentFrames = image.frames;

  // Resulting image will contain frameCount frames.
  // If the original image had less than that, then we'll copy the last frame until we have enough.
  // If the original has more frames, then we'll discard the last ones.
  const frames = repeat(frameCount).map(
    (i): Frame => ({
      data: currentFrames[i]
        ? currentFrames[i].data
        : currentFrames[currentFrames.length - 1].data,
    })
  );

  return {
    dimensions: image.dimensions,
    frames,
  };
};

const calculateAverageValue = (image: Image): number => {
  const [width, height] = image.dimensions;

  // Find average value of all pixels
  let totalLight = 0;
  for (let f = 0; f < image.frames.length; f += 1) {
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        const [r, g, b] = getPixelFromSource(
          image.dimensions,
          image.frames[f].data,
          [x, y]
        );
        const [, , l] = convert.rgb.hsv(r, g, b);
        totalLight += l;
      }
    }
  }
  return totalLight / (image.frames.length * width * height);
};

// Amount = -100 to 100
const adjustContrast = (
  color: Color,
  averageValue: number,
  amount: number
): Color => {
  const [r, g, b, a] = color;
  const [h, s, l] = convert.rgb.hsv(r, g, b);
  const diff = l - averageValue;
  const newLight = l + diff * (amount / 100);
  const [newR, newG, newB] = convert.hsv.rgb([h, s, newLight]);
  return [newR, newG, newB, a];
};

// Amount: -100 to 100
const adjustBrightness = (color: Color, amount: number): Color => {
  const rawAmount = (amount / 100) * 255;
  return clampColor([
    color[0] + rawAmount,
    color[1] + rawAmount,
    color[2] + rawAmount,
    color[3],
  ]);
};
