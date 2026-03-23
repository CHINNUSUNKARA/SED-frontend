
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ViewState } from '../../App';
import { BookingModal } from '../modals/BookingModal';

interface CTASectionProps {
  onNavigate: (view: ViewState) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <>
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Start Your IT Career?
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of learners building their future with SED. Get access to premium courses, mentorship, and job support today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-600 hover:bg-brand-500 text-white border-none text-lg px-10"
              onClick={() => onNavigate('get-started')}
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 hover:text-white"
              onClick={() => setShowBookingModal(true)}
            >
              Book Free Counseling
            </Button>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            No credit card required for free demo classes.
          </p>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

