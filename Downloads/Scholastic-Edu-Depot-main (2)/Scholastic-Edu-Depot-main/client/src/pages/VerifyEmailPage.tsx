import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/VerifyEmailPage.css';

interface VerifyResponse {
  message: string;
  success?: boolean;
}

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const location = useLocation();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const statusParam = search.get('status');
    const messageParam = search.get('message');

    // If the backend redirected here with a status, show that and skip calling the API again.
    if (statusParam) {
      if (statusParam === 'success') {
        setStatus('success');
        setMessage('✓ Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(messageParam ? decodeURIComponent(messageParam) : 'Email verification failed. The link may have expired.');
      }
      return;
    }

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl}/auth/verify-email/${token}`);
        const data: VerifyResponse = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('✓ Email verified successfully! Redirecting to login...');

          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. The link may have expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, navigate, location.search]);

  return (
    <div className="verify-container">
      <div className={`verify-card ${status}`}>
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h1>Verifying Email</h1>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon-success">✓</div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <div className="countdown">Redirecting to login in 2 seconds...</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon-error">✗</div>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <div className="actions">
              <button onClick={() => navigate('/login')} className="btn-primary">
                Go to Login
              </button>
              <button onClick={() => navigate('/register')} className="btn-secondary">
                Create New Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
