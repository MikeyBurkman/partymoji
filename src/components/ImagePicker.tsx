import { TextField } from '@mui/material';
import React from 'react';
import { miscUtil, imageUtil, imageImportUtil } from '~/domain/utils';
import type { ImageEffectResult } from '~/domain/types';
import { Gif } from './Gif';
import { Icon } from './Icon';
import { Column } from '~/layout';
import { Button } from './Button';

const parseFileName = (s: string): string => {
  const parts = s.split('/'); // For URLs
  return parts[parts.length - 1]; // Return the last segment
};

interface ImagePickerProps {
  currentImage?: ImageEffectResult;
  name?: string;
  width?: number;
  height?: number;
  onChange: (image: ImageEffectResult, fileName: string, fps: number) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImage,
  onChange,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const handleUrlBlur = async (
    e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const text = e.target.value;
    try {
      setError(undefined);

      if (text.startsWith('data:')) {
        // Data URL
        const { image, fps } = await imageImportUtil.readImage(text);
        onChange(
          {
            gif: text,
            image,
            gifWithBackgroundColor: text,
            partiallyTransparent: imageUtil.isPartiallyTransparent(image),
          },
          'image',
          fps,
        );
        return;
      }

      if (!miscUtil.isUrl(text)) {
        setError('Does not appear to be a valid URL');
        return;
      }
      const gif = await imageImportUtil.getImageFromUrl(text);
      const { image, fps } = await imageImportUtil.readImage(gif);
      onChange(
        {
          gif,
          image,
          gifWithBackgroundColor: gif,
          partiallyTransparent: imageUtil.isPartiallyTransparent(image),
        },
        parseFileName(text),
        fps,
      );
    } catch (err) {
      console.error('Error importing url', err);
      setError('Error importing url');
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.item(0);
    if (file) {
      const { dataUrl, image, fps } = await imageImportUtil.readImage(file);
      onChange(
        {
          gif: dataUrl,
          image,
          gifWithBackgroundColor: dataUrl,
          partiallyTransparent: imageUtil.isPartiallyTransparent(image),
        },
        parseFileName(file.name),
        fps,
      );
    }
  };
  return (
    <Column horizontalAlign="center">
      <TextField
        label="URL"
        variant="outlined"
        fullWidth
        error={!!error}
        helperText={error}
        onBlur={(e) => void handleUrlBlur(e)}
      />
      OR
      <Button icon={<Icon name="Image"></Icon>} variant="primary">
        Upload an Image
        <input
          type="file"
          hidden
          accept="image/png,image/jpg,image/jpeg,image/gif"
          name="source-image"
          onChange={(e) => void handleFileChange(e)}
        />
      </Button>
      {currentImage && (
        <Gif
          src={currentImage.gif}
          dimensions={currentImage.image.dimensions}
          alt="Source"
        />
      )}
    </Column>
  );
};
