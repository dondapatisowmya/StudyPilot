import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Removed prohibited process.env shim as the environment variable is handled externally.

const rootElement = document.getElementById('root');
if (!rootElement) {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);