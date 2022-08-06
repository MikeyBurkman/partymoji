import { Alert, Button, Icon, Stack, Typography } from '@material-ui/core';
import React from 'react';
import { AppState } from '../domain/types';
import { exportToClipboard, importFromClipboard } from '../domain/importExport';

interface ImportExportProps {
  state: AppState;
  onImport: (o: AppState) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  state,
  onImport,
}) => {
  const [info, setInfo] = React.useState<string | undefined>();
  const [errorText, setErrorText] = React.useState<string | undefined>();

  const showInfo = (text: string) => {
    setInfo(text);
    setTimeout(() => setInfo(undefined), 3000);
  };

  const showError = (message: string) => {
    setErrorText(message);
    setTimeout(() => setErrorText(undefined), 3000);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Import/Export</Typography>
      <Typography variant="caption">
        This is used to share image transformations with other Partymoji users
      </Typography>
      <Button
        startIcon={<Icon>file_upload</Icon>}
        sx={{ maxWidth: '300px' }}
        variant="contained"
        onClick={() => {
          exportToClipboard(state);
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
          const results = await importFromClipboard();
          if (results.status === 'success') {
            onImport(results.appState);
            setErrorText(undefined);
          } else {
            showError(results.message);
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
      {errorText && (
        <Alert severity="error" sx={{ maxWidth: '300px' }}>
          Error importing from clipboard: {errorText}
        </Alert>
      )}
    </Stack>
  );
};
