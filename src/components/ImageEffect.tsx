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
import { ParamFunction, Effect } from '../domain/types';

interface SelectedEffect {
  effect: Effect<any>;
  paramValues: any[];
}

interface ImageEffectProps {
  selectedEffect: SelectedEffect;
  possibleEffects: Effect<any>[];
  index: number;
  onSelect: (selected: SelectedEffect) => void;
  onRemove: () => void;
  onMoveBefore?: () => void;
  onMoveAfter?: () => void;
}

export const ImageEffect: React.FC<ImageEffectProps> = ({
  selectedEffect,
  possibleEffects,
  index,
  onSelect,
  onRemove,
  onMoveBefore,
  onMoveAfter,
}) => {
  const effectsByName = React.useMemo(
    () => new Map(possibleEffects.map((effect) => [effect.name, effect])),
    [possibleEffects]
  );

  const [paramsOpen, setParamsOpen] = React.useState(false);
  const [currParams, setCurrParams] = React.useState([
    ...selectedEffect.paramValues,
  ]);
  const [dirty, setDirty] = React.useState(false);
  const closeDialog = ({ save }: { save: boolean }) => {
    setParamsOpen(false);
    if (save && dirty) {
      onSelect({
        ...selectedEffect,
        paramValues: currParams,
      });
    } else {
      setCurrParams([...selectedEffect.paramValues]);
    }
    setDirty(false);
  };

  return (
    <Paper style={{ padding: 8 }} elevation={3} sx={{ width: 300 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2}>
          <Typography variant="subtitle1">{index + 1}</Typography>
          <Tooltip title="Delete effect">
            <IconButton aria-label="delete" onClick={onRemove}>
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move effect earlier">
            <IconButton
              aria-label="move-before"
              onClick={onMoveBefore}
              disabled={!onMoveBefore}
            >
              <Icon>arrow_upward</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Move effect later">
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
              value={selectedEffect.effect.name}
              options={possibleEffects.map((t) => t.name)}
              onChange={(event, newEffectName) => {
                const t = effectsByName.get(newEffectName)!;
                // Reset all the params when you select a new effect
                onSelect({
                  effect: t,
                  paramValues: t.params.map(
                    (p: ParamFunction<any>) => p.defaultValue
                  ),
                });
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  <Stack marginLeft={2} marginRight={2}>
                    <Typography variant="body1">{option}</Typography>
                    <Typography variant="caption" marginLeft={2}>
                      {effectsByName.get(option)?.description}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Effect" />}
            />
          </FormControl>
        </Stack>
        {selectedEffect.effect.params.length > 0 ? (
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
          <DialogTitle>{selectedEffect.effect.name} Parameters</DialogTitle>
          <DialogContent>
            <Stack divider={<Divider />} spacing={2}>
              <Typography variant="body2">
                {selectedEffect.effect.description}
                <div>
                  {selectedEffect.effect.secondaryDescription && (
                    <Typography variant="caption" marginLeft={2}>
                      {selectedEffect.effect.secondaryDescription}
                    </Typography>
                  )}
                </div>
              </Typography>

              {selectedEffect.effect.params.map(
                // Create elements for each of the parameters for the selectect effect.
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
                      key={`${selectedEffect.effect.name}-${param.name}`}
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
