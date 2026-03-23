import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

// 🔥 IMPORTANT: paste your NEW client ID here (Google Console nundi)
const GOOGLE_CLIENT_ID = "885798134213-1p1n14q3vv0nq4r3qn866mjrqkr3irgp.apps.googleusercontent.com";

console.log("Google Client ID:", GOOGLE_CLIENT_ID);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);