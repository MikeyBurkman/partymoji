import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { ThemeProvider } from '@emotion/react';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary.tsx';
import { createTheme } from '@mui/material';
import * as localStorage from '~/localStorage';

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
        onClearLocalStorage={() => {
          localStorage.clearAppState();
          window.location.reload();
        }}
      >
        <App />
      </TopLevelErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
