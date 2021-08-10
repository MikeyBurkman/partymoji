import React from 'react';
import {
  ParamFunction,
  ParamValue,
  Transform,
  TransformWithParams,
} from './domain/types';
import { ImageTransform } from './Transform';

interface TransformListProps {
  currentTransforms: TransformWithParams<any>[];
  possibleTransforms: Transform<any>[];
  onTransformsChange: (t: TransformWithParams<any>[]) => void;
}

export const TransformList: React.FC<TransformListProps> = ({
  currentTransforms,
  possibleTransforms,
  onTransformsChange,
}) => (
  <div className="box">
    <h3 className="title">Image Transforms</h3>
    {currentTransforms.map((t, tIdx) => (
      <div className="box">
        <ImageTransform
          image={undefined}
          possibleTransforms={possibleTransforms}
          selectedTransform={{
            transform: t.transform,
            paramValues: t.paramsValues,
          }}
          onRemove={() => {
            onTransformsChange(
              currentTransforms.filter((nextT, nextTIdx) => nextTIdx !== tIdx)
            );
            // setState({
            //   ...state,
            //   dirty: true,
            //   transforms: state.transforms.filter(
            //     (nextT, nextTIdx) => nextTIdx !== tIdx
            //   ),
            // });
          }}
          onSelect={(selected) => {
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
            );
          }}
          // setState({
          //   ...state,
          //   dirty: true,
          //   transforms: state.transforms.map((nextT, nextTIdx) => {
          //     if (tIdx === nextTIdx) {
          //       // This is the one we just changed
          //       return {
          //         transform: selected.transform,
          //         paramsValues: selected.paramValues,
          //         computedImage: undefined,
          //       };
          //     }
          //     // Reset all the images if we changed anything
          //     return {
          //       transform: nextT.transform,
          //       paramsValues: nextT.paramsValues,
          //       computedImage: undefined,
          //     };
          //   }),
          // });
          // }}
        />
      </div>
    ))}
    <button
      className="button block"
      onClick={() => {
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
        ]);
        // setState({
        //   ...state,
        //   dirty: true,
        //   transforms: state.transforms.concat([
        //     {
        //       transform: POSSIBLE_TRANSFORMS[0],
        //       paramsValues: POSSIBLE_TRANSFORMS[0].params.map(
        //         (p: ParamFunction<any>): ParamValue<any> =>
        //           p.defaultValue !== undefined
        //             ? { valid: true, value: p.defaultValue }
        //             : { valid: false }
        //       ),
        //     },
        //   ]),
        // });
      }}
    >
      New Transform
    </button>
  </div>
);
