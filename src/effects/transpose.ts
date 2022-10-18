import { buildEffect } from '../domain/types';
import { mapImage } from '../domain/utils/image';
import { intParam } from '../params/intParam';

export const transpose = buildEffect({
  name: 'Transpose',
  description: 'Move the image left or right, up or down',
  params: [
    intParam({ name: 'X', defaultValue: 0 }),
    intParam({ name: 'Y', defaultValue: 0 }),
  ] as const,
  fn: mapImage(({ coord: [x, y], getSrcPixel, parameters: [transX, transY] }) =>
    getSrcPixel([x + transX, y + transY])
  ),
});
