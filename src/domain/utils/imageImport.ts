// @ts-ignore
import getPixels from 'get-pixels';
import { parseGIF, decompressFrames } from 'gifuct-js';
import type { Dimensions, FrameData, Image } from '~/domain/types';
import { canvasToFrame, createCanvas } from './canvas';

const toArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });

// Only works for gifs
export const readGifFromFile = async (file: File): Promise<Image> => {
  const buffer = await toArrayBuffer(file);
  const gif = await parseGIF(buffer);

  const dimensions: Dimensions = [gif.lsd.width, gif.lsd.height];
  const finalCanvas = createCanvas(dimensions);

  let needsDisposal = false;
  const frames = decompressFrames(gif, true).map(
    (parsedFrame): Uint8ClampedArray => {
      if (needsDisposal) {
        finalCanvas.ctx.clearRect(0, 0, dimensions[0], dimensions[1]);
        needsDisposal = false;
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

  return {
    dimensions,
    frames,
  };
};

// NOTE: This does not handle some gifs correctly. Use readGifFromFile instead.
export const readImage = (dataUrl: string): Promise<Image> =>
  new Promise<Image>((res, rej) =>
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

export const getImageFromUrl = async (url: string) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => {
      reject(new Error('Error loading url'));
    };

    img.src = url;
  });
};
