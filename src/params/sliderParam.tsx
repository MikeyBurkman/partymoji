import { Slider, Stack, TextField, Typography } from '@mui/material';
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
  const [draft, setDraft] = React.useState<string | null>(null);
  const precision = Math.max(
    ...[min, max, step ?? 1].map((n) => {
      const [coefficient, exponent = '0'] = n.toString().split('e');
      return Math.max(
        0,
        (coefficient.split('.')[1]?.length ?? 0) - Number(exponent),
      );
    }),
  );
  const valueWidth = Math.max(
    min.toFixed(precision).length,
    max.toFixed(precision).length,
  );

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <Tooltip kind="help" description={description} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
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
        <TextField
          size="small"
          type="number"
          value={draft ?? val.toString()}
          slotProps={{
            htmlInput: {
              'aria-label': `${name} value`,
              min,
              max,
              step: step ?? 1,
            },
          }}
          sx={{
            flexShrink: 0,
            width: `calc(${valueWidth}ch + 1.75em)`,
            '& input': {
              fontVariantNumeric: 'tabular-nums',
              MozAppearance: 'textfield',
            },
            '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button':
              { WebkitAppearance: 'none', margin: 0 },
          }}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
          onBlur={(e) => {
            const input = e.target as HTMLInputElement;
            const nextValue = input.valueAsNumber;
            if (
              input.validity.valid &&
              Number.isFinite(nextValue) &&
              nextValue !== val
            ) {
              setVal(nextValue);
            }
            setDraft(null);
          }}
        />
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
