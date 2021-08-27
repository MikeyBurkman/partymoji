import { buildTransform, Color } from '../domain/types';
import { isTransparent, getAveragePixelValue, mapImage } from '../domain/utils';

const PARTY_COLORS: Color[] = [
  [255, 141, 139, 255],
  [254, 214, 137, 255],
  [136, 255, 137, 255],
  [135, 255, 255, 255],
  [139, 181, 254, 255],
  [215, 140, 255, 255],
  [255, 140, 255, 255],
  [255, 104, 247, 255],
  [254, 108, 183, 255],
  [255, 105, 104, 255],
];

export const party = buildTransform({
  name: 'Party',
  description: 'Make the image flash different colors',
  params: [],
  fn: mapImage(({ coord, frameCount, frameIndex, getSrcPixel }) => {
    const srcPixel = getSrcPixel(coord);

    if (isTransparent(srcPixel)) {
      return [0, 0, 0, 0];
    }

    const partyColorIdx = Math.floor(
      (frameIndex / frameCount) * PARTY_COLORS.length
    );
    const partyColor = PARTY_COLORS[partyColorIdx];

    const gray = getAveragePixelValue(srcPixel);

    return [
      (gray * partyColor[0]) / 255,
      (gray * partyColor[1]) / 255,
      (gray * partyColor[2]) / 255,
      255,
    ];
  }),
});
