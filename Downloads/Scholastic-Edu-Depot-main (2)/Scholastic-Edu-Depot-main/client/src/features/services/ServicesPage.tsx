




import React from 'react';
import { ALL_SERVICES } from '../../constants';
import { CheckCircle, ArrowRight, Building, Users, GraduationCap, Briefcase, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';

interface ServicesPageProps {
   onNavigate: (view: ViewState) => void;
   onViewService?: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onViewService }) => {
   // Get featured case studies from the first few services for the summary section
   const featuredCaseStudies = ALL_SERVICES.slice(0, 3).map(service => ({
      serviceTitle: service.title,
      ...service.caseStudies![0]
   }));

   return (
      <div className="pt-24 min-h-screen bg-white flex flex-col">

         {/* Hero Section */}
         <section className="relative bg-slate-50 pb-20 pt-10 border-b border-slate-200 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform -translate-x-1/3 translate-y-1/4"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                     Comprehensive Educational <span className="text-brand-600">Solutions</span>
                  </h1>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                     Beyond courses, we provide end-to-end educational services for corporates, universities, and individuals. Elevate your potential with our expert-led programs.
                  </p>
                  <div className="flex justify-center gap-4">
                     <Button size="lg" onClick={() => document.getElementById('service-list')?.scrollIntoView({ behavior: 'smooth' })}>
                        Explore Services
                     </Button>
                     <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                           const link = document.createElement('a');
                           link.href = '/brochure.png';
                           link.download = 'SED_Brochure.png';
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                        }}
                     >
                        Download Brochure
                     </Button>
                  </div>
               </div>
            </div>
         </section>

         {/* Who We Serve Section */}
         <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                     <div className="w-16 h-16 bg-blue-50 rounded-2xl text-brand-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Building size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Corporates</h3>
                     <p className="text-slate-500">Upskill your workforce with custom tech training tailored to your project needs.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                     <div className="w-16 h-16 bg-orange-50 rounded-2xl text-accent-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-600 group-hover:text-white transition-colors">
                        <GraduationCap size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Universities</h3>
                     <p className="text-slate-500">Bridge the academia-industry gap with our workshops and curriculum support.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                     <div className="w-16 h-16 bg-green-50 rounded-2xl text-green-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Users size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Individuals</h3>
                     <p className="text-slate-500">Accelerate your career with 1-on-1 mentorship and placement assistance.</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Services Grid */}
         <section id="service-list" className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Our Core Services</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">We deliver excellence through a wide range of specialized services designed to meet the evolving demands of the tech industry.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
                  {ALL_SERVICES.map((service, index) => (
                     <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                           <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                              <service.icon size={28} />
                           </div>
                        </div>
                        <div className="flex-grow">
                           <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                           <p className="text-slate-600 mb-6 leading-relaxed text-sm">{service.description}</p>

                           <div className="space-y-2 mb-6">
                              {service.features.slice(0, 3).map((feature, idx) => (
                                 <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                 </div>
                              ))}
                           </div>

                           <button
                              className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center group"
                              onClick={() => onViewService && onViewService(service.id)}
                           >
                              View Case Studies & Details <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Featured Impact / Case Studies Teaser */}
         <section className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div className="max-w-2xl">
                     <div className="flex items-center gap-2 text-brand-600 font-bold uppercase tracking-wider text-sm mb-2">
                        <Star size={16} />
                        <span>Real World Impact</span>
                     </div>
                     <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Client Success Stories</h2>
                     <p className="text-slate-600">See how our services have transformed businesses and careers across the globe.</p>
                  </div>
                  <Button variant="outline" onClick={() => onNavigate('contact')}>Book a Consultation</Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredCaseStudies.map((study, idx) => (
                     <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                        <div className="mb-4">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{study.serviceTitle}</span>
                           <h3 className="text-xl font-bold text-slate-900 mt-1">{study.title}</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-6 leading-relaxed min-h-[60px]">
                           "{study.desc}"
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                           <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Client</p>
                              <p className="text-sm font-semibold text-slate-900">{study.client}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-slate-500 font-bold uppercase">Result</p>
                              <p className="text-sm font-bold text-brand-600">{study.outcome}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* CTA */}
         <section className="py-20 bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
               <div className="absolute top-[-10%] right-[10%] w-80 h-80 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl"></div>
               <div className="absolute bottom-[-10%] left-[10%] w-80 h-80 bg-brand-600 rounded-full mix-blend-screen filter blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
               <h2 className="text-3xl font-display font-bold text-white mb-6">Need a Custom Solution?</h2>
               <p className="text-slate-300 text-lg mb-8">
                  Whether you are a university looking to revamp your curriculum or a company seeking specialized training, we can tailor our services to your specific requirements.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" onClick={() => onNavigate('contact')}>Contact Us</Button>
                  <Button variant="outline" size="lg" className="text-white border-slate-600 hover:bg-slate-800">View Full Portfolio</Button>
               </div>
            </div>
         </section>

      </div>
   );
};