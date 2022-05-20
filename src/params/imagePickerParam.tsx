import React from 'react';
import { ImagePicker } from '../components/ImagePicker';
import { readImage } from '../domain/run';
import { Image, ParamFunction } from '../domain/types';

interface ImagePickerParamsProps {
  name: string;
}

interface ParamType {
  dataUrl: string;
  image: Image;
}

// Just a 1x1 black jpg. Surprisingly big!
const DEFAULT_IMAGE: ParamType = {
  dataUrl:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgICAgICAwICAgIDBAMDAwMDBAUEBAQEBAQFBQUFBQUFBQYGBgYGBgcHBwcHCAgICAgICAgICP/bAEMBAQEBAgICAwICAwgFBAUICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICP/dAAQAAf/aAAwDAQACEQMRAD8A/wA/+iiigD//2Q==',
  image: {
    dimensions: [1, 1],
    frames: [new Uint8Array([0, 0, 0, 255])],
  },
};

export function imagePickerParam({
  name,
}: ImagePickerParamsProps): ParamFunction<ParamType> {
  return {
    name,
    defaultValue: DEFAULT_IMAGE,
    fn: (params) => (
      <ImagePicker
        currentImageUrl={params.value.dataUrl}
        name={name}
        width={64}
        height={64}
        onChange={async (dataUrl) => {
          const image = await readImage(dataUrl);
          params.onChange({ dataUrl, image });
        }}
      />
    ),
  };
}
