

import React, { useState } from 'react';
import { CheckCircle, Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { register as registerService, googleLogin as googleLoginService, AuthResponse } from '../services/authService';
import { Button } from '../components/ui/Button';
import { ViewState } from '../App';
import { CertificationBadge } from '../components/ui/CertificationBadge';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmpassword: string;
  terms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmpassword?: string;
  terms?: string;
  general?: string;
}

interface GetStartedPageProps {
  onNavigate: (view: ViewState) => void;
}

export const GetStartedPage: React.FC<GetStartedPageProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    terms: false
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.confirmpassword) {
      newErrors.confirmpassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: undefined }));

    try {
      const response: AuthResponse = await registerService({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmpassword: formData.confirmpassword,
        role: 'student',
        acceptTerms: formData.terms,
      });
      // Save token and redirect user
      localStorage.setItem('token', response.token);
      alert('Account created successfully! Please verify your email before logging in.');
      onNavigate('login');
    } catch (error: any) {
      setErrors({
        general: error?.response?.data?.message || 'Failed to create account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (codeResponse: any) => {
      setIsLoading(true);
      try {
        const response = await googleLoginService(codeResponse.id_token);
        // Store token and user info
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Redirect to dashboard
        onNavigate('student-dashboard');
      } catch (err: any) {
        setErrors({
          general: err?.response?.data?.message || 'Google signup failed'
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrors({
        general: 'Failed to sign up with Google'
      });
    },
    flow: 'implicit'
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual & Benefits (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-16">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-600/40 via-slate-900 to-slate-900"></div>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Students collaborating"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center mb-12 w-full">
            <img
              src="/logo-sed.png"
              alt="Scholastic Edu. Depot"
              className="h-24 w-auto mb-4"
            />
            <h2 className="text-2xl font-display font-bold text-white">SCHOLASTIC EDU. DEPOT</h2>
          </div>
          <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
            Start your journey to a <br />
            <span className="text-brand-400">successful IT career</span> today.
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Join 10,000+ learners who have transformed their careers with our industry-aligned curriculum and placement support.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            {[
              "Access to 50+ Premium Courses",
              "Real-world Capstone Projects",
              "1-on-1 Mentorship Sessions",
              "Lifetime Access to Community"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-brand-400" />
                </div>
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 mt-8">
            <div className="flex text-yellow-400 mb-3">
              {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
            </div>
            <p className="text-slate-300 italic mb-4">
              "The best decision I made for my career. The hands-on projects gave me the confidence to ace my interviews."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-600">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Sarah Jenkins</p>
                <p className="text-xs text-slate-400">Software Engineer at TechNova</p>
              </div>
            </div>
          </div>

          {/* ISO Certification Badge */}
          <div className="mt-6">
            <CertificationBadge variant="compact" />
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-4 sm:px-12 md:px-24 py-12 pt-24 lg:pt-12 overflow-y-auto relative">

        {/* Desktop Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="hidden lg:flex absolute top-8 right-8 items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-600">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                Log in
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => googleSignup()}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                {isLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase">Or continue with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className={errors.name ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.name ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-brand-500 focus:border-brand-500'
                      } transition-all`}
                    placeholder="Venu Thota"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className={errors.email ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-brand-500 focus:border-brand-500'
                      } transition-all`}
                    placeholder="venuthota@gmail.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className={errors.password ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-brand-500 focus:border-brand-500'
                      } transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.password}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters long.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className={errors.confirmpassword ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <input
                    type="password"
                    name="confirmpassword"
                    value={formData.confirmpassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.confirmpassword ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.confirmpassword ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-brand-500 focus:border-brand-500'
                      } transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmpassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {errors.confirmpassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className={`h-4 w-4 ${errors.terms ? 'text-red-600 focus:ring-red-500' : 'text-brand-600 focus:ring-brand-500'
                  } border-${errors.terms ? 'red-300' : 'slate-300'
                  } rounded mt-1 cursor-pointer`}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                I agree to the{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}
                  className="text-brand-600 hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}
                  className="text-brand-600 hover:underline"
                >
                  Privacy Policy
                </a>.
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.terms}
                </p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
                <AlertCircle size={16} className="flex-shrink-0 mr-2 mt-0.5" />
                {errors.general}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base py-3 mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

