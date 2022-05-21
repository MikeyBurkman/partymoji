import seedrandom from 'seedrandom';

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
 * [0, 0] = index 0
 * [1, 0] = index 4
 * [2, 0] = index 8
 * [0, 1] = index 12
 * [1, 1] = index 16
 * [2, 1] = index 20
 * To get pixel [x, y], do (x + y * width) * 4
 */
export type ImageData = Uint8Array;

/**
 * The results of get-pixels processImage()
 */
export interface Image {
  dimensions: Dimensions;
  frames: ImageData[];
}

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

export interface Parameter<T> {
  name: string;
  defaultValue: T;
  ele: JSX.Element;
}

export interface Params<T> {
  value: T;
  onChange: (v: T) => void;
}

export type ParamFunction<T = any> = {
  name: string;
  defaultValue: T;
  fn: (params: Params<T>) => JSX.Element;
};

export type EffectFn<Params> = (opts: EffectFnOpts<Params>) => Image;

type ParamType<Type> = Type extends ParamFunction<infer X> ? X : never;

export interface Effect<T extends readonly ParamFunction<any>[]> {
  name: string;
  params: T;
  description?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled: boolean;
}

export interface EffectWithParams<T extends readonly ParamFunction<any>[]> {
  effectName: string;
  paramsValues: T[];
}

export interface EffectInput {
  effectName: string;
  params: any;
}

export const buildEffect = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  params: T;
  description?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled?: boolean;
}): Effect<T> => ({
  name: args.name,
  params: args.params,
  description: args.description,
  fn: args.fn,
  disabled: args.disabled ?? false,
});

export interface AppStateEffect {
  effectName: string;
  paramsValues: any[];
  state:
    | { status: 'init' }
    | { status: 'computing' }
    | { status: 'done'; image: ImageEffectResult };
}

export interface AppState {
  version: number;
  baseImage?: string;
  effects: AppStateEffect[];
  fps: number;
}

export interface ImageEffectResult {
  gif: string;
  image: Image;
}

export type AsyncRunMessage = {
  status: 'complete';
  result: ImageEffectResult;
};
