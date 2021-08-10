import { buildTransform } from '../types';
import { mapImage } from '../utils';
import { intParam } from './params/intParam';

export const transpose = buildTransform({
  name: 'Transpose',
  params: [
    intParam({ name: 'X', defaultValue: 0 }),
    intParam({ name: 'Y', defaultValue: 0 }),
  ],
  fn: mapImage(({ coord, getSrcPixel, parameters }) => {
    const [transX, transY] = parameters;
    const [x, y] = coord;

    return getSrcPixel([x + transX, y + transY]);
  }),
});
