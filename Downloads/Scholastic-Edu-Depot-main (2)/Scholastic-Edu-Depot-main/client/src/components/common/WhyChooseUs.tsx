import React from 'react';
import { BookOpen, Users, Code, Briefcase, Clock, MessageCircle } from 'lucide-react';

// Define FEATURES constant directly in the file
const FEATURES = [
  {
    id: 1,
    title: 'Industry-Centric Curriculum',
    description: 'Our courses are designed in collaboration with industry experts to ensure you learn the most in-demand skills.',
    icon: 'book-open',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 2,
    title: 'Expert Instructors',
    description: 'Learn from experienced professionals who are passionate about teaching and mentoring the next generation of developers.',
    icon: 'users',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 3,
    title: 'Hands-on Projects',
    description: 'Build real-world projects that you can showcase in your portfolio to potential employers.',
    icon: 'code',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    title: 'Career Support',
    description: 'Get resume reviews, mock interviews, and job search assistance to help you land your dream job.',
    icon: 'briefcase',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 5,
    title: 'Flexible Learning',
    description: 'Learn at your own pace with our flexible online courses that fit your schedule.',
    icon: 'clock',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 6,
    title: 'Community Access',
    description: 'Join a community of like-minded learners and get support from instructors and peers.',
    icon: 'message-circle',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const getIconComponent = (iconName: string, size: number) => {
  const iconProps = { size };
  switch (iconName) {
    case 'book-open': return <BookOpen {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'code': return <Code {...iconProps} />;
    case 'briefcase': return <Briefcase {...iconProps} />;
    case 'clock': return <Clock {...iconProps} />;
    case 'message-circle': return <MessageCircle {...iconProps} />;
    default: return null;
  }
};

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-72 h-72 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">
            Why Choose SED?
          </h2>
          <p className="text-lg text-slate-600">
            We don't just teach code; we build careers. Our ecosystem is designed to take you from novice to professional developer in record time.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.slice(0, 4).map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                {getIconComponent(feature.icon, 28)}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};