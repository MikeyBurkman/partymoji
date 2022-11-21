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

export const debounce = <T extends Function>(func: T, timeout: number): T => {
  let timer: NodeJS.Timeout | undefined;
  return ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(args);
    }, timeout);
  }) as any as T;
};

export const isUrl = (s: string): boolean =>
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
    s
  );

export const copyToClipboard = (s: string): Promise<void> =>
  navigator.clipboard.writeText(s);

export const readFromClipboard = (): Promise<string> =>
  navigator.clipboard.readText();
