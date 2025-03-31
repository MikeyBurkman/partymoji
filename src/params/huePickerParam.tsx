import { Stack, Typography } from '@material-ui/core';
import React from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { colorUtil } from '~/domain/utils';
import { toParamFunction } from './utils';

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
    [onChange]
  );

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
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
    </Stack>
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
