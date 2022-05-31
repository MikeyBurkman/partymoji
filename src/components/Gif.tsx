import React from 'react';

export interface GifProps {
  src: string;
  alt: string;
}

export const Gif: React.FC<GifProps> = ({ src, alt }) => (
  <img
    src={src}
    alt={`gif-${alt}`}
    style={{ maxWidth: '300px', maxHeight: 'auto' }}
  ></img>
);
