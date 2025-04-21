import { Image, JsonType } from './types';

export interface RunArgs {
  randomSeed: string;
  image: Image;
  effectInput: {
    effectName: string;
    params: Array<JsonType>;
  };
  fps: number;
  useAlternateGifGenerator: boolean;
}
