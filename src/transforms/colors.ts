import { buildTransform } from '../domain/types';
import {
  isTransparent,
  getAveragePixelValue,
  mapImage,
  fromHexColor,
} from '../domain/utils';
import { colorPickerParam } from '../params/colorPickerParam';
import { variableLengthParam } from '../params/variableLengthParam';

const DEFAULT_COLORS = [
  '#FF8D8B',
  '#FED689',
  '#88FF89',
  '#87FFFF',
  '#8BB5FE',
  '#D78CFF',
  '#FF8CFF',
  '#FF68F7',
  '#FE6CB7',
  '#FF6968',
].map(fromHexColor);

export const colors = buildTransform({
  name: 'Colors',
  description: 'Make the image flash different colors',
  params: [
    variableLengthParam({
      name: 'Colors',
      newParamText: 'New Color',
      defaultValue: DEFAULT_COLORS,
      createNewParam: () =>
        colorPickerParam({
          name: 'Color',
        }),
    }),
  ],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel, parameters }) => {
    const srcPixel = getSrcPixel(coord);

    const [colors] = parameters;

    if (isTransparent(srcPixel)) {
      return [0, 0, 0, 0];
    }

    const colorIdx = Math.floor((frameIndex / frameCount) * colors.length);
    const chosenColor = colors[colorIdx];

    const gray = getAveragePixelValue(srcPixel);

    return [
      (gray * chosenColor[0]) / 255,
      (gray * chosenColor[1]) / 255,
      (gray * chosenColor[2]) / 255,
      255,
    ];
  }),
});
