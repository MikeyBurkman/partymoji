import {
  Button,
  CircularProgress,
  Icon,
  Stack,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ParamFunction, Effect, AppStateEffect } from '../domain/types';
import { replaceIndex } from '../domain/utils';
import { effectByName } from '../effects';
import { ImageEffect } from './ImageEffect';

interface EffectListProps {
  currentEffect: AppStateEffect[];
  possibleEffects: Effect<any>[];
  onEffectsChange: (t: AppStateEffect[]) => void;
}

const effectKey = (t: AppStateEffect, idx: number): string =>
  `${t.effectName}-${idx}-${
    t.state.status === 'done' ? t.state.image.gif.substring(0, 10) : 'pending'
  }`;

export const ImageEffectList: React.FC<EffectListProps> = ({
  currentEffect,
  possibleEffects,
  onEffectsChange,
}) => (
  <Stack spacing={4}>
    <Typography variant="h5">Image Effects</Typography>
    {currentEffect.map((t, tIdx) => (
      <Stack direction={'row'} key={effectKey(t, tIdx)} spacing={4}>
        <ImageEffect
          index={tIdx}
          possibleEffects={possibleEffects}
          selectedEffect={{
            effect: effectByName(t.effectName),
            paramValues: t.paramsValues,
          }}
          onRemove={() =>
            onEffectsChange(
              currentEffect.filter((nextT, newIdx) => newIdx !== tIdx)
            )
          }
          onMoveBefore={
            tIdx > 0
              ? () =>
                  onEffectsChange(
                    currentEffect.map((nextT, newIdx) => {
                      if (newIdx === tIdx - 1) {
                        // This is the next item in the list
                        return currentEffect[newIdx + 1];
                      } else if (tIdx === newIdx) {
                        // This is the previous item
                        return currentEffect[tIdx - 1];
                      } else {
                        return nextT;
                      }
                    })
                  )
              : undefined
          }
          onMoveAfter={
            tIdx < currentEffect.length - 1
              ? () =>
                  onEffectsChange(
                    currentEffect.map((nextT, newIdx) => {
                      if (newIdx === tIdx + 1) {
                        // This is the previous item in the list
                        return currentEffect[newIdx - 1];
                      } else if (tIdx === newIdx) {
                        // This is the next item
                        return currentEffect[tIdx + 1];
                      } else {
                        return nextT;
                      }
                    })
                  )
              : undefined
          }
          onSelect={(selected) =>
            onEffectsChange(
              replaceIndex(
                currentEffect,
                tIdx,
                (t): AppStateEffect => ({
                  ...t,
                  effectName: selected.effect.name,
                  paramsValues: selected.paramValues,
                })
              )
            )
          }
        />
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
      onClick={() =>
        onEffectsChange([
          ...currentEffect,
          {
            effectName: possibleEffects[0].name,
            paramsValues: possibleEffects[0].params.map(
              (p: ParamFunction<any>) => p.defaultValue
            ),
            state: { status: 'init' },
          },
        ])
      }
    >
      New Effect
    </Button>
  </Stack>
);
