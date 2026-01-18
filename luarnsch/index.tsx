import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Entry point for the React application.
 * Renders the main App component into the HTML root element.
 */
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
