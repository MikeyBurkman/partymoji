import {
  Button,
  CircularProgress,
  Divider,
  Icon,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { readImage } from '../domain/run';
import {
  ParamFunction,
  Effect,
  AppStateEffect,
  Image,
  AppState,
  ImageEffectResult,
  ComputeState,
} from '../domain/types';
import { replaceIndex } from '../domain/utils/misc';
import { Gif } from './Gif';
import { ImageEffectDialog } from './ImageEffectDialog';

interface EffectListProps {
  appState: AppState;
  computeState: ComputeState[];
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
}

const effectKey = (t: AppStateEffect, c: ComputeState, idx: number): string =>
  `${t.effectName}-${idx}-${
    c?.status === 'done' ? c.image.gif.substring(0, 10) : 'pending'
  }`;

export const ImageEffectList: React.FC<EffectListProps> = ({
  appState,
  computeState,
  possibleEffects,
  onEffectsChange,
}) => {
  const currentEffects = appState.effects;
  const [effectDialogOpen, setEffectDialogOpen] = React.useState<
    { open: false } | { open: true; idx: number; isNew: boolean }
  >({ open: false });

  const onDelete = (idx: number) => () =>
    onEffectsChange(currentEffects.filter((nextT, newIdx) => newIdx !== idx));

  const [baseImage, setBaseImage] = React.useState<
    ImageEffectResult | undefined
  >();
  React.useEffect(() => {
    if (!appState.baseImage || baseImage?.gif === appState.baseImage) {
      return;
    }

    const gif = appState.baseImage;
    readImage(gif).then((image) =>
      setBaseImage({
        gif,
        image,
      })
    );
  }, [appState, baseImage]);

  const getInitialImage = React.useCallback(
    (idx: number): ImageEffectResult | undefined => {
      const prevEffect = computeState[idx - 1];
      if (prevEffect) {
        return prevEffect.status === 'done' ? prevEffect.image : undefined;
      }

      return baseImage;
    },
    [baseImage, computeState]
  );

  const onMoveUp = (idx: number) =>
    idx > 0
      ? () =>
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
          )
      : undefined;

  const onMoveDown = (idx: number) =>
    idx < currentEffects.length - 1
      ? () =>
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
          )
      : undefined;

  const fx = currentEffects.map((t, tIdx) => ({
    t,
    c: computeState[tIdx] as ComputeState | undefined,
    tIdx,
  }));

  return (
    <Stack spacing={4} alignItems="center">
      <Typography variant="h5">Image Effects</Typography>
      {fx.flatMap(({ t, c, tIdx }) => [
        <Stack direction="row" key={effectKey(t, c, tIdx)} spacing={4}>
          <Stack>
            <Stack>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                marginLeft={2}
                marginBottom={1}
              >
                {t.effectName}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Remove effect">
                  <IconButton aria-label="delete" onClick={onDelete(tIdx)}>
                    <Icon>delete</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move effect earlier">
                  <IconButton
                    aria-label="move-before"
                    onClick={onMoveUp(tIdx)}
                    disabled={tIdx === 0}
                  >
                    <Icon>arrow_upward</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move effect later">
                  <IconButton
                    aria-label="move-after"
                    onClick={onMoveDown(tIdx)}
                    disabled={tIdx === currentEffects.length - 1}
                  >
                    <Icon>arrow_downward</Icon>
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            {c?.status === 'done' && (
              <Stack sx={{ width: 250 }}>
                <Gif src={c.image.gif} alt={`${t.effectName}-${tIdx}`} />
              </Stack>
            )}
            {c?.status === 'computing' && <CircularProgress size={100} />}
            <Stack spacing={1} marginTop={1}>
              <Button
                variant="contained"
                startIcon={<Icon>edit</Icon>}
                onClick={() =>
                  setEffectDialogOpen({ open: true, idx: tIdx, isNew: false })
                }
              >
                Edit Effect
              </Button>
            </Stack>
            <ImageEffectDialog
              open={effectDialogOpen.open && effectDialogOpen.idx === tIdx}
              possibleEffects={possibleEffects}
              onChangeEffect={(newEffect, computedImage) => {
                onEffectsChange(
                  replaceIndex(currentEffects, tIdx, () => ({
                    effectName: newEffect.effectName,
                    paramsValues: newEffect.params,
                  }))
                );
                setEffectDialogOpen({ open: false });
              }}
              onCancel={() => {
                // Assumed to be open at this point
                if (effectDialogOpen.open && effectDialogOpen.isNew) {
                  // They pressed cancel on a new effect, so just remove this one.
                  // (It's assumed to be the last effect in the chain
                  onEffectsChange(
                    currentEffects.slice(0, currentEffects.length - 1)
                  );
                }

                setEffectDialogOpen({ open: false });
              }}
              initialImage={getInitialImage(tIdx)}
              currentEffect={{
                effectName: t.effectName,
                params: t.paramsValues,
              }}
              currFps={appState.fps}
              currRandomSeed="partymoji"
            />
          </Stack>
        </Stack>,
        <FxDivider key={`divider-${effectKey(t, c, tIdx)}`} />,
      ])}
      <Button
        variant="contained"
        startIcon={<Icon>add</Icon>}
        size="large"
        onClick={() => {
          onEffectsChange([
            ...currentEffects,
            {
              effectName: possibleEffects[0].name,
              paramsValues: possibleEffects[0].params.map(
                (p: ParamFunction<any>) => {
                  let image: Image | undefined = undefined;
                  if (currentEffects.length === 0) {
                    image = baseImage?.image;
                  } else {
                    const lastEffect = computeState[currentEffects.length - 1];
                    if (lastEffect?.status === 'done') {
                      image = lastEffect.image.image;
                    }
                  }

                  return p.defaultValue(image);
                }
              ),
            },
          ]);
          setEffectDialogOpen({
            open: true,
            idx: currentEffects.length,
            isNew: true,
          });
        }}
      >
        Add New Effect
      </Button>
    </Stack>
  );
};

const FxDivider: React.FC = () => (
  <Divider variant="middle" sx={{ width: 300 }} />
);
