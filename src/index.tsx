import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary';
import * as localStorage from './localStorage';

ReactDOM.render(
  <React.StrictMode>
    <TopLevelErrorBoundary
      onClearLocalStorage={() => {
        localStorage.clearAppState();
        window.location.reload();
      }}
    >
      <App />
    </TopLevelErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
