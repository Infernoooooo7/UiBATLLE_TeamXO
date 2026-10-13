import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles/tokens.css';
import './styles/base.css';
import App from './App.jsx';

// Mark images that fail to load (styled in base.css) and clear the mark if they recover
document.addEventListener(
  'error',
  (e) => {
    if (e.target instanceof HTMLImageElement) e.target.setAttribute('data-broken', '');
  },
  true,
);
document.addEventListener(
  'load',
  (e) => {
    if (e.target instanceof HTMLImageElement) e.target.removeAttribute('data-broken');
  },
  true,
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
