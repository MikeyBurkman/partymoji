import type { Coord } from '~/domain/types';
import { colorUtil, miscUtil, imageUtil } from '~/domain/utils';
import {
  colorPickerParam,
  intParam,
  sliderParam,
  variableLengthParam,
} from '~/params';
import { buildEffect } from './utils';
import { precomputeValues } from './precompute-values';
import { createBackgroundCompositor } from './background-compositor';

const DEFAULT_COLORS = [
  '#FF0000',
  '#FF9600',
  '#FFFF00',
  '#00FF00',
  '#00FF96',
  '#00FFFF',
  '#0000FF',
  '#B400FF',
].map(colorUtil.fromHexColor);

export const pinwheelColors = buildEffect({
  name: 'Pinwheel Colors',
  group: 'Party',
  description: 'Create a background pinwheel of colors of your choosing',
  requiresAnimation: true,
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
    sliderParam({
      name: 'Foreground Opacity',
      defaultValue: 100,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({
    image,
    parameters: [groupCount, colors, offsetX, offsetY, opacity],
  }) => {
    const [width, height] = image.dimensions;
    const composite = createBackgroundCompositor(image.dimensions, opacity);
    const ribbonCount = colors.length * groupCount;
    const ribbonArcDegrees = Math.round(360 / ribbonCount);
    // Need to make sure ribbonCount is always a multiple of the number of images, otherwise we
    //  won't get a smooth transition.
    // We'll cut off colors from the end of the list until we get an even multiple.
    let colorsLength = colors.length;
    while (!(ribbonCount / colorsLength).toFixed(2).endsWith('00')) {
      colorsLength -= 1;
    }

    const center: Coord = [width / 2 + offsetX, height / 2 - offsetY];
    const baseValues =
      image.frames.length === 0
        ? []
        : precomputeValues(image.dimensions, (coord) => {
            const angle = miscUtil.calculateAngle(coord, center);
            return Math.floor(angle / ribbonArcDegrees) % colorsLength;
          });
    return imageUtil.mapFrames(image, (frame, frameIndex, frameCount) => {
      const animationProgress = frameIndex / frameCount;
      const shift = Math.floor(animationProgress * colorsLength);
      const background = imageUtil.mapCoords(
        image.dimensions,
        ([x, y]) => colors[(shift + baseValues[y * width + x]) % colorsLength],
      );
      return composite(background, frame);
    });
  },
});
