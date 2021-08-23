import { Tooltip, Icon } from '@material-ui/core';
import React from 'react';
import { InlineIcon } from '../components/InlineIcon';
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
    <div className="field" style={{ maxWidth: '12em' }}>
      <label className="label">
        <div>
          {name}{' '}
          {description && (
            <Tooltip title={description}>
              <Icon>help</Icon>
            </Tooltip>
          )}
        </div>
      </label>
      <div className="control">
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
            <div key={`${name}-${idx}`} className="columns">
              <div className="column is-narrow">
                <InlineIcon
                  iconClassName="fa-trash"
                  onClick={() => {
                    setParams(params.filter((x, i) => i !== idx));
                  }}
                />
              </div>
              <div className="column">{ele}</div>
            </div>
          );
        })}
        <div>
          <button
            className="button"
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
          </button>
        </div>
      </div>
    </div>
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
