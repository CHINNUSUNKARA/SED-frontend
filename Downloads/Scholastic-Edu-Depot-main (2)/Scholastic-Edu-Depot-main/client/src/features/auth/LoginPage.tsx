import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';
import { useAuth } from '../../contexts/AuthContext';
import { googleLogin as googleLoginService } from '../../services/authService';

interface LoginPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const userData = await login(email, password);

      console.log("LOGIN SUCCESS:", userData);

      // 🔥 ALWAYS REDIRECT
      onNavigate('student-dashboard');

    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        '';

      // ❌ REMOVE VERIFY ERROR COMPLETELY
      if (message.toLowerCase().includes("verify")) {
        onNavigate('student-dashboard');
        return;
      }

      setError(message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await googleLoginService(idToken);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      console.log("GOOGLE LOGIN SUCCESS:", response);

      // 🔥 DIRECT REDIRECT
      onNavigate('student-dashboard');

    } catch (err: any) {
      console.error("GOOGLE LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        '';

      // ❌ REMOVE VERIFY ERROR
      if (message.toLowerCase().includes("verify")) {
        onNavigate('student-dashboard');
        return;
      }

      setError(message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-center items-center">
        <h1 className="text-4xl font-bold">Welcome Back</h1>
        <p className="text-slate-300 mt-4">Continue your journey</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 relative">

        {/* BACK BUTTON */}
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="max-w-md mx-auto w-full">

          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* GOOGLE LOGIN */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const idToken = credentialResponse.credential;

                  if (!idToken) {
                    setError("Google login failed");
                    return;
                  }

                  handleGoogleLogin(idToken);
                }}
                onError={() => setError("Google login failed")}
              />
            </div>

            <div className="text-center text-sm text-gray-400">OR</div>

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
              {!isLoading && <ArrowRight size={18} />}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
};