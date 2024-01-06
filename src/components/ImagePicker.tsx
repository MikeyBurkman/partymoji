import { Button, Icon, Stack, Box, TextField } from '@material-ui/core';
import React from 'react';
import { miscUtil, imageUtil, imageImportUtil } from '~/domain/utils';
import type { ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';

const parseFileName = (s: string): string => {
  const parts = s.split('/'); // For URLs
  const name = parts[parts.length - 1];
  // Now remove file extension
  const nameParts = name.split('.');
  if (nameParts.length === 1) {
    return nameParts[0];
  }
  return nameParts.slice(0, nameParts.length - 1).join('.');
};

interface ImagePickerProps {
  currentImage?: ImageEffectResult;
  name?: string;
  width?: number;
  height?: number;
  onChange: (image: ImageEffectResult, fileName: string) => void;
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
          fullWidth
          error={!!error}
          helperText={error ?? 'Only supports static images'}
          onBlur={async (e) => {
            const text = e.target.value;
            try {
              setError(undefined);

              if (text.startsWith('data:')) {
                // Data URL
                const image = await imageImportUtil.readImage(text);
                onChange(
                  {
                    gif: text,
                    image,
                    gifWithBackgroundColor: text,
                    partiallyTransparent:
                      imageUtil.isPartiallyTransparent(image),
                  },
                  'image'
                );
                return;
              }

              if (!miscUtil.isUrl(text)) {
                return;
              }
              const gif = await imageImportUtil.getImageFromUrl(text);
              const image = await imageImportUtil.readImage(gif);
              onChange(
                {
                  gif,
                  image,
                  gifWithBackgroundColor: gif,
                  partiallyTransparent: imageUtil.isPartiallyTransparent(image),
                },
                parseFileName(text)
              );
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
              const gif = await miscUtil.blobOrFileToDataUrl(file);
              // TODO refactor readGifFromeFile and readImage so this conditional isn't necessary
              const image = file.name.endsWith('.gif')
                ? await imageImportUtil.readGifFromFile(file)
                : await imageImportUtil.readImage(gif);
              onChange(
                {
                  gif,
                  image,
                  gifWithBackgroundColor: gif,
                  partiallyTransparent: imageUtil.isPartiallyTransparent(image),
                },
                parseFileName(file.name)
              );
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
