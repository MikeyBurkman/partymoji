import { Stack, Typography } from '@material-ui/core';
import React from 'react';
import { HuePicker } from 'react-color';
import * as convert from 'color-convert';

import { ParamValue, ParamFunction } from '../domain/types';
import { toHexColor } from '../domain/utils';
import { HelpTooltip } from '../components/HelpTooltip';

const HuePickerParam: React.FC<{
  name: string;
  value?: number;
  description?: string;
  onChange: (v: ParamValue<number>) => void;
}> = ({ name, value, description, onChange }) => {
  const hexColor =
    value === undefined
      ? undefined
      : toHexColor([...convert.hsl.rgb([value, 255, 255]), 255]);
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <HuePicker
        color={hexColor}
        onChangeComplete={({ hsl }) => onChange({ valid: true, value: hsl.h })}
      />
    </Stack>
  );
};

export function huePickerParam(args: {
  name: string;
  defaultValue?: number;
  description?: string;
}): ParamFunction<number> {
  return {
    name: args.name,
    defaultValue: args.defaultValue
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
    fn: (params) => {
      return (
        <HuePickerParam
          name={args.name}
          value={params.value.valid ? params.value.value : undefined}
          onChange={params.onChange}
        />
      );
    },
  };
}
