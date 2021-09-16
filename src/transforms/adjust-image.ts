import { range } from 'remeda';

import { buildTransform, Color, Image } from '../domain/types';
import {
  clampColor,
  getPixelFromSource,
  mapCoords,
  mapFrames,
  scaleImage,
  weightedValue,
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
    sliderParam({
      name: 'Saturation',
      min: -100,
      max: 100,
      step: 5,
      defaultValue: 0,
    }),
  ],
  fn: ({ image, parameters }) => {
    const [frameCount, newWidth, newHeight, brightness, contrast, saturation] =
      parameters;

    const hasFrameCount = frameCount !== 0;

    const hasScaleChange = newWidth > 0 && newHeight > 0;
    // Use this to figure out when we should optimally resize the image
    const isBiggerImage =
      newWidth * newHeight > image.dimensions[0] * image.dimensions[1];

    const averageValue = contrast !== 0 ? calculateAverageValue(image) : 0;

    let currImage = image;

    if (hasFrameCount && frameCount < image.frames.length) {
      // Reducing the number of frames, so do that first so we have fewer pixels to change
      currImage = setFrameCount(currImage, frameCount);
    }

    // If making a smaller image, might as well do the brightness/contrast after making it smaller
    if (hasScaleChange && !isBiggerImage) {
      currImage = scaleImage({ image: currImage, newWidth, newHeight });
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

        if (saturation !== 0) {
          currColor = adjustSaturation(currColor, saturation);
        }

        return currColor;
      })
    );

    // If the image will be made bigger, we'll run that after adjusting the brightness/contrast
    if (hasScaleChange && isBiggerImage) {
      currImage = scaleImage({ image: currImage, newWidth, newHeight });
    }

    // Finally change the number of frames if we're adding frames
    if (hasFrameCount && frameCount > image.frames.length) {
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
  return {
    dimensions: image.dimensions,
    frames: range(0, frameCount).map((i) =>
      currentFrames[i]
        ? currentFrames[i]
        : currentFrames[currentFrames.length - 1]
    ),
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
          image.frames[f],
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
  const [h, s, l] = convert.rgb.hsl(r, g, b);
  const diff = l - averageValue;
  const newLight = l + diff * (amount / 100);
  const [newR, newG, newB] = convert.hsl.rgb([h, s, newLight]);
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

// Amount = -100 to 100
const adjustSaturation = (color: Color, amount: number): Color => {
  const [r, g, b, a] = color;
  const [h, s, l] = convert.rgb.hsl(r, g, b);
  const newSat = weightedValue(Math.abs(amount), s, amount >= 0 ? 100 : 0);
  const [newR, newG, newB] = convert.hsl.rgb([h, newSat, l]);
  return [newR, newG, newB, a];
};
