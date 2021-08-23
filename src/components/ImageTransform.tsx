import {
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Icon,
  Tooltip,
} from '@material-ui/core';
import React from 'react';

import { ParamFunction, ParamValue, Transform } from '../domain/types';

interface SelectedTransform {
  transform: Transform<any>;
  paramValues: ParamValue<any>[];
}

interface ImageTransformProps {
  selectedTransform: SelectedTransform;
  possibleTransforms: Transform<any>[];
  index: number;
  onSelect: (selected: SelectedTransform) => void;
  onRemove: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({
  selectedTransform,
  possibleTransforms,
  index,
  onSelect,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) => {
  return (
    <div className="card" style={{ padding: '0.75rem', maxWidth: '24rem' }}>
      <div className="card-header-title">
        <div className="columns is-desktop">
          <div className="column">
            <div className="block columns">
              <div className="column is-narrow">{index + 1}</div>
              <div className="column">
                <FormControl fullWidth>
                  <Select
                    autoWidth
                    value={selectedTransform.transform.name}
                    onChange={(event) => {
                      const newTransformName = event.target.value;
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
                  >
                    {possibleTransforms.map((t) => (
                      <MenuItem key={t.name} value={t.name}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            {selectedTransform.transform.description && (
              <div className="block" style={{ fontSize: '0.75rem' }}>
                {selectedTransform.transform.description}
              </div>
            )}
          </div>
          <div className="column columns">
            {onMoveLeft && (
              <Tooltip title="Move transform left">
                <IconButton aria-label="delete" onClick={onMoveLeft}>
                  <Icon>chevron_left</Icon>
                </IconButton>
              </Tooltip>
            )}
            {onMoveRight && (
              <Tooltip title="Move transform right">
                <IconButton aria-label="delete" onClick={onMoveRight}>
                  <Icon>chevron_right</Icon>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete transform">
              <IconButton aria-label="delete" onClick={onRemove}>
                <Icon>delete</Icon>
              </IconButton>
            </Tooltip>
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
            return (
              <div className="block" key={param.name}>
                {ele}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
