import React from 'react';
import { CircularProgress, Stack, Typography, Checkbox } from '@mui/material';
import { AppStateEffect, ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';

interface InnerProps {
  result: ImageEffectResult;
  effectName: string;
}

const Inner: React.FC<InnerProps> = ({ result, effectName }) => {
  const dimensions = result.image.dimensions;

  const [showTransparency, setShowTransparency] = React.useState(true);

  return (
    <>
      <Stack alignItems="center">
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
                  onChange={(e) => {
                    setShowTransparency(e.target.checked);
                  }}
                />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
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
