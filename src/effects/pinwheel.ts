import { buildEffect, Coord } from '../domain/types';
import {
  calculateAngle,
  fromHexColor,
  isTransparent,
  mapImageWithPrecompute,
} from '../domain/utils';
import { colorPickerParam } from '../params/colorPickerParam';
import { intParam } from '../params/intParam';
import { sliderParam } from '../params/sliderParam';
import { variableLengthParam } from '../params/variableLengthParam';

const DEFAULT_COLORS = [
  '#FF0000',
  '#FF9600',
  '#FFFF00',
  '#00FF00',
  '#00FF96',
  '#00FFFF',
  '#0000FF',
  '#B400FF',
].map(fromHexColor);

export const pinwheel = buildEffect({
  name: 'Pinwheel',
  description: 'Create a pinwheel of colors',
  params: [
    sliderParam({
      name: 'Group Count',
      description: 'How many times each color is repeated',
      defaultValue: 1,
      min: 1,
      max: 24,
    }),
    variableLengthParam({
      name: 'Colors',
      newParamText: 'New Color',
      description: 'Colors for the pinwheel',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
          defaultValue: DEFAULT_COLORS[0],
        }),
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
  fn: mapImageWithPrecompute(
    ({ parameters: [groupCount, colors, offsetX, offsetY] }) => {
      const ribbonCount = colors.length * groupCount;
      const ribbonArcDegrees = Math.round(360 / ribbonCount);
      // Need to make sure ribbonCount is always a multiple of the number of images, otherwise we
      //  won't get a smooth transition.
      // We'll cut off colors from the end of the list until we get an even multiple.
      let colorsLength = colors.length;
      while ((ribbonCount / colorsLength).toFixed(2).slice(-2) !== '00') {
        colorsLength -= 1;
      }

      return {
        colorsLength,
        ribbonArcDegrees,
      };
    },
    ({
      computed: { ribbonArcDegrees, colorsLength },
      coord,
      dimensions,
      animationProgress,
      getSrcPixel,
      parameters: [groupCount, colors, offsetX, offsetY],
    }) => {
      const srcPixel = getSrcPixel(coord);

      if (!isTransparent(srcPixel)) {
        return srcPixel;
      }

      // Make the transparent parts colorful
      const center: Coord = [
        dimensions[0] / 2 + offsetX,
        dimensions[1] / 2 - offsetY,
      ];
      const pointAngle = calculateAngle(coord, center);

      const colorIdx = Math.floor(pointAngle / ribbonArcDegrees) % colorsLength;

      // Increment colorIdx based on current frame progress
      const idx =
        (Math.floor(animationProgress * colorsLength) + colorIdx) %
        colorsLength;
      return colors[idx];
    }
  ),
});
