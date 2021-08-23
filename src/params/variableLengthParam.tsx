import {
  Box,
  Tooltip,
  Icon,
  IconButton,
  Grid,
  Button,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamValue, ParamFunction } from '../domain/types';

interface VariableLengthProps<T> {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  value?: T[];
  description?: string;
  onChange: (v: ParamValue<T>) => void;
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
  >(
    value === undefined
      ? []
      : value.map((v, idx) => ({ param: createNewParam(), pValue: v }))
  );
  return (
    <Paper>
      <Grid container>
        <Grid item xs={12}>
          <Grid container>
            <Grid item>
              <Typography variant="h5" component="div">
                {name}
              </Typography>
            </Grid>
            {description && (
              <Grid item>
                <Tooltip title={description}>
                  <Icon>help</Icon>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </Grid>
        {params.map(({ param, pValue }, idx) => {
          const ele = param.fn({
            value: { valid: true, value: pValue },
            onChange: (newValue) => {
              if (newValue.valid) {
                const p = params.map((oldP, i) => {
                  if (idx === i) {
                    return {
                      param,
                      pValue: newValue.value,
                    };
                  }
                  return oldP;
                });
                setParams(p);
                onChange({
                  valid: true,
                  value: p.map((n) => n.pValue),
                });
              }
            },
          });

          return (
            <Grid item xs={12}>
              <Grid container spacing={4} key={`${name}-${idx}`}>
                <Grid item xs={4}>
                  <IconButton
                    onClick={() =>
                      setParams(params.filter((x, i) => i !== idx))
                    }
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </Grid>
                <Grid item>{ele}</Grid>
              </Grid>
            </Grid>
          );
        })}
        <Grid item>
          <Button
            variant="contained"
            onClick={() => {
              const p = createNewParam();
              setParams([
                ...params,
                {
                  param: p,
                  pValue: p.defaultValue,
                },
              ]);
            }}
          >
            {newParamText}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export function variableLengthParam<T>(args: {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  description?: string;
  defaultValue?: T[];
}): ParamFunction<T[]> {
  return {
    name: args.name,
    defaultValue: args.defaultValue
      ? { valid: true, value: args.defaultValue }
      : { valid: false },
    fn: (params) => {
      return (
        <VariableLengthParam
          name={args.name}
          newParamText={args.newParamText}
          value={params.value.valid ? params.value.value : undefined}
          createNewParam={args.createNewParam}
          description={args.description}
          onChange={params.onChange}
        />
      );
    },
  };
}
