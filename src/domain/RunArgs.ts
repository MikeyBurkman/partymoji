import { Image } from './types';

export interface RunArgs {
  randomSeed: string;
  image: Image;
  effectInput: {
    effectName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any;
  };
  fps: number;
}
