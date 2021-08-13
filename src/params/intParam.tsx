import React from 'react';
import { ParamValue, ParamFunction } from '../domain/types';

type ParsedParam<T> =
  | { valid: true; value: T }
  | { valid: false; reason: string };

const IntParam: React.FC<{
  name: string;
  value?: number;
  parse: (s: string) => ParsedParam<number>;
  onChange: (v: ParamValue<number>) => void;
}> = ({ name, value, parse, onChange }) => {
  const [val, setVal] = React.useState(
    value === undefined ? undefined : value.toString()
  );
  const [invalidText, setInvalidText] = React.useState('');

  const onBlur = () => {
    if (val === undefined) {
      // Only if no default value provided and no changes have happened
      return;
    }

    if (value && val === value.toString()) {
      return; // Don't fire an onChange event if things haven't changed
    }
    const n = parse(val);
    if (n.valid) {
      setInvalidText('');
    } else {
      setInvalidText(n.reason);
    }
    onChange(n);
  };

  return (
    <div className="field">
      <label className="label">{name}</label>
      <div className="control has-icons-left has-icons-right">
        <input
          className="input"
          type="text"
          defaultValue={value}
          onChange={(e) => {
            setVal(e.target.value);
          }}
          onBlur={onBlur}
        />
      </div>
      {invalidText && <p className="help is-danger">{invalidText}</p>}
    </div>
  );
};

export const intParam = (args: {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
}): ParamFunction<number> => ({
  name: args.name,
  defaultValue:
    args.defaultValue !== undefined
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
  fn: (params) => {
    const { min, max } = args;
    const parse = (s: string): ParsedParam<number> => {
      const n = parseInt(s, 10);
      if (isNaN(n)) {
        return { valid: false, reason: 'Must be an integer' };
      }
      if (min !== undefined && n < min) {
        return {
          valid: false,
          reason: `Must be greater than or equal to ${min}`,
        };
      }
      if (max !== undefined && n > max) {
        return { valid: false, reason: `Must be less than or equal to ${max}` };
      }
      return { valid: true, value: n };
    };

    return (
      <IntParam
        name={args.name}
        parse={parse}
        onChange={params.onChange}
        value={params.value.valid ? params.value.value : undefined}
      />
    );
  },
});
