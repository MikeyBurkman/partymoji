import { Checkbox, Stack, Typography } from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '../components/HelpTooltip';
import { ParamFunction, ParamValue } from '../domain/types';

const CheckboxParam: React.FC<{
  name: string;
  value?: boolean;
  description?: string;
  onChange: (v: ParamValue<boolean>) => void;
}> = ({ name, value, description, onChange }) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2" paddingTop="0.5rem">
          {name}
        </Typography>
        <span style={{ paddingTop: '0.5rem' }}>
          <HelpTooltip description={description} />
        </span>
        <Checkbox
          aria-label={name}
          checked={value}
          onChange={(e, value) => onChange({ valid: true, value })}
        />
      </Stack>
    </Stack>
  );
};

export function checkboxParam(args: {
  name: string;
  defaultValue?: boolean;
  description?: string;
}): ParamFunction<boolean> {
  return {
    name: args.name,
    defaultValue:
      args.defaultValue !== undefined
        ? { valid: true, value: args.defaultValue }
        : { valid: false },
    fn: (params) => {
      return (
        <CheckboxParam
          name={args.name}
          value={params.value.valid ? params.value.value : undefined}
          onChange={params.onChange}
          description={args.description}
        />
      );
    },
  };
}
