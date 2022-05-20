import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { ParamFunction, Transform } from '../domain/types';

interface SelectedTransform {
  transform: Transform<any>;
  paramValues: any[];
}

interface ImageTransformProps {
  selectedTransform: SelectedTransform;
  possibleTransforms: Transform<any>[];
  index: number;
  onSelect: (selected: SelectedTransform) => void;
  onRemove: () => void;
  onMoveBefore?: () => void;
  onMoveAfter?: () => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({
  selectedTransform,
  possibleTransforms,
  index,
  onSelect,
  onRemove,
  onMoveBefore,
  onMoveAfter,
}) => {
  const [paramsOpen, setParamsOpen] = React.useState(false);
  const [currParams, setCurrParams] = React.useState([
    ...selectedTransform.paramValues,
  ]);
  const [dirty, setDirty] = React.useState(false);
  const closeDialog = ({ save }: { save: boolean }) => {
    setParamsOpen(false);
    if (save && dirty) {
      onSelect({
        ...selectedTransform,
        paramValues: currParams,
      });
    } else {
      setCurrParams([...selectedTransform.paramValues]);
    }
    setDirty(false);
  };

  return (
    <Paper style={{ padding: 8 }} elevation={3} sx={{ width: 300 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2}>
          <Typography variant="subtitle1">{index + 1}</Typography>
          <Tooltip title="Delete transform">
            <IconButton aria-label="delete" onClick={onRemove}>
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move transform earlier">
            <IconButton
              aria-label="move-before"
              onClick={onMoveBefore}
              disabled={!onMoveBefore}
            >
              <Icon>arrow_upward</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move transform later">
            <IconButton
              aria-label="move-after"
              onClick={onMoveAfter}
              disabled={!onMoveAfter}
            >
              <Icon>arrow_downward</Icon>
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
        {selectedTransform.transform.params.length > 0 ? (
          <Button
            variant="contained"
            startIcon={<Icon>edit</Icon>}
            onClick={() => setParamsOpen(!paramsOpen)}
          >
            Edit Parameters
          </Button>
        ) : (
          <Button variant="contained" disabled>
            (No Parameters Available)
          </Button>
        )}
        <Dialog fullWidth maxWidth="sm" open={paramsOpen}>
          <DialogTitle>
            {selectedTransform.transform.name} Parameters
          </DialogTitle>
          <DialogContent>
            <Stack divider={<Divider />} spacing={2}>
              {selectedTransform.transform.description && (
                <Typography variant="caption">
                  {selectedTransform.transform.description}
                </Typography>
              )}
              {selectedTransform.transform.params.map(
                // Create elements for each of the parameters for the selectect transform.
                // Each of these would get an onChange event so we know when the user has
                //  selected a value.
                (param: ParamFunction<any>, idx: number) => {
                  const ele = param.fn({
                    value: currParams[idx],
                    onChange: (v) => {
                      setDirty(true);
                      setCurrParams(
                        currParams.map((x, i) => {
                          if (i === idx) {
                            return v;
                          }
                          return x;
                        })
                      );
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
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              autoFocus
              onClick={() => {
                closeDialog({ save: false });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              autoFocus
              disabled={!dirty}
              onClick={() => {
                closeDialog({ save: true });
              }}
            >
              Save and Close
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Paper>
  );
};
