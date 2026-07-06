import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent benign ResizeObserver loop limit exceeded / completed with undelivered notifications errors from crashing or spamming the console
if (typeof window !== 'undefined') {
  const ignoreErrors = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded'
  ];

  const handleError = (e: ErrorEvent) => {
    if (e && e.message && ignoreErrors.some(msg => e.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  const handleRejection = (e: PromiseRejectionEvent) => {
    if (e && e.reason && e.reason.message && ignoreErrors.some(msg => e.reason.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

