import {
  Tooltip,
  Icon,
  FormControl,
  Select,
  MenuItem,
  Stack,
  FormHelperText,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamValue, ParamFunction } from '../domain/types';

const DropdownParam: React.FC<{
  name: string;
  options: readonly { name: string; value: any }[];
  value?: any;
  description?: string;
  onChange: (v: ParamValue<any>) => void;
}> = ({ name, options, value, description, onChange }) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        {description && (
          <Tooltip title={description}>
            <Icon fontSize="small">help</Icon>
          </Tooltip>
        )}
      </Stack>
      <FormControl>
        <Select
          autoWidth
          value={value}
          onChange={(event) =>
            onChange({ valid: true, value: event.target.value })
          }
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
