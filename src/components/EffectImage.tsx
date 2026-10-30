import React from 'react';
import { Stack, Typography, Checkbox, CircularProgress } from '@mui/material';
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
      <Stack>
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

export const EffectImage: React.FC<ImageRowProps> = ({ appStateEffect }) => {
  if (appStateEffect.state.status !== 'done') {
    return (
      <Stack
        role="status"
        aria-label={`${appStateEffect.effectName}: ${appStateEffect.state.status === 'computing' ? 'Processing' : 'Queued'}`}
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{
          width: 128,
          height: 128,
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        {appStateEffect.state.status === 'computing' && (
          <CircularProgress size={24} aria-label="Processing effect" />
        )}
        <Typography variant="caption" color="text.secondary">
          {appStateEffect.state.status === 'computing'
            ? 'Processing…'
            : 'Queued'}
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Inner
        effectName={appStateEffect.effectName}
        result={appStateEffect.state.image}
      />
    </>
  );
};
