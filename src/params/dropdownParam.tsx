import React from 'react';
import { Dropdown } from '../components/Dropdown';
import { Tooltip } from '../components/Tooltip';
import { ParamValue, ParamFunction } from '../domain/types';

const DropdownParam: React.FC<{
  name: string;
  options: readonly { name: string; value: any }[];
  value?: any;
  description?: string;
  onChange: (v: ParamValue<any>) => void;
}> = ({ name, options, value, description, onChange }) => {
  return (
    <div className="field" style={{ maxWidth: '12em' }}>
      <label className="label">
        {name}
        {description && <Tooltip text={description} />}
      </label>
      <div className="control">
        <Dropdown
          onChange={(value) => onChange({ valid: true, value })}
          selected={value}
          options={options}
        />
      </div>
    </div>
  );
};

export function dropdownParam<T>(args: {
  name: string;
  options: readonly { name: string; value: T }[];
  description?: string;
  defaultValue?: T;
}): ParamFunction<T> {
  return {
    name: args.name,
    defaultValue: args.defaultValue
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
    fn: (params) => {
      return (
        <DropdownParam
          name={args.name}
          value={params.value.valid ? params.value.value : undefined}
          options={args.options}
          description={args.description}
          onChange={params.onChange}
        />
      );
    },
  };
}
