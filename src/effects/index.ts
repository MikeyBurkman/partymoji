import { pipe, reject, sortBy } from 'remeda';
import { ParamFunction, Effect } from '../domain/types';
import { assert } from '../domain/utils/misc';

import { adjustImage } from './adjust-image';
import { backgroundColor } from './background-color';
import { backgroundImage } from './background-image';
import { blur } from './blur';
import { bounce } from './bounce';
import { bounceAnimation } from './bounce-animation';
import { circle } from './circle';
import { colors } from './colors';
import { colorsBackground } from './colors-background';
import { doubleVision } from './double-vision';
import { dropShadow } from './drop-shadow';
import { expand } from './expand';
import { fill } from './fill';
import { fisheye } from './fisheye';
import { grid } from './grid';
import { hueChange } from './hue-change';
import { hueShift } from './hue-shift';
import { hueShiftPulse } from './hue-shift-pulse';
import { hueWave } from './hue-wave';
import { lightning } from './lightning';
import { mirror } from './mirror';
import { nuke } from './nuke';
import { opacity } from './opacity';
import { party } from './party';
import { partyBackground } from './party-background';
import { partyHarder } from './party-harder';
import { partyShadow } from './party-shadow';
import { pinwheelColors } from './pinwheel-colors';
import { pinwheelRainbow } from './pinwheel-rainbow';
import { pinwheelRainbowBackground } from './pinwheel-rainbow-background';
import { radianceColors } from './radiance-colors';
import { radianceRainbow } from './radiance-rainbow';
import { radianceRainbowBackground } from './radiance-rainbow-background';
import { reduceColorPalette } from './reduce-color-palette';
import { repeatAnimation } from './repeat-animation';
import { resizeImage } from './resize-image';
import { reverseAnimation } from './reverse-animation';
import { ripple } from './ripple';
import { rotate } from './rotate';
import { roxbury } from './roxbury';
import { scaleImage } from './scale-image';
import { setAnimationLength } from './set-animation-length';
import { shake } from './shake';
import { slowAnimation } from './slow-animation';
import { spin } from './spin';
import { staticc } from './static';
import { text } from './text';
import { transparency } from './transparency';
import { transpose } from './transpose';

const otherEffects = pipe(
  [
    backgroundColor,
    backgroundImage,
    blur,
    bounce,
    bounceAnimation,
    circle,
    colors,
    colorsBackground,
    doubleVision,
    dropShadow,
    expand,
    fill,
    fisheye,
    grid,
    hueChange,
    hueShift,
    hueShiftPulse,
    hueWave,
    lightning,
    mirror,
    nuke,
    opacity,
    party,
    partyBackground,
    partyHarder,
    partyShadow,
    pinwheelColors,
    pinwheelRainbow,
    pinwheelRainbowBackground,
    radianceColors,
    radianceRainbow,
    radianceRainbowBackground,
    reduceColorPalette,
    repeatAnimation,
    resizeImage,
    reverseAnimation,
    ripple,
    rotate,
    roxbury,
    scaleImage,
    shake,
    slowAnimation,
    spin,
    staticc,
    text,
    transparency,
    transpose,
  ],
  sortBy((x) => x.name),
  reject((x) => x.disabled)
);

export const POSSIBLE_EFFECTS = [
  // The first one is the one that is automatically selected, so make sure this is at the top of the list
  setAnimationLength,
  adjustImage,
  ...otherEffects,
];

export const effectByName = (
  name: string
): Effect<readonly ParamFunction<any>[]> => {
  const t = POSSIBLE_EFFECTS.find((t) => t.name === name);
  assert(t, `Could not find matching effect: ${name}`);
  return t as any as Effect<readonly ParamFunction<any>[]>;
};
