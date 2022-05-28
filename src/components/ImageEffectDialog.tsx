import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Stack,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamFunction, Effect } from '../domain/types';
import { replaceIndex } from '../domain/utils';
import { effectByName } from '../effects';

interface SelectedEffect {
  effect: Effect<any>;
  paramValues: any[];
}

interface ImageEffectProps {
  selectedEffect: SelectedEffect;
  possibleEffects: Effect<any>[];
  onChangeEffect: (effect: SelectedEffect) => void;
  onCancel: () => void;
}

export const ImageEffectDialog: React.FC<ImageEffectProps> = ({
  selectedEffect,
  possibleEffects,
  onChangeEffect,
  onCancel,
}) => {
  const [editingEffect, setEditingEffect] = React.useState<SelectedEffect>({
    effect: selectedEffect.effect, // Make a copy of the effect being passed in
    paramValues: [...selectedEffect.paramValues],
  });
  const [dirty, setDirty] = React.useState(false);
  const closeDialog = ({ save }: { save: boolean }) => {
    if (!save) {
      onCancel();
      return;
    }

    onChangeEffect(editingEffect);
    setDirty(false);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open>
      <DialogTitle>
        <Stack direction="row" spacing={4} marginTop={2}>
          <FormControl fullWidth>
            <Autocomplete
              disableClearable
              value={editingEffect.effect.name}
              options={possibleEffects.map((t) => t.name)}
              onChange={(event, newEffectName) => {
                const t = effectByName(newEffectName)!;
                // Reset all the params when you select a new effect
                setEditingEffect({
                  effect: t,
                  paramValues: t.params.map((p) => p.defaultValue),
                });
                setDirty(true);
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  <Stack marginLeft={2} marginRight={2}>
                    <Typography variant="body1">{option}</Typography>
                    <Typography variant="caption" marginLeft={2}>
                      {effectByName(option).description}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Effect" />}
            />
          </FormControl>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack divider={<Divider />} spacing={2}>
          <Typography variant="body2">
            {editingEffect.effect.description}
            <div>
              {editingEffect.effect.secondaryDescription && (
                <Typography variant="caption" marginLeft={2}>
                  {editingEffect.effect.secondaryDescription}
                </Typography>
              )}
            </div>
          </Typography>

          {editingEffect.effect.params.map(
            // Create elements for each of the parameters for the selectect effect.
            // Each of these would get an onChange event so we know when the user has
            //  selected a value.
            (param: ParamFunction<any>, idx: number) => {
              const ele = param.fn({
                value: editingEffect.paramValues[idx],
                onChange: (v) => {
                  setDirty(true);
                  setEditingEffect({
                    effect: editingEffect.effect,
                    paramValues: replaceIndex(
                      editingEffect.paramValues,
                      idx,
                      () => v
                    ),
                  });
                },
              });
              return (
                <React.Fragment
                  key={`${editingEffect.effect.name}-${param.name}`}
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
  );
};
