import { AlertColor } from '@mui/material';
import React from 'react';

export type AlertValue = { message: string; severity: AlertColor } | null;

export interface AlertContext {
  alert: AlertValue;
  setAlert: (alert: AlertValue) => void;
}

export const AlertContext = React.createContext<AlertContext>({
  alert: null,
  setAlert: () => {
    throw new Error('Context not initialized');
  },
});
