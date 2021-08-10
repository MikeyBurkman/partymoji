import React from 'react';
import { SketchPicker } from 'react-color';
import { Expandable } from '../../../components';

import { ParamValue, ParamFunction, Color } from '../../types';
import { fromHexColor, toHexColor } from '../../utils';

const ColorPickerParam: React.FC<{
  name: string;
  value: Color;
  onChange: (v: ParamValue<Color>) => void;
}> = ({ name, value, onChange }) => {
  return (
    <Expandable
      mainEle={
        <div className="is-flex-direction-column">
          {name}
          <div
            style={{
              width: '1.0em',
              height: '1.0em',
              backgroundColor: toHexColor(value),
            }}
          />
        </div>
      }
    >
      <SketchPicker
        disableAlpha={true}
        presetColors={[]}
        color={toHexColor(value)}
        onChangeComplete={(c) =>
          onChange({ valid: true, value: fromHexColor(c.hex) })
        }
      />
    </Expandable>
  );
};

export function colorPickerParam(args: {
  name: string;
  defaultValue: Color;
}): ParamFunction<Color> {
  return {
    name: args.name,
    defaultValue: args.defaultValue,
    fn: (params) => (
      <ColorPickerParam
        name={args.name}
        value={params.value}
        onChange={params.onChange}
      />
    ),
  };
}
