import React from 'react';
import {
  CircularProgress,
  Stack,
  Typography,
  Divider,
} from '@material-ui/core';
import { AppStateEffect } from '~/domain/types';
import { Gif } from '../Gif';
import { CanvasElement } from '~/domain/utils';
import { drawImageOnCanvas, applyTransform } from '~/domain/utils/canvas';

const MAX_SIZE = 128;

interface Props {
  appStateEffect: AppStateEffect;
}

export const ImageRow: React.FC<Props> = ({ appStateEffect }) => {
  if (appStateEffect.state.status !== 'done') {
    return <CircularProgress />;
  }

  const gif = appStateEffect.state.image.gif;
  const image = appStateEffect.state.image.image;
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

  const renderedFrames = frames.map((frame, idx) => (
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
  ));

  return (
    <>
      <Stack alignItems="center">
        <Typography variant="body1">Full Gif</Typography>
        <Gif
          src={gif}
          dimensions={dimensions}
          alt={appStateEffect.effectName}
        />
      </Stack>
      <Divider orientation="vertical" />
      {renderedFrames}
    </>
  );
};
