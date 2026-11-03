import type { CanvasData, Dimensions, FrameData } from '~/domain/types';
import { canvasUtil } from '~/domain/utils';

/** Keep canvases local to one effect invocation, including the alpha round trip. */
export const createBackgroundCompositor = (
  dimensions: Dimensions,
  opacity: number,
) => {
  let backgroundCanvas: CanvasData | undefined;
  let sourceCanvas: CanvasData | undefined;
  let filteredCanvas: CanvasData | undefined;
  const [width, height] = dimensions;
  return (background: FrameData, foreground: FrameData): FrameData => {
    backgroundCanvas ??= canvasUtil.createCanvas(dimensions);
    sourceCanvas ??= canvasUtil.createCanvas(dimensions);
    sourceCanvas.ctx.putImageData(
      new ImageData(foreground, width, height),
      0,
      0,
    );
    if (opacity !== 100) {
      filteredCanvas ??= canvasUtil.createCanvas(dimensions);
      filteredCanvas.ctx.clearRect(0, 0, width, height);
      canvasUtil.applyFilter(filteredCanvas, { opacity });
      filteredCanvas.ctx.drawImage(sourceCanvas.canvas, 0, 0);
      // Preserve applyCanvasFromFrame -> FrameData -> frameToCanvas rounding.
      sourceCanvas.ctx.putImageData(
        new ImageData(canvasUtil.canvasToFrame(filteredCanvas), width, height),
        0,
        0,
      );
    }
    backgroundCanvas.ctx.putImageData(
      new ImageData(background, width, height),
      0,
      0,
    );
    backgroundCanvas.ctx.drawImage(sourceCanvas.canvas, 0, 0);
    return canvasUtil.canvasToFrame(backgroundCanvas);
  };
};
