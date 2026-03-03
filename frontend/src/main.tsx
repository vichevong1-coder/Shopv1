import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './redux/store';
import { setupAxios } from './api/axiosInstance';
import { UIProvider } from './context/UIContext';
import App from './App';
import './index.css';

// Inject store into axiosInstance to avoid a circular import:
// store → authSlice → api/auth → axiosInstance → store
setupAxios(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <UIProvider>
          <App />
        </UIProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
