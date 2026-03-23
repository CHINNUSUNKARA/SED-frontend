

import React from 'react';
import { FileCheck, AlertTriangle, Book, Scale, CreditCard } from 'lucide-react';

import { ViewState } from '../App';

interface TermsOfServicePageProps {
  onNavigate?: (view: ViewState) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
  const lastUpdated = "March 15, 2024";

  const Section = ({ title, children, icon: Icon }: { title: string, children?: React.ReactNode, icon?: any }) => (
    <div className="mb-10 border-b border-slate-100 pb-10 last:border-0 last:pb-0">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
        {Icon && <Icon className="text-brand-600" size={24} />}
        {title}
      </h2>
      <div className="text-slate-600 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center mb-6 mx-auto">
            <img src="/logo-sed.png" alt="SED" className="h-10 w-auto" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 text-center mb-6">
            Terms of Service
          </h1>
          <p className="text-center text-slate-500">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Welcome to <span className="font-semibold">Scholastic A Edu. Depot</span>. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>

            <Section title="1. Educational Services" icon={Book}>
              <p>
                <div className="flex items-center gap-2 mb-2"><img src="/logo-sed.png" alt="Scholastic Edu. Depot" className="h-6 w-auto" /><span className="font-semibold">Scholastic Edu. Depot</span></div> provides online educational courses, mentorship programs, and career placement services. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
              </p>
              <p>
                We do not guarantee that completing a course will result in employment. Our placement services are on a "best effort" basis and depend on market conditions and your performance.
              </p>
            </Section>

            <Section title="2. User Accounts" icon={FileCheck}>
              <p>
                To access certain features, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate, current, and complete information during the registration process.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
                <li>Notify us immediately if you discover or suspect any security breaches related to the service.</li>
              </ul>
            </Section>

            <Section title="3. Payments & Refunds" icon={CreditCard}>
              <p>
                <strong>Pricing:</strong> All course fees are listed in INR. We reserve the right to change prices at any time.
              </p>
              <p>
                <strong>Refunds:</strong> We offer a 7-day money-back guarantee for most self-paced courses. If you are unsatisfied, you may request a refund within 7 days of purchase, provided you have not completed more than 20% of the course content. Mentorship programs are non-refundable once the first session has commenced.
              </p>
            </Section>

            <Section title="4. Intellectual Property" icon={Scale}>
              <p>
                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of <span className="font-semibold">Scholastic Edu. Depot</span> and its licensors. The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of <span className="font-semibold">Scholastic Edu. Depot</span>.
              </p>
              <p>
                You are granted a limited license to access and use the course materials for your personal, non-commercial education. You may not share, sell, or distribute our content.
              </p>
            </Section>

            <Section title="5. User Conduct" icon={AlertTriangle}>
              <p>
                You agree not to use the Service:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>To harass, abuse, or harm another person (including instructors and other students).</li>
                <li>To transmit spam, chain letters, or other unsolicited email.</li>
                <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              </ul>
              <p>
                We reserve the right to terminate your account for violations of these terms without refund.
              </p>
            </Section>

            <Section title="6. Limitation of Liability">
              <p>
                In no event shall <span className="font-semibold">Scholastic Edu. Depot</span>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have any questions about these Terms, please contact us at: <br />
                <a href="mailto:legal@sed-edu.com" className="text-brand-600 hover:text-brand-700 font-semibold">legal@sed-edu.com</a>
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};
