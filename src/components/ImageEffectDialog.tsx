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
  styled,
  TextField,
  Typography,
} from '@mui/material';
import type {
  ParamFunction,
  Effect,
  EffectInput,
  ImageEffectResult,
} from '~/domain/types';
import { miscUtil } from '~/domain/utils';
import { logger } from '~/domain/logger';
import { Gif } from './Gif';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';
import { useProcessingQueue } from '~/domain/useProcessingQueue';
import { RequiresAnimationTooltip } from './RequiresAnimationTooltip';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  backgroundColor: theme.palette.primary.contrastText,
}));

const GroupItems = styled('ul')({
  padding: 0,
});

interface Props {
  open: boolean;
  initialImage: ImageEffectResult | undefined;
  currentEffect: EffectInput | undefined;
  possibleEffects: Effect<any>[];
  currFps: number;
  currRandomSeed: string;
  currUseWasm: boolean;
  onChangeEffect: (
    effect: EffectInput,
    computedImage: ImageEffectResult | undefined,
  ) => void;
  onCancel: () => void;
}

export const ImageEffectDialog: React.FC<Props> = ({
  open,
  initialImage,
  currentEffect,
  possibleEffects,
  currFps,
  currRandomSeed,
  currUseWasm,
  onChangeEffect,
  onCancel,
}) => {
  const [image, setImage] = React.useState<
    { computing: true } | { computing: false; results: ImageEffectResult }
  >({ computing: true });

  const onImageChange = useProcessingQueue({
    onComplete: (results) => {
      setImage({ computing: false, results });
    },
  });

  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const [editingEffect, setEditingEffect] = React.useState<
    EffectInput | undefined
  >(undefined);

  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (currentEffect) {
      setEditingEffect({
        effect: currentEffect.effect,
        params: [...currentEffect.params], // Make a defensive copy so we can edit the params
      });
    }
  }, [currentEffect]);

  React.useEffect(() => {
    // Reset state to default values on close
    if (!open) {
      setInitialLoaded(false);
      setEditingEffect(undefined);
      setImage({ computing: true });
    }
  }, [open]);

  React.useEffect(() => {
    // Set initial loaded image once we have it
    if (!initialImage) {
      return;
    }

    if (!initialLoaded) {
      logger.debug('Initial loading');
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
    if (!initialImage || !editingEffect) {
      return;
    }

    setImage({ computing: true });
    onImageChange({
      fps: currFps,
      randomSeed: currRandomSeed,
      image: initialImage.image,
      effectInput: {
        effectName: editingEffect.effect.name,
        params: editingEffect.params,
      },
      useWasm: currUseWasm,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage, editingEffect, currFps, currRandomSeed]);

  const closeDialog = ({ save }: { save: boolean }) => {
    if (!save || !editingEffect) {
      onCancel();
      return;
    }

    onChangeEffect(editingEffect, image.computing ? undefined : image.results);
    setDirty(false);
  };

  const effect = editingEffect?.effect ?? undefined;

  return (
    <Dialog fullWidth maxWidth="sm" open={open}>
      {editingEffect && effect && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={4} marginTop={2}>
              <FormControl fullWidth>
                <Autocomplete
                  disableClearable
                  value={editingEffect.effect}
                  options={possibleEffects}
                  groupBy={(e) => e.group}
                  onChange={(_event, newEffect) => {
                    // Reset all the params when you select a new effect
                    setEditingEffect({
                      effect: newEffect,
                      params: newEffect.params.map((p: any) =>
                        p.defaultValue(initialImage?.image ?? undefined),
                      ),
                    });
                    setDirty(true);
                  }}
                  getOptionLabel={(option) => option.name}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <GroupHeader>
                        <Typography variant="subtitle1">
                          {params.group}
                        </Typography>
                        <Divider />
                      </GroupHeader>
                      <GroupItems>{params.children}</GroupItems>
                    </li>
                  )}
                  renderOption={(props, effect) => (
                    <li {...props}>
                      <Stack marginLeft={2} marginRight={2}>
                        <Typography variant="body2">{effect.name}</Typography>
                        <Typography variant="caption" marginLeft={2}>
                          {effect.description}
                        </Typography>
                      </Stack>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Effect" />
                  )}
                />
              </FormControl>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack divider={<Divider />} spacing={2}>
              <Stack direction="row" spacing={4}>
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
                {effect.requiresAnimation &&
                !image.computing &&
                image.results.image.frames.length <= 1 ? (
                  <RequiresAnimationTooltip />
                ) : null}
              </Stack>

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
                        params: miscUtil.replaceIndex(
                          editingEffect.params,
                          idx,
                          () => v,
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
                },
              )}
              <Stack sx={{ height: 300 }}>
                {image.computing ? (
                  <CircularProgress size={100} />
                ) : (
                  <>
                    <Gif
                      src={
                        image.results.gifWithBackgroundColor ??
                        image.results.gif
                      }
                      alt={`effect-${editingEffect.effect.name}`}
                      dimensions={image.results.image.dimensions}
                    />
                    {image.results.partiallyTransparent ? (
                      <BackgroundPreviewTooltip />
                    ) : null}
                  </>
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
        </>
      )}
    </Dialog>
  );
};
