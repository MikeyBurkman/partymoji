import { buildTransform } from '../domain/types';
import {
  mapFrames,
  mapCoords,
  getPixelFromSource,
  isTransparent,
  shiftHue,
  colorFromHue,
} from '../domain/utils';
import { dropdownParam } from '../params/dropdownParam';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const radianceParty = buildTransform({
  name: 'Radiance Party',
  description: 'Radiate party colors out in rings',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    dropdownParam({
      name: 'Type',
      description: 'Whether to apply the party to the foreground or background',
      defaultValue: 'background',
      options: [
        {
          name: 'Background',
          value: 'background',
        },
        {
          name: 'Foreground',
          value: 'foreground',
        },
      ],
    }),
    sliderParam({
      name: 'Amount',
      description:
        'How strong the effect is. Only applies when type = foreground.',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 75,
    }),
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the radiance',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the radiance',
      defaultValue: 0,
    }),
  ] as const,
  fn: ({ image, parameters: [groupCount, type, amount, offsetX, offsetY] }) => {
    const [width, height] = image.dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    const maxDist = Math.sqrt(
      (width / 2) * (width / 2) + (height / 2) * (height / 2)
    );

    return mapFrames(image, (imageData, frameIndex, frameCount) =>
      mapCoords(image.dimensions, (coord) => {
        const [x, y] = coord;
        const src = getPixelFromSource(image.dimensions, imageData, coord);

        const isBackground = isTransparent(src);

        if (type === 'foreground' ? isBackground : !isBackground) {
          return src;
        }

        const xRelCenter = x - centerX - offsetX;
        const yRelCenter = y - centerY + offsetY;

        const distFromCenter = Math.sqrt(
          yRelCenter * yRelCenter + xRelCenter * xRelCenter
        );

        const frameProgress = frameIndex / frameCount;
        const newH =
          ((1 - distFromCenter / maxDist) * 360 * groupCount +
            360 * frameProgress) %
          360;

        return isBackground ? colorFromHue(newH) : shiftHue(src, newH, amount);
      })
    );
  },
});
