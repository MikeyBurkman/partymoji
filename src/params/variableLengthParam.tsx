import { Button, IconButton, Paper } from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { JsonType, ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';
import { Icon } from '~/components/Icon';
import { Column, Row } from '~/layout';

interface VariableLengthProps<T extends JsonType> {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  value: Array<T>;
  description?: string;
  onChange: (v: Array<T>) => void;
}

interface ParamState<T extends JsonType> {
  param: ParamFunction<T>;
  pValue: T;
}

function VariableLengthParam<T extends JsonType>({
  name,
  newParamText,
  createNewParam,
  value,
  description,
  onChange,
}: VariableLengthProps<T>) {
  const [params, setParams] = React.useState<Array<ParamState<T>>>(
    value.map((v) => ({ param: createNewParam(), pValue: v })),
  );

  const paramComponents = React.useMemo(() => {
    return params.map(({ param, pValue }, idx) => {
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
        <Row key={`${name}-${idx}`}>
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
        </Row>
      );
    });
  }, [name, onChange, params]);

  const onClickNewParam = React.useCallback(() => {
    const p = createNewParam();
    const newParams = [
      ...params,
      {
        param: p,
        pValue: p.defaultValue(),
      },
    ];
    setParams(newParams);
    const vals = newParams.map((n) => n.pValue);
    onChange(vals);
  }, [createNewParam, onChange, params]);

  return (
    <Paper>
      <Column>
        <Row>
          <p>{name}</p>
          <Tooltip kind="help" description={description} />
        </Row>
        {paramComponents}
        <Button variant="contained" onClick={onClickNewParam}>
          {newParamText}
        </Button>
      </Column>
    </Paper>
  );
}

export function variableLengthParam<T extends JsonType>(args: {
  name: string;
  newParamText: string;
  createNewParam: () => ParamFunction<T>;
  description?: string;
  defaultValue: ParamFnDefault<Array<T>>;
}): ParamFunction<Array<T>> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <VariableLengthParam<T>
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
