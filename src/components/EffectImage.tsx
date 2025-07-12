import React from 'react';
import { Stack, Typography, Checkbox } from '@mui/material';
import { AppStateEffect, Dimensions, ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';
import { Shimmer } from './Shimmer';

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
  const cachedDimensions = React.useRef<Dimensions>([120, 120]);
  React.useEffect(() => {
    if (appStateEffect.state.status === 'done') {
      cachedDimensions.current = appStateEffect.state.image.image.dimensions;
    }
  }, [appStateEffect]);

  if (appStateEffect.state.status !== 'done') {
    return (
      <Shimmer
        width={cachedDimensions.current[0]}
        height={cachedDimensions.current[1]}
      />
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
