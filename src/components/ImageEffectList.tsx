import React from 'react';
import { Button, CircularProgress, Stack, Typography } from '@material-ui/core';
import { saveAs } from 'file-saver';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Controller } from 'swiper';
import SwiperClass from 'swiper/types/swiper-class';
import 'swiper/swiper.min.css';
import 'swiper/modules/navigation/navigation.min.css';

import {
  ParamFunction,
  Effect,
  AppStateEffect,
  Image,
  AppState,
  ImageEffectResult,
  EffectInput,
} from '../domain/types';
import { replaceIndex } from '../domain/utils/misc';
import { Gif } from './Gif';
import { Icon, ClickableIcon } from './Icon';
import { ImageEffectDialog } from './ImageEffectDialog';

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
        <ClickableIcon
          tooltip="Delete effect"
          name="delete"
          onClick={onDelete}
        />
      </Stack>

      {effect.state.status === 'done' ? (
        <Stack sx={{ width: 250, paddingLeft: 3.5 }}>
          <Gif
            src={effect.state.image.gif}
            alt={`${effect.effectName}-${index}`}
            dimensions={effect.state.image.image.dimensions}
          />
        </Stack>
      ) : (
        <CircularProgress size={100} />
      )}

      <Stack direction="row" spacing={2} mt={4}>
        <ClickableIcon
          tooltip="Add new effect before this"
          name="add"
          onClick={onAddBefore}
        />
        <ClickableIcon
          tooltip="Move effect left"
          isDisabled={index <= 0}
          name="keyboard_double_arrow_left"
          onClick={onMoveBefore}
        />
        <ClickableIcon tooltip="Edit effect" name="settings" onClick={onEdit} />
        <ClickableIcon
          tooltip="Move effect right"
          isDisabled={index >= totalEffects - 1}
          name="keyboard_double_arrow_right"
          onClick={onMoveAfter}
        />
        <ClickableIcon
          tooltip="Add new effect after this"
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
      effectName: e.effectName,
      params: e.paramsValues,
    };
  }, [effectDialogOpen, currentEffects]);

  const onDelete = (idx: number) =>
    onEffectsChange(currentEffects.filter((nextT, newIdx) => newIdx !== idx));

  const onMoveBefore = (idx: number) =>
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

  const onMoveAfter = (idx: number) =>
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

  const onAddNew = React.useCallback(() => {
    onEffectsChange([
      ...currentEffects,
      {
        effectName: possibleEffects[0].name,
        paramsValues: possibleEffects[0].params.map((p: ParamFunction<any>) => {
          let image: Image | undefined = undefined;
          if (currentEffects.length === 0) {
            image = baseImage?.image;
          } else {
            const lastEffect = currentEffects[currentEffects.length - 1];
            if (lastEffect.state.status === 'done') {
              image = lastEffect.state.image.image;
            }
          }

          return p.defaultValue(image);
        }),
        state: { status: 'init' },
      },
    ]);
    setTimeout(() => swiper?.slideTo(currentEffects.length + 1), 50);
    setEffectDialogOpen({
      open: true,
      idx: currentEffects.length,
      isNew: true,
    });
  }, [baseImage, currentEffects, onEffectsChange, possibleEffects, swiper]);

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
    <Stack spacing={4}>
      <ImageEffectDialog
        open={effectDialogOpen.open}
        possibleEffects={possibleEffects}
        onChangeEffect={(newEffect, computedImage) => {
          if (!effectDialogOpen.open) {
            return;
          }

          onEffectsChange(
            replaceIndex(currentEffects, effectDialogOpen.idx, () => ({
              effectName: newEffect.effectName,
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
      <Typography variant="h5">Image Effects</Typography>
      <Stack direction="row">
        <Swiper
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
                onAddBefore={() => {
                  onEffectsChange([
                    {
                      effectName: possibleEffects[0].name,
                      paramsValues: possibleEffects[0].params.map(
                        (p: ParamFunction<any>) => {
                          let image: Image | undefined = undefined;
                          if (tIdx === 0) {
                            image = baseImage?.image;
                          } else {
                            const previousEffect = currentEffects[tIdx - 1];
                            if (previousEffect.state.status === 'done') {
                              image = previousEffect.state.image.image;
                            }
                          }

                          return p.defaultValue(image);
                        }
                      ),
                      state: { status: 'init' },
                    },
                    ...currentEffects,
                  ]);
                  setEffectDialogOpen({
                    open: true,
                    idx: tIdx,
                    isNew: true,
                  });
                }}
                onAddAfter={onAddNew}
                onMoveBefore={() => onMoveBefore(tIdx)}
                onMoveAfter={() => onMoveAfter(tIdx)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Stack>
      {currentEffects.length === 0 && (
        <Button variant="outlined" fullWidth onClick={onAddNew}>
          Add First Effect
        </Button>
      )}
      <Button
        variant="contained"
        disabled={finalGif == null}
        onClick={() => {
          if (!finalGif) {
            return; // Button will be disabled
          }
          saveAs(finalGif, appState.fname || 'image.gif');
        }}
        startIcon={<Icon name="save_alt" />}
      >
        Save Gif
      </Button>
    </Stack>
  );
};
