import React from 'react';
import { readImage } from '../domain/run';

import { ParamFunction, Image } from '../domain/types';
import { ImagePicker } from '../components/ImagePicker';

export function imagePickerParam(args: {
  name: string;
}): ParamFunction<{ dataUrl: string; image: Image }> {
  return {
    name: args.name,
    defaultValue: { valid: false },
    fn: (params) => (
      <div>
        <label>{args.name}</label>
        <br />
        <ImagePicker
          name="Image"
          currentImageUrl={
            params.value.valid ? params.value.value.dataUrl : undefined
          }
          width={64}
          height={64}
          onChange={async (dataUrl) => {
            const image = await readImage(dataUrl);
            params.onChange({ valid: true, value: { dataUrl, image } });
          }}
        />
      </div>
    ),
  };
}
