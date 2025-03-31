import { FormControl, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { HelpTooltip } from '~/components/HelpTooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

const TextParam: React.FC<{
  name: string;
  value: string;
  description?: string;
  onChange: (v: string) => void;
}> = ({ name, value, description, onChange }) => {
  const [val, setVal] = React.useState(value);

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <HelpTooltip description={description} />
      </Stack>
      <FormControl>
        <TextField
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            if (val.length > 0) {
              onChange(val);
            }
          }}
        />
      </FormControl>
    </Stack>
  );
};

export const textParam = (args: {
  name: string;
  description?: string;
  defaultValue: ParamFnDefault<string>;
}): ParamFunction<string> => ({
  name: args.name,
  defaultValue: toParamFunction(args.defaultValue),
  fn: (params) => (
    <TextParam
      name={args.name}
      description={args.description}
      onChange={params.onChange}
      value={params.value}
    />
  ),
});
