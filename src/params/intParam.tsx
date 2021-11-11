import {
  FormControl,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '../components/HelpTooltip';
import { ParamFunction, ParamValue } from '../domain/types';

type ParsedParam<T> =
  | { valid: true; value: T }
  | { valid: false; reason: string };

const IntParam: React.FC<{
  name: string;
  value?: number;
  description?: string;
  parse: (s: string) => ParsedParam<number>;
  onChange: (v: ParamValue<number>) => void;
}> = ({ name, value, description, parse, onChange }) => {
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
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <FormControl>
        <TextField
          error={!!invalidText}
          value={val}
          onBlur={onBlur}
          onChange={(e) => {
            setVal(e.target.value);
          }}
        />
        {invalidText && <FormHelperText>{invalidText}</FormHelperText>}
      </FormControl>
    </Stack>
  );
};

export const intParam = (args: {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  description?: string;
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
      if (isNaN(n) || n.toString() !== s) {
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
        description={args.description}
        parse={parse}
        onChange={params.onChange}
        value={params.value.valid ? params.value.value : undefined}
      />
    );
  },
});
