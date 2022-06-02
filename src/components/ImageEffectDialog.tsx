import {
  Autocomplete,
  Button,
  CircularProgress,
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
import {
  ParamFunction,
  Effect,
  AppStateEffect,
  EffectInput,
} from '../domain/types';
import { replaceIndex } from '../domain/utils';
import { effectByName } from '../effects';
import { Gif } from './Gif';

interface ImageEffectProps {
  open: boolean;
  currentImage: AppStateEffect;
  selectedEffect: EffectInput;
  possibleEffects: Effect<any>[];
  onChangeEffect: (effect: EffectInput) => void;
  onCancel: () => void;
  applyEffect: (effect: EffectInput) => Promise<string | null>;
}

export const ImageEffectDialog: React.FC<ImageEffectProps> = ({
  open,
  currentImage,
  selectedEffect,
  possibleEffects,
  onChangeEffect,
  onCancel,
  applyEffect,
}) => {
  const [image, setImage] = React.useState<
    { computing: true } | { computing: false; gif: string }
  >({ computing: true });
  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const [editingEffect, setEditingEffect] = React.useState<EffectInput>({
    effectName: selectedEffect.effectName, // Make a copy of the effect being passed in
    params: [...selectedEffect.params],
  });
  const [dirty, setDirty] = React.useState(false);
  const [needsNewPreview, setNeedsNewPreview] = React.useState(false);
  const closeDialog = ({ save }: { save: boolean }) => {
    if (!save) {
      onCancel();
      return;
    }

    onChangeEffect(editingEffect);
    setDirty(false);
    setNeedsNewPreview(false);
  };

  React.useEffect(() => {
    if (currentImage.state.status !== 'done') {
      // Can't compute any preview until the previous image has computed
      return;
    }

    if (!initialLoaded) {
      // The initial loading of the original effect
      setImage({
        computing: false,
        gif: currentImage.state.image.gif,
      });
      setInitialLoaded(true);
      return;
    }

    if (needsNewPreview && !image.computing) {
      // The user changed the effect
      setImage({
        computing: true,
      });
      applyEffect(editingEffect).then((gif) => {
        // Should only be null if the original effect hasn't compute yet...
        if (gif) {
          setNeedsNewPreview(false);
          setImage({
            computing: false,
            gif,
          });
        }
      });
    }
  }, [
    image,
    setImage,
    currentImage,
    editingEffect,
    applyEffect,
    initialLoaded,
    needsNewPreview,
  ]);

  const effect = effectByName(editingEffect.effectName);

  return (
    <Dialog fullWidth maxWidth="sm" open={open}>
      <DialogTitle>
        <Stack direction="row" spacing={4} marginTop={2}>
          <FormControl fullWidth>
            <Autocomplete
              disableClearable
              value={editingEffect.effectName}
              options={possibleEffects.map((t) => t.name)}
              onChange={(event, newEffectName) => {
                const t = effectByName(newEffectName)!;
                // Reset all the params when you select a new effect
                setEditingEffect({
                  effectName: t.name,
                  params: t.params.map((p) =>
                    p.defaultValue(
                      currentImage.state.status === 'done'
                        ? currentImage.state.image.image
                        : undefined
                    )
                  ),
                });
                setDirty(true);
                setNeedsNewPreview(true);
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
            {effect.description}
            <div>
              {effect.secondaryDescription && (
                <Typography variant="caption" marginLeft={2}>
                  {effect.secondaryDescription}
                </Typography>
              )}
            </div>
          </Typography>

          {effect.params.map(
            // Create elements for each of the parameters for the selectect effect.
            // Each of these would get an onChange event so we know when the user has
            //  selected a value.
            (param: ParamFunction<any>, idx: number) => {
              const ele = param.fn({
                value: editingEffect.params[idx],
                onChange: (v) => {
                  setDirty(true);
                  setNeedsNewPreview(true);
                  setEditingEffect({
                    ...editingEffect,
                    params: replaceIndex(editingEffect.params, idx, () => v),
                  });
                },
              });
              return (
                <React.Fragment
                  key={`${editingEffect.effectName}-${param.name}`}
                >
                  {ele}
                </React.Fragment>
              );
            }
          )}
          <Stack sx={{ height: 300 }}>
            {image.computing ? (
              <CircularProgress size={100} />
            ) : (
              <Gif src={image.gif} alt={`effect-${editingEffect.effectName}`} />
            )}
          </Stack>
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
