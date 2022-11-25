import React from 'react';
import { Dimensions } from '../domain/types';

export interface GifProps {
  src: string;
  alt: string;
  dimensions?: Dimensions;
}

/**
 * Returns a size that will make the image at most 300px width or tall,
 *  while preserving the aspect ratio.
 */
const calculateDimensions = (dimensions: GifProps['dimensions']): any => {
  if (dimensions == null) {
    // TODO This happens in image picker, where we don't have a parsed image.
    // We can probably parse the image in the image picker instead of just using a URL.
    return { maxWidth: '300px', maxHeight: '300px' };
  }

  const [width, height] = dimensions;
  const aspectRatio = height / width;
  if (width > height) {
    const maxWidth = 300;
    const maxHeight = aspectRatio * 300;
    // If width is bigger, then limit by width
    return { maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` };
  } else {
    // Else, limit by height
    const maxHeight = 300;
    const maxWidth = (1 / aspectRatio) * 300;
    return { maxHeight: `${maxHeight}px`, maxWidth: `${maxWidth}px` };
  }
};

export const Gif: React.FC<GifProps> = ({ src, alt, dimensions }) => (
  <img
    src={src}
    alt={`gif-${alt}`}
    style={calculateDimensions(dimensions)}
  ></img>
);
