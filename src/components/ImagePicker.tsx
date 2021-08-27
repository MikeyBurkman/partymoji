import { Button, Icon, Stack } from '@material-ui/core';
import React from 'react';

interface ImagePickerProps {
  currentImageUrl?: string;
  name?: string;
  width?: number;
  height?: number;
  onChange: (imageUrl: string) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUrl,
  name,
  width,
  height,
  onChange,
}) => (
  <Stack spacing={4}>
    <Button
      startIcon={<Icon>image</Icon>}
      sx={{ maxWidth: '300px' }}
      variant="contained"
      component="label"
    >
      {name}
      <input
        type="file"
        hidden
        accept="image/png,image/jpg"
        name="source-png"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          const file = files[0];
          const baseImage = await readFile(file);
          onChange(baseImage);
        }}
      />
    </Button>
    {currentImageUrl && (
      <img
        width={width}
        height={height}
        src={currentImageUrl}
        alt="Source"
      ></img>
    )}
  </Stack>
);

const readFile = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
