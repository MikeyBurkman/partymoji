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
import { hueShift } from './hue-shift';
import { lightning } from './lightning';
import { nuke } from './nuke';
import { party } from './party';
import { partyBackground } from './party-background';
import { pinwheel } from './pinwheel';
import { pinwheelParty } from './pinwheel-party';
import { radiance } from './radiance';
import { radianceParty } from './radiance-party';
import { resizeImage } from './resize-image';
import { ripple } from './ripple';
import { rotate } from './rotate';
import { roxbury } from './roxbury';
import { shake } from './shake';
import { staticc } from './static';
import { staticBackground } from './static-background';
import { transparentColor } from './transparent-color';
import { transpose } from './transpose';

import { assert } from '../domain/utils';

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
  hueShift,
  lightning,
  nuke,
  party,
  partyBackground,
  pinwheel,
  pinwheelParty,
  radiance,
  radianceParty,
  resizeImage,
  ripple,
  rotate,
  roxbury,
  shake,
  staticc,
  staticBackground,
  transparentColor,
  transpose,
].sort((x, y) => (x.name > y.name ? 1 : -1));

export const transformByName = (name: string) => {
  const t = POSSIBLE_TRANSFORMS.find((t) => t.name === name);
  assert(t);
  return t;
};
