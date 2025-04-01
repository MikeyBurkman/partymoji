import {
  FormControl,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

type ParsedParam<T> =
  | { valid: true; value: T }
  | { valid: false; reason: string };

const IntParam: React.FC<{
  name: string;
  value: number;
  description?: string;
  parse: (s: string) => ParsedParam<number>;
  onChange: (v: number) => void;
}> = ({ name, value, description, parse, onChange }) => {
  const [val, setVal] = React.useState(value.toString());
  const [invalidText, setInvalidText] = React.useState('');

  const onBlur = () => {
    if (val === value.toString()) {
      return; // Don't fire an onChange event if things haven't changed
    }
    const n = parse(val);
    if (n.valid) {
      setInvalidText('');
      onChange(n.value);
    } else {
      setInvalidText(n.reason);
    }
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <Tooltip kind="help" description={description} />
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
  defaultValue: ParamFnDefault<number>;
  min?: number;
  max?: number;
  description?: string;
}): ParamFunction<number> => ({
  name: args.name,
  defaultValue: toParamFunction(args.defaultValue),
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
        value={params.value}
      />
    );
  },
});
