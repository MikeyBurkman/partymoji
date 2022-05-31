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
import {
  ParamFunction,
  Effect,
  AppStateEffect,
  EffectInput,
  Image,
} from '../domain/types';
import { replaceIndex } from '../domain/utils';
import { Gif } from './Gif';
import { ImageEffectDialog } from './ImageEffectDialog';

interface EffectListProps {
  currentEffects: AppStateEffect[];
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
  applyEffect: (image: Image, effect: EffectInput) => Promise<string>;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 10) : 'pending'
  }`;

export const ImageEffectList: React.FC<EffectListProps> = ({
  currentEffects,
  possibleEffects,
  onEffectsChange,
  applyEffect,
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
    <Stack spacing={4} alignItems="center">
      <Typography variant="h5">Image Effects</Typography>
      {currentEffects.flatMap((t, tIdx) => [
        <Stack direction="row" key={effectKey(t, tIdx)} spacing={4}>
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
            {t.state.status === 'done' && (
              <Stack sx={{ width: 250 }}>
                <Gif src={t.state.image.gif} alt={`${t.effectName}-${tIdx}`} />
              </Stack>
            )}
            {t.state.status === 'computing' && <CircularProgress size={100} />}
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
              selectedEffect={{
                effectName: t.effectName,
                params: t.paramsValues,
              }}
              onChangeEffect={(newEffect) => {
                onEffectsChange(
                  replaceIndex(currentEffects, tIdx, () => ({
                    effectName: newEffect.effectName,
                    paramsValues: newEffect.params,
                    state: { status: 'init' },
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
              currentImage={t}
              applyEffect={async (effect) => {
                if (t.state.status === 'done') {
                  return await applyEffect(t.state.image.image, effect);
                }
                return null;
              }}
            />
          </Stack>
        </Stack>,
        <FxDivider key={`divider-${effectKey(t, tIdx)}`} />,
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
        Add New Effect
      </Button>
    </Stack>
  );
};

const FxDivider: React.FC = () => (
  <Divider variant="middle" sx={{ width: 300 }} />
);
