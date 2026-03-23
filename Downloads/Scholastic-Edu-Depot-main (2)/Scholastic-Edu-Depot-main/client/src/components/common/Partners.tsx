
import React from 'react';

// Define PARTNERS constant with real company logos
const PARTNERS = [
  {
    name: 'Google',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
  },
  {
    name: 'Microsoft',
    logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31'
  },
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'
  },
  {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'
  },
  {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
  },
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'
  },
  {
    name: 'Uber',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png'
  },
  {
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png'
  }
];

export const Partners: React.FC = () => {
  // Duplicate the list for infinite scroll effect
  const doubledPartners = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-16 bg-white border-y border-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h3 className="text-xl font-display font-bold text-slate-900 mb-3">
          Trusted by Hiring Partners from Top Companies
        </h3>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
          Our graduates are making an impact at leading technology organizations worldwide, securing positions at Fortune 500 companies and high-growth startups.
        </p>
      </div>

      {/* Scroll Container */}
      <div className="relative w-full group">

        {/* Gradient Masks for smooth fade effect */}
        <div className="absolute top-0 left-0 h-full w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Content */}
        <div className="flex animate-scroll whitespace-nowrap py-6 items-center group-hover:[animation-play-state:paused]">
          {doubledPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="mx-8 lg:mx-12 flex-shrink-0 relative group/logo"
            >
              <div className="opacity-50 group-hover/logo:opacity-100 transition-all duration-500 filter grayscale group-hover/logo:grayscale-0 cursor-pointer transform group-hover/logo:scale-110">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 md:h-12 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
