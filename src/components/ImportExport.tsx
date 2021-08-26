import {
  Stack,
  Button,
  Icon,
  Typography,
  Divider,
  Alert,
} from '@material-ui/core';
import React from 'react';
import * as lz from 'lz-string';

interface ImportExportProps {
  state: any;
  onImport: (o: any) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  state,
  onImport,
}) => {
  const [info, setInfo] = React.useState<string | undefined>();
  const [isInvalid, setInvalid] = React.useState(false);
  return (
    <Stack spacing={1}>
      {info && <Alert severity="info">{info}</Alert>}
      <Typography variant="subtitle1">
        Export the current image and all of its transitions to the clipboard
      </Typography>
      <Button
        endIcon={<Icon>file_upload</Icon>}
        variant="contained"
        onClick={() => {
          const output = lz.compressToBase64(JSON.stringify(state));
          navigator.clipboard.writeText(output);
          setInfo('Copied to clipboard');
          setTimeout(() => setInfo(undefined), 2000);
        }}
      >
        Export to clipboard
      </Button>

      <Divider />

      <Typography variant="subtitle1">
        Import an image and its transformations from the clipboard
      </Typography>
      {isInvalid && (
        <Alert severity="error">Error importing from clipboard</Alert>
      )}
      <Button
        endIcon={<Icon>file_download</Icon>}
        variant="contained"
        onClick={async () => {
          try {
            const clipboardContents = await navigator.clipboard.readText();
            if (!clipboardContents) {
              setInvalid(true);
              return;
            }
            const data = JSON.parse(
              lz.decompressFromBase64(clipboardContents)!
            );
            onImport(data);
            setInvalid(false);
          } catch (e) {
            console.error(e);
            setInvalid(true);
          }
        }}
      >
        Import from clipboard
      </Button>
    </Stack>
  );
};
