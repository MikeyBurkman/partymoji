import React from 'react';
import { Box, Button, Divider, Stack, Typography, Paper } from '@mui/material';
import { saveAs } from 'file-saver';

import { IS_MOBILE } from '~/domain/env';
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
import { ImageRow } from './ImageRow';
import { RequiresAnimationTooltip } from './RequiresAnimationTooltip';

type EffectEditDialogState =
  | { open: false }
  | { open: true; idx: number; isNew: boolean };

interface EffectListProps {
  appState: AppState;
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 16) : 'pending'
  }`;

interface ImageEffectProps {
  effect: AppStateEffect;
  index: number;
  currentEffects: AppStateEffect[];
  setEffectEditDialogState: (state: EffectEditDialogState) => void;
  onEffectsChange: EffectListProps['onEffectsChange'];
  newDefaultEffect: (index: number) => AppStateEffect;
}

export const ImageEffect: React.FC<ImageEffectProps> = ({
  effect,
  index,
  currentEffects,
  setEffectEditDialogState,
  onEffectsChange,
  newDefaultEffect,
}) => {
  const onEdit = React.useCallback(() => {
    setEffectEditDialogState({
      open: true,
      idx: index,
      isNew: false,
    });
  }, [index, setEffectEditDialogState]);

  const onDelete = React.useCallback(() => {
    onEffectsChange(miscUtil.removeIndex(currentEffects, index));
  }, [currentEffects, index, onEffectsChange]);

  const onAddAfter = React.useCallback(() => {
    const newIdx = index + 1;
    onEffectsChange(
      miscUtil.insertInto(currentEffects, newIdx, newDefaultEffect(index)),
    );
    setTimeout(
      () =>
        setEffectEditDialogState({
          open: true,
          idx: newIdx,
          isNew: true,
        }),
      2,
    );
  }, [
    currentEffects,
    index,
    newDefaultEffect,
    onEffectsChange,
    setEffectEditDialogState,
  ]);

  const requiresAnimation = React.useMemo(() => {
    if (effect.state.status !== 'done') {
      return null;
    }

    const e = effectByName(effect.effectName);
    if (e.requiresAnimation && effect.state.image.image.frames.length <= 1) {
      return <RequiresAnimationTooltip />;
    }

    return null;
  }, [effect]);

  return (
    <Stack>
      <Paper style={{ padding: 8 }} elevation={4}>
        <Stack alignItems="center" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h6">
              #{index + 1}: {effect.effectName}
            </Typography>
            {requiresAnimation}
          </Stack>
          <Stack
            direction="row"
            maxWidth={IS_MOBILE ? '300px' : 'md'}
            spacing={2}
            sx={{ overflowX: 'auto' }}
          >
            <Stack spacing={2} justifyContent="center">
              <ClickableIcon label="Edit" name="Settings" onClick={onEdit} />
              <ClickableIcon label="Delete" name="Delete" onClick={onDelete} />
            </Stack>
            <ImageRow appStateEffect={effect} />
          </Stack>
        </Stack>
      </Paper>
      <Divider sx={{ py: 4 }}>
        <Button onClick={onAddAfter} startIcon={<Icon name="Add" />}>
          {index < currentEffects.length - 1
            ? 'Insert Effect Here'
            : 'Add New Effect'}
        </Button>
      </Divider>
    </Stack>
  );
};

export const ImageEffectList: React.FC<EffectListProps> = ({
  appState,
  possibleEffects,
  onEffectsChange,
}) => {
  const currentEffects = appState.effects;
  const [effectEditDialogState, setEffectEditDialogState] =
    React.useState<EffectEditDialogState>({ open: false });

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
    if (!effectEditDialogState.open) {
      return undefined;
    }

    const prevEffect = currentEffects[effectEditDialogState.idx - 1];
    if (prevEffect) {
      return prevEffect.state.status === 'done'
        ? prevEffect.state.image
        : undefined;
    }

    return appState.baseImage;
  }, [appState, currentEffects, effectEditDialogState]);

  const currentEffect = React.useMemo((): EffectInput | undefined => {
    if (!effectEditDialogState.open) {
      return undefined;
    }

    const e = currentEffects[effectEditDialogState.idx];
    return {
      effect: effectByName(e.effectName),
      params: e.paramsValues,
    };
  }, [effectEditDialogState, currentEffects]);

  const newDefaultEffect = React.useCallback(
    (tIdx: number): AppStateEffect => ({
      effectName: possibleEffects[0].name,
      paramsValues: possibleEffects[0].params.map((p: ParamFunction<any>) => {
        let image: Image | undefined = undefined;
        if (tIdx === 0) {
          image = appState.baseImage?.image;
        } else {
          const previousEffect = currentEffects[tIdx];
          if (previousEffect?.state.status === 'done') {
            image = previousEffect.state.image.image;
          }
        }

        return p.defaultValue(image);
      }),
      state: { status: 'init' },
    }),
    [appState, currentEffects, possibleEffects],
  );

  // const onMoveBefore = (idx: number) => {
  //   onEffectsChange(
  //     currentEffects.map((nextT, newIdx) => {
  //       if (newIdx === idx - 1) {
  //         // This is the next item in the list
  //         return currentEffects[newIdx + 1];
  //       } else if (idx === newIdx) {
  //         // This is the previous item
  //         return currentEffects[idx - 1];
  //       } else {
  //         return nextT;
  //       }
  //     })
  //   );
  // };

  // const onMoveAfter = (idx: number) => {
  //   onEffectsChange(
  //     currentEffects.map((nextT, newIdx) => {
  //       if (newIdx === idx + 1) {
  //         // This is the previous item in the list
  //         return currentEffects[newIdx - 1];
  //       } else if (idx === newIdx) {
  //         // This is the next item
  //         return currentEffects[idx + 1];
  //       } else {
  //         return nextT;
  //       }
  //     })
  //   );
  // };

  const onAddNew = React.useCallback(() => {
    onEffectsChange(
      miscUtil.insertInto(currentEffects, 0, newDefaultEffect(0)),
    );
    setTimeout(
      () =>
        setEffectEditDialogState({
          open: true,
          idx: 0,
          isNew: true,
        }),
      2,
    );
  }, [currentEffects, newDefaultEffect, onEffectsChange]);

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

  const dialogOnChangeEffect = React.useCallback(
    (
      newEffect: EffectInput,
      computedImage: ImageEffectResult | undefined,
    ): void => {
      if (!effectEditDialogState.open) {
        return;
      }

      onEffectsChange(
        miscUtil.replaceIndex(
          currentEffects,
          effectEditDialogState.idx,
          () => ({
            effectName: newEffect.effect.name,
            paramsValues: newEffect.params,
            state: computedImage
              ? { status: 'done', image: computedImage }
              : { status: 'init' },
          }),
        ),
      );
      setEffectEditDialogState({ open: false });
    },
    [currentEffects, effectEditDialogState, onEffectsChange],
  );

  const dialogOnCancel = React.useCallback(() => {
    if (effectEditDialogState.open && effectEditDialogState.isNew) {
      // They pressed cancel on a new effect, so just remove the one we added.
      onEffectsChange(
        miscUtil.removeIndex(currentEffects, effectEditDialogState.idx),
      );
    }
    setEffectEditDialogState({ open: false });
  }, [currentEffects, effectEditDialogState, onEffectsChange]);

  const onSaveGif = React.useCallback(() => {
    if (finalGif != null) {
      saveAs(finalGif, appState.fname || 'image.gif');
    }
  }, [finalGif, appState]);

  // Hide this effect index, as it's a new effect
  const hiddenIdx = React.useMemo(() => {
    if (!effectEditDialogState.open) {
      return Number.MAX_SAFE_INTEGER;
    }

    return effectEditDialogState.isNew
      ? effectEditDialogState.idx
      : Number.MAX_SAFE_INTEGER;
  }, [effectEditDialogState]);

  return (
    <Stack>
      <ImageEffectDialog
        open={effectEditDialogState.open}
        possibleEffects={possibleEffects}
        onChangeEffect={dialogOnChangeEffect}
        onCancel={dialogOnCancel}
        initialImage={dialogInitialImage}
        currentEffect={currentEffect}
        currFps={appState.fps}
        currUseWasm={appState.useWasm}
        currRandomSeed="partymoji"
      />
      <Box>
        <Divider sx={{ pb: 4 }}>
          <Button startIcon={<Icon name="Add" />} onClick={onAddNew} name="add">
            Insert First Effect
          </Button>
        </Divider>
        {currentEffects.map(
          (t, tIdx) =>
            tIdx !== hiddenIdx && (
              <ImageEffect
                key={effectKey(t, tIdx)}
                index={tIdx}
                currentEffects={currentEffects}
                effect={t}
                setEffectEditDialogState={setEffectEditDialogState}
                onEffectsChange={onEffectsChange}
                newDefaultEffect={newDefaultEffect}
              />
            ),
        )}
      </Box>
      {finalGif != null && (
        <Paper style={{ padding: 8 }} elevation={4}>
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h6">Final Result</Typography>
            <Gif src={finalGif} alt={appState.fname || 'image.gif'} />
            <Button
              variant="contained"
              onClick={onSaveGif}
              startIcon={<Icon name="SaveAlt" />}
            >
              Save Gif
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};
