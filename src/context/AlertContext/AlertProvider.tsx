import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AlertContext, AlertValue } from './AlertContext';

export const AlertProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [alertValue, setAlertValue] = React.useState<AlertValue>(null);

  const contextValue = React.useMemo(
    () => ({ alert: alertValue, setAlert: setAlertValue }),
    [alertValue],
  );

  return <AlertContext value={contextValue}>{children}</AlertContext>;
};

export const AlertSnackbar: React.FC = () => {
  const { alert, setAlert } = React.use(AlertContext);
  return (
    <Snackbar open={alert != null}>
      {alert == null ? undefined : (
        <Alert
          severity={alert.severity}
          onClose={() => {
            setAlert(null);
          }}
        >
          {alert.message}
        </Alert>
      )}
    </Snackbar>
  );
};
