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
 * a one-dimensional array of pixels; looks like [r1,g1,b1,a1, r2,g2,b2,a2,...]
 */
export type ImageData = number[];

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
  value: T;
  onChange: (v: ParamValue<T>) => void;
}

export type ParamFunction<T> = {
  name: string;
  defaultValue: T;
  fn: (params: Params<T>) => JSX.Element;
};

export type TransformFn<Params> = (opts: TransformFnOpts<Params>) => Image;

type ParamType<Type> = Type extends ParamFunction<infer X> ? X : never;

export interface Transform<T extends readonly ParamFunction<any>[]> {
  name: string;
  params: T;
  fn: TransformFn<{ [P in keyof T]: ParamType<T[P]> }>;
}

export interface TransformWithParams<T extends readonly ParamFunction<any>[]> {
  transform: Transform<T>;
  paramsValues: ParamValue<T>[];
}

export interface TransformInput<T extends ParamFunction<any>[]> {
  transform: Transform<T>;
  params: T;
}

export const buildTransform = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  params: T;
  fn: TransformFn<{ [P in keyof T]: ParamType<T[P]> }>;
}): Transform<T> => ({
  name: args.name,
  params: args.params,
  fn: args.fn,
});
