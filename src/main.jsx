import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { StoreProvider } from './context/StoreContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SiteProvider>
        <AuthProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  </React.StrictMode>
);
