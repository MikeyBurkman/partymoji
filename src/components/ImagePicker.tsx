import { Button, Icon, Stack, Box, TextField } from '@material-ui/core';
import React from 'react';
import { getImageFromUrl } from '../domain/importImageFromUrl';
import { isUrl } from '../domain/utils/misc';

interface ImagePickerProps {
  currentImageUrl?: string;
  name?: string;
  width?: number;
  height?: number;
  onChange: (imageUrl: string) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUrl,
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
              const dataUrl = await getImageFromUrl(text);
              onChange(dataUrl);
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
              const baseImage = await readFile(file);
              onChange(baseImage);
            }
          }}
        />
      </Button>
      {currentImageUrl && (
        <img
          style={{ maxWidth: '200px', maxHeight: 'auto' }}
          src={currentImageUrl}
          alt="Source"
        ></img>
      )}
    </Stack>
  );
};

const readFile = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
