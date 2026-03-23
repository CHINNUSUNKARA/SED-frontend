
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';

interface ForgotPasswordPageProps {
  onNavigate: (view: ViewState) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-800/40 via-slate-900 to-slate-900"></div>
          <img
            src="https://images.unsplash.com/photo-1555421689-492a18d9c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Security Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold">S</div>
            <span className="text-xl font-display font-bold">SED<span className="text-brand-500">.</span></span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
            Secure Account <br /> Recovery
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back to learning in no time.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-4 sm:px-12 md:px-24 py-12 pt-24 lg:pt-12 overflow-y-auto relative">

        {/* Desktop Back Button */}
        <button
          onClick={() => onNavigate('login')}
          className="hidden lg:flex absolute top-8 right-8 items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center lg:text-left mb-10">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 mx-auto lg:mx-0">
              <Mail size={24} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Forgot password?</h2>
            <p className="text-slate-600">
              {!isSubmitted
                ? "Enter the email address associated with your account and we'll send you a link to reset your password."
                : `We sent a password reset link to ${email}`
              }
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-base py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 items-start">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-green-800">
                  <p className="font-bold mb-1">Check your email</p>
                  <p>If an account exists for {email}, you will receive a reset link shortly.</p>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500">
                Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="text-brand-600 font-bold hover:underline">Click to resend</button>
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('login')}
              >
                <ArrowLeft size={18} className="mr-2" /> Back to Login
              </Button>

              {/* Demo purpose only link */}
              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Developer Demo Mode</p>
                <button
                  onClick={() => onNavigate('reset-password')}
                  className="text-sm text-brand-600 hover:text-brand-800 font-medium bg-brand-50 px-4 py-2 rounded-lg"
                >
                  Simulate Clicking Email Link →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
