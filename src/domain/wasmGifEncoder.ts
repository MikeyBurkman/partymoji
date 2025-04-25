import { Image } from './types';
import init, { create_gif_data_url } from '@wasm/gif_encoder_wasm';

let initialized = false;

const initializeWasm = async () => {
  if (initialized) {
    return;
  }
  console.time('Initialize WASM');
  await init();
  console.timeEnd('Initialize WASM');

  initialized = true;
};

export const wasmCreateGif = async ({
  image,
  fps,
}: {
  image: Image;
  fps: number;
}): Promise<string> => {
  console.info('Creating GIF with WASM');
  const [width, height] = image.dimensions;

  const flattenedFrames = new Uint8Array(
    image.frames.reduce((acc, frame) => acc + frame.length, 0),
  );
  let offset = 0;
  for (const frame of image.frames) {
    flattenedFrames.set(frame, offset);
    offset += frame.length;
  }

  await initializeWasm();

  console.debug('Calling WASM', {
    width,
    height,
    fps,
  });

  return create_gif_data_url(width, height, flattenedFrames, fps);
};
