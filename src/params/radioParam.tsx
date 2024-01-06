import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

const RadioParam: React.FC<{
  name: string;
  options: readonly { name: string; value: string }[];
  value: string;
  description?: string;
  onChange: (s: string) => void;
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
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((t) => (
            <FormControlLabel
              value={t.value}
              control={<Radio />}
              label={t.name}
              key={t.value}
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
  defaultValue: ParamFnDefault<T>;
}): ParamFunction<T> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <RadioParam
          name={args.name}
          value={params.value}
          options={args.options}
          description={args.description}
          onChange={(s) => params.onChange(s as T)}
        />
      );
    },
  };
}
