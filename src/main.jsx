import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SiteProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
              <Toaster position="top-center" toastOptions={{ style: { background: '#5b1a2e', color: '#fffaf1' } }} />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  </React.StrictMode>
);
