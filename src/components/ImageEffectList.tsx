import React from 'react';
import { saveAs } from 'file-saver';
import type {
  AppStateEffect,
  Image,
  AppState,
  ImageEffectResult,
  EffectInput,
  AnyEffect,
} from '~/domain/types';
import { miscUtil } from '~/domain/utils';
import { effectByName } from '~/effects';
import { Gif } from './Gif';
import { Icon } from './Icon';
import { ImageEffectDialog } from './ImageEffectDialog';
import { ImageRow } from './ImageRow';
import { RequiresAnimationTooltip } from './RequiresAnimationTooltip';
import { Column, Row } from '~/layout';
import { Button } from './Button';
import { Divider } from './Divider';

type EffectEditDialogState =
  | { open: false }
  | { open: true; idx: number; isNew: boolean };

interface EffectListProps {
  appState: AppState;
  possibleEffects: Array<AnyEffect>;
  onEffectsChange: (t: Array<AppStateEffect>) => void;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 16) : 'pending'
  }`;

interface ImageEffectProps {
  effect: AppStateEffect;
  index: number;
  currentEffects: Array<AppStateEffect>;
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
    setTimeout(() => {
      setEffectEditDialogState({
        open: true,
        idx: newIdx,
        isNew: true,
      });
    }, 2);
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
    <Column gap={2} width="100%" horizontalAlign="stretch">
      <Column
        horizontalAlign="center"
        padding={1}
        gap={2}
        backgroundColor="white"
      >
        <Row gap={2} verticalAlign="middle">
          <h2>
            #{index + 1}: {effect.effectName}
          </h2>
          {requiresAnimation}
          <Button
            variant="warning"
            size="small"
            onClick={onDelete}
            icon={<Icon name="Delete" />}
          />
        </Row>
        <ImageRow appStateEffect={effect} onEdit={onEdit} onDelete={onDelete} />
      </Column>
      <Divider py={4}>
        <Button
          onClick={onAddAfter}
          icon={<Icon name="Add" />}
          variant="secondary"
        >
          {index < currentEffects.length - 1
            ? 'Insert Effect Here'
            : 'Add New Effect'}
        </Button>
      </Divider>
    </Column>
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- invalid linting error
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
      paramsValues: possibleEffects[0].params.map((p) => {
        let image: Image | undefined = undefined;
        if (tIdx === 0) {
          image = appState.baseImage?.image;
        } else {
          const previousEffect = currentEffects[tIdx];
          if (previousEffect.state.status === 'done') {
            image = previousEffect.state.image.image;
          }
        }

        return p.defaultValue(image);
      }),
      state: { status: 'init' },
    }),
    [appState, currentEffects, possibleEffects],
  );

  const onAddNew = React.useCallback(() => {
    onEffectsChange(
      miscUtil.insertInto(currentEffects, 0, newDefaultEffect(0)),
    );
    setTimeout(() => {
      setEffectEditDialogState({
        open: true,
        idx: 0,
        isNew: true,
      });
    }, 2);
  }, [currentEffects, newDefaultEffect, onEffectsChange]);

  const finalGif = React.useMemo((): string | undefined => {
    const lastEffect = currentEffects[currentEffects.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- invalid linting error
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
      const fileName =
        (appState.fname ?? 'image').replace(/\.[^/.]+$/, '') + '.gif';
      saveAs(finalGif, fileName);
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
    <Column horizontalAlign="stretch">
      <ImageEffectDialog
        open={effectEditDialogState.open}
        possibleEffects={possibleEffects}
        onChangeEffect={dialogOnChangeEffect}
        onCancel={dialogOnCancel}
        initialImage={dialogInitialImage}
        currentEffect={currentEffect}
        currFps={appState.fps}
        currRandomSeed="partymoji"
      />
      <Divider py={4}>
        <Button
          icon={<Icon name="Add" />}
          onClick={onAddNew}
          variant="secondary"
        >
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
      {finalGif != null && (
        <Column horizontalAlign="center" padding={2} backgroundColor="white">
          <h2>Final Result</h2>
          <Gif src={finalGif} alt={appState.fname ?? 'image.gif'} />
          <Button
            variant="primary"
            size="large"
            onClick={onSaveGif}
            icon={<Icon name="SaveAlt" />}
          >
            Save Gif
          </Button>
        </Column>
      )}
    </Column>
  );
};
