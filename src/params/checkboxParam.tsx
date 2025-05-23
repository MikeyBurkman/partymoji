import React from 'react';
import { Checkbox, Stack, Typography } from '@mui/material';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

const CheckboxParam: React.FC<{
  name: string;
  value?: boolean;
  description?: string;
  onChange: (v: boolean) => void;
}> = ({ name, value, description, onChange }) => {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2" paddingTop="0.5rem">
          {name}
        </Typography>
        <span style={{ paddingTop: '0.5rem' }}>
          <Tooltip kind="help" description={description} />
        </span>
        <Checkbox
          aria-label={name}
          checked={value}
          onChange={(e) => { onChange(e.target.checked); }}
        />
      </Stack>
    </Stack>
  );
};

export function checkboxParam(args: {
  name: string;
  defaultValue: ParamFnDefault<boolean>;
  description?: string;
}): ParamFunction<boolean> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <CheckboxParam
          name={args.name}
          value={params.value}
          onChange={params.onChange}
          description={args.description}
        />
      );
    },
  };
}
