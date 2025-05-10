import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';
import { Column, Row } from '~/layout';

const RadioParam: React.FC<{
  name: string;
  options: ReadonlyArray<{ name: string; value: string }>;
  value: string;
  description?: string;
  onChange: (s: string) => void;
}> = ({ name, options, value, description, onChange }) => {
  return (
    <Column>
      <Row>
        <p>{name}</p>
        <Tooltip kind="help" description={description} />
      </Row>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label={name}
          defaultValue={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
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
    </Column>
  );
};

export function radioParam<T extends string>(args: {
  name: string;
  options: ReadonlyArray<{ name: string; value: T }>;
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
          onChange={(s) => {
            params.onChange(s as T);
          }}
        />
      );
    },
  };
}
