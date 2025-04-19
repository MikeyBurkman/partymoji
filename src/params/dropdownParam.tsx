import {
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Tooltip } from '~/components/Tooltip';
import type { ParamFnDefault, ParamFunction } from '~/domain/types';
import { toParamFunction } from './utils';

function DropdownParam<T extends string>({
  name,
  options,
  value,
  description,
  onChange,
}: {
  name: string;
  options: ReadonlyArray<{ name: string; value: string }>;
  value?: T;
  description?: string;
  onChange: (v: T) => void;
}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body2">{name}</Typography>
        <Tooltip kind="help" description={description} />
      </Stack>
      <FormControl>
        <Select
          autoWidth
          value={value}
          onChange={(event) => {
            onChange(event.target.value as T);
          }}
        >
          {options.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export function dropdownParam<T extends string>(args: {
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
        <DropdownParam<T>
          name={args.name}
          value={params.value}
          options={args.options}
          description={args.description}
          onChange={params.onChange}
        />
      );
    },
  };
}
