import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary.tsx';
import * as localStorage from '~/localStorage';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TopLevelErrorBoundary
      onClearLocalStorage={() => {
        localStorage.clearAppState();
        window.location.reload();
      }}
    >
      <App />
    </TopLevelErrorBoundary>
  </StrictMode>,
);
