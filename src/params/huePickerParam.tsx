import { Stack, Typography } from '@material-ui/core';
import * as convert from 'color-convert';
import React from 'react';
import { HuePicker } from 'react-color';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  ParamFnDefault,
  ParamFunction,
  toParamFunction,
} from '../domain/types';
import { toHexColor } from '../domain/utils/color';

const HuePickerParam: React.FC<{
  name: string;
  value?: number;
  description?: string;
  onChange: (v: number) => void;
}> = ({ name, value, description, onChange }) => {
  const hexColor = React.useMemo(
    () =>
      value === undefined
        ? undefined
        : toHexColor([...convert.hsl.rgb([value, 100, 50]), 255]),
    [value]
  );
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <HuePicker
        color={hexColor}
        // HSL is in [0-360, 0-100, 0-100]
        onChangeComplete={({ hsl }) => onChange(hsl.h)}
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
