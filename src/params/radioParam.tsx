import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '../components/HelpTooltip';
import { ParamFunction, ParamValue } from '../domain/types';

const RadioParam: React.FC<{
  name: string;
  options: readonly { name: string; value: string }[];
  value?: string;
  description?: string;
  onChange: (string: ParamValue<any>) => void;
}> = ({ name, options, value, description, onChange }) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label={name}
          defaultValue={value}
          onChange={(event) =>
            onChange({ valid: true, value: event.target.value })
          }
        >
          {options.map((t) => (
            <FormControlLabel
              value={t.value}
              control={<Radio />}
              label={t.name}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Stack>
  );
};

export function radioParam<T extends string>(args: {
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
        <RadioParam
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
