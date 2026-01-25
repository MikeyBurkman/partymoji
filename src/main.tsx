import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { ThemeProvider } from '@emotion/react';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary.tsx';
import { createTheme } from '@mui/material';
import * as storage from '~/domain/storage';

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway, Arial',
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <TopLevelErrorBoundary
        onClearLocalStore={() => {
          storage
            .clearAppState()
            .then(() => {
              window.location.reload();
            })
            .catch((err: unknown) => {
              console.error('Error clearing storage', { err });
            });
        }}
      >
        <App />
      </TopLevelErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
