import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  Stack,
  Typography,
  Icon as MuiIcon,
  Tooltip,
  Skeleton,
  Paper,
} from '@material-ui/core';
import { saveAs } from 'file-saver';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Controller } from 'swiper';
import SwiperClass from 'swiper/types/swiper-class';
import 'swiper/swiper.min.css';
import 'swiper/modules/navigation/navigation.min.css';

import type {
  ParamFunction,
  Effect,
  AppStateEffect,
  Image,
  AppState,
  ImageEffectResult,
  EffectInput,
} from '~/domain/types';
import { miscUtil } from '~/domain/utils';
import { effectByName } from '~/effects';
import { Gif } from './Gif';
import { Icon, ClickableIcon } from './Icon';
import { ImageEffectDialog } from './ImageEffectDialog';
import { BackgroundPreviewTooltip } from './BackgroundPreviewTooltip';
import { ImageRow } from './V2/ImageRow';
import { RequiresAnimationTooltip } from './RequiresAnimationTooltip';

interface EffectListProps {
  appState: AppState;
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 10) : 'pending'
  }`;

interface ImageEffectProps {
  effect: AppStateEffect;
  index: number;
  totalEffects: number;
  fname?: string;
  onDelete: () => void;
  onEdit: () => void;
  onMoveBefore: () => void;
  onMoveAfter: () => void;
  onAddBefore: () => void;
  onAddAfter: () => void;
}

export const ImageEffect: React.FC<ImageEffectProps> = ({
  effect,
  index,
  totalEffects,
  onEdit,
  onDelete,
  onMoveBefore,
  onMoveAfter,
  onAddBefore,
  onAddAfter,
}) => {
  return (
    <Stack alignItems="center" margin={2} justifyContent="space-evenly">
      <Stack direction="row" width="100%" minHeight="4rem">
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          marginLeft={2}
          marginBottom={1}
          alignSelf="left"
          width="95%"
        >
          {effect.effectName}
        </Typography>
        <ClickableIcon label="Delete effect" name="delete" onClick={onDelete} />
        <Stack direction="row" spacing={4} px={1}>
          {effectByName(effect.effectName).requiresAnimation &&
          effect.state.status === 'done' &&
          effect.state.image.image.frames.length <= 1 ? (
            <RequiresAnimationTooltip />
          ) : null}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            marginLeft={2}
            marginBottom={1}
            alignSelf="left"
            width="95%"
          >
            {effect.effectName}
          </Typography>
        </Stack>
        <ClickableIcon label="Delete effect" name="delete" onClick={onDelete} />
      </Stack>

      {effect.state.status === 'done' ? (
        <Stack sx={{ width: 250, paddingLeft: 3.5 }}>
          <Gif
            src={effect.state.image.gifWithBackgroundColor}
            alt={`${effect.effectName}-${index}`}
            dimensions={effect.state.image.image.dimensions}
          />
          {effect.state.image.partiallyTransparent ? (
            <BackgroundPreviewTooltip />
          ) : null}
        </Stack>
      ) : (
        <CircularProgress size={100} />
      )}

      <Stack direction="row" spacing={2} mt={4}>
        <ClickableIcon
          label="Add new effect before this"
          name="add"
          onClick={onAddBefore}
        />
        <ClickableIcon
          label="Move effect left"
          isDisabled={index <= 0}
          name="keyboard_double_arrow_left"
          onClick={onMoveBefore}
        />
        <ClickableIcon label="Edit effect" name="settings" onClick={onEdit} />
        <ClickableIcon
          label="Move effect right"
          isDisabled={index >= totalEffects - 1}
          name="keyboard_double_arrow_right"
          onClick={onMoveAfter}
        />
        <ClickableIcon
          label="Add new effect after this"
          name="add"
          onClick={onAddAfter}
        />
      </Stack>
    </Stack>
  );
};

export const ImageEffectList: React.FC<EffectListProps> = ({
  appState,
  possibleEffects,
  onEffectsChange,
}) => {
  const currentEffects = appState.effects;
  const [effectDialogOpen, setEffectDialogOpen] = React.useState<
    { open: false } | { open: true; idx: number; isNew: boolean }
  >({ open: false });

  const [swiper, setSwiper] = React.useState<SwiperClass | undefined>();

  const [baseImage, setBaseImage] = React.useState<
    ImageEffectResult | undefined
  >();

  React.useEffect(() => {
    if (!appState.baseImage || baseImage?.gif === appState.baseImage.gif) {
      return;
    }

    setBaseImage(baseImage);
  }, [appState, baseImage]);

  /** The first image to show when the edit dialog is opened */
  const dialogInitialImage = React.useMemo(():
    | ImageEffectResult
    | undefined => {
    if (!effectDialogOpen.open) {
      return undefined;
    }

    const prevEffect = currentEffects[effectDialogOpen.idx - 1];
    if (prevEffect) {
      return prevEffect.state.status === 'done'
        ? prevEffect.state.image
        : undefined;
    }

    return appState.baseImage;
  }, [appState, currentEffects, effectDialogOpen]);

  const currentEffect = React.useMemo((): EffectInput | undefined => {
    if (!effectDialogOpen.open) {
      return undefined;
    }

    const e = currentEffects[effectDialogOpen.idx];
    return {
      effect: effectByName(e.effectName),
      params: e.paramsValues,
    };
  }, [effectDialogOpen, currentEffects]);

  const newDefaultEffect = (tIdx: number): AppStateEffect => ({
    effectName: possibleEffects[0].name,
    paramsValues: possibleEffects[0].params.map((p: ParamFunction<any>) => {
      let image: Image | undefined = undefined;
      const previousEffect = currentEffects[tIdx];
      if (previousEffect?.state.status === 'done') {
        image = previousEffect.state.image.image;
      }

      return p.defaultValue(image);
    }),
    state: { status: 'init' },
  });

  const onDelete = (idx: number) =>
    onEffectsChange(currentEffects.filter((nextT, newIdx) => newIdx !== idx));

  const onMoveBefore = (idx: number) => {
    onEffectsChange(
      currentEffects.map((nextT, newIdx) => {
        if (newIdx === idx - 1) {
          // This is the next item in the list
          return currentEffects[newIdx + 1];
        } else if (idx === newIdx) {
          // This is the previous item
          return currentEffects[idx - 1];
        } else {
          return nextT;
        }
      })
    );
    setTimeout(() => swiper?.slideTo(idx - 1), 50);
  };

  const onMoveAfter = (idx: number) => {
    onEffectsChange(
      currentEffects.map((nextT, newIdx) => {
        if (newIdx === idx + 1) {
          // This is the previous item in the list
          return currentEffects[newIdx - 1];
        } else if (idx === newIdx) {
          // This is the next item
          return currentEffects[idx + 1];
        } else {
          return nextT;
        }
      })
    );
    setTimeout(() => swiper?.slideTo(idx + 1), 50);
  };

  const onAddNew = () => {
    onEffectsChange([newDefaultEffect(0)]);
    setTimeout(() => swiper?.slideTo(0), 50);
    setEffectDialogOpen({
      open: true,
      idx: 0,
      isNew: true,
    });
  };

  const onAddAfter = (tIdx: number) => {
    const newIdx = tIdx + 1;
    onEffectsChange(
      miscUtil.insertInto(currentEffects, newIdx, newDefaultEffect(tIdx))
    );
    setTimeout(() => swiper?.slideTo(newIdx), 50);
    setTimeout(
      () =>
        setEffectDialogOpen({
          open: true,
          idx: newIdx,
          isNew: true,
        }),
      2
    );
  };

  const onAddBefore = (tIdx: number) => {
    onEffectsChange(
      miscUtil.insertInto(currentEffects, tIdx, newDefaultEffect(tIdx - 1))
    );
    setTimeout(
      () =>
        setEffectDialogOpen({
          open: true,
          idx: tIdx,
          isNew: true,
        }),
      2
    );
  };

  const finalGif = React.useMemo((): string | undefined => {
    const lastEffect = currentEffects[currentEffects.length - 1];
    if (!lastEffect) {
      return undefined;
    }

    if (lastEffect.state.status !== 'done') {
      return undefined;
    }

    return lastEffect.state.image.gif;
  }, [currentEffects]);

  return (
    <Stack>
      <ImageEffectDialog
        open={effectDialogOpen.open}
        possibleEffects={possibleEffects}
        onChangeEffect={(newEffect, computedImage) => {
          if (!effectDialogOpen.open) {
            return;
          }

          onEffectsChange(
            miscUtil.replaceIndex(currentEffects, effectDialogOpen.idx, () => ({
              effectName: newEffect.effect.name,
              paramsValues: newEffect.params,
              state: computedImage
                ? { status: 'done', image: computedImage }
                : { status: 'init' },
            }))
          );
          setEffectDialogOpen({ open: false });
        }}
        onCancel={() => {
          // Assumed to be open at this point
          if (effectDialogOpen.open && effectDialogOpen.isNew) {
            // They pressed cancel on a new effect, so just remove this one.
            // (It's assumed to be the last effect in the chain
            onEffectsChange(currentEffects.slice(0, currentEffects.length - 1));
          }

          setEffectDialogOpen({ open: false });
        }}
        initialImage={dialogInitialImage}
        currentEffect={currentEffect}
        currFps={appState.fps}
        currRandomSeed="partymoji"
      />
      <Box>
        <Divider sx={{ pb: 4 }}>
          <Button startIcon={<Icon name="add" />} onClick={onAddNew} name="add">
            Insert First Effect
          </Button>
        </Divider>
        {currentEffects.map((t, tIdx) => (
          <Stack key={effectKey(t, tIdx)}>
            <Paper style={{ padding: 8 }} elevation={4}>
              <Stack alignItems="center" spacing={2}>
                <Typography variant="h6">{t.effectName}</Typography>
                <Stack
                  direction="row"
                  maxWidth="md"
                  spacing={2}
                  sx={{ overflowX: 'scroll' }}
                >
                  <Stack spacing={2} justifyContent="center">
                    <ClickableIcon
                      label="Edit"
                      name="settings"
                      onClick={() =>
                        setEffectDialogOpen({
                          open: true,
                          idx: tIdx,
                          isNew: false,
                        })
                      }
                    />
                    <ClickableIcon
                      label="Delete"
                      name="delete"
                      onClick={() => onDelete(tIdx)}
                    />
                  </Stack>
                  <ImageRow appStateEffect={t} />
                </Stack>
              </Stack>
            </Paper>
            <Divider sx={{ py: 4 }}>
              <Button
                onClick={() => onAddAfter(tIdx)}
                startIcon={<Icon name="add" />}
              >
                {tIdx < currentEffects.length - 1
                  ? 'Insert Effect Here'
                  : 'Add New Effect'}
              </Button>
            </Divider>
          </Stack>
        ))}

        {/*<Swiper
          navigation
          modules={[Navigation, Controller]}
          controller={{ control: swiper }}
          onSwiper={setSwiper}
        >
          {currentEffects.map((t, tIdx) => (
              <SwiperSlide key={effectKey(t, tIdx)}>
                {tIdx + 1} of {currentEffects.length}
                <ImageEffect
                  effect={t}
                  index={tIdx}
                  totalEffects={currentEffects.length}
                  fname={appState.fname}
                  onDelete={() => onDelete(tIdx)}
                  onEdit={() =>
                    setEffectDialogOpen({
                      open: true,
                      idx: tIdx,
                      isNew: false,
                    })
                  }
                  onAddBefore={() => onAddBefore(tIdx)}
                  onAddAfter={() => onAddAfter(tIdx)}
                  onMoveBefore={() => onMoveBefore(tIdx)}
                  onMoveAfter={() => onMoveAfter(tIdx)}
                />
              </SwiperSlide>
          ))}
        </Swiper> */}
      </Box>
      {finalGif != null && (
        <Paper style={{ padding: 8 }} elevation={4}>
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h6">Final Result</Typography>
            <Gif src={finalGif} alt={appState.fname || 'image.gif'} />
            <Button
              variant="contained"
              onClick={() => {
                saveAs(finalGif, appState.fname || 'image.gif');
              }}
              startIcon={<Icon name="save_alt" />}
            >
              Save Gif
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};
