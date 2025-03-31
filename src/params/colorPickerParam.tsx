import { Stack, Typography } from '@material-ui/core';
import React from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Expandable } from '~/components/Expandable';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { Color, ParamFnDefault, ParamFunction } from '~/domain/types';
import { colorUtil } from '~/domain/utils';
import { toParamFunction } from './utils';

const ColorBox: React.FC<{ color: Color }> = ({ color }) => (
  <div
    style={{
      width: '1.5em',
      height: '1.5em',
      backgroundColor: colorUtil.toHexColor(color),
    }}
  />
);

const ColorPickerParam: React.FC<{
  name: string;
  value: Color;
  description?: string;
  onChange: (v: Color) => void;
}> = ({ name, value, description, onChange }) => {
  const rgbColor = React.useMemo(
    () => `rgb(${value[0]}, ${value[1]}, ${value[2]})`,
    [value]
  );

  const setRgbColor = React.useCallback(
    (rgb: string) => {
      onChange(colorUtil.rgbaStringToColor(rgb));
    },
    [onChange]
  );

  return (
    <Expandable
      mainEle={
        <Stack direction="row" spacing={4}>
          <Typography variant="body2">{name}</Typography>
          <HelpTooltip description={description} />
          <ColorBox color={value} />
        </Stack>
      }
    >
      <ColorPicker
        value={rgbColor}
        onChange={setRgbColor}
        hideColorTypeBtns
        hideOpacity
        hidePresets
        hideAdvancedSliders
        hideGradientType
        hideControls
        hideColorGuide
      />
    </Expandable>
  );
};

export function colorPickerParam(args: {
  name: string;
  defaultValue: ParamFnDefault<Color>;
  description?: string;
}): ParamFunction<Color> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <ColorPickerParam
          name={args.name}
          value={params.value}
          onChange={params.onChange}
          description={args.description}
        />
      );
    },
  };
}
