import { Button, Grid, Icon, Stack, Typography } from '@material-ui/core';
import React from 'react';
import { ParamFunction, Transform, AppStateTransforms } from '../domain/types';
import { transformByName } from '../transforms';
import { ImageTransform } from './ImageTransform';

interface TransformListProps {
  currentTransforms: AppStateTransforms[];
  possibleTransforms: Transform<any>[];
  onTransformsChange: (t: AppStateTransforms[]) => void;
}

const transformKey = (t: AppStateTransforms, idx: number): string =>
  `${t.transformName}-${idx}-${
    t.computedImage ? t.computedImage.gif.substring(0, 10) : 'computing'
  }`;

export const ImageTransformList: React.FC<TransformListProps> = ({
  currentTransforms,
  possibleTransforms,
  onTransformsChange,
}) => (
  <Stack spacing={4}>
    <Typography variant="h5">Image Transforms</Typography>
    {currentTransforms.map((t, tIdx) => (
      <Stack direction={'row'} key={transformKey(t, tIdx)} spacing={4}>
        <ImageTransform
          index={tIdx}
          possibleTransforms={possibleTransforms}
          selectedTransform={{
            transform: transformByName(t.transformName),
            paramValues: t.paramsValues,
          }}
          onRemove={() =>
            onTransformsChange(
              currentTransforms.filter((nextT, newIdx) => newIdx !== tIdx)
            )
          }
          onMoveBefore={
            tIdx > 0
              ? () =>
                  onTransformsChange(
                    currentTransforms.map((nextT, newIdx) => {
                      if (newIdx === tIdx - 1) {
                        // This is the next item in the list
                        return currentTransforms[newIdx + 1];
                      } else if (tIdx === newIdx) {
                        // This is the previous item
                        return currentTransforms[tIdx - 1];
                      } else {
                        return nextT;
                      }
                    })
                  )
              : undefined
          }
          onMoveAfter={
            tIdx < currentTransforms.length - 1
              ? () =>
                  onTransformsChange(
                    currentTransforms.map((nextT, newIdx) => {
                      if (newIdx === tIdx + 1) {
                        // This is the previous item in the list
                        return currentTransforms[newIdx - 1];
                      } else if (tIdx === newIdx) {
                        // This is the next item
                        return currentTransforms[tIdx + 1];
                      } else {
                        return nextT;
                      }
                    })
                  )
              : undefined
          }
          onSelect={(selected) =>
            onTransformsChange(
              currentTransforms.map((nextT, nextTIdx) => {
                if (tIdx === nextTIdx) {
                  // This is the one we just changed
                  return {
                    transformName: selected.transform.name,
                    paramsValues: selected.paramValues,
                    computedImage: undefined,
                  };
                }
                // Reset all the images if we changed anything
                return {
                  transformName: nextT.transformName,
                  paramsValues: nextT.paramsValues,
                  computedImage: undefined,
                };
              })
            )
          }
        />
        {t.computedImage && (
          <Stack sx={{ width: 200 }}>
            <img
              src={t.computedImage.gif}
              alt={`gif-${t.transformName}-${tIdx}`}
              style={{ maxWidth: '300px', maxHeight: 'auto' }}
            ></img>
          </Stack>
        )}
      </Stack>
    ))}
    <Button
      fullWidth={false}
      variant="contained"
      startIcon={<Icon>add</Icon>}
      size="large"
      onClick={() =>
        onTransformsChange([
          ...currentTransforms,
          {
            transformName: possibleTransforms[0].name,
            paramsValues: possibleTransforms[0].params.map(
              (p: ParamFunction<any>) => p.defaultValue
            ),
            computedImage: undefined,
          },
        ])
      }
    >
      New Transform
    </Button>
  </Stack>
);
