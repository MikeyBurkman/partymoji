// @ts-ignore
import getPixels from 'get-pixels';
import { parseGIF, decompressFrames } from 'gifuct-js';
import type { Dimensions, FrameData, Image } from '~/domain/types';
import { canvasToFrame, createCanvas } from './canvas';
import * as miscUtil from './misc';
import { debugLog } from '../env';

const toArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });

const readGifFromFile = async (
  file: File
): Promise<{ image: Image; fps: number }> => {
  const buffer = await toArrayBuffer(file);
  const gif = parseGIF(buffer);

  const dimensions: Dimensions = [gif.lsd.width, gif.lsd.height];
  const finalCanvas = createCanvas(dimensions);

  const frameDelays: number[] = [];

  const frames = decompressFrames(gif, true).map(
    (parsedFrame): Uint8ClampedArray => {
      const delay = parsedFrame.delay;
      if (typeof delay === 'number' && delay > 0) {
        // Some gifs have undefined frame delays, despite the typings saying otherwise
        frameDelays.push(delay);
      }

      // Disposal Type explanation https://www.matthewflickinger.com/lab/whatsinagif/animation_and_transparency.asp
      // 0 = Not animated, so it doesn't matter
      // 1 = Draw this frame onto the previous frame
      // 2 = Draw onto a blank frame
      if (parsedFrame.disposalType === 2) {
        finalCanvas.ctx.clearRect(0, 0, dimensions[0], dimensions[1]);
      }

      const frameDims: Dimensions = [
        parsedFrame.dims.width,
        parsedFrame.dims.height,
      ];

      // This is somewhat stolen from the gifuct-js demo.js file
      const patch = createCanvas(frameDims);
      const imageData = patch.ctx.createImageData(frameDims[0], frameDims[1]);
      imageData.data.set(parsedFrame.patch);
      patch.ctx.putImageData(imageData, 0, 0);

      finalCanvas.ctx.drawImage(
        patch.canvas,
        parsedFrame.dims.left,
        parsedFrame.dims.top
      );

      return canvasToFrame(finalCanvas);
    }
  );

  const averageDelay =
    frameDelays.reduce((acc, val) => acc + val, 0) / frameDelays.length;

  const fps = Math.ceil(1000 / averageDelay);

  return {
    image: { dimensions, frames },
    fps,
  };
};

interface ReadResult {
  image: Image;
  dataUrl: string;
  fps: number;
}

export const readImage = async (
  fileOrDataUrl: File | string
): Promise<ReadResult> => {
  let dataUrl: string;
  let file: File;
  if (typeof fileOrDataUrl === 'string') {
    const fileType = getFileType(fileOrDataUrl);
    file = dataUrlToFile({
      dataUrl: fileOrDataUrl,
      fname: `image.${fileType ?? 'gif'}`,
    });
    dataUrl = fileOrDataUrl;
  } else {
    file = fileOrDataUrl;
    dataUrl = await miscUtil.blobOrFileToDataUrl(file);
  }

  const isGif = file.name.endsWith('.gif');

  debugLog('Reading file', {
    isFile: typeof file !== 'string',
    fname: typeof file === 'string' ? 'N/A' : file.name,
    isGif,
  });

  if (isGif) {
    const { image, fps } = await readGifFromFile(file);
    return {
      dataUrl,
      image,
      fps,
    };
  }

  const image = await new Promise<Image>((res, rej) =>
    getPixels(
      dataUrl,
      (err: Error, results: { shape: number[]; data: FrameData }) => {
        if (err) {
          return rej(err);
        }

        if (results.shape.length === 3) {
          const [width, height] = results.shape;
          // Single frame
          return res({
            frames: [Uint8ClampedArray.from(results.data)],
            dimensions: [width, height],
          });
        }

        // Multiple frames, need to slice up the image data into numFrames slices
        const [numFrames, width, height] = results.shape;
        const sliceSize = width * height * 4;
        const frames: Uint8ClampedArray[] = [];
        for (let i = 0; i < numFrames; i += 1) {
          const frame = results.data.subarray(
            i * sliceSize,
            (i + 1) * sliceSize
          );
          // Contrary to the TS types, the result of subarray returns a regular Uint8Array, NOT a clamped one!
          frames.push(Uint8ClampedArray.from(frame));
        }
        return res({
          frames,
          dimensions: [width, height],
        });
      }
    )
  );

  return {
    image,
    dataUrl,
    fps: 1,
  };
};

export const getImageFromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const contentType = res.headers.get('content-type');
  if (!contentType) {
    throw new Error('Unable to determine content type');
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64String = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

  return `data:${contentType};base64,${base64String}`;
};

function dataUrlToFile({
  dataUrl,
  fname,
}: {
  dataUrl: string;
  fname: string;
}): File {
  const blob = miscUtil.dataURItoBlob(dataUrl);
  return new File([blob], fname);
}

function getFileType(dataUrl: string): string | undefined {
  const matched = dataUrl.match(/^data:image\/(\w+);/);
  return matched?.[1];
}
