import { Stack, Typography } from '@material-ui/core';
import React from 'react';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';
import { Expandable } from '~/components/Expandable';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { Color, ParamFnDefault, ParamFunction } from '~/domain/types';
import { colorUtil } from '~/domain/utils';
import { toParamFunction } from './utils';
import { useState } from 'react';
import { useEffect } from 'react';

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
  const [rgbColor, setRgbColor] = useState(
    `rgb(${value[0]}, ${value[1]}, ${value[2]})`
  );
  const { rgbaArr } = useColorPicker(rgbColor, setRgbColor);

  useEffect(() => {
    console.log(`Comparing ${rgbaArr} with ${value}`);
    if (
      rgbaArr.length === value.length &&
      !rgbaArr.every((val, index) => val === value[index])
    ) {
      console.info('Updating color picker value');
      onChange(rgbaArr as Color);
    }
  }, [value, onChange, rgbaArr]);

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
      <ColorPicker
        value={rgbColor}
        onChange={setRgbColor}
        hideColorTypeBtns={true}
        hideOpacity={true}
        hidePresets={true}
        hideEyeDrop={true}
        hideAdvancedSliders={true}
        hideGradientType={true}
        hideControls={true}
        hideColorGuide={true}
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
