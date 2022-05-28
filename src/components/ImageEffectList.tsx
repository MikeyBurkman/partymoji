import {
  Button,
  CircularProgress,
  Icon,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamFunction, Effect, AppStateEffect } from '../domain/types';
import { replaceIndex } from '../domain/utils';
import { effectByName } from '../effects';
import { ImageEffectDialog } from './ImageEffectDialog';

interface EffectListProps {
  currentEffects: AppStateEffect[];
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 10) : 'pending'
  }`;

export const ImageEffectList: React.FC<EffectListProps> = ({
  currentEffects,
  possibleEffects,
  onEffectsChange,
}) => {
  const [effectDialogOpen, setEffectDialogOpen] = React.useState<
    { open: false } | { open: true; idx: number; isNew: boolean }
  >({ open: false });

  const onDelete = (idx: number) => () =>
    onEffectsChange(currentEffects.filter((nextT, newIdx) => newIdx !== idx));

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

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Image Effects</Typography>
      {currentEffects.map((t, tIdx) => (
        <Stack direction="row" key={effectKey(t, tIdx)} spacing={4}>
          <Stack>
            <Typography
              variant="subtitle1"
              fontWeight="semiBold"
              marginLeft={2}
              marginBottom={1}
            >
              {t.effectName}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Delete effect">
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
            <Paper style={{ padding: 8 }} elevation={3} sx={{ width: 300 }}>
              <Stack spacing={1}>
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
            </Paper>
            {effectDialogOpen.open && effectDialogOpen.idx === tIdx && (
              <ImageEffectDialog
                possibleEffects={possibleEffects}
                selectedEffect={{
                  effect: effectByName(t.effectName),
                  paramValues: t.paramsValues,
                }}
                onChangeEffect={(newEffect) => {
                  onEffectsChange(
                    replaceIndex(currentEffects, tIdx, () => ({
                      effectName: newEffect.effect.name,
                      paramsValues: newEffect.paramValues,
                      state: { status: 'init' },
                    }))
                  );
                  setEffectDialogOpen({ open: false });
                }}
                onCancel={() => {
                  if (effectDialogOpen.isNew) {
                    // They pressed cancel on a new effect, so just remove this one.
                    // (It's assumed to be the last effect in the chain
                    onEffectsChange(
                      currentEffects.slice(0, currentEffects.length - 1)
                    );
                  }

                  setEffectDialogOpen({ open: false });
                }}
              />
            )}
          </Stack>
          {t.state.status === 'done' && (
            <Stack sx={{ width: 200 }}>
              <img
                src={t.state.image.gif}
                alt={`gif-${t.effectName}-${tIdx}`}
                style={{ maxWidth: '300px', maxHeight: 'auto' }}
              ></img>
            </Stack>
          )}
          {t.state.status === 'computing' && <CircularProgress size={100} />}
        </Stack>
      ))}
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
                (p: ParamFunction<any>) => p.defaultValue
              ),
              state: { status: 'init' },
            },
          ]);
          setEffectDialogOpen({
            open: true,
            idx: currentEffects.length,
            isNew: true,
          });
        }}
      >
        New Effect
      </Button>
    </Stack>
  );
};
