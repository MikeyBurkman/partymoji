import React from 'react';
import * as R from 'remeda';
import { Box, Stack, Typography } from '@mui/material';
import { HelpTooltip } from '~/components/HelpTooltip';
import type {
  Coord,
  ParamFnDefault,
  ParamFunction,
  BezierTuple,
  CanvasData,
} from '~/domain/types';
import { CanvasElement, useDebounce, miscUtil } from '~/domain/utils';
import { toParamFunction } from './utils';

const BezierParam: React.FC<{
  name: string;
  value: BezierTuple;
  description?: string;
  onChange: (v: BezierTuple) => void;
}> = ({ name, value, description, onChange }) => {
  const WIDTH = 64;
  const HEIGHT = 64;
  const MARKER_RADIUS = 5;
  const DEBOUNCE_TIME = 200;

  const [curValue, setCurValue] = useDebounce({
    value,
    onChange,
    debounceMillis: DEBOUNCE_TIME,
  });

  const [latestMouseLocation, setLatestMouseLocation] = React.useState<Coord>([
    0, 0,
  ]);

  const [canvasCtx, setCanvasCtx] = React.useState<CanvasData['ctx'] | null>(
    null,
  );
  const onCanvasMount = React.useCallback(({ ctx }: CanvasData) => {
    setCanvasCtx(ctx);
  }, []);

  const [isDragging, setIsDragging] = React.useState<number | null>(null);

  const closestPointIdx = React.useMemo(() => {
    const distances = curValue.map((c, idx) => ({
      idx,
      coord: c,
      distance: miscUtil.pointDistance(
        [c[0] * WIDTH, c[1] * HEIGHT],
        latestMouseLocation,
      ),
    }));

    const sorted = R.sortBy(distances, (d) => d.distance);
    const closest = sorted[0];
    return closest.distance < MARKER_RADIUS ? closest.idx : null;
  }, [latestMouseLocation, curValue]);

  React.useEffect(() => {
    if (!canvasCtx) {
      return;
    }

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw each dot - 4x4 circle
    canvasCtx.fillStyle = 'red';
    for (const coord of curValue) {
      const x = coord[0] * WIDTH;
      const y = coord[1] * HEIGHT;
      canvasCtx.beginPath();
      canvasCtx.ellipse(x, y, MARKER_RADIUS, MARKER_RADIUS, 0, 0, 2 * Math.PI);
      canvasCtx.fill();
    }

    // Draw the bezier curve itself
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, 0);
    canvasCtx.strokeStyle = 'black';
    canvasCtx.bezierCurveTo(
      curValue[0][0] * WIDTH,
      curValue[0][1] * HEIGHT,
      curValue[1][0] * WIDTH,
      curValue[1][1] * HEIGHT,
      WIDTH,
      HEIGHT,
    );
    canvasCtx.stroke();
  }, [curValue, canvasCtx]);

  const onMouseDown = React.useCallback(() => {
    setIsDragging(closestPointIdx);
  }, [closestPointIdx]);

  const onMouseUp = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  const onMouseMove = React.useCallback(
    (c: Coord) => {
      setLatestMouseLocation(c);

      const newCoord: Coord = [
        miscUtil.clamp(c[0] / WIDTH, 0, WIDTH),
        miscUtil.clamp(c[1] / HEIGHT, 0, HEIGHT),
      ];

      if (isDragging === 0) {
        setCurValue([newCoord, curValue[1]]);
      } else if (isDragging === 1) {
        setCurValue([curValue[0], newCoord]);
      }
    },
    [isDragging, curValue, setCurValue],
  );

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2" paddingTop="0.5rem">
          {name}
        </Typography>
        <span style={{ paddingTop: '0.5rem' }}>
          <HelpTooltip description={description} />
        </span>
        <Box border={1}>
          <CanvasElement
            width={WIDTH}
            height={HEIGHT}
            onCanvasMount={onCanvasMount}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseMove={onMouseMove}
            cursorIsPointer={closestPointIdx != null}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export function bezierParam(args: {
  name: string;
  defaultValue: ParamFnDefault<BezierTuple>;
  description?: string;
}): ParamFunction<BezierTuple> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <BezierParam
          name={args.name}
          value={params.value}
          onChange={params.onChange}
          description={args.description}
        />
      );
    },
  };
}
