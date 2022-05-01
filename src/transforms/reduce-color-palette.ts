import { minBy, sortBy } from 'remeda';
import { buildTransform, Color } from '../domain/types';
import {
  colorDiff,
  fromHexColor,
  getPixelFromSource,
  isTransparent,
  mapCoords,
  mapFrames,
  mapImageWithPrecompute,
  toHexColor,
  TRANSPARENT_COLOR,
} from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const reduceColorPalette = buildTransform({
  name: 'Reduce Color Palette',
  description:
    'Reduce the number of unique colors in the gif, to reduce the file size.' +
    'This can be a slow operation depending on the number of final colors',
  params: [
    sliderParam({
      name: 'Number of Colors',
      description: 'Number of unique colors that will be in the result',
      defaultValue: 20,
      min: 1,
      max: 100,
    }),
  ] as const,
  fn: mapImageWithPrecompute(
    ({ image, parameters: [numColors] }) => {
      // Buid up a set of all unique colors.
      // These will be our data points that we're going to group into to N clusters
      const allColorsSet = new Set<string>();
      mapFrames(image, (frame) =>
        mapCoords(image.dimensions, (coord) => {
          const px = getPixelFromSource(image.dimensions, frame, coord);
          if (!isTransparent(px)) {
            allColorsSet.add(toHexColor(px));
          }
          return TRANSPARENT_COLOR; // Not actually used, just makes TS happy
        })
      );

      const allColors = Array.from(allColorsSet).map(fromHexColor);

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
        let closetsColorDist = colorDiff(
          allColors[i],
          allColors[closestColorIdx]
        );
        // Find the other color that is closest to this one
        for (let k = 0; k < allColors.length; k += 1) {
          if (k === i) {
            // Don't check the distance between this color and itself
            continue;
          }
          const dist = colorDiff(allColors[k], allColors[i]);
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
      if (isTransparent(px)) {
        return px;
      }
      // Find the color in the palette this one is closest to
      const closestColor = minBy(colorPalette, (top) => colorDiff(top, px))!;
      return closestColor;
    }
  ),
});
