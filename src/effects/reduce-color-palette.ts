import { minBy, sortBy } from 'remeda';
import type { Color } from '~/domain/types';
import { colorUtil, imageUtil } from '~/domain/utils';
import { sliderParam } from '~/params';
import { buildEffect } from './utils';

export const reduceColorPalette = buildEffect({
  name: 'Reduce Color Palette',
  group: 'Colors',
  description:
    'Reduce the number of unique colors in the gif, to reduce the file size.',
  secondaryDescription:
    'This can be a slow operation depending on the number of final colors',
  params: [
    sliderParam({
      name: 'Percent Reduction',
      description:
        '0% will have no effect, 100% will result in just one unique color in the result',
      defaultValue: 70,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: imageUtil.mapImageWithPrecompute(
    ({ image, parameters: [percentReduction] }) => {
      // Buid up a set of all unique colors.
      // These will be our data points that we're going to group into to N clusters
      const allColorsSet = new Set<string>();
      imageUtil.mapFrames(image, (frame) =>
        imageUtil.mapCoords(image.dimensions, (coord) => {
          const px = imageUtil.getPixelFromSource(
            image.dimensions,
            frame,
            coord
          );
          allColorsSet.add(colorUtil.toHexColor(px));
          return colorUtil.TRANSPARENT_COLOR; // Not actually used, just makes TS happy
        })
      );

      const allColors = Array.from(allColorsSet).map(colorUtil.fromHexColor);
      const numColors = Math.max(
        Math.floor((allColors.length * (100 - percentReduction)) / 100),
        1
      );

      // Create a mapping of each unique color to the list of colors are the closest to it.
      // We'll then pick the top N colors.
      // Lastly, we'll replace every pixel with the color that it reduces to.

      // colorMap[i].numClosestColors is the number of colors closest to allColors[i]
      const colorMap: { color: Color; numClosestColors: number }[] =
        allColors.map((c) => ({
          color: c,
          numClosestColors: 0,
        }));

      for (let i = 1; i < allColors.length; i += 1) {
        let closestColorIdx = 0;
        let closetsColorDist = colorUtil.colorDiff(
          allColors[i],
          allColors[closestColorIdx]
        );
        // Find the other color that is closest to this one
        for (let k = 0; k < allColors.length; k += 1) {
          if (k === i) {
            // Don't check the distance between this color and itself
            continue;
          }
          const dist = colorUtil.colorDiff(allColors[k], allColors[i]);
          if (dist < closetsColorDist) {
            closestColorIdx = k;
            closetsColorDist = dist;
          }
        }
        colorMap[closestColorIdx].numClosestColors += 1;
      }

      const colorPalette = sortBy(colorMap, [(c) => c.numClosestColors, 'desc'])
        .slice(0, numColors)
        .map(({ color }) => color);

      return { colorPalette };
    },
    ({ coord, getSrcPixel, computed: { colorPalette } }) => {
      const px = getSrcPixel(coord);
      // Find the color in the palette this one is closest to
      const closestColor = minBy(colorPalette, (top) =>
        colorUtil.colorDiff(top, px)
      )!;
      return closestColor;
    }
  ),
});
