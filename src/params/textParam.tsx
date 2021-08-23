import { FormControl, FormHelperText, TextField } from '@material-ui/core';
import React from 'react';
import { ParamFunction, ParamValue } from '../domain/types';

const TextParam: React.FC<{
  name: string;
  value?: string;
  description?: string;
  onChange: (v: ParamValue<string>) => void;
}> = ({ name, value, description, onChange }) => {
  const [val, setVal] = React.useState(value);

  return (
    <FormControl>
      <FormHelperText>{description ?? ' '}</FormHelperText>
      <TextField
        label={name}
        defaultValue={value}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() =>
          onChange(val ? { valid: true, value: val } : { valid: false })
        }
      />
    </FormControl>
  );
};

export const textParam = (args: {
  name: string;
  description?: string;
  defaultValue?: string;
}): ParamFunction<string> => ({
  name: args.name,
  defaultValue:
    args.defaultValue !== undefined
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
  fn: (params) => (
    <TextParam
      name={args.name}
      description={args.description}
      onChange={params.onChange}
      value={params.value.valid ? params.value.value : undefined}
    />
  ),
});
