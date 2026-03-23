

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FAQ_ITEMS } from '../constants';
import api from '../lib/api';
import { CertificationBadge } from '../components/ui/CertificationBadge';

export const ContactPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      await api.post('/contact', formState);
      setFormStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Have a question about our courses, pricing, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Info Column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h3>
              <p className="text-slate-600 mb-8">
                Our team is available to assist you with any inquiries. Reach out to us via any of the following channels.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg text-brand-600 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Visit Us</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VISAKHAPATNAM</p>
                        <p className="text-slate-600 text-sm">
                          #50-50-33/2/1, Shop No.1, 2nd Floor,<br />
                          Priyadarshini Complex, Gurudwara Jn.,<br />
                          VISAKHAPATNAM - 530 013, A.P. India
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VIJAYAWADA</p>
                        <p className="text-slate-600 text-sm">
                          C/o Modern Public School, Above SBI,<br />
                          Madhu Gardens, Moghalrajpuram,<br />
                          VIJAYAWADA - 520 010, A.P. India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Email Us</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VISAKHAPATNAM</p>
                        <p className="text-slate-600 text-sm">vizag@ctcglobal.co.uk</p>
                      </div>
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VIJAYAWADA</p>
                        <p className="text-slate-600 text-sm">vijayawada@ctcglobal.co.uk</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Call Us</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VISAKHAPATNAM</p>
                        <p className="text-slate-600 text-sm">+91 81798 46868</p>
                        <p className="text-slate-600 text-sm">+91 89144 33003</p>
                      </div>
                      <div>
                        <p className="text-brand-600 font-semibold text-xs mb-1">VIJAYAWADA</p>
                        <p className="text-slate-600 text-sm">+91 737 737 1237</p>
                        <p className="text-slate-600 text-sm">+91 737 737 1238</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Office Hours</h4>
                    <p className="text-slate-600 text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-600 text-sm">Saturday: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>

              {/* ISO Certification Badge - Trust Signal */}
              <div className="pt-6 border-t border-slate-200">
                <CertificationBadge variant="compact" />
              </div>
            </div>

            {/* Google Maps */}
            <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Office Map"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=50-50-33%2F2%2F1+Shop+No.1+2nd+Floor+Priyadarshini+Complex+Gurudwara+Junction+Visakhapatnam+530013"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="shadow-lg hover:shadow-xl transition-shadow">
                    View on Google Maps
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>

            {formStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
                <Send size={20} className="mr-2" />
                Message sent successfully! We'll allow get back to you soon.
              </div>
            )}

            {formStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                Something went wrong. Please try again later.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Venu Thota"
                    disabled={formStatus === 'loading'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="venuthota@gmail.com"
                    disabled={formStatus === 'loading'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                  disabled={formStatus === 'loading'}
                >
                  <option value="">Select a topic</option>
                  <option value="course_inquiry">Course Inquiry</option>
                  <option value="admissions">Admissions & Fees</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                  placeholder="How can we help you today?"
                  disabled={formStatus === 'loading'}
                ></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={formStatus === 'loading'}>
                <Send size={18} className="mr-2" />
                {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Find quick answers to common questions about our platform and courses.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-slate-900">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="text-brand-600" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </button>
                <div
                  className={`px-5 pb-5 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${openFaq === index ? 'block opacity-100' : 'hidden opacity-0'
                    }`}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Still have questions?</p>
            <Button variant="outline" className="bg-white">
              <MessageSquare size={18} className="mr-2 text-brand-600" />
              Chat with Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

