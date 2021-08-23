import { Icon, Tooltip } from '@material-ui/core';
import React from 'react';
import { SketchPicker } from 'react-color';
import { Expandable } from '../components/Expandable';

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
  description?: string;
  onChange: (v: ParamValue<Color>) => void;
}> = ({ name, value, description, onChange }) => {
  return (
    <Expandable
      mainEle={
        <div className="columns">
          <label className="label column is-four-fifths">
            {name}
            {description && (
              <Tooltip title={description}>
                <Icon>help</Icon>
              </Tooltip>
            )}
          </label>
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
  description?: string;
}): ParamFunction<Color> {
  return {
    name: args.name,
    defaultValue: args.defaultValue
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
    fn: (params) => {
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
