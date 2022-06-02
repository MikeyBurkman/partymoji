import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  ParamFnDefault,
  ParamFunction,
  toParamFunction,
} from '../domain/types';

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

export function dropdownParam(args: {
  name: string;
  options: readonly { name: string; value: string }[];
  description?: string;
  defaultValue: ParamFnDefault<string>;
}): ParamFunction<string> {
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
          onChange={params.onChange}
        />
      );
    },
  };
}
