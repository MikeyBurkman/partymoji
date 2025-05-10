import React from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { colorUtil } from '~/domain/utils';
import { toParamFunction } from './utils';
import { Column, Row } from '~/layout';

const HuePickerParam: React.FC<{
  name: string;
  value: number;
  description?: string;
  onChange: (v: number) => void;
}> = ({ name, value, description, onChange }) => {
  const rgbColor = React.useMemo(() => {
    const color = colorUtil.colorFromHue(value);
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }, [value]);

  const setRgbColor = React.useCallback(
    (rgb: string) => {
      const [r, g, b] = colorUtil.rgbaStringToColor(rgb);
      const hue = colorUtil.hueFromColor([r, g, b, 255]);
      onChange(hue);
    },
    [onChange],
  );

  return (
    <Column>
      <Row>
        <p>{name}</p>
        <Tooltip kind="help" description={description} />
      </Row>
      <ColorPicker
        value={rgbColor}
        onChange={setRgbColor}
        hideColorTypeBtns
        hideOpacity
        hidePresets
        hideEyeDrop
        hideAdvancedSliders
        hideGradientType
        hideControls
        hideColorGuide
        hideInputs
        hidePickerSquare
      />
    </Column>
  );
};

export function huePickerParam(args: {
  name: string;
  defaultValue: ParamFnDefault<number>;
  description?: string;
}): ParamFunction<number> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <HuePickerParam
          name={args.name}
          value={params.value}
          onChange={params.onChange}
        />
      );
    },
  };
}
