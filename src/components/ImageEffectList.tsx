import React from 'react';
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Divider,
} from '@material-ui/core';
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
import { Icon } from './Icon';
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isOpen = anchorEl != null;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack alignItems="center" margin={2}>
      <Stack>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          marginLeft={2}
          marginBottom={1}
        >
          {effect.effectName}
        </Typography>
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

      <Button
        startIcon={<Icon name="settings" />}
        onClick={handleClick}
        variant="contained"
        style={{ marginTop: 12 }}
      >
        Options
      </Button>
      <Menu
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onEdit();
          }}
        >
          Edit effect
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            onAddBefore();
          }}
        >
          Insert new effect before this
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onAddAfter();
          }}
        >
          Add new effect after this
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={index <= 0}
          onClick={() => {
            handleClose();
            onMoveBefore();
          }}
        >
          Move effect to the left
        </MenuItem>
        <MenuItem
          disabled={index >= totalEffects - 1}
          onClick={() => {
            handleClose();
            onMoveAfter();
          }}
        >
          Move effect to the right
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            onDelete();
          }}
        >
          <>
            <Icon name="delete" />
            Delete Effect
          </>
        </MenuItem>
      </Menu>
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
        <Button variant="contained" fullWidth onClick={onAddNew}>
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
