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
import { expand } from './expand';
import { fill } from './fill';
import { fisheye } from './fisheye';
import { grid } from './grid';
import { hueChange } from './hue-change';
import { hueShift } from './hue-shift';
import { hueShiftPulse } from './hue-shift-pulse';
import { hueWave } from './hue-wave';
import { lightning } from './lightning';
import { nuke } from './nuke';
import { opacity } from './opacity';
import { party } from './party';
import { partyTwo } from './party-two';
import { pinwheel } from './pinwheel';
import { pinwheelParty } from './pinwheel-party';
import { pinwheelPartyBackground } from './pinwheel-party-background';
import { radiance } from './radiance';
import { radianceParty } from './radiance-party';
import { radiancePartyBackground } from './radiance-party-background';
import { reduceColorPalette } from './reduce-color-palette';
import { repeatAnimation } from './repeat-animation';
import { resizeImage } from './resize-image';
import { reverseAnimation } from './reverse-animation';
import { ripple } from './ripple';
import { rotate } from './rotate';
import { roxbury } from './roxbury';
import { shake } from './shake';
import { slowAnimation } from './slow-animation';
import { spin } from './spin';
import { staticc } from './static';
import { text } from './text';
import { transparency } from './transparency';
import { transpose } from './transpose';

export const POSSIBLE_EFFECTS = pipe(
  [
    adjustImage,
    backgroundColor,
    backgroundImage,
    blur,
    bounce,
    bounceAnimation,
    circle,
    colors,
    colorsBackground,
    doubleVision,
    expand,
    fill,
    fisheye,
    grid,
    hueChange,
    hueShift,
    hueShiftPulse,
    hueWave,
    lightning,
    nuke,
    opacity,
    party,
    partyTwo,
    pinwheel,
    pinwheelParty,
    pinwheelPartyBackground,
    radiance,
    radianceParty,
    radiancePartyBackground,
    reduceColorPalette,
    repeatAnimation,
    resizeImage,
    reverseAnimation,
    ripple,
    rotate,
    roxbury,
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

export const effectByName = (
  name: string
): Effect<readonly ParamFunction<any>[]> => {
  const t = POSSIBLE_EFFECTS.find((t) => t.name === name);
  assert(t, `Could not find matching effect: ${name}`);
  return t as any as Effect<readonly ParamFunction<any>[]>;
};
