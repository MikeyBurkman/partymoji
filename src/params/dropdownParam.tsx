import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

const DropdownParam: React.FC<{
  name: string;
  options: readonly { name: string; value: string }[];
  value?: any;
  description?: string;
  onChange: (v: string) => void;
}> = ({ name, options, value, description, onChange }) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <FormControl>
        <Select
          autoWidth
          value={value}
          onChange={(event) => onChange(event.target.value as string)}
        >
          {options.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export function dropdownParam<T extends string>(args: {
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
        <DropdownParam
          name={args.name}
          value={params.value}
          options={args.options}
          description={args.description}
          onChange={params.onChange as any}
        />
      );
    },
  };
}
