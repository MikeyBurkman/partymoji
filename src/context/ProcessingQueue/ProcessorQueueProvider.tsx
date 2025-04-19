import React from 'react';
import { ProcessorQueueContext } from './ProcessorQueueContext';

export const ProcessorQueueProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const latestRunIdRef = React.useRef(0);

  return (
    <ProcessorQueueContext value={{ latestRunIdRef }}>
      {children}
    </ProcessorQueueContext>
  );
};
