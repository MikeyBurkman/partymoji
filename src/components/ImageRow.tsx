import React from 'react';
import {
  CircularProgress,
  Stack,
  Typography,
  Divider,
  Checkbox,
} from '@mui/material';
import { AppStateEffect, ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { CanvasElement } from '~/domain/utils';
import { drawImageOnCanvas, applyTransform } from '~/domain/utils/canvas';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';
import { logger } from '~/domain/logger';

const MAX_SIZE = 128;

interface InnerProps {
  result: ImageEffectResult;
  effectName: string;
}

const Inner: React.FC<InnerProps> = ({ result, effectName }) => {
  const image = result.image;
  const { frames, dimensions } = image;
  const [width, height] = dimensions;

  const [showTransparency, setShowTransparency] = React.useState(true);
  const [showBorder, setShowBorder] = React.useState(true);

  const { eleWidth, eleHeight, hScale, vScale } = React.useMemo(() => {
    const aspectRatio = height / width;

    let eleWidth = MAX_SIZE;
    let eleHeight = MAX_SIZE;

    if (width > height) {
      // If width is bigger, then keep the width at MAX and scale the height down
      eleHeight = Math.floor(aspectRatio * MAX_SIZE);
    } else {
      // Else scale the width down
      eleWidth = Math.floor(aspectRatio * MAX_SIZE);
    }

    return {
      eleWidth,
      eleHeight,
      hScale: eleWidth / width,
      vScale: eleHeight / height,
    };
  }, [height, width]);

  const renderedFrames = React.useMemo(
    () =>
      frames.map((frame, idx) => (
        <Stack
          alignItems="center"
          key={`${result.gif.substring(0, 16)}-${idx}`}
        >
          <Typography variant="caption">Frame {idx + 1}</Typography>
          <div style={showBorder ? { border: '2px solid black' } : {}}>
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
          </div>
        </Stack>
      )),
    [
      dimensions,
      eleHeight,
      eleWidth,
      frames,
      hScale,
      result.gif,
      showBorder,
      vScale,
    ],
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
          <Stack spacing={1} pb={2}>
            <Gif
              src={
                showTransparency && result.gifWithBackgroundColor
                  ? result.gifWithBackgroundColor
                  : result.gif
              }
              dimensions={dimensions}
              alt={effectName}
            />
            {result.gifWithBackgroundColor != null && (
              <Stack direction="row">
                <Typography variant="caption">Show Transparency</Typography>
                <Checkbox
                  checked={showTransparency}
                  onChange={(e) => { setShowTransparency(e.target.checked); }}
                />
              </Stack>
            )}
            <Stack direction="row">
              <Typography variant="caption">Show Frame Border</Typography>
              <Checkbox
                checked={showBorder}
                onChange={(e) => { setShowBorder(e.target.checked); }}
              />
            </Stack>
          </Stack>
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
    logger.debug('ImageRow - status = ', appStateEffect.state.status);
    debugger;
    return <CircularProgress />;
  }

  return (
    <Inner
      effectName={appStateEffect.effectName}
      result={appStateEffect.state.image}
    />
  );
};
