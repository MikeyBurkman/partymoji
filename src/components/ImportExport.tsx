import {
  Stack,
  Button,
  Icon,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@material-ui/core';
import React from 'react';
import * as lz from 'lz-string';
import { AppState } from '../domain/types';

interface ImportExportProps {
  state: AppState;
  onImport: (o: AppState) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  state,
  onImport,
}) => {
  const [exportSource, setExportSource] = React.useState(true);
  const [info, setInfo] = React.useState<string | undefined>();
  const [isInvalid, setInvalid] = React.useState(false);

  const showInfo = (text: string) => {
    setInfo(text);
    setTimeout(() => setInfo(undefined), 2000);
  };

  const showError = () => {
    setInvalid(true);
    setTimeout(() => setInvalid(false), 2000);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="h5">Import/Export</Typography>
      <Stack
        direction="row"
        spacing={4}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportSource}
                  onChange={(e) => setExportSource(e.target.checked)}
                />
              }
              label="Include Source Image"
            />
            <Button
              endIcon={<Icon>file_upload</Icon>}
              variant="contained"
              onClick={() => {
                const out: AppState = exportSource
                  ? state
                  : { ...state, baseImage: undefined };
                const output = lz.compressToBase64(JSON.stringify(out));
                navigator.clipboard.writeText(output);
                showInfo('Copied to clipboard');
              }}
            >
              Export to clipboard
            </Button>
          </Stack>
        </Stack>
        <Stack spacing={1}>
          <Button
            endIcon={<Icon>file_download</Icon>}
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
                if (!!Array.isArray(data.transforms)) {
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
        </Stack>
      </Stack>
      {info && <Alert severity="info">{info}</Alert>}
      {isInvalid && (
        <Alert severity="error">Error importing from clipboard</Alert>
      )}
    </Stack>
  );
};
