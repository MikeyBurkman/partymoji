import React from 'react';
import { Alert, AlertColor, Snackbar } from '@material-ui/core';

export type AlertValue = { message: string; severity: AlertColor } | null;

interface AlertContext {
  alert: AlertValue;
  setAlert: (alert: AlertValue) => void;
}

export const alertContext = React.createContext<AlertContext>({
  alert: null,
  setAlert: () => {
    throw new Error('Context not initialized');
  },
});

export const AlertProvider: React.FC = ({ children }) => {
  const [alertValue, setAlertValue] = React.useState<AlertValue>(null);

  return (
    <alertContext.Provider
      value={{ alert: alertValue, setAlert: setAlertValue }}
    >
      {children}
    </alertContext.Provider>
  );
};

export const AlertSnackbar: React.FC = () => {
  const { alert, setAlert } = React.useContext(alertContext);
  return (
    <Snackbar open={alert != null}>
      {alert == null ? undefined : (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export const useSetAlert = () => {
  const { setAlert } = React.useContext(alertContext);
  return setAlert;
};
