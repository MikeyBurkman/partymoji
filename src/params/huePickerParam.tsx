import { Stack, Typography } from '@material-ui/core';
import * as convert from 'color-convert';
import React, { useEffect } from 'react';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';
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
  const hexColor = React.useMemo(
    () => colorUtil.toHexColor([...convert.hsl.rgb([value, 100, 50]), 255]),
    [value]
  );
  const [rgbColor, setRgbColor] = React.useState(hexColor);
  const { hslArr } = useColorPicker(rgbColor, setRgbColor);

  useEffect(() => {
    const [h] = hslArr;
    if (h !== value) {
      onChange(h);
    }
  }, [value, onChange, hslArr]);

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <ColorPicker
        value={hexColor}
        onChange={setRgbColor}
        hideColorTypeBtns={true}
        hideOpacity={true}
        hidePresets={true}
        hideEyeDrop={true}
        hideAdvancedSliders={true}
        hideGradientType={true}
        hideControls={true}
        hideColorGuide={true}
        hideInputs={true}
        hidePickerSquare={true}
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
