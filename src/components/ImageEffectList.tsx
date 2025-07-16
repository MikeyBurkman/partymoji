import React from 'react';
import {
  Box,
  Button,
  Divider,
  Stack,
  Grid,
  Typography,
  Paper,
  Autocomplete,
  styled,
  TextField,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { logger } from '~/domain/utils';

import type {
  AppStateEffect,
  Image,
  AppState,
  ImageEffectResult,
  AnyEffect,
  JsonType,
} from '~/domain/types';
import { miscUtil } from '~/domain/utils';
import { DEFAULT_EFFECT, effectByName, POSSIBLE_EFFECTS } from '~/effects';
import { Gif } from './Gif';
import { Icon, ClickableIcon } from './Icon';
import { EffectImage } from './EffectImage';
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

interface EffectListProps {
  appState: AppState;
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
  possibleEffects: Array<AnyEffect>;
  onEffectsChange: EffectListProps['onEffectsChange'];
  newDefaultEffect: (index: number) => AppStateEffect;
}

export const ImageEffect: React.FC<ImageEffectProps> = ({
  effect,
  index,
  currentEffects,
  possibleEffects,
  onEffectsChange,
  newDefaultEffect,
}) => {
  const currEffect = React.useMemo(
    () => effectByName(effect.effectName),
    [effect],
  );

  const onDelete = React.useCallback(() => {
    const newEffects = miscUtil.removeIndex(currentEffects, index);
    onEffectsChange(newEffects);
  }, [currentEffects, index, onEffectsChange]);

  const onAddAfter = React.useCallback(() => {
    onEffectsChange(
      miscUtil.insertInto(currentEffects, index + 1, newDefaultEffect(index)),
    );
  }, [currentEffects, index, newDefaultEffect, onEffectsChange]);

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

  const onPickNewEffect = React.useCallback(
    (_: unknown, newEffect: AnyEffect) => {
      if (effect.state.status !== 'done') {
        // This button should be disabled anyhow
        return;
      }

      const baseImage = effect.state.image;
      onEffectsChange(
        miscUtil.replaceIndex(currentEffects, index, () => ({
          effectName: newEffect.name,
          paramsValues: newEffect.params.map((p) =>
            p.defaultValue(baseImage.image),
          ),
          state: { status: 'init' },
        })),
      );
    },
    [currentEffects, effect, index, onEffectsChange],
  );

  const updateEffectParam = React.useCallback(
    (paramValue: JsonType, paramIndex: number) => {
      onEffectsChange(
        miscUtil.replaceIndex(currentEffects, index, () => ({
          effectName: currEffect.name,
          paramsValues: miscUtil.replaceIndex(
            effect.paramsValues,
            paramIndex,
            () => paramValue,
          ),
          state: { status: 'computing' },
        })),
      );
    },
    [currEffect, effect, currentEffects, index, onEffectsChange],
  );

  const effectParams = React.useMemo(() => {
    // Create elements for each of the parameters for the selected effect.
    // Each of these would get an onChange event so we know when the user has
    //  selected a value.
    const renderedParams = currEffect.params.map((param, paramIdx: number) => {
      const ele = param.fn({
        value: effect.paramsValues[paramIdx],
        onChange: (v) => {
          updateEffectParam(v, paramIdx);
        },
      });

      return (
        <Grid
          key={`${effect.effectName}-${param.name}`}
          size="auto"
          minWidth={160}
        >
          {ele}
        </Grid>
      );
    });

    return (
      <Grid container spacing={4}>
        {renderedParams}
      </Grid>
    );
  }, [currEffect, effect, updateEffectParam]);

  return (
    <Stack>
      <Paper style={{ padding: 8 }} elevation={4}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} width="100%">
            <Autocomplete
              fullWidth
              disableClearable
              value={currEffect}
              options={possibleEffects}
              groupBy={(e) => e.group}
              onChange={onPickNewEffect}
              disabled={effect.state.status !== 'done'}
              getOptionLabel={(option) => option.name}
              renderGroup={(params) => (
                <li key={params.key}>
                  <GroupHeader>
                    <Typography variant="subtitle1">{params.group}</Typography>
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
              renderInput={(params) => <TextField {...params} label="Effect" />}
            />
            <Stack spacing={2} justifyContent="center">
              <ClickableIcon name="Delete" onClick={onDelete} />
            </Stack>
            {requiresAnimation}
          </Stack>
          <Typography variant="subtitle1">{currEffect.description}</Typography>
          {currEffect.secondaryDescription != null && (
            <Typography variant="caption">
              {currEffect.secondaryDescription}
            </Typography>
          )}
          <Grid container width="md" spacing={2} p={2}>
            <Grid size={4}>
              <EffectImage appStateEffect={effect} />
            </Grid>
            <Grid size={8}>{effectParams}</Grid>
          </Grid>
        </Stack>
      </Paper>
      <Divider sx={{ py: 4 }}>
        {/* Add-effect button can be in between items, or at the end of the list */}
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
  onEffectsChange,
}) => {
  const currentEffects = appState.effects;
  logger.debug('CURRENT EFFECTS', currentEffects);

  const [baseImage, setBaseImage] = React.useState<
    ImageEffectResult | undefined
  >();

  React.useEffect(() => {
    if (!appState.baseImage || baseImage?.gif === appState.baseImage.gif) {
      return;
    }

    setBaseImage(baseImage);
  }, [appState, baseImage]);

  const newDefaultEffect = React.useCallback(
    (tIdx: number): AppStateEffect => ({
      effectName: DEFAULT_EFFECT.name,
      paramsValues: DEFAULT_EFFECT.params.map((p) => {
        let image: Image | undefined = undefined;
        if (tIdx === 0) {
          image = appState.baseImage?.image;
        } else {
          const previousEffect = currentEffects[tIdx];
          console.log('HERE', { tIdx, previousEffect, currentEffects });
          if (previousEffect.state.status === 'done') {
            image = previousEffect.state.image.image;
          }
        }

        return p.defaultValue(image);
      }),
      state: { status: 'init' },
    }),
    [appState, currentEffects],
  );

  const onAddNew = React.useCallback(() => {
    onEffectsChange(
      miscUtil.insertInto(currentEffects, 0, newDefaultEffect(0)),
    );
  }, [currentEffects, newDefaultEffect, onEffectsChange]);

  const finalGif = React.useMemo((): string | null => {
    const lastEffect = miscUtil.getLast(currentEffects);
    if (!lastEffect) {
      return null;
    }

    return lastEffect.state.status !== 'done'
      ? null
      : lastEffect.state.image.gif;
  }, [currentEffects]);

  const onSaveGif = React.useCallback(() => {
    if (finalGif != null) {
      const fileName =
        (appState.fname ?? 'image').replace(/\.[^/.]+$/, '') + '.gif';
      saveAs(finalGif, fileName);
    }
  }, [finalGif, appState]);

  return (
    <Stack>
      <Box>
        <Divider sx={{ pb: 4 }}>
          <Button startIcon={<Icon name="Add" />} onClick={onAddNew} name="add">
            Insert First Effect
          </Button>
        </Divider>
        {currentEffects.map((t, tIdx) => (
          <ImageEffect
            key={effectKey(t, tIdx)}
            index={tIdx}
            currentEffects={currentEffects}
            effect={t}
            onEffectsChange={onEffectsChange}
            newDefaultEffect={newDefaultEffect}
            possibleEffects={POSSIBLE_EFFECTS}
          />
        ))}
      </Box>
      {finalGif != null && (
        <Paper style={{ padding: 8 }} elevation={4}>
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h6">Final Result</Typography>
            <Gif src={finalGif} alt={appState.fname ?? 'image.gif'} />
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
