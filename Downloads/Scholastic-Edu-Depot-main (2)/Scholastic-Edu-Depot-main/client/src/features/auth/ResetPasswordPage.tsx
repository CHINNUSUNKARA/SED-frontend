
import React, { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';

interface ResetPasswordPageProps {
  onNavigate: (view: ViewState) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-800/40 via-slate-900 to-slate-900"></div>
          <img
            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Lock Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold">S</div>
            <span className="text-xl font-display font-bold">SED<span className="text-brand-500">.</span></span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
            Secure Your <br /> Future
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Choose a strong password to protect your learning progress and certifications.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-4 sm:px-12 md:px-24 py-12 pt-24 lg:pt-12 overflow-y-auto relative">

        {!isSubmitted && (
          <button
            onClick={() => onNavigate('login')}
            className="hidden lg:flex absolute top-8 right-8 items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        )}

        <div className="max-w-md mx-auto w-full">
          <div className="text-center lg:text-left mb-10">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 mx-auto lg:mx-0">
              <Key size={24} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Set new password</h2>
            <p className="text-slate-600">
              {!isSubmitted
                ? "Your new password must be different to previously used passwords."
                : "Your password has been successfully reset."
              }
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    placeholder="••••••••"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-base py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-1">Password Reset Complete</h3>
                <p className="text-sm text-green-700">You can now log in with your new password.</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => onNavigate('login')}
              >
                Log In Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
