import React from 'react';
import { SketchPicker } from 'react-color';
import { Expandable } from '../components';

import { ParamValue, ParamFunction, Color } from '../domain/types';
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
  value?: Color;
  onChange: (v: ParamValue<Color>) => void;
}> = ({ name, value, onChange }) => {
  console.log('value', value);
  return (
    <Expandable
      mainEle={
        <div className="columns">
          <label className="label column is-four-fifths">{name}</label>
          <span className="column">{value && <ColorBox color={value} />}</span>
        </div>
      }
    >
      <SketchPicker
        disableAlpha={true}
        presetColors={[]}
        color={value ? toHexColor(value) : undefined}
        onChangeComplete={(c) =>
          onChange({ valid: true, value: fromHexColor(c.hex) })
        }
      />
    </Expandable>
  );
};

export function colorPickerParam(args: {
  name: string;
  defaultValue?: Color;
}): ParamFunction<Color> {
  return {
    name: args.name,
    defaultValue: args.defaultValue
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
    fn: (params) => {
      console.log('params', params);
      return (
        <ColorPickerParam
          name={args.name}
          value={params.value.valid ? params.value.value : undefined}
          onChange={params.onChange}
        />
      );
    },
  };
}
