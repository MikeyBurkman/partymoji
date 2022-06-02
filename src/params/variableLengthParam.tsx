import {
  Button,
  Icon,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { HelpTooltip } from '../components/HelpTooltip';
import {
  JsonType,
  ParamFnDefault,
  ParamFunction,
  toParamFunction,
} from '../domain/types';

interface VariableLengthProps<T extends JsonType> {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  value: T[];
  description?: string;
  onChange: (v: T) => void;
}

const VariableLengthParam: React.FC<VariableLengthProps<any>> = ({
  name,
  newParamText,
  createNewParam,
  value,
  description,
  onChange,
}) => {
  const [params, setParams] = React.useState<
    { param: ParamFunction<any>; pValue: any }[]
  >(value.map((v) => ({ param: createNewParam(), pValue: v })));
  return (
    <Paper>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Typography variant="body2">{name}</Typography>
          <HelpTooltip description={description} />
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
                  const newParams = params.filter((x, i) => i !== idx);
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
                <Icon>delete</Icon>
              </IconButton>
              {ele}
            </Stack>
          );
        })}
        <Button
          variant="contained"
          onClick={() => {
            const p = createNewParam();
            const newParams = [
              ...params,
              {
                param: p,
                pValue: p.defaultValue,
              },
            ];
            setParams(newParams);
            onChange(newParams.map((n) => n.pValue));
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
