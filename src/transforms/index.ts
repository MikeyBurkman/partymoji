import { backgroundParty } from './background-party';
import { backgroundImage } from './background-image';
import { bounce } from './bounce';
import { brightness } from './brightness';
import { circle } from './circle';
import { expand } from './expand';
import { fisheye } from './fisheye';
import { frameCount } from './frame-count';
import { grayscale } from './grayscale';
import { hueParty } from './hue-party';
import { hueShift } from './hue-shift';
import { lightning } from './lightning';
import { party } from './party';
import { pinwheel } from './pinwheel';
import { radiance } from './radiance';
import { resize } from './resize';
import { resizeBackground } from './resize-background';
import { ripple } from './ripple';
import { rotate } from './rotate';
import { roxbury } from './roxbury';
import { shake } from './shake';
import { solidBackground } from './solid-background';
import { staticc } from './static';
import { transparency } from './transparency';
import { transpose } from './transpose';

import { assert } from '../domain/utils';

export const POSSIBLE_TRANSFORMS = [
  backgroundImage,
  backgroundParty,
  bounce,
  brightness,
  circle,
  expand,
  fisheye,
  frameCount,
  grayscale,
  hueParty,
  hueShift,
  lightning,
  party,
  pinwheel,
  radiance,
  resize,
  resizeBackground,
  ripple,
  rotate,
  roxbury,
  shake,
  solidBackground,
  staticc,
  transparency,
  transpose,
];

export const transformByName = (name: string) => {
  const t = POSSIBLE_TRANSFORMS.find((t) => t.name === name);
  assert(t);
  return t;
};
