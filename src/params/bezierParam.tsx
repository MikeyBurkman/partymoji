import React from 'react';
import * as R from 'remeda';
import { Box, Stack, Typography } from '@material-ui/core';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  Coord,
  ParamFnDefault,
  ParamFunction,
  toParamFunction,
} from '../domain/types';
import { CanvasElement } from '../domain/utils/CanvasElement';
import { useDebounce } from '../domain/utils/useDebounce';

export type BezierTuple = [Coord, Coord];

const BezierParam: React.FC<{
  name: string;
  value: BezierTuple;
  description?: string;
  onChange: (v: BezierTuple) => void;
}> = ({ name, value, description, onChange }) => {
  const WIDTH = 64;
  const HEIGHT = 64;
  const CLICK_SLOP = 10;
  const DEBOUNCE_TIME = 200;

  // const [v, setV] = React.useState<BezierTuple>(value);
  // const debounceRef = React.useRef<NodeJS.Timeout>();
  // const onValueChange = React.useCallback(
  //   (newV: BezierTuple) => {
  //     setV(newV);
  //     if (debounceRef.current != null) {
  //       clearTimeout(debounceRef.current);
  //     }
  //     debounceRef.current = setTimeout(() => {
  //       onChange(newV);
  //     }, DEBOUNCE_TIME);
  //   },
  //   [onChange]
  // );

  const [curValue, setCurValue] = useDebounce({
    value,
    onChange,
    debounceMillis: DEBOUNCE_TIME,
  });

  const [latestMouseLocation, setLatestMouseLocation] = React.useState<Coord>([
    0, 0,
  ]);

  const [canvasCtx, setCanvasCtx] =
    React.useState<CanvasRenderingContext2D | null>(null);
  const onCanvasMount = React.useCallback((ctx: CanvasRenderingContext2D) => {
    setCanvasCtx(ctx);
  }, []);

  const [isDragging, setIsDragging] = React.useState<number | null>(null);

  const closestPointIdx = React.useMemo(() => {
    const distances = curValue.map((c, idx) => {
      const xDif = Math.pow(c[0] * WIDTH - latestMouseLocation[0], 2);
      const yDif = Math.pow(c[1] * HEIGHT - latestMouseLocation[1], 2);
      return {
        idx,
        coord: c,
        distance: Math.sqrt(xDif + yDif),
      };
    });

    const sorted = R.sortBy(distances, (d) => d.distance);
    const closest = sorted[0];
    return closest.distance < CLICK_SLOP ? closest.idx : null;
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
      canvasCtx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
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
      HEIGHT
    );
    canvasCtx.stroke();
  }, [curValue, canvasCtx]);

  const onMouseDown = React.useCallback(
    (c: Coord) => {
      setIsDragging(closestPointIdx);
    },
    [closestPointIdx]
  );

  const onMouseUp = React.useCallback(() => {
    setIsDragging(null);
  }, []);

  const onMouseMove = React.useCallback(
    (c: Coord) => {
      setLatestMouseLocation(c);

      const newCoord: Coord = [c[0] / WIDTH, c[1] / HEIGHT];

      if (isDragging === 0) {
        const newCoords: BezierTuple = [newCoord, curValue[1]];
        setCurValue(newCoords);
      } else if (isDragging === 1) {
        const newCoords: BezierTuple = [curValue[0], newCoord];
        setCurValue(newCoords);
      }
    },
    [isDragging, curValue, setCurValue]
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
