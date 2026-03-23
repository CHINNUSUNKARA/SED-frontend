
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../constants';
import { Button } from '../ui/Button';
import { ViewState } from '../../App';

interface HeaderProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === '#courses') {
      onNavigate('courses');
    } else if (href === '#services') {
      onNavigate('services');
    } else if (href === '#about') {
      onNavigate('about');
    } else if (href === '#contact') {
      onNavigate('contact');
    } else {
      onNavigate('home');
      // Small delay to allow rendering home before scrolling
      if (href !== '#home') {
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md py-3`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              className="flex items-center space-x-4 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg transition-all duration-300 group-hover:bg-blue-50">
                  <img src="/logo-sed.png" alt="SED Logo" className="h-12 w-auto" />
                </div>
                <span className="hidden sm:block text-lg font-display font-bold text-gray-900">
                  SCHOLASTIC EDU. DEPOT
                </span>
                <span className="sm:hidden text-xl font-display font-bold text-gray-900">
                  SED
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${((link.href === '#courses' && currentView === 'courses') ||
                  (link.href === '#services' && currentView === 'services') ||
                  (link.href === '#about' && currentView === 'about') ||
                  (link.href === '#contact' && currentView === 'contact') ||
                  (link.href === '#home' && currentView === 'home'))
                  ? 'bg-white text-blue-700 font-semibold shadow-sm'
                  : 'text-blue-800 hover:bg-blue-50 hover:text-blue-900'
                  }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-800 font-medium hover:text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </button>
            <Button
              size="sm"
              onClick={() => onNavigate('get-started')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-blue-800 hover:text-blue-700 focus:outline-none p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md"
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 px-3 space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => { setIsMobileMenuOpen(false); onNavigate('login'); }}
              >
                Log in
              </Button>
              <Button className="w-full" onClick={() => { setIsMobileMenuOpen(false); onNavigate('get-started'); }}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

