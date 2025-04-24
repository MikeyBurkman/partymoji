import { canvasUtil } from '~/domain/utils';
import { sliderParam, dropdownParam } from '~/params';
import { buildEffect } from './utils';
import { mapFrames } from '~/domain/utils/image';

/*
0 copies
  size: 1
  X locations: [0]
  Visible at top: [true]
1 copy
  size: 1/2
  X locations: [0, width * 1/2]
  Visible at top: [true, false]
2 copies
  size: 1/3
  X locations: [0, width * 1/3, width * 2/3]
  Visible at top: [true, false, true]
3 copies
  size: 1/4
  X locations: [0, width * 1/4, width * 2/4, width * 3/4]
  Visible at top: [true, false, true]
N copies
  size: 1/(N+1)
  X locations: [0, width * 1/(N+1), width * 2/(N+1), ...]
  Visible at top: Index % 2 === 0

-------

Draws a grid of copies of the image:
x - x - x - x
-------------
- x - x - x -
x - x - x - x
- x - x - x -
x - x - x - x

The x coordinates of each remains the same through the animation.
But the y coordinates are offset by a certain amount with each frame.
Need to draw at least one extra copy of the image above the top of the canvas.

*/

export const rain = buildEffect({
  name: 'Rain',
  group: 'Misc',
  description: 'Make the image rain from above',
  requiresAnimation: true,
  params: [
    sliderParam({
      name: 'Copies',
      description: 'Positive number',
      defaultValue: 2,
      min: 0,
      max: 10,
    }),
    sliderParam({
      name: 'Spacing',
      description: 'Spacing between copies, as a percentage of the image size',
      defaultValue: 25,
      min: 0,
      max: 100,
    }),
    dropdownParam({
      name: 'Spin',
      description: 'Spin the copies as they fall',
      options: [
        {
          name: 'No spin',
          value: 'none',
        },
        {
          name: 'Clockwise',
          value: 'clockwise',
        },
        {
          name: 'Counter-clockwise',
          value: 'counter-clockwise',
        },
      ],
      defaultValue: 'none',
    } as const),
  ] as const,
  fn: ({ image, parameters: [copies, spacing, spin] }) => {
    const [width, height] = image.dimensions;

    // Total copy width/height are the size of each copy including padding on all sides
    // This is solely based on the size of the image and the number of copies.
    const copyWidthWithPadding = Math.ceil(width / (copies + 1));
    const copyHeightWithPadding = Math.ceil(height / (copies + 1));
    const numVerticalCopies = Math.ceil(height / copyHeightWithPadding);

    const horizontalPadding = Math.floor(
      (copyWidthWithPadding * spacing) / 100,
    );
    const verticalPadding = Math.floor((copyHeightWithPadding * spacing) / 100);

    const copyWidth = copyWidthWithPadding - horizontalPadding;
    const copyHeight = copyHeightWithPadding - verticalPadding;

    return mapFrames(image, (imageData, frameIndex, frameCount) => {
      const percent = frameIndex / frameCount;

      const baseImage = canvasUtil.frameToCanvas({
        dimensions: image.dimensions,
        frame: imageData,
      });

      const canvasToDraw = (() => {
        if (spin === 'none') {
          return baseImage;
        }

        const dir = spin === 'clockwise' ? -1 : 1;
        const rotateCanvas = canvasUtil.createCanvas(image.dimensions);
        canvasUtil.applyRotation(rotateCanvas, percent * 360 * dir);
        rotateCanvas.ctx.drawImage(baseImage.canvas, 0, 0);
        return rotateCanvas;
      })();

      const canvasData = canvasUtil.createCanvas(image.dimensions);
      const ctx = canvasData.ctx;

      for (let i = 0; i <= copies; i++) {
        const x = Math.ceil(width * (i / (copies + 1)));

        for (let j = 0; j < numVerticalCopies + 2; j++) {
          if ((i + j) % 2 === 0) {
            ctx.drawImage(
              canvasToDraw.canvas,
              0, // source x
              0, // source y
              width, // source width -- always draw the entire base image
              height, // source height
              x + horizontalPadding / 2, // destination x
              j * copyHeightWithPadding +
                (percent * copyHeightWithPadding - copyHeightWithPadding) * 2, // destination y
              copyWidth, // destination width
              copyHeight, // destination height
            );
          }
        }
      }

      return canvasUtil.canvasToFrame(canvasData);
    });
  },
});
