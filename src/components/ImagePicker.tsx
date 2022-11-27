import { Button, Icon, Stack, Box, TextField } from '@material-ui/core';
import React from 'react';
import { getImageFromUrl } from '../domain/importImageFromUrl';
import { blobOrFileToDataUrl, readImage } from '../domain/run';
import { ImageEffectResult } from '../domain/types';
import { isUrl } from '../domain/utils/misc';
import { Gif } from './Gif';

interface ImagePickerProps {
  currentImage?: ImageEffectResult;
  name?: string;
  width?: number;
  height?: number;
  onChange: (image: ImageEffectResult) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImage,
  onChange,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  return (
    <Stack spacing={2}>
      <Stack direction="row">
        <TextField
          label="URL"
          variant="outlined"
          error={!!error}
          helperText={error ?? 'Only supports static images'}
          onBlur={async (e) => {
            const text = e.target.value;
            try {
              setError(undefined);
              if (!isUrl(text)) {
                return;
              }
              const gif = await getImageFromUrl(text);
              const image = await readImage(gif);
              onChange({
                gif,
                image,
              });
            } catch {
              setError('Error importing url');
            }
          }}
        />
      </Stack>
      <Box>OR</Box>
      <Button
        startIcon={<Icon>image</Icon>}
        sx={{ maxWidth: '300px' }}
        variant="contained"
        component="label"
      >
        Upload an Image
        <input
          type="file"
          hidden
          accept="image/png,image/jpg,image/jpeg,image/gif"
          name="source-png"
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            const file = files[0];
            if (file) {
              // Will be undefined if user clicked the cancel button
              const gif = await blobOrFileToDataUrl(file);
              const image = await readImage(gif);
              onChange({
                gif,
                image,
              });
            }
          }}
        />
      </Button>
      {currentImage && (
        <Gif
          src={currentImage.gif}
          dimensions={currentImage.image.dimensions}
          alt="Source"
        />
      )}
    </Stack>
  );
};
