import {
  Autocomplete,
  Divider,
  FormControl,
  Icon,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamFunction, ParamValue, Transform } from '../domain/types';

interface SelectedTransform {
  transform: Transform<any>;
  paramValues: ParamValue<any>[];
}

interface ImageTransformProps {
  selectedTransform: SelectedTransform;
  possibleTransforms: Transform<any>[];
  index: number;
  onSelect: (selected: SelectedTransform) => void;
  onRemove: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({
  selectedTransform,
  possibleTransforms,
  index,
  onSelect,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) => {
  return (
    <Paper style={{ padding: 8 }} elevation={3}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2}>
          <Typography variant="subtitle1">{index + 1}</Typography>
          <Tooltip title="Delete transform">
            <IconButton aria-label="delete" onClick={onRemove}>
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move transform left">
            <IconButton
              aria-label="delete"
              onClick={onMoveLeft}
              disabled={!onMoveLeft}
            >
              <Icon>chevron_left</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move transform right">
            <IconButton
              aria-label="delete"
              onClick={onMoveRight}
              disabled={!onMoveRight}
            >
              <Icon>chevron_right</Icon>
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={4}>
          <FormControl fullWidth>
            <Autocomplete
              disableClearable
              value={selectedTransform.transform.name}
              options={possibleTransforms.map((t) => t.name)}
              onChange={(event, newTransformName) => {
                const t = possibleTransforms.find(
                  (t) => t.name === newTransformName
                )!;
                // Reset all the params when you select a new transform
                onSelect({
                  transform: t,
                  paramValues: t.params.map(
                    (p: ParamFunction<any>) => p.defaultValue
                  ),
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Transform" />
              )}
            />
          </FormControl>
        </Stack>
        {selectedTransform.transform.description && (
          <Typography variant="caption">
            {selectedTransform.transform.description}
          </Typography>
        )}
        {selectedTransform.transform.params.length > 0 && (
          <Typography variant="subtitle1">Parameters</Typography>
        )}
        <Stack divider={<Divider />} spacing={2}>
          {selectedTransform.transform.params.map(
            // Create elements for each of the parameters for the selectect transform.
            // Each of these would get an onChange event so we know when the user has
            //  selected a value.
            (param: ParamFunction<any>, idx: number) => {
              const ele = param.fn({
                value: selectedTransform.paramValues[idx],
                onChange: (v) => {
                  onSelect({
                    ...selectedTransform,
                    paramValues: selectedTransform.paramValues.map((x, i) => {
                      if (i === idx) {
                        return v;
                      }
                      return x;
                    }),
                  });
                },
              });
              return (
                <React.Fragment
                  key={`${selectedTransform.transform.name}-${param.name}`}
                >
                  {ele}
                </React.Fragment>
              );
            }
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
