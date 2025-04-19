import { reject, pipe, sortBy } from 'remeda';
import type { EffectGroup, AnyEffect } from '~/domain/types';
import { miscUtil } from '~/domain/utils';

import { adjustImage } from './adjust-image';
import { backgroundColor } from './background-color';
import { backgroundImage } from './background-image';
import { blur } from './blur';
import { bounce } from './bounce';
import { bounceAnimation } from './bounce-animation';
import { circle } from './circle';
import { changingFocus } from './changing-focus';
import { colorPalette } from './color-palette';
import { colors } from './colors';
import { colorsBackground } from './colors-background';
import { doubleVision } from './double-vision';
import { dropShadow } from './drop-shadow';
import { dualHue } from './dual-hue';
import { expand } from './expand';
import { fade } from './fade';
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
import { trails } from './trails';
import { transparency } from './transparency';
import { transpose } from './transpose';

// This array dictates the order of the groups.
const GROUP_ORDERING: Array<EffectGroup> = [
  'Animation',
  'Image',
  'Party',
  'Transform',
  'Colors',
  'Misc',
];

export const POSSIBLE_EFFECTS = pipe(
  [
    setAnimationLength,
    adjustImage,
    backgroundColor,
    backgroundImage,
    blur,
    bounce,
    bounceAnimation,
    circle,
    changingFocus,
    colorPalette,
    colors,
    colorsBackground,
    doubleVision,
    dropShadow,
    dualHue,
    expand,
    fade,
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
    trails,
    transparency,
    transpose,
  ],
  // Each effect needs to be ordered according to the group for the dropdown to work correctly.
  // After that, we order within the group order, and then in alphabetical order
  sortBy(
    (x) => GROUP_ORDERING.indexOf(x.group),
    (x) => -1 * (x.groupOrder ?? 0),
    (x) => x.name,
  ),
  reject((x) => x.disabled),
  // TODO Might be able to refactor some types to get rid of this cast.
) as unknown as Array<AnyEffect>;

export const effectByName = (name: string): AnyEffect => {
  const t = POSSIBLE_EFFECTS.find((t) => t.name === name);
  miscUtil.assert(t, `Could not find matching effect: ${name}`);
  return t;
};
