import { FormControl, TextField } from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';
import { Column, Row } from '~/layout';

const TextParam: React.FC<{
  name: string;
  value: string;
  description?: string;
  onChange: (v: string) => void;
}> = ({ name, value, description, onChange }) => {
  const [val, setVal] = React.useState(value);

  return (
    <Column>
      <Row>
        <p>{name}</p>
        <Tooltip kind="help" description={description} />
      </Row>
      <FormControl>
        <TextField
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
          }}
          onBlur={() => {
            if (val.length > 0) {
              onChange(val);
            }
          }}
        />
      </FormControl>
    </Column>
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
