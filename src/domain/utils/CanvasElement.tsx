import React from 'react';
import { Coord } from '../../domain/types';

export type BezierTuple = [Coord, Coord];

export interface CavasElementProps {
  width: number;
  height: number;
  cursorIsPointer?: boolean;
  onCanvasMount: (context: CanvasRenderingContext2D) => void;
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

  const canvas = ref.current;

  React.useEffect(() => {
    if (canvas && !isMounted.current) {
      const ctx = canvas.getContext('2d');
      if (ctx != null) {
        onCanvasMount(ctx);
        isMounted.current = true;
      }
    }
  }, [canvas, isMounted, onCanvasMount]);

  const onEvent =
    (callback: undefined | ((c: Coord) => void)) =>
    (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!canvas || !callback) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
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
