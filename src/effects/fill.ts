import type { Color, Coord, Image } from '~/domain/types';
import { colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, sliderParam } from '~/params';
import { buildEffect } from './utils';

// TODO
export const fill = buildEffect({
  disabled: true,
  group: 'Image',
  name: 'Fill Transparent',
  description:
    'Makes transparent all pixels of similar color surrounding a point',
  params: [
    colorPickerParam({
      name: 'Color to Make Transparent',
      defaultValue: [0, 0, 0, 255],
    }),
    sliderParam({
      name: 'Tolerance',
      defaultValue: 10,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: ({ image: oldImage, parameters: [colorToReplace, tolerance] }) => {
    const image = imageUtil.duplicateImage(oldImage);

    for (
      let frameIndex = 0;
      frameIndex < image.frames.length;
      frameIndex += 1
    ) {
      floodFill({
        image,
        frameIndex,
        colorToReplace,
        newColor: colorUtil.TRANSPARENT_COLOR,
        tolerance,
      });
    }

    return image;
  },
});

// Mutates the given image/frameIndex
const floodFill = ({
  image,
  frameIndex,
  colorToReplace,
  newColor,
  tolerance,
}: {
  image: Image;
  frameIndex: number;
  colorToReplace: Color;
  tolerance: number;
  newColor: Color;
}) => {
  const visited = (() => {
    const set = new Set<string>();
    return {
      add: ([x, y]: Coord) => {
        set.add(`${x}-${y}`);
      },
      has: ([x, y]: Coord) => set.has(`${x}-${y}`),
    };
  })();
  const stack: Array<Coord> = [[0, image.dimensions[1] - 1]]; // Bottom right pixel
  const push = (coord: Coord) => {
    if (!visited.has(coord)) {
      visited.add(coord);
      stack.push(coord);
    }
  };

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const coord = stack.pop()!;
    const [x, y] = coord;
    if (
      x < 0 ||
      x >= image.dimensions[0] ||
      y < 0 ||
      y >= image.dimensions[1]
    ) {
      // Out of bounds
      continue;
    }

    const currColor = imageUtil.getPixelFromSource(
      image.dimensions,
      image.frames[frameIndex],
      coord,
    );
    if (colorUtil.colorDiff(currColor, colorToReplace) * 100 > tolerance) {
      continue;
    }

    imageUtil.setPixel({
      image,
      frameIndex,
      color: newColor,
      coord: coord,
    });

    push([x + 1, y]);
    push([x - 1, y]);
    push([x, y + y]);
    push([x, y - 1]);
  }
};
