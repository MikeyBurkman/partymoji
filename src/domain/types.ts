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

export type Frame = {
  data: ImageData;
};

/**
 * The results of get-pixels processImage()
 */
export interface Image {
  dimensions: Dimensions;
  frames: Frame[];
}

export type Random = seedrandom.prng;

export interface TransformFnOpts<Params> {
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

export type ParamValue<T> = { valid: true; value: T } | { valid: false };

export interface Parameter<T> {
  name: string;
  defaultValue: T;
  ele: JSX.Element;
}

export interface Params<T> {
  value: ParamValue<T>;
  onChange: (v: ParamValue<T>) => void;
}

export type ParamFunction<T> = {
  name: string;
  defaultValue: ParamValue<T>;
  fn: (params: Params<T>) => JSX.Element;
};

export type TransformFn<Params> = (opts: TransformFnOpts<Params>) => Image;

type ParamType<Type> = Type extends ParamFunction<infer X> ? X : never;

export interface Transform<T extends readonly ParamFunction<any>[]> {
  name: string;
  params: T;
  description?: string;
  fn: TransformFn<{ [P in keyof T]: ParamType<T[P]> }>;
}

export interface TransformWithParams<T extends readonly ParamFunction<any>[]> {
  transformName: string;
  paramsValues: ParamValue<T>[];
}

export interface TransformInput<T extends ParamFunction<any>[]> {
  transform: Transform<T>;
  params: T;
}

export const buildTransform = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  params: T;
  description?: string;
  fn: TransformFn<{ [P in keyof T]: ParamType<T[P]> }>;
}): Transform<T> => ({
  name: args.name,
  params: args.params,
  description: args.description,
  fn: args.fn,
});

export interface AppState {
  baseImage?: string;
  transforms: {
    transformName: string;
    paramsValues: ParamValue<any>[];
    computedImage?: string;
  }[];
  dirty: boolean;
}
