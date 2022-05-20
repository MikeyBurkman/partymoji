import { Stack, Typography } from '@material-ui/core';
import React from 'react';
import { SketchPicker } from 'react-color';
import { Expandable } from '../components/Expandable';
import { HelpTooltip } from '../components/HelpTooltip';
import { Color, ParamFunction } from '../domain/types';
import { fromHexColor, toHexColor } from '../domain/utils';

const ColorBox: React.FC<{ color: Color }> = ({ color }) => (
  <div
    style={{
      width: '1.5em',
      height: '1.5em',
      backgroundColor: toHexColor(color),
    }}
  />
);

const ColorPickerParam: React.FC<{
  name: string;
  value: Color;
  description?: string;
  onChange: (v: Color) => void;
}> = ({ name, value, description, onChange }) => {
  return (
    <Expandable
      mainEle={
        <Stack direction="row" spacing={4}>
          <Typography variant="body2">{name}</Typography>
          <HelpTooltip description={description} />
          {value && <ColorBox color={value} />}
        </Stack>
      }
    >
      <SketchPicker
        disableAlpha={true}
        presetColors={[]}
        color={toHexColor(value)}
        onChangeComplete={(c) => {
          onChange(fromHexColor(c.hex));
        }}
      />
    </Expandable>
  );
};

export function colorPickerParam(args: {
  name: string;
  defaultValue: Color;
  description?: string;
}): ParamFunction<Color> {
  return {
    name: args.name,
    defaultValue: args.defaultValue,
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
