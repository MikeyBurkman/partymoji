import { JSX } from 'react';
import seedrandom from 'seedrandom';

type JsonPrimitive = string | number | boolean | Uint8ClampedArray | null;
interface JsonMap {
  [member: string]: JsonPrimitive | JsonArray | JsonMap;
}
type JsonArray = Array<JsonPrimitive | JsonArray | JsonMap>;
export type JsonType = JsonPrimitive | JsonMap | JsonArray;

export type BezierTuple = [Coord, Coord];

/**
 * [R, G, B, A] in values 0 - 255 inclusive
 */
export type Color = [number, number, number, number];

/**
 * [x, y]
 */
export type Coord = [number, number];

/**
 * [width, height]
 */
export type Dimensions = [number, number];

/**
 * A one-dimensional array of pixels.
 * A 3x2 image would contain 24 (6*4) numbers, and would look like this:
 *  [
 *    r1,g1,b1,a1, r2,g2,b2,a2, r3,g3,b3,a3,
 *    r4,g4,b4,a4, r5,g5,b5,a5, r6,g6,b6,a6
 *  ]
 *
 * Coordinate to index mapping:
 * [0, 0] = indices 0-3
 * [1, 0] = indices 4-7
 * [2, 0] = indices 8-11
 * [0, 1] = indices 12-15
 * [1, 1] = indices 16-19
 * [2, 1] = indices 20-23
 *
 * To get pixel [x, y], do (x + y * width) * 4
 */
export type FrameData = Uint8ClampedArray;

/**
 * Contains the dimensions of an image, along with an array of frames.
 * Each frame is a one-dimension array of colors (see `FrameData`).
 * Each frame represents one frame in the animation -- if `frames` has length 4, then
 *  it means that there are 4 animation frames in the image.
 */
export type Image = {
  dimensions: Dimensions;
  frames: FrameData[];
};

export type Random = seedrandom.PRNG;

export interface EffectFnOpts<Params> {
  /**
   * The image we're trying to transform
   */
  image: Image;

  /**
   * Use to generate "random" numbers. It's seeded, so that subsequent calls will yield the same value on the same image.
   */
  random: Random;

  /**
   * User-passed in parameters.
   */
  parameters: Params;
}

export interface Parameter<T> {
  name: string;
  defaultValue: T;
  ele: JSX.Element;
}

export interface Params<T> {
  value: T;
  onChange: (v: T) => void;
}

export type ParamFunction<T> = {
  name: string;
  /**
   * If the previous image is done computing, it will be given to this function.
   * If it's not done computing, `undefined` will be given
   */
  defaultValue: (image?: Image) => T;
  fn: (params: Params<T>) => JSX.Element;
};

export type ParamFnDefault<T> = ParamFunction<T>['defaultValue'] | T;

export type EffectFn<Params> = (
  opts: EffectFnOpts<Params>,
) => Image | Promise<Image>;

export type ParamType<Type> = Type extends ParamFunction<infer X> ? X : never;

export type EffectGroup =
  | 'Animation'
  | 'Image'
  | 'Party'
  | 'Colors'
  | 'Transform'
  | 'Misc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Effect<T extends readonly ParamFunction<any>[]> {
  /** Name of the effect. Must be globally unique */
  name: string;
  params: T;
  /** Description of the effect, will show up in the dropdown */
  description: string;
  /** Extra description to be shown in the parameters dialog menu */
  secondaryDescription?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled: boolean;
  group: EffectGroup;
  /** Set to a higher number to sort it top of the group */
  groupOrder?: number;
  /** Indicates that this effect requires multiple animation frames to do anything */
  requiresAnimation?: true;
}

export interface EffectInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  effect: Effect<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}

export interface AppStateEffect {
  effectName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paramsValues: any[];
  state:
    | { status: 'init' }
    | { status: 'computing' }
    | {
        status: 'done';
        image: ImageEffectResult;
      };
}

export interface AppState {
  version: number;
  baseImage?: ImageEffectResult;
  fname?: string;
  effects: AppStateEffect[];
  fps: number;
}

export type ImageEffectResult = {
  gif: string;
  image: Image;
} & (
  | {
      partiallyTransparent: true;
      gifWithBackgroundColor: string;
    }
  | {
      partiallyTransparent: false;
      /** Will be null if there's no transparency to this image */
      gifWithBackgroundColor: string | undefined;
    }
);

export type AsyncRunMessage = {
  status: 'complete';
  result: ImageEffectResult;
};

export interface CanvasData {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
}
