import seedrandom from 'seedrandom';

type JsonPrimitive = string | number | boolean | Uint8ClampedArray | null;
interface JsonMap {
  [member: string]: JsonPrimitive | JsonArray | JsonMap;
}
interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonMap> {}
export type JsonType = JsonPrimitive | JsonMap | JsonArray;

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

export type Random = seedrandom.prng;

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

export interface Parameter<T extends JsonType> {
  name: string;
  defaultValue: T;
  ele: JSX.Element;
}

export interface Params<T extends JsonType> {
  value: T;
  onChange: (v: T) => void;
}

export type ParamFunction<T extends JsonType> = {
  name: string;
  /**
   * If the previous image is done computing, it will be given to this function.
   * If it's not done computing, `undefined` will be given
   */
  defaultValue: (image?: Image) => T;
  fn: (params: Params<T>) => JSX.Element;
};

export type ParamFnDefault<T extends JsonType> =
  | ParamFunction<T>['defaultValue']
  | T;

export const toParamFunction = <T extends JsonType>(
  x: ParamFnDefault<T>
): ParamFunction<T>['defaultValue'] => {
  if (typeof x === 'function') {
    return x;
  }
  return () => x;
};

export type EffectFn<Params> = (
  opts: EffectFnOpts<Params>
) => Image | Promise<Image>;

type ParamType<Type> = Type extends ParamFunction<infer X> ? X : never;

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
  /** Set to true to demo transparency effects that won't render properly */
  applyBackgroundColor: boolean;
}

export interface EffectInput {
  effectName: string;
  params: any;
}

export const buildEffect = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  params: T;
  description: string;
  secondaryDescription?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled?: boolean;
  /** Set to true to demo transparency effects that won't render properly */
  applyBackgroundColor?: boolean;
}): Effect<T> => ({
  name: args.name,
  params: args.params,
  description: args.description,
  secondaryDescription: args.secondaryDescription,
  fn: args.fn,
  disabled: args.disabled ?? false,
  applyBackgroundColor: args.applyBackgroundColor ?? false,
});

export interface AppStateEffect {
  effectName: string;
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

export interface ImageEffectResult {
  gif: string;
  image: Image;
  gifWithBackgroundColor: string;
}

export type AsyncRunMessage = {
  status: 'complete';
  result: ImageEffectResult;
};

export interface CanvasData {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
}
