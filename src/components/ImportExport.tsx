import { Alert, Button, Icon, Stack, Typography } from '@material-ui/core';
import * as lz from 'lz-string';
import React from 'react';
import { AppState } from '../domain/types';

interface ImportExportProps {
  state: AppState;
  onImport: (o: AppState) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  state,
  onImport,
}) => {
  const [info, setInfo] = React.useState<string | undefined>();
  const [isInvalid, setInvalid] = React.useState(false);

  const showInfo = (text: string) => {
    setInfo(text);
    setTimeout(() => setInfo(undefined), 3000);
  };

  const showError = () => {
    setInvalid(true);
    setTimeout(() => setInvalid(false), 3000);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Import/Export</Typography>
      <Button
        startIcon={<Icon>file_upload</Icon>}
        sx={{ maxWidth: '300px' }}
        variant="contained"
        onClick={() => {
          const output = lz.compressToBase64(JSON.stringify(state));
          navigator.clipboard.writeText(output);
          showInfo('Copied to clipboard');
        }}
      >
        Export to clipboard
      </Button>

      <Button
        startIcon={<Icon>file_download</Icon>}
        sx={{ maxWidth: '300px' }}
        variant="contained"
        onClick={async () => {
          try {
            const clipboardContents = await navigator.clipboard.readText();
            if (!clipboardContents) {
              showError();
              return;
            }
            const data = JSON.parse(
              lz.decompressFromBase64(clipboardContents)!
            );
            if (!Array.isArray(data.effects)) {
              showError();
              return;
            }
            onImport(data);
            setInvalid(false);
          } catch (e) {
            console.error(e);
            showError();
          }
        }}
      >
        Import from clipboard
      </Button>
      {info && (
        <Alert severity="info" sx={{ maxWidth: '300px' }}>
          {info}
        </Alert>
      )}
      {isInvalid && (
        <Alert severity="error" sx={{ maxWidth: '300px' }}>
          Error importing from clipboard
        </Alert>
      )}
    </Stack>
  );
};
