import { mapFrames, mapCoords, getPixelFromSource } from '../domain/utils';
import { buildTransform, Coord } from '../domain/types';

export const roxbury = buildTransform({
  name: 'Roxbury',
  params: [],
  fn: ({ image }) =>
    mapFrames(image, (data, frameIndex, frameCount) => {
      const idx = frameIndex / frameCount;
      // 4 phases:
      //  0 -> freeze
      //  1 -> rotate clockwise
      //  2 -> freeze
      //  3 -> rotate counter-clockwise
      const phase = Math.floor(idx * 4);
      const phaseIdx = (idx - phase / 4) * 4;

      const maxAngle = (Math.PI / 2) * 0.2; // 40% of 90 degrees

      const angle =
        phase === 0
          ? 0
          : phase === 1
          ? phaseIdx * maxAngle // Rotate clockwise
          : phase === 2
          ? maxAngle // Freeze!
          : (1 - phaseIdx) * maxAngle; // Rotate counter-clockwise

      const cos = Math.cos(-angle * 1.35);
      const sin = Math.sin(-angle * 1.35);

      const rotatePointX = image.dimensions[0] * 0.25;
      const rotatePointY = image.dimensions[1] * 0.7;

      return mapCoords(image.dimensions, (coord) => {
        const [x, y] = coord;
        const xRelCenter = Math.floor(x - rotatePointX + 8 * Math.sin(angle));
        const yRelCenter = Math.floor(y - rotatePointY + 8 * Math.cos(angle));

        const newCoord: Coord = [
          Math.round(rotatePointX + xRelCenter * cos - yRelCenter * sin),
          Math.round(rotatePointY + yRelCenter * cos + xRelCenter * sin),
        ];

        return getPixelFromSource(image.dimensions, data, newCoord);
      });
    }),
});
