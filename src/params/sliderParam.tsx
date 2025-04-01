import { Slider, Stack, Typography } from '@mui/material';
import React from 'react';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { useDebounce } from '~/domain/utils/useDebounce';
import { toParamFunction } from './utils';

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

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <Tooltip kind="help" description={description} />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ paddingLeft: '8px', paddingRight: '8px' }}
      >
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
        <Typography variant="body2">{val}</Typography>
      </Stack>
    </Stack>
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
