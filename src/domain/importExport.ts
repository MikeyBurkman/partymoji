import * as lz from 'lz-string';
import { AppState } from './types';

type ImportResults =
  | { status: 'error'; message: string }
  | { status: 'success'; appState: AppState };

export const importFromClipboard = async (): Promise<ImportResults> => {
  try {
    const clipboardContents = await navigator.clipboard.readText();
    if (!clipboardContents) {
      return { status: 'error', message: 'No text found on clipboard' };
    }
    const appState = JSON.parse(lz.decompressFromBase64(clipboardContents)!);
    if (!Array.isArray(appState.effects)) {
      return {
        status: 'error',
        message: 'Clipboard text is not a valid Partymoji export',
      };
    }
    return { status: 'success', appState };
  } catch (error) {
    return { status: 'error', message: error.message ?? error };
  }
};

export const exportToClipboard = (state: AppState) => {
  const output = lz.compressToBase64(JSON.stringify(state));
  navigator.clipboard.writeText(output);
};
