import React from 'react';

interface ContextProps {
  latestRunIdRef: React.RefObject<number>;
}
export const ProcessorQueueContext = React.createContext<ContextProps>({
  // eslint-disable-next-line
  latestRunIdRef: null as any, // Will be set immediately in the provider
});
