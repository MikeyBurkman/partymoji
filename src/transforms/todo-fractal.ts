import { buildTransform } from '../domain/types';
import { mapImage, isTransparent, shiftHue } from '../domain/utils';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';

// Creates a cool fractal-like effect. Should tweak this and understand it before releasing.

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
      defaultValue: 40,
    }),
    sliderParam({
      name: 'Amount',
      description: 'How strong the effect is',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 50,
    }),
    sliderParam({
      name: 'Group Count',
      description: 'How many times each rainbow is repeated',
      defaultValue: 1,
      min: 1,
      max: 10,
    }),
  ] as const,
  fn: mapImage(
    ({
      coord,
      dimensions,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters: [offsetX, offsetY, amount, groupCount],
    }) => {
      const srcPixel = getSrcPixel(coord);

      // Make the transparent parts colorful
      if (isTransparent(srcPixel)) {
        return srcPixel;
      }

      const centerX = dimensions[0] / 2 + offsetX;
      const centerY = dimensions[1] / 2 + offsetY;
      const [x, y] = coord;
      const xRelCenter = x - centerX;
      const yRelCenter = y - centerY;

      const pointAngle =
        (360 + (Math.atan2(yRelCenter, xRelCenter) * 180) / Math.PI) % 360;

      const ribbonArcDegrees = Math.round(360 / groupCount);

      const frameProgress = frameIndex / frameCount;

      const newH =
        (pointAngle * ribbonArcDegrees + frameProgress * ribbonArcDegrees) %
        ribbonArcDegrees;

      return shiftHue(srcPixel, newH, amount);
    }
  ),
});
