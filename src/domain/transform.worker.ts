/* eslint-disable no-restricted-globals */
import { runTransforms } from './run';

console.log('POOPY');
console.log('$ runTransforms', runTransforms);
const ctx: Worker = self as any;
console.log('$ self', ctx);
ctx.addEventListener('message', async (event) => {
  console.log('EVENT:', event);
  const results = await runTransforms(event.data);
  console.log('RESULTS: ', results.length);
  ctx.postMessage(results);
});
