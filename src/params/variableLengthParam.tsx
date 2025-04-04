import { Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { JsonType, ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';
import { Icon } from '~/components/Icon';

interface VariableLengthProps<T extends JsonType> {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  value: T[];
  description?: string;
  onChange: (v: T) => void;
}

interface ParamState {
  param: ParamFunction<any>;
  pValue: any;
}

const VariableLengthParam: React.FC<VariableLengthProps<any>> = ({
  name,
  newParamText,
  createNewParam,
  value,
  description,
  onChange,
}) => {
  const [params, setParams] = React.useState<ParamState[]>(
    value.map((v) => ({ param: createNewParam(), pValue: v })),
  );
  return (
    <Paper>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Typography variant="body2">{name}</Typography>
          <Tooltip kind="help" description={description} />
        </Stack>
        {params.map(({ param, pValue }, idx) => {
          const ele = param.fn({
            value: pValue,
            onChange: (newValue) => {
              const p = params.map((oldP, i) => {
                if (idx === i) {
                  return {
                    param,
                    pValue: newValue,
                  };
                }
                return oldP;
              });
              setParams(p);
              onChange(p.map((n) => n.pValue));
            },
          });

          return (
            <Stack direction="row" key={`${name}-${idx}`}>
              <IconButton
                onClick={() => {
                  const newParams = params.filter((_x, i) => i !== idx);
                  setParams(newParams);
                  onChange(newParams.map((n) => n.pValue));
                }}
                style={{
                  visibility:
                    idx === 0 /* Hide delete on first item */
                      ? 'hidden'
                      : undefined,
                }}
              >
                <Icon name="Delete" />
              </IconButton>
              {ele}
            </Stack>
          );
        })}
        <Button
          variant="contained"
          onClick={() => {
            const p = createNewParam();
            const newParams: ParamState[] = [
              ...params,
              {
                param: p,
                pValue: p.defaultValue(),
              },
            ];
            setParams(newParams);
            const vals = newParams.map((n) => n.pValue);
            onChange(vals);
          }}
        >
          {newParamText}
        </Button>
      </Stack>
    </Paper>
  );
};

export function variableLengthParam<T extends JsonType>(args: {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  description?: string;
  defaultValue: ParamFnDefault<T[]>;
}): ParamFunction<T[]> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <VariableLengthParam
          name={args.name}
          newParamText={args.newParamText}
          value={params.value}
          createNewParam={args.createNewParam}
          description={args.description}
          onChange={params.onChange}
        />
      );
    },
  };
}
