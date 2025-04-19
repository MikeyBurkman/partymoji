
/**
 * Wraps an asynchronous function and ensures its return value is ignored.
 * This utility is useful for explicitly discarding the result of a Promise
 * while still invoking the function.
 *
 * @template ARGS - The types of the arguments that the input function accepts.
 * @param fn - An asynchronous function that returns a Promise.
 * @returns A new function that takes the same arguments as `fn` but returns `void`.
 *
 * @example
 * ```typescript
 * async function fetchData(url: string): Promise<string> {
 *   // Simulate fetching data
 *   return "data";
 * }
 *
 * const fetchDataWithoutResult = promiseWithoutResult(fetchData);
 * fetchDataWithoutResult("https://example.com"); // The result of fetchData is ignored.
 * ```
 */
export function promiseWithoutResult<ARGS extends Array<unknown>>(
  fn: (...args: ARGS) => Promise<unknown>,
): (...args: ARGS) => void {
  return (...args) => {
    void fn(...args);
  };
}
