import { frameToCanvas, canvasToFrame } from '~/domain/utils/canvas';
import { IS_WORKER } from '~/domain/utils/isWorker';

const worker = self as unknown as DedicatedWorkerGlobalScope;
worker.onmessage = () => {
  const data = frameToCanvas({
    dimensions: [2, 1],
    frame: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]),
  });
  worker.postMessage({
    isWorker: IS_WORKER,
    isOffscreen: data.canvas instanceof OffscreenCanvas,
    pixels: Array.from(canvasToFrame(data)),
  });
};
