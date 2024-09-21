import React from 'react';
import type { Dimensions } from '~/domain/types';

const MAX_SIZE = 220;

export interface GifProps {
  src: string;
  alt: string;
  dimensions?: Dimensions;
}

/**
 * Returns a size that will make the image at most 300px width or tall,
 *  while preserving the aspect ratio.
 */
const calculateDimensions = (dimensions: Dimensions | undefined) => {
  if (dimensions == null) {
    // TODO This happens in image picker, where we don't have a parsed image.
    // We can probably parse the image in the image picker instead of just using a URL.
    return {
      maxWidth: `${MAX_SIZE}px`,
      maxHeight: `${MAX_SIZE}px`,
      width: 128,
    };
  }

  const [width, height] = dimensions;
  const aspectRatio = height / width;
  if (width > height) {
    const maxWidth = MAX_SIZE;
    const maxHeight = aspectRatio * MAX_SIZE;
    // If width is bigger, then limit by width
    return {
      maxWidth: `${maxWidth}px`,
      maxHeight: `${maxHeight}px`,
      width: 128,
      height: 128 * aspectRatio,
    };
  } else {
    // Else, limit by height
    const maxHeight = MAX_SIZE;
    const maxWidth = (1 / aspectRatio) * MAX_SIZE;
    return {
      maxHeight: `${maxHeight}px`,
      maxWidth: `${maxWidth}px`,
      width: 128,
      height: 128 * aspectRatio,
    };
  }
};

export const Gif: React.FC<GifProps> = ({ src, alt, dimensions }) => (
  <img
    src={src}
    alt={`gif-${alt}`}
    style={calculateDimensions(dimensions)}
  ></img>
);
