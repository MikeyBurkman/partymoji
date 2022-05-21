import { buildEffect } from '../domain/types';
import { mapImage } from '../domain/utils';

export const spin = buildEffect({
  disabled: true,
  name: 'Spin',
  description: 'Make the image spin in a 3D-like way',
  params: [],
  fn: mapImage(
    ({ image, coord: [x, y], frameCount, frameIndex, getSrcPixel }) => {
      const centerX = image.dimensions[0] / 2;
      const idx = frameIndex / frameCount;
      // 0% -> 0
      // 25% -> Pi / 2
      // 50% -> Pi
      // 75% -> 3/2 * Pi
      // 100% -> 2 * Pi
      const angle = 2 * Math.PI * idx;
      const newX = Math.round(centerX + x * Math.cos(angle));
      return getSrcPixel([newX, y]);
    }
  ),
});

/*
x = centerX
newX = centerX

x = 0, idx = 0, angle = cos(0) = 1, relX = centerX - 0
  newX = 0
x = 0, idx = 25%, angle = cos(45deg) ~ 0.5, relX = centerX - 0
  newX = centerX - cos(45) * x
x = 0, idx = 50%, angle = cos(90deg) = 0, relX = centerX - 0
  newX = (centerX - 0)

x = 25%, idx = 25%, angle ~ 0.5, relX = centerX - 0
  newX = centerX - angle * x
*/
