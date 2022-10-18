import React from 'react';
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
import {
  ParamFunction,
  Effect,
  EffectInput,
  ImageEffectResult,
} from '../domain/types';
import { replaceIndex } from '../domain/utils/misc';
import { debugLog } from '../domain/env';
import { effectByName } from '../effects';
import { Gif } from './Gif';
import { useProcessingQueue } from './useProcessingQueue';
import { computeGif } from '../domain/computeGifs';

interface ImageEffectProps {
  open: boolean;
  initialImage: ImageEffectResult | undefined;
  currentEffect: EffectInput;
  possibleEffects: Effect<any>[];
  currFps: number;
  currRandomSeed: string;
  onChangeEffect: (
    effect: EffectInput,
    computedImage: ImageEffectResult | undefined
  ) => void;
  onCancel: () => void;
}

export const ImageEffectDialog: React.FC<ImageEffectProps> = ({
  open,
  initialImage,
  currentEffect,
  possibleEffects,
  currFps,
  currRandomSeed,
  onChangeEffect,
  onCancel,
}) => {
  const [image, setImage] = React.useState<
    { computing: true } | { computing: false; results: ImageEffectResult }
  >({ computing: true });

  const onImageChange = useProcessingQueue({
    fn: computeGif,
    onComplete: (results) => setImage({ computing: false, results }),
  });

  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const [editingEffect, setEditingEffect] = React.useState<EffectInput>({
    // Make a copy of the effect being passed in
    effectName: currentEffect.effectName,
    params: [...currentEffect.params],
  });
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    // Reset state to default values on close
    if (!open) {
      setInitialLoaded(false);
      setEditingEffect({
        // Make a copy of the effect being passed in
        effectName: currentEffect.effectName,
        params: [...currentEffect.params],
      });
      setImage({ computing: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    // Set initial loaded image once we have it
    if (!initialImage) {
      return;
    }

    if (!initialLoaded) {
      debugLog('Initial loading');
      // The initial loading of the original effect
      setImage({
        computing: false,
        results: initialImage,
      });
      setInitialLoaded(true);
      return;
    }

    // Just used for setting the initial image, so just change it when the initial image does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage]);

  React.useEffect(() => {
    if (!initialImage) {
      return;
    }

    setImage({ computing: true });
    onImageChange({
      fps: currFps,
      randomSeed: currRandomSeed,
      image: initialImage.image,
      effectInput: editingEffect,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage, editingEffect, currFps, currRandomSeed]);

  const closeDialog = ({ save }: { save: boolean }) => {
    if (!save) {
      onCancel();
      return;
    }

    onChangeEffect(editingEffect, image.computing ? undefined : image.results);
    setDirty(false);
  };

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
                    p.defaultValue(initialImage?.image ?? undefined)
                  ),
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
              <Gif
                src={image.results.gif}
                alt={`effect-${editingEffect.effectName}`}
              />
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
