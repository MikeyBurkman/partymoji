import { imageUtil } from '~/domain/utils';
import { intParam } from '~/params';
import { buildEffect } from './utils';

export const transpose = buildEffect({
  name: 'Transpose',
  description: 'Move the image left or right, up or down',
  params: [
    intParam({ name: 'X', defaultValue: 0 }),
    intParam({ name: 'Y', defaultValue: 0 }),
  ] as const,
  fn: imageUtil.mapImage(
    ({ coord: [x, y], getSrcPixel, parameters: [transX, transY] }) =>
      getSrcPixel([x + transX, y + transY])
  ),
});
