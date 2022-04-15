import { buildTransform, Coord } from '../domain/types';
import {
  calculateAngle,
  colorFromHue,
  isTransparent,
  mapImage,
  shiftTowardsHue,
} from '../domain/utils';
import { intParam } from '../params/intParam';
import { radioParam } from '../params/radioParam';
import { sliderParam } from '../params/sliderParam';

export const pinwheelParty = buildTransform({
  name: 'Pinwheel Party',
  description: 'Create a pinwheel of party colors',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    radioParam({
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
      description: 'Change the horizontal center of the pinwheel',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      description: 'Change the vertical center of the pinwheel',
      defaultValue: 0,
    }),
  ] as const,
  fn: mapImage(
    ({
      coord,
      dimensions,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters: [groupCount, type, amount, offsetX, offsetY],
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
        ? colorFromHue(newH)
        : shiftTowardsHue(srcPixel, newH, amount);
    }
  ),
});
