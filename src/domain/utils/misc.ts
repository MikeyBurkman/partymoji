import { Coord } from '../types';

/**
 * Asserts that a given value is truthy. Uses TypeScript 3.7 assertion types.
 *
 * @example
 * ```ts
 * const foo: string|undefined = getSomeData();
 * asert(foo, 'foo must be defined');
 * console.log(foo.length); // OK
 * ```
 */
export function assert(
  condition: unknown,
  message = 'Unexpected falsy value'
): asserts condition {
  if (!condition) {
    throw new Error(`AssertionFailure: ${message}`);
  }
}

/** Returns a new array where the item at the given index is replaced by the given value */
export const replaceIndex = <T>(
  arr: T[],
  index: number,
  newValueFn: (oldValue: T) => T
): T[] => arr.map((x, i) => (index === i ? newValueFn(x) : x));

/**
 * Returns a new array with the new item inserted into the given index.
 * @example
 * insertInto(['a','b','c'], 1, 'z'); // ['a','z','b','c']
 */
export const insertInto = <T>(arr: T[], index: number, newValue: T): T[] => {
  return [...arr.slice(0, index), newValue, ...arr.slice(index)];
};

export const isUrl = (s: string): boolean =>
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
    s
  );

export const copyToClipboard = (s: string): Promise<void> =>
  navigator.clipboard.writeText(s);

export const readFromClipboard = (): Promise<string> =>
  navigator.clipboard.readText();

export const clamp = (n: number, min: number, max: number) =>
  Math.max(Math.min(n, max), min);

/**
 * Calculate a value between v1 and v2, determined by percent.
 * @param percent Between 0 and 100. 0 is all v1, and 100 is all v2.
 */
export const weightedValue = (percent: number, v1: number, v2: number) =>
  (1 - percent / 100) * v1 + (percent / 100) * v2;

/**
 * Returns the angle in degrees (0 to 360) from c2 to c1
 */
export const calculateAngle = (c1: Coord, c2: Coord): number => {
  const xRelCenter = c2[0] - c1[0];
  const yRelCenter = c2[1] - c1[1];
  return (360 + (Math.atan2(yRelCenter, xRelCenter) * 180) / Math.PI) % 360;
};

export const pointDistance = ([x1, y1]: Coord, [x2, y2]: Coord): number => {
  const xDiff = Math.pow(x2 - x1, 2);
  const yDiff = Math.pow(y2 - y1, 2);
  return Math.sqrt(xDiff + yDiff);
};
