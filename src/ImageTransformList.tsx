import React from 'react';
import {
  ParamFunction,
  ParamValue,
  Transform,
  TransformWithParams,
} from './domain/types';
import { ImageTransform } from './ImageTransform';

interface TransformListProps {
  currentTransforms: TransformWithParams<any>[];
  possibleTransforms: Transform<any>[];
  onTransformsChange: (t: TransformWithParams<any>[]) => void;
}

export const ImageTransformList: React.FC<TransformListProps> = ({
  currentTransforms,
  possibleTransforms,
  onTransformsChange,
}) => (
  <div className="box">
    <h3 className="title">Image Transforms</h3>
    <div className="columns">
      {currentTransforms.map((t, tIdx) => (
        <div className="box">
          <ImageTransform
            image={undefined}
            possibleTransforms={possibleTransforms}
            selectedTransform={{
              transform: t.transform,
              paramValues: t.paramsValues,
            }}
            onRemove={() =>
              onTransformsChange(
                currentTransforms.filter((nextT, newIdx) => newIdx !== tIdx)
              )
            }
            onMoveLeft={
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
            onSelect={(selected) =>
              onTransformsChange(
                currentTransforms.map((nextT, nextTIdx) => {
                  if (tIdx === nextTIdx) {
                    // This is the one we just changed
                    return {
                      transform: selected.transform,
                      paramsValues: selected.paramValues,
                      computedImage: undefined,
                    };
                  }
                  // Reset all the images if we changed anything
                  return {
                    transform: nextT.transform,
                    paramsValues: nextT.paramsValues,
                    computedImage: undefined,
                  };
                })
              )
            }
          />
        </div>
      ))}
      <div className="box">
        <button
          className="button"
          onClick={() =>
            onTransformsChange([
              ...currentTransforms,
              {
                transform: possibleTransforms[0],
                paramsValues: possibleTransforms[0].params.map(
                  (p: ParamFunction<any>): ParamValue<any> =>
                    p.defaultValue !== undefined
                      ? { valid: true, value: p.defaultValue }
                      : { valid: false }
                ),
              },
            ])
          }
        >
          New Transform
        </button>
      </div>
      <div className="box" style={{ display: 'none' }}>
        {/* Placeholder, because the last box has no bottom padding */}
      </div>
    </div>
  </div>
);
