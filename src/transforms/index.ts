import { ParamFunction, Transform } from '../domain/types';
import { assert } from '../domain/utils';
import { adjustImage } from './adjust-image';
import { backgroundColor } from './background-color';
import { backgroundImage } from './background-image';
import { bounce } from './bounce';
import { circle } from './circle';
import { colors } from './colors';
import { colorsBackground } from './colors-background';
import { doubleVision } from './double-vision';
import { expand } from './expand';
import { fisheye } from './fisheye';
import { grid } from './grid';
import { hueShift } from './hue-shift';
import { lightning } from './lightning';
import { nuke } from './nuke';
import { party } from './party';
import { pinwheel } from './pinwheel';
import { pinwheelParty } from './pinwheel-party';
import { radiance } from './radiance';
import { radianceParty } from './radiance-party';
import { repeatAnimation } from './repeat-animation';
import { resizeImage } from './resize-image';
import { ripple } from './ripple';
import { rotate } from './rotate';
import { roxbury } from './roxbury';
import { shake } from './shake';
import { slowAnimation } from './slow-animation';
import { staticc } from './static';
import { transparency } from './transparency';
import { transpose } from './transpose';

export const POSSIBLE_TRANSFORMS = [
  adjustImage,
  backgroundColor,
  backgroundImage,
  bounce,
  circle,
  colors,
  colorsBackground,
  doubleVision,
  expand,
  fisheye,
  grid,
  hueShift,
  lightning,
  nuke,
  party,
  pinwheel,
  pinwheelParty,
  radiance,
  radianceParty,
  repeatAnimation,
  resizeImage,
  ripple,
  rotate,
  roxbury,
  shake,
  slowAnimation,
  //spin,
  staticc,
  transparency,
  transpose,
].sort((x, y) => (x.name > y.name ? 1 : -1));

export const transformByName = (
  name: string
): Transform<readonly ParamFunction<any>[]> => {
  const t = POSSIBLE_TRANSFORMS.find((t) => t.name === name);
  assert(t, `Could not find matching transform: ${name}`);
  return t as any as Transform<readonly ParamFunction<any>[]>;
};
