import React from 'react';
import { AlertContext } from './AlertContext';


export const useSetAlert = () => {
  const { setAlert } = React.use(AlertContext);
  return setAlert;
};
