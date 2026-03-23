

import React from 'react';
import { ALL_SERVICES } from '../../constants';
import { ViewState } from '../../App';
import { Button } from '../../components/ui/Button';
import { CheckCircle, ArrowRight, ChevronLeft, MessageSquare, Briefcase } from 'lucide-react';

interface ServiceDetailPageProps {
   serviceId: string;
   onNavigate: (view: ViewState) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ serviceId, onNavigate }) => {
   const service = ALL_SERVICES.find(s => s.id === serviceId);

   if (!service) {
      return (
         <div className="pt-32 min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Service Not Found</h2>
            <p className="text-slate-600 mb-8">We couldn't locate the details for this service.</p>
            <Button onClick={() => onNavigate('services')}>Back to Services</Button>
         </div>
      );
   }

   return (
      <div className="pt-24 min-h-screen bg-white flex flex-col">
         {/* Breadcrumb / Navigation */}
         <div className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <button
                  onClick={() => onNavigate('services')}
                  className="flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors font-medium"
               >
                  <ChevronLeft size={16} className="mr-1" />
                  Back to All Services
               </button>
            </div>
         </div>

         {/* Hero Section */}
         <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900 z-0">
               <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover opacity-20"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="max-w-3xl">
                  <div className="inline-flex items-center justify-center p-3 bg-brand-500/20 backdrop-blur-md border border-brand-400/30 rounded-xl mb-6">
                     <service.icon className="text-brand-400 w-8 h-8" />
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
                     {service.title}
                  </h1>
                  <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                     {service.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                     <Button size="lg" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                        Get Started
                     </Button>
                     <Button variant="outline" size="lg" className="text-white border-slate-600 hover:bg-white hover:text-slate-900">
                        Talk to an Expert
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         {/* Main Content */}
         <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col lg:flex-row gap-16">

                  {/* Left Column: Content */}
                  <div className="flex-grow">
                     <div className="mb-16">
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Overview</h2>
                        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                           {service.longDescription || service.description}
                        </p>
                     </div>

                     <div className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">What We Offer</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                 <CheckCircle className="text-brand-600 mr-3 flex-shrink-0" size={20} />
                                 <span className="font-medium text-slate-800">{feature}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Process Timeline */}
                     {service.process && (
                        <div className="mb-16">
                           <h2 className="text-2xl font-bold text-slate-900 mb-8">Our Process</h2>
                           <div className="space-y-8">
                              {service.process.map((step: any, idx: number) => (
                                 <div key={idx} className="flex gap-6">
                                    <div className="flex flex-col items-center">
                                       <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shadow-lg z-10 relative">
                                          {idx + 1}
                                       </div>
                                       {idx < service.process.length - 1 && (
                                          <div className="w-0.5 bg-slate-200 h-full min-h-[60px] mt-2"></div>
                                       )}
                                    </div>
                                    <div className="pb-8">
                                       <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                       <p className="text-slate-600">{step.desc}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Case Studies Section */}
                     {service.caseStudies && service.caseStudies.length > 0 && (
                        <div className="mb-12">
                           <div className="flex items-center gap-3 mb-8">
                              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                 <Briefcase size={24} />
                              </div>
                              <h2 className="text-2xl font-bold text-slate-900">Success Stories</h2>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {service.caseStudies.map((study, idx) => (
                                 <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">
                                       {study.client}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{study.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                       {study.desc}
                                    </p>
                                    <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
                                       <CheckCircle size={16} className="text-green-600" />
                                       <span className="text-sm font-semibold text-slate-800">Result: {study.outcome}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Right Column: Sticky Sidebar CTA */}
                  <div className="lg:w-1/3 flex-shrink-0">
                     <div className="sticky top-28">
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm" id="contact-form">
                           <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <MessageSquare size={20} className="text-brand-600" />
                              Inquire About This Service
                           </h3>
                           <p className="text-sm text-slate-500 mb-6">
                              Fill out the form below and our team will get back to you within 24 hours with a customized proposal.
                           </p>

                           <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Request sent!'); }}>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                 <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Venu Thota" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                                 <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="john@company.com" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                 <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Tech Corp Inc." />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
                                 <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Tell us more about your needs..."></textarea>
                              </div>
                              <Button type="submit" className="w-full">Send Request</Button>
                           </form>
                        </div>

                        <div className="mt-8 bg-brand-600 text-white p-6 rounded-2xl shadow-lg text-center">
                           <h4 className="font-bold text-lg mb-2">Need urgent assistance?</h4>
                           <p className="text-brand-100 mb-4 text-sm">Call our dedicated business line.</p>
                           <a href="tel:+15551234567" className="text-2xl font-bold hover:text-brand-100 transition-colors">+1 (555) 123-4567</a>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </section>
      </div>
   );
};