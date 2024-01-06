import { canvasUtil, colorUtil, imageUtil } from '~/domain/utils';
import { colorPickerParam, dropdownParam, intParam, textParam } from '~/params';
import { buildEffect } from './utils';

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
      defaultValue: colorUtil.fromHexColor('#000000'),
    }),
  ] as const,
  fn: ({ image, parameters: [text, font, x, y, fontSize, color] }) =>
    imageUtil.mapFrames(image, (frame) =>
      canvasUtil.applyCanvasFromFrame({
        dimensions: image.dimensions,
        frame,
        postEffect: ({ ctx }) => {
          ctx.font = `${fontSize}px ${font}`;
          ctx.fillStyle = colorUtil.toHexColor(color);
          ctx.fillText(text, x, y);
        },
      })
    ),
});
