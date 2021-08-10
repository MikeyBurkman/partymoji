import React from 'react';
import { Dropdown } from './components';

import { ParamFunction, ParamValue, Transform } from './domain/types';

interface SelectedTransform {
  transform: Transform<any>;
  paramValues: ParamValue<any>[];
}

interface ImageTransformProps {
  image?: string;
  selectedTransform: SelectedTransform;
  possibleTransforms: Transform<any>[];
  onSelect: (selected: SelectedTransform) => void;
  onRemove: () => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({
  image,
  selectedTransform,
  possibleTransforms,
  onSelect,
  onRemove,
}) => {
  return (
    <div>
      <div className="columns">
        <div className="column">
          <Dropdown
            selected={selectedTransform.transform.name}
            options={possibleTransforms.map((t) => ({
              name: t.name,
              value: t.name,
            }))}
            onChange={(newTransformName) => {
              const t = possibleTransforms.find(
                (t) => t.name === newTransformName
              )!;
              // Reset all the params when you select a new transform
              onSelect({
                transform: t,
                paramValues: t.params.map(
                  (p: ParamFunction<any>): ParamValue<any> => ({
                    valid: true,
                    value: p.defaultValue,
                  })
                ),
              });
            }}
          />
        </div>
        <button className="delete column" onClick={() => onRemove()} />
      </div>
      <div>
        {selectedTransform.transform.params.map(
          // Create elements for each of the parameters for the selectect transform.
          // Each of these would get an onChange event so we know when the user has
          //  selected a value.
          (param: ParamFunction<any>, idx: number) => {
            const value = selectedTransform.paramValues[idx];
            const ele = param.fn({
              value: value.valid ? value.value : param.defaultValue,
              onChange: (v) => {
                onSelect({
                  transform: selectedTransform.transform,
                  paramValues: selectedTransform.paramValues.map((x, i) => {
                    if (i === idx) {
                      return v;
                    }
                    return x;
                  }),
                });
              },
            });
            return <div key={param.name}>{ele}</div>;
          }
        )}
        {image && (
          <>
            <br />
            <img src={image}></img>
          </>
        )}
      </div>
    </div>
  );
};
