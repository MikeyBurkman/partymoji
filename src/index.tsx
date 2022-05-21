import { createTheme, ThemeProvider } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary';
import * as localStorage from './localStorage';

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway, Arial',
  },
});

ReactDOM.render(
  <React.StrictMode>
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
  </React.StrictMode>,
  document.getElementById('root')
);
