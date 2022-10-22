import { buildEffect } from '../domain/types';
import { applyCanvasFromFrame } from '../domain/utils/canvas';
import { fromHexColor, toHexColor } from '../domain/utils/color';
import { mapFrames } from '../domain/utils/image';
import { colorPickerParam } from '../params/colorPickerParam';
import { dropdownParam } from '../params/dropdownParam';
import { intParam } from '../params/intParam';
import { textParam } from '../params/textParam';

const FONTS = [
  'Arial',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Brush Script MT',
];

export const text = buildEffect({
  name: 'Text',
  description: 'Puts text on the image',
  params: [
    textParam({
      name: 'Text',
      description: 'The text to put on the image',
      defaultValue: '',
    }),
    dropdownParam({
      name: 'Font',
      defaultValue: FONTS[0],
      options: FONTS.map((font) => ({ name: font, value: font })),
    }),
    intParam({
      name: 'X',
      defaultValue: 0,
    }),
    intParam({
      name: 'Y',
      defaultValue: 0,
    }),
    intParam({
      name: 'Size',
      defaultValue: 12,
      min: 8,
    }),
    colorPickerParam({
      name: 'Color',
      defaultValue: fromHexColor('#000000'),
    }),
  ] as const,
  fn: ({ image, parameters: [text, font, x, y, fontSize, color] }) =>
    mapFrames(image, (frame) =>
      applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        postEffect: ({ ctx }) => {
          ctx.font = `${fontSize}px ${font}`;
          ctx.fillStyle = toHexColor(color);
          ctx.fillText(text, x, y);
        },
      })
    ),
});
