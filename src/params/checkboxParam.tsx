import React from 'react';
import { Checkbox } from '@mui/material';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';
import { Row } from '~/layout';

const CheckboxParam: React.FC<{
  name: string;
  value?: boolean;
  description?: string;
  onChange: (v: boolean) => void;
}> = ({ name, value, description, onChange }) => {
  return (
    <Row>
      <p>{name}</p>
      <span style={{ paddingTop: '0.5rem' }}>
        <Tooltip kind="help" description={description} />
      </span>
      <Checkbox
        aria-label={name}
        checked={value}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
    </Row>
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
