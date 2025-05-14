import React from 'react';
import { CircularProgress, Typography, Divider, Checkbox } from '@mui/material';
import { AppStateEffect, ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { CanvasElement } from '~/domain/utils';
import { drawImageOnCanvas, applyTransform } from '~/domain/utils/canvas';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';
import { Column, Row } from '~/layout';
import { ClickableIcon } from './Icon';
import { Expandable } from './Expandable';

const MAX_SIZE = 128;

interface InnerProps {
  result: ImageEffectResult;
  effectName: string;
  onEdit: () => void;
}

const Inner: React.FC<InnerProps> = ({ result, effectName, onEdit }) => {
  const image = result.image;
  const { frames, dimensions } = image;
  const [width, height] = dimensions;

  const [showTransparency, setShowTransparency] = React.useState(true);
  const [showBorder, setShowBorder] = React.useState(true);

  const { eleWidth, eleHeight, hScale, vScale } = React.useMemo(() => {
    let eleWidth = MAX_SIZE;
    let eleHeight = MAX_SIZE;

    if (width > height) {
      // If width is bigger, then keep the width at MAX and scale the height down
      const aspectRatio = height / width;
      eleHeight = Math.floor(aspectRatio * MAX_SIZE);
    } else {
      // Else scale the width down
      const aspectRatio = width / height;
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
        <Column
          horizontalAlign="center"
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
        </Column>
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
      <Row verticalAlign="middle" horizontalAlign="space-evenly" gap={4}>
        <Column horizontalAlign="center">
          <h3>Effect Result</h3>
          {result.partiallyTransparent ? (
            <Column horizontalAlign="center">
              <Gif
                src={result.gifWithBackgroundColor}
                dimensions={dimensions}
                alt={effectName}
              />
              <BackgroundPreviewTooltip />
            </Column>
          ) : (
            <Column>
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
                <Row>
                  <Typography variant="caption">Show Transparency</Typography>
                  <Checkbox
                    checked={showTransparency}
                    onChange={(e) => {
                      setShowTransparency(e.target.checked);
                    }}
                  />
                </Row>
              )}
            </Column>
          )}
        </Column>
        <Column horizontalAlign="stretch" gap={3}>
          <ClickableIcon label="Edit" name="Edit" onClick={onEdit} />
        </Column>
      </Row>
      <Divider orientation="vertical" />

      <Expandable mainEle={<h3>Frames</h3>}>
        <Column horizontalAlign="left">
          <Row>
            {/* TODO: Maybe we always show the border? */}
            <label>
              <Checkbox
                checked={showBorder}
                onChange={(e) => {
                  setShowBorder(e.target.checked);
                }}
              />
              Show Frame Border
            </label>
          </Row>
          <Row gap={2} verticalAlign="middle" wrap="wrap">
            {renderedFrames}
          </Row>
        </Column>
      </Expandable>
    </>
  );
};

interface ImageRowProps {
  appStateEffect: AppStateEffect;
  onEdit: () => void;
  onDelete: () => void;
}

export const ImageRow: React.FC<ImageRowProps> = ({
  appStateEffect,
  onEdit,
}) => {
  if (appStateEffect.state.status !== 'done') {
    return <CircularProgress />;
  }

  return (
    <Column horizontalAlign="center" gap={2}>
      <Inner
        effectName={appStateEffect.effectName}
        result={appStateEffect.state.image}
        onEdit={onEdit}
      />
    </Column>
  );
};
