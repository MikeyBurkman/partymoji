import React from 'react';
import {
  CircularProgress,
  Stack,
  Typography,
  Divider,
} from '@material-ui/core';
import { AppStateEffect, ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { CanvasElement } from '~/domain/utils';
import { drawImageOnCanvas, applyTransform } from '~/domain/utils/canvas';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';

const MAX_SIZE = 128;

interface InnerProps {
  result: ImageEffectResult;
  effectName: string;
}

const Inner: React.FC<InnerProps> = ({ result, effectName }) => {
  const image = result.image;
  const { frames, dimensions } = image;
  const [width, height] = dimensions;

  const { eleWidth, eleHeight, hScale, vScale } = (() => {
    const aspectRatio = height / width;

    let eleWidth = MAX_SIZE;
    let eleHeight = MAX_SIZE;

    if (width > height) {
      // If width is bigger, then limit by width
      eleWidth = aspectRatio * MAX_SIZE;
    } else {
      // Else, limit by height
      eleHeight = (1 / aspectRatio) * MAX_SIZE;
    }

    return {
      eleWidth,
      eleHeight,
      hScale: eleWidth / width,
      vScale: eleHeight / height,
    };
  })();

  const renderedFrames = React.useMemo(
    () =>
      frames.map((frame, idx) => (
        <Stack alignItems="center">
          <Typography variant="caption">Frame {idx + 1}</Typography>
          <CanvasElement
            key={idx}
            width={eleWidth}
            height={eleHeight}
            onCanvasMount={(canvasData) => {
              applyTransform(canvasData, {
                horizontalScale: hScale,
                verticalScale: vScale,
              });
              drawImageOnCanvas({ ctx: canvasData.ctx, dimensions, frame });
            }}
          />
        </Stack>
      )),
    [dimensions, eleHeight, eleWidth, frames, hScale, vScale]
  );

  return (
    <>
      <Stack alignItems="center">
        <Typography variant="body1">Full Gif</Typography>

        {result.partiallyTransparent ? (
          <>
            <Gif
              src={result.gifWithBackgroundColor}
              dimensions={dimensions}
              alt={effectName}
            />
            <BackgroundPreviewTooltip />
          </>
        ) : (
          <Gif src={result.gif} dimensions={dimensions} alt={effectName} />
        )}
      </Stack>
      <Divider orientation="vertical" />
      {renderedFrames}
    </>
  );
};

interface ImageRowProps {
  appStateEffect: AppStateEffect;
}

export const ImageRow: React.FC<ImageRowProps> = ({ appStateEffect }) => {
  if (appStateEffect.state.status !== 'done') {
    return <CircularProgress />;
  }

  return (
    <Inner
      effectName={appStateEffect.effectName}
      result={appStateEffect.state.image}
    />
  );
};
