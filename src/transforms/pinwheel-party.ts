import { buildTransform, Coord } from '../domain/types';
import {
  mapImage,
  isTransparent,
  shiftHue,
  calculateAngle,
  colorFromeHue,
} from '../domain/utils';
import { dropdownParam } from '../params/dropdownParam';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelParty = buildTransform({
  name: 'Pinwheel Party',
  description: 'Create a pinwheel of party colors',
  params: [
    intParam({
      name: 'Offset X',
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
      defaultValue: 0,
    }),
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 10,
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
  ] as const,
  fn: mapImage(
    ({
      coord,
      dimensions,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters: [offsetX, offsetY, groupCount, type, amount],
    }) => {
      const srcPixel = getSrcPixel(coord);

      const isBackground = isTransparent(srcPixel);

      if (type === 'foreground' ? isBackground : !isBackground) {
        return srcPixel;
      }

      const center: Coord = [
        dimensions[0] / 2 + offsetX,
        dimensions[1] / 2 - offsetY,
      ];
      const pointAngle = calculateAngle(coord, center);
      const frameProgress = frameIndex / frameCount;
      const newH = (pointAngle * groupCount + frameProgress * 360) % 360;

      return isBackground
        ? colorFromeHue(newH)
        : shiftHue(srcPixel, newH, amount);
    }
  ),
});
