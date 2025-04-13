import { Color, Image } from './types';
import { create_gif_data_url } from 'gif_encoder_wasm';

export const wasmCreateGif = ({
  image,
  transparentColor,
  fps,
}: {
  image: Image;
  transparentColor: Color | undefined;
  fps: number;
}): string => {
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

  console.info(
    ' Calling WASM with width: ',
    width,
    'height: ',
    height,
    'transparentColor: ',
    transparentColor,
    'fps: ',
    fps,
  );

  return create_gif_data_url(
    width,
    height,
    flattenedFrames,
    fps,
    transparentColor && new Uint8Array(transparentColor),
  );
};
