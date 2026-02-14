
import React from 'react';
import { Shield, Lock, Eye, Server, FileText } from 'lucide-react';

import { ViewState } from '../App';

interface PrivacyPolicyPageProps {
  onNavigate?: (view: ViewState) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
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
            Privacy Policy
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
              At <span className="font-semibold">Scholastic Edu. Depot</span>, we value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
            </p>

            <Section title="1. Information We Collect" icon={FileText}>
              <p>We collect several types of information from and about users of our Website, including information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Identity Information:</strong> Name, postal address, email address, telephone number, or any other identifier by which you may be contacted online or offline.</li>
                <li><strong>Educational Data:</strong> Course progress, quiz scores, assignment submissions, and certification details.</li>
                <li><strong>Technical Data:</strong> Internet connection details, equipment used to access our Website, and usage details (IP addresses, cookies, etc.).</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information" icon={Server}>
              <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To present our Website and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us (e.g., enrolling in courses).</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
                <li>To allow you to participate in interactive features on our Website (e.g., student forums).</li>
              </ul>
            </Section>

            <Section title="3. Data Security" icon={Lock}>
              <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. Any payment transactions are encrypted using SSL technology.
              </p>
              <p>
                The safety and security of your information also depend on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Website, you are responsible for keeping this password confidential. We ask you not to share your password with anyone.
              </p>
            </Section>

            <Section title="4. Third-Party Disclosure" icon={Eye}>
              <p>
                We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
              </p>
            </Section>

            <Section title="5. Your Rights">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              </ul>
            </Section>

            <Section title="Contact Us">
              <p>
                If you have any questions about this Privacy Policy, please contact us at: <br />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = 'mailto:privacy@sed-edu.com';
                  }}
                  className="text-brand-600 hover:text-brand-700 font-semibold"
                >
                  privacy@scholasticedudepot.com
                </a>
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};
