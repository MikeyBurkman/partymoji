import { Slider } from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { useDebounce } from '~/domain/utils/useDebounce';
import { toParamFunction } from './utils';
import styled from 'styled-components';
import { Column, Row } from '~/layout';

const SliderParam: React.FC<{
  name: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  description?: string;
  onChange: (v: number) => void;
}> = ({ name, value, min, max, step, description, onChange }) => {
  const [val, setVal] = useDebounce({
    value,
    onChange,
    debounceMillis: 500,
  });

  const increments = Math.floor((max - min) / (step ?? 1));

  // column with minimum width to be a usable slider
  const SliderColumn = styled(Column)`
    min-width: ${increments * 2}px;
  `;

  return (
    <SliderColumn>
      <Row width="100%" verticalAlign='middle' gap={2}>
        <label>
          {name} <Tooltip kind="help" description={description} />
          <Slider
            aria-label={name}
            value={val}
            step={step}
            valueLabelDisplay="off"
            getAriaValueText={(x) => x.toString()}
            min={min}
            max={max}
            onChange={(_e, value) => {
              setVal(value);
            }}
          />
        </label>
        <span>{val}</span>
      </Row>
    </SliderColumn>
  );
};

export function sliderParam(args: {
  name: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: ParamFnDefault<number>;
  description?: string;
}): ParamFunction<number> {
  return {
    name: args.name,
    defaultValue: toParamFunction(args.defaultValue),
    fn: (params) => {
      return (
        <SliderParam
          name={args.name}
          value={params.value}
          onChange={params.onChange}
          min={args.min}
          max={args.max}
          step={args.step}
          description={args.description}
        />
      );
    },
  };
}
