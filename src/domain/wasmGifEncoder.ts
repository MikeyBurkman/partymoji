import { Color, Image } from './types';
import { create_gif_data_url } from "gif_encoder_wasm";


export const wasmCreateGif = async ({
    image,
    transparentColor,
    fps,
}: {
    image: Image;
    transparentColor: Color | undefined;
    fps: number;
}): Promise<string> => {
    console.info('Creating GIF with WASM');
    return new Promise<string>((resolve) => {

        const [width, height] = image.dimensions;

        const flattenedFrames = new Uint8Array(
            image.frames.reduce((acc, frame) => acc + frame.length, 0)
        );
        let offset = 0;
        for (const frame of image.frames) {
            flattenedFrames.set(frame, offset);
            offset += frame.length;
        }

        const url = create_gif_data_url(width, height, flattenedFrames, fps, transparentColor && new Uint8Array(transparentColor));

        console.warn('URL:', url);

        resolve(url);
    });
    // TODO: Catch and do it in JS?
}