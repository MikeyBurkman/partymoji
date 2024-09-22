import React from 'react';
import type { CanvasData, Coord } from '~/domain/types';

export type BezierTuple = [Coord, Coord];

export interface CavasElementProps {
  width: number;
  height: number;
  cursorIsPointer?: boolean;
  onCanvasMount: (canvasData: CanvasData) => void;
  onMouseDown?: (coord: Coord) => void;
  onMouseMove?: (coord: Coord) => void;
  onMouseUp?: (coord: Coord) => void;
  onMouseLeave?: (coord: Coord) => void;
}

export const CanvasElement: React.FC<CavasElementProps> = ({
  width,
  height,
  cursorIsPointer,
  onCanvasMount,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseLeave,
}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    if (ref.current && !isMounted.current) {
      const ctx = ref.current.getContext('2d');
      if (ctx != null) {
        onCanvasMount({ canvas: ref.current, ctx });
        isMounted.current = true;
      }
    }
  }, [isMounted, onCanvasMount]);

  const onEvent =
    (callback: undefined | ((c: Coord) => void)) =>
    (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!ref.current || !callback) {
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      setTimeout(() => callback([x, y]), 0);
    };

  const style = React.useMemo((): React.CSSProperties | undefined => {
    if (cursorIsPointer) {
      return { cursor: 'pointer' };
    } else {
      return undefined;
    }
  }, [cursorIsPointer]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      onMouseDown={onEvent(onMouseDown)}
      onMouseUp={onEvent(onMouseUp)}
      onMouseMove={onEvent(onMouseMove)}
      onMouseLeave={onEvent(onMouseLeave)}
      style={style}
    ></canvas>
  );
};
