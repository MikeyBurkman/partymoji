// TODO Varargs???
import { buildTransform } from '../types';
import { mapImage, isTransparent, fromHexColor } from '../utils';
import { colorPickerParam } from '../../params/colorPickerParam';
import { intParam } from '../../params/intParam';

const DEFAULT_COLORS = [
  '#FF0000',
  '#FF9600',
  '#FFFF00',
  '#00FF00',
  '#00FF96',
  '#00FFFF',
  '#0000FF',
  '#B400FF',
  '#0000FF',
  '#00FFFF',
  '#00FF96',
  '#00FF00',
  '#FFFF00',
  '#FF9600',
];

export const pinwheel = buildTransform({
  name: 'Pinwheel',
  description: 'Create a pinwheel of colors',
  params: [
    intParam({
      name: 'Offset X',
      defaultValue: 0,
    }),
    intParam({
      name: 'Offset Y',
      defaultValue: 40,
    }),
    intParam({
      name: 'Group Count',
      defaultValue: 1,
      min: 1
    }),
    ...DEFAULT_COLORS.map((c, i) =>
      colorPickerParam({
        name: `Color ${i}`,
        defaultValue: fromHexColor(c),
      })
    ),
  ] as const,
  fn: mapImage(
    ({
      coord,
      dimensions,
      frameCount,
      frameIndex,
      getSrcPixel,
      parameters,
    }) => {
      const srcPixel = getSrcPixel(coord);

      const [offsetX, offsetY, groupCount, ...colors] = parameters;

      const ribbonCount = colors.length * groupCount;
      const ribbonArcDegrees = Math.round(360 / ribbonCount);
      // Need to make sure ribbonCount is always a multiple of the number of images, otherwise we
      //  won't get a smooth transition.
      // We'll cut off colors from the end of the list until we get an even multiple.
      let colorsLength = colors.length;
      while ((ribbonCount / colorsLength).toFixed(2).slice(-2) !== '00') {
        colorsLength -= 1;
      }

      // Make the transparent parts colorful
      if (isTransparent(srcPixel)) {
        const centerX = dimensions[0] / 2 + offsetX;
        const centerY = dimensions[1] / 2 + offsetY;
        const [x, y] = coord;
        const xRelCenter = x - centerX;
        const yRelCenter = y - centerY;

        const pointAngle =
          (360 + (Math.atan2(yRelCenter, xRelCenter) * 180) / Math.PI) % 360;

        const colorIdx =
          Math.floor(pointAngle / ribbonArcDegrees) % colorsLength;

        // Increment colorIdx based on current frame progress
        const frameProgress = frameIndex / frameCount;
        const idx =
          (Math.floor(frameProgress * colorsLength) + colorIdx) % colorsLength;
        return colors[idx];
      }

      return srcPixel;
    }
  ),
});
