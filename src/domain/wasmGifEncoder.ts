import { Color, Image } from './types';
import init, { create_gif, create_gif_with_transparency } from "~wasm/gif_encoder/pkg";
import { miscUtil } from './utils';

let isInitialized = false;

const initWasm = async () => {
    if (isInitialized) {
        return;
    }

    console.info('Initializing WASM');
    await init().then(() => {
        console.info('WASM initialized');
        isInitialized = true;
    }).catch((err) => {
        console.error('WASM initialization failed', err);
    });
};

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
    return initWasm().then(() => {
        const [width, height] = image.dimensions;

        const flattenedFrames = new Uint8Array(
            image.frames.reduce((acc, frame) => acc + frame.length, 0)
        );
        let offset = 0;
        for (const frame of image.frames) {
            flattenedFrames.set(frame, offset);
            offset += frame.length;
        }

        let array: Uint8Array;

        // if (transparentColor) {
        //     array = create_gif_with_transparency(width, height, flattenedFrames, fps, new Uint8Array(transparentColor));
        // }
        // else {
            array = create_gif(width, height, flattenedFrames, fps);
        // }

        const blob = new Blob([array], { type: 'image/gif' });
        return miscUtil.blobOrFileToDataUrl(blob);
    });
    // TODO: Catch and do it in JS?
}