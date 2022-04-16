import { buildTransform, Coord } from '../domain/types';
import { mapImageWithPrecompute } from '../domain/utils';

export const roxbury = buildTransform({
  name: 'Roxbury',
  description: "Baby, don't hurt me",
  params: [],
  fn: mapImageWithPrecompute(
    ({ dimensions: [width, height], animationProgress }) => {
      // 4 phases:
      //  0 -> freeze
      //  1 -> rotate clockwise
      //  2 -> freeze
      //  3 -> rotate counter-clockwise
      const phase = Math.floor(animationProgress * 4);
      const phaseIdx = (animationProgress - phase / 4) * 4;

      const maxAngle = (Math.PI / 2) * 0.2; // 40% of 90 degrees

      const angle =
        phase === 0
          ? 0
          : phase === 1
          ? phaseIdx * maxAngle // Rotate clockwise
          : phase === 2
          ? maxAngle // Freeze!
          : (1 - phaseIdx) * maxAngle; // Rotate counter-clockwise

      return {
        angle,
        cos: Math.cos(-angle * 1.35),
        sin: Math.sin(-angle * 1.35),
        rotatePointX: width * 0.25,
        rotatePointY: height * 0.7,
      };
    },
    ({
      computed: { angle, cos, sin, rotatePointX, rotatePointY },
      coord: [x, y],
      getSrcPixel,
    }) => {
      const xRelCenter = Math.floor(x - rotatePointX + 8 * Math.sin(angle));
      const yRelCenter = Math.floor(y - rotatePointY + 8 * Math.cos(angle));

      const newCoord: Coord = [
        Math.round(rotatePointX + xRelCenter * cos - yRelCenter * sin),
        Math.round(rotatePointY + yRelCenter * cos + xRelCenter * sin),
      ];

      return getSrcPixel(newCoord);
    }
  ),
});
