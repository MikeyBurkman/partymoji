import React from 'react';
import { Dropdown } from './Dropdown';

import { ParamFunction, ParamValue, Transform } from '../domain/types';

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
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({
  image,
  selectedTransform,
  possibleTransforms,
  onSelect,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) => {
  return (
    <div className="card" style={{ width: '300px' }}>
      <div className="card-header-title">
        <div className="columns is-desktop">
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
                    (p: ParamFunction<any>) => p.defaultValue
                  ),
                });
              }}
            />
          </div>
          <div className="column columns">
            {onMoveLeft && (
              <div className="icon column is-clickable" onClick={onMoveLeft}>
                <i className="fas fa-chevron-left" aria-hidden="true"></i>
              </div>
            )}
            {onMoveRight && (
              <div className="icon column is-clickable" onClick={onMoveRight}>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
              </div>
            )}
            <div className="icon column is-clickable" onClick={onRemove}>
              <i className="fas fa-trash" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="card-content">
        {selectedTransform.transform.params.map(
          // Create elements for each of the parameters for the selectect transform.
          // Each of these would get an onChange event so we know when the user has
          //  selected a value.
          (param: ParamFunction<any>, idx: number) => {
            const ele = param.fn({
              value: selectedTransform.paramValues[idx],
              onChange: (v) => {
                console.log('changing to ', v);
                onSelect({
                  ...selectedTransform,
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
      </div>
    </div>
  );
};
