import { buildTransform } from '../types';
import { mapImage, isTransparent, repeat, fromHexColor } from '../utils';
import { colorPickerParam } from '../../params/colorPickerParam';
import { intParam } from '../../params/intParam';
import { variableLengthParam } from '../../params/variableLengthParam';

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

export const radiance = buildTransform({
  name: 'Radiance',
  params: [
    intParam({
      name: 'Group Count',
      defaultValue: 1,
      min: 1,
    }),
    variableLengthParam({
      name: 'Colors',
      newParamText: 'New Color',
      description: 'Colors radiating outwards',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
        }),
    }),
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

      const [groupCount, colors] = parameters;
      const colorList = repeat(groupCount).flatMap(() => colors);

      // Make the transparent parts colorful
      if (isTransparent(srcPixel)) {
        const [width, height] = dimensions;
        const centerX = width / 2;
        const centerY = height / 2;
        const [x, y] = coord;
        const xRelCenter = x - centerX;
        const yRelCenter = y - centerY;

        const maxDist = Math.sqrt(
          (width / 2) * (width / 2) + (height / 2) * (height / 2)
        );
        const distFromCenter = Math.sqrt(
          yRelCenter * yRelCenter + xRelCenter * xRelCenter
        );

        const colorIdx =
          Math.floor((1 - distFromCenter / maxDist) * colorList.length) %
          colorList.length;

        // Increment colorIdx based on current frame progress
        const frameProgress = frameIndex / frameCount;
        const idx =
          (Math.floor(frameProgress * colorList.length) + colorIdx) %
          colorList.length;
        return colorList[idx];
      }

      return srcPixel;
    }
  ),
});
