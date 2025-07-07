import React from 'react';
import { Stack, Typography } from '@mui/material';
import { ImagePicker } from './ImagePicker';
import { IS_MOBILE } from '~/domain/utils/isMobile';
import type { ImageEffectResult } from '~/domain/types';
import { sliderParam } from '~/params';
import { DEFAULT_FPS, MAX_FRAMES } from '~/config';

const fpsParam = sliderParam({
  name: 'Final Gif Frames per Second',
  defaultValue: DEFAULT_FPS,
  min: 1,
  max: 60,
});

const frameCountParam = sliderParam({
  name: 'Final Gif Frame Count',
  defaultValue: 0,
  min: 1,
  max: MAX_FRAMES,
});

interface SourceImageProps {
  baseImage?: ImageEffectResult;
  fps: number;
  frameCount: number;
  onImageChange: (
    baseImage: ImageEffectResult,
    fname: string,
    fps: number,
  ) => void;
  onFpsChange: (fps: number) => void;
  onFrameCountChange: (frameCount: number) => void;
  setAlert: (alert: { severity: 'error' | 'warning'; message: string }) => void;
}

export const SourceImage: React.FC<SourceImageProps> = ({
  baseImage,
  fps,
  frameCount,
  onImageChange,
  onFpsChange,
  onFrameCountChange,
  setAlert,
}) => {
  return (
    <Stack spacing={1} alignItems="center">
      <Typography variant="h5">Source Image</Typography>
      <ImagePicker
        name="Upload a source image"
        currentImage={baseImage}
        onChange={(baseImage, fname, fps) => {
          if (IS_MOBILE) {
            const [width, height] = baseImage.image.dimensions;
            if (width > 512 || height > 512) {
              setAlert({
                severity: 'error',
                message:
                  'The image you chose is too large to work well on mobile.',
              });
              return;
            }
          }

          onImageChange(baseImage, fname, fps);
        }}
      />
      {baseImage != null &&
        fpsParam.fn({
          value: fps,
          onChange: onFpsChange,
        })}
      {baseImage != null &&
        frameCountParam.fn({
          value: frameCount,
          onChange: onFrameCountChange,
        })}
    </Stack>
  );
};
