

import React from 'react';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { ViewState } from '../../App';
import { CertificationBadge } from '../ui/CertificationBadge';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50 selection:bg-brand-200 selection:text-brand-900">
      {/* Background Decor - Minimal */}
      <div className="absolute top-0 right-0 -z-10 opacity-30 transform translate-x-1/3 -translate-y-1/4 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-to-br from-brand-100 to-brand-50 rounded-full filter blur-[80px]"></div>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-30 transform -translate-x-1/3 translate-y-1/4 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-blue-50 to-slate-100 rounded-full filter blur-[80px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <div className="animate-fade-in-up z-10">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Launch Your <span className="text-brand-600">IT Career</span> with Confidence
          </h1>

          {/* ISO Certification Badge - Trust Signal */}
          <div className="flex justify-center mb-6">
            <CertificationBadge variant="minimal" />
          </div>

          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Master the skills that drive the future. Industry-aligned curriculum, hands-on projects, and expert mentorship designed to get you hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="shadow-lg shadow-brand-500/20 text-lg px-8" onClick={() => onNavigate('get-started')}>
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button variant="outline" size="lg" className="bg-white text-lg px-8" onClick={() => onNavigate('courses')}>
              <PlayCircle className="mr-2 h-5 w-5 text-slate-500" />
              Explore Courses
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-slate-100 object-cover" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                +2k
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <div className="flex text-yellow-400 gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span>Rated 4.9/5 by students</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

