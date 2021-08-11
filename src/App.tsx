import React from 'react';

import { ParamFunction, ParamValue, Transform } from './domain/types';
import { ImagePicker } from './ImagePicker';
import { ImageTransformList } from './ImageTransformList';
import { POSSIBLE_TRANSFORMS } from './domain/transforms';
import { ComputeBox } from './ComputeBox';

const DEBUG = false;

type AppState = {
  baseImage?: string;
  transforms: {
    transform: Transform<any>;
    paramsValues: ParamValue<any>[];
    computedImage?: string;
  }[];
  dirty: boolean;
};

export const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>({
    dirty: false,
    transforms: [],
    baseImage: undefined,
  });

  const computeBtnDisbled =
    !state.baseImage ||
    state.transforms.length === 0 ||
    !state.dirty ||
    state.transforms.some((t) => {
      const params = t.transform.params as ParamFunction<any>[];
      return (
        params.length > 0 && t.paramsValues.every((p, i) => p.valid === false)
      );
    });

  return (
    <section>
      <div className="container">
        <div>
          <ImagePicker
            currentImageUrl={state.baseImage}
            onChange={(baseImage) => {
              setState({
                ...state,
                baseImage,
                dirty: true,
              });
            }}
          />
          <ImageTransformList
            currentTransforms={state.transforms}
            possibleTransforms={POSSIBLE_TRANSFORMS}
            onTransformsChange={(transforms) =>
              setState({
                ...state,
                dirty: true,
                transforms,
              })
            }
          />
          <ComputeBox
            isDirty={state.dirty}
            baseImageUrl={state.baseImage}
            computeDisabled={computeBtnDisbled}
            transforms={state.transforms}
            onComputed={() =>
              setState({
                ...state,
                dirty: false,
              })
            }
          />
          {DEBUG && (
            <div>
              <code>{JSON.stringify(state, null, 2)}</code>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
