import React from 'react';
import { Users, Target, Award, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ViewState } from '../App';

// Define types for CORE_VALUES and TEAM_MEMBERS since they're not in the constants file
type CoreValue = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number }>;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
};

// Mock data for CORE_VALUES
const CORE_VALUES: CoreValue[] = [
  {
    title: 'Student-Centric',
    description: 'We put our students at the heart of everything we do, ensuring their success is our top priority.',
    icon: Users
  },
  {
    title: 'Excellence',
    description: 'We strive for excellence in education, continuously improving our curriculum and teaching methods.',
    icon: Award
  },
  {
    title: 'Innovation',
    description: 'We embrace innovative teaching approaches and cutting-edge technologies to enhance learning.',
    icon: Globe
  },
  {
    title: 'Accessibility',
    description: 'We believe quality education should be accessible to everyone, regardless of their background.',
    icon: Target
  }
];

// Mock data for TEAM_MEMBERS
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    bio: 'Education technology expert with 15+ years of experience in the industry.'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Head of Education',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'Passionate educator with a background in curriculum development and instructional design.'
  },
  {
    id: '3',
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    bio: 'Technology leader with expertise in building scalable learning platforms.'
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'Student Success',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    bio: 'Dedicated to ensuring every student achieves their learning goals and career aspirations.'
  }
];

interface AboutPageProps {
  onNavigate: (view: ViewState) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col">

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-600 via-slate-900 to-slate-900"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            Empowering the Next Generation of <br />
            <span className="text-brand-500">Tech Leaders</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            At <span className="font-semibold">Scholastic Edu. Depot</span>, we believe that quality education is the bridge between talent and opportunity. We are on a mission to transform aspiring learners into industry-ready professionals.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-8 border-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team working together"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-[-1]"></div>
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-[-1]"></div>
            </div>

            <div>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                    <Target size={24} />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Our Mission</h2>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">
                  To provide accessible, high-quality, and practical technical education that empowers individuals to build sustainable careers in the ever-evolving technology landscape.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent-100 text-accent-600 rounded-lg">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Our Vision</h2>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">
                  To be the global standard for skills-based education, creating a world where anyone, anywhere, can acquire the skills needed to shape the future of technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              These principles guide every interaction we have with our students, partners, and each other.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {CORE_VALUES.map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-brand-50 rounded-lg text-brand-600 flex items-center justify-center mb-6">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Meet Our Leadership</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A team of passionate educators and industry veterans dedicated to your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="group text-center">
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="text-brand-600 font-medium mb-3 text-sm uppercase tracking-wide">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed px-4">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Award size={48} className="mx-auto text-yellow-500 mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Join a Community Dedicated to Excellence
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Whether you're a student, a professional, or a partner, we invite you to be part of our journey in reshaping technical education.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-brand-600 hover:bg-brand-500 border-none" onClick={() => onNavigate('courses')}>
              Explore Our Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
