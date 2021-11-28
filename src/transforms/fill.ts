import { buildTransform, Coord, Image } from '../domain/types';
import { mapImage, setPixel, TRANSPARENT_COLOR } from '../domain/utils';
import { sliderParam } from '../params/sliderParam';

export const fill = buildTransform({
  disabled: true,
  name: 'Fill Transparent',
  description:
    'Makes transparent all pixels of similar color surrounding a point',
  params: [
    sliderParam({
      name: 'Tolerance',
      defaultValue: 50,
      min: 0,
      max: 100,
    }),
  ] as const,
  fn: mapImage(({ coord, getSrcPixel, parameters: [tolerance] }) => {
    const matchP = getSrcPixel([0, 0]);

    const p = getSrcPixel(coord);
    const [x, y] = coord;

    return [0, 0, 0, 0];
  }),
});

const fillFn = (image: Image, frameIndex: number, coord: Coord) => {
  const visited = (() => {
    const set = new Set<string>();
    return {
      set: (x: number, y: number) => {
        set.add(`${x}-${y}`);
      },
      has: (x: number, y: number) => set.has(`${x}-${y}`),
    };
  })();

  const set = (x: number, y: number) =>
    setPixel({
      image,
      frameIndex,
      color: TRANSPARENT_COLOR,
      coord: [x - 1, y],
    });

  const s: { x1: number; x2: number; y: number; dy: number }[] = [];
  s.push({ x1: coord[0], x2: coord[0], y: coord[1], dy: 1 });
  s.push({ x1: coord[0], x2: coord[0], y: coord[1] - 1, dy: -1 });

  while (s.length > 0) {
    const n = s.pop()!;
    let x = n.x1;
    let y = n.y;
    if (visited.has(x, y)) {
      while (visited.has(x - 1, y)) {
        set(x - 1, y);
        x = x - 1;
      }
    }

    if (x < n.x1) {
      s.push({ x1: x, x2: n.x1 - 1, y: y - n.dy, dy: n.dy * -1 });
    }

    while (n.x1 < n.x2) {
      while (visited.has(n.x1, y)) {
        set(n.x1, y);
      }
    }
  }
};

/*
fn fill(x, y):
  if not Inside(x, y) then return
  let s = new empty queue or stack
  Add (x, x, y, 1) to s
  Add (x, x, y - 1, -1) to s
  while s is not empty:
    Remove an (x1, x2, y, dy) from s
    let x = x1
    if Inside(x, y):
      while Inside(x - 1, y):
        Set(x - 1, y)
        x = x - 1
    if x < x1:
      Add (x, x1-1, y-dy, -dy) to s
    while x1 < x2:
      while Inside(x1, y):
        Set(x1, y)
        x1 = x1 + 1
      Add (x, x1 - 1, y+dy, dy) to s
      if x1 - 1 > x2:
        Add (x2 + 1, x1 - 1, y-dy, -dy)
      while x1 < x2 and not Inside(x1, y):
        x1 = x1 + 1
      x = x1
*/
