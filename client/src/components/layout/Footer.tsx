import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { ViewState } from '../../App';
import { CertificationBadge } from '../ui/CertificationBadge';

interface FooterProps {
  onNavigate?: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, view: ViewState, id?: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view);
      if (id && view === 'home') {
        setTimeout(() => {
          const el = document.querySelector(id);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handlePolicyNavigation = (e: React.MouseEvent, view: 'privacy' | 'terms') => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Policy navigation clicked:', view);
    console.log('onNavigate function exists:', !!onNavigate);
    if (onNavigate) {
      console.log('Calling onNavigate with view:', view);
      onNavigate(view);
      // Scroll to top when navigating to policy pages
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      console.error('onNavigate function is not available');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

          {/* Brand Column */}
          <div>
            <div className="flex flex-col space-y-2">
              <a
                href="#"
                onClick={(e) => handleNav(e, 'home')}
                className="flex items-center space-x-2"
              >
                <img src="/logo-sed.png" alt="SED Logo" className="h-14 w-auto" />
                <span className="text-xl font-display font-bold text-white tracking-tight ml-2">
                  SCHOLASTIC EDU. DEPOT
                </span>
              </a>
            </div>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Scholastic A Edu. Depot is a premier EdTech platform dedicated to bridging the gap between academic learning and industry requirements.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-brand-500 transition-colors"
                aria-label="Facebook"
                title="Visit our Facebook page"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="hover:text-brand-500 transition-colors"
                aria-label="Twitter"
                title="Visit our Twitter profile"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="hover:text-brand-500 transition-colors"
                aria-label="Instagram"
                title="Visit our Instagram profile"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="hover:text-brand-500 transition-colors"
                aria-label="LinkedIn"
                title="Visit our LinkedIn page"
              >
                <Linkedin size={20} />
              </a>
            </div>

            {/* ISO Certification Badge */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <CertificationBadge variant="minimal" className="opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" onClick={(e) => handleNav(e, 'about')} className="hover:text-brand-500 transition-colors">About Us</a></li>
              <li><a href="#courses" onClick={(e) => handleNav(e, 'courses')} className="hover:text-brand-500 transition-colors">Our Courses</a></li>
              <li><a href="#services" onClick={(e) => handleNav(e, 'services')} className="hover:text-brand-500 transition-colors">Our Services</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'success-stories')} className="hover:text-brand-500 transition-colors">Success Stories</a></li>
              <li><a href="#contact" onClick={(e) => handleNav(e, 'contact')} className="hover:text-brand-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>



          {/* Contact Info - Both Locations Side by Side */}
          <div>
            <h3 className="text-white font-bold mb-6">Contact Us</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visakhapatnam */}
              <div>
                <p className="text-brand-400 font-semibold mb-3 text-sm">VISAKHAPATNAM</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    <span>#50-50-33/2/1, Shop No.1, 2nd Floor, Priyadarshini Complex, Gurudwara Jn., VISAKHAPATNAM - 530 013, A.P. India</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-brand-500 flex-shrink-0" />
                    <span>+91 81798 46868 / +91 89144 33003</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-brand-500 flex-shrink-0" />
                    <span>vizag@ctcglobal.co.uk</span>
                  </li>
                </ul>
              </div>

              {/* Vijayawada */}
              <div>
                <p className="text-brand-400 font-semibold mb-3 text-sm">VIJAYAWADA</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    <span>C/o Modern Public School, Above SBI, Madhu Gardens, Moghalrajpuram, VIJAYAWADA - 520 010, A.P. India</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-brand-500 flex-shrink-0" />
                    <span>+91 737 737 1237 / +91 737 737 1238</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-brand-500 flex-shrink-0" />
                    <span>vijayawada@ctcglobal.co.uk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center relative z-10">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Scholastic A Edu. Depot. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm relative z-[60]">
            <a
              href="#"
              onClick={(e) => handlePolicyNavigation(e, 'privacy')}
              className="text-slate-300 hover:text-white transition-colors hover:underline underline-offset-4 cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => handlePolicyNavigation(e, 'terms')}
              className="text-slate-300 hover:text-white transition-colors hover:underline underline-offset-4 cursor-pointer"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};