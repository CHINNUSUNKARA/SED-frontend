import { Building, GraduationCap, Users, Code } from 'lucide-react';

// Notification related types
export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

// Instructor related types
export interface Instructor {
  name: string;
  role: string;
  bio: string;
  rating: number;
  students: number;
  courses: number;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
  about: string;
  experience: string;
  teachingStyle: string;
  reviews: number;
  skills: string[];
}

// Course related types
export interface Course {
  id: string | number;
  title: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  description: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
  category: string;
  price: number | string;
  lessons: number;
  icon?: string;
}

// Navigation Links
export const NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Courses', href: '#courses' },
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' }
];

// Services
export const ALL_SERVICES = [
  {
    id: 'corporate-training',
    title: 'Corporate Training',
    description: 'Customized technical training programs for your workforce.',
    icon: Building,
    features: ['Custom Curriculum', 'On-site/Remote', 'Progress Tracking'],
    caseStudies: [
      {
        title: 'Tech Corp Upskilling',
        desc: 'Trained 50+ developers in React and Node.js.',
        client: 'Tech Corp',
        outcome: '30% productivity boost'
      }
    ],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    longDescription: 'Our corporate training programs are designed to upskill your entire workforce with the latest technologies and best practices.',
    process: [
      { title: 'Assessment', desc: 'We assess your team\'s current skills and identify gaps.' },
      { title: 'Custom Curriculum', desc: 'We design a tailored training program for your needs.' },
      { title: 'Delivery', desc: 'Expert trainers deliver engaging sessions on-site or remotely.' },
      { title: 'Evaluation', desc: 'We track progress and provide detailed reports.' }
    ]
  },
  {
    id: 'university-partnership',
    title: 'University Partnership',
    description: 'Curriculum support and workshops for universities.',
    icon: GraduationCap,
    features: ['Curriculum Design', 'Guest Lectures', 'Faculty Development'],
    caseStudies: [
      {
        title: 'University Curriculum Revamp',
        desc: 'Modernized CS curriculum for 500+ students.',
        client: 'City University',
        outcome: '90% placement rate'
      }
    ],
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
    longDescription: 'Partner with us to modernize your university curriculum and provide students with industry-relevant skills.'
  },
  {
    id: 'career-mentorship',
    title: 'Career Mentorship',
    description: '1-on-1 guidance for aspiring developers.',
    icon: Users,
    features: ['Resume Review', 'Mock Interviews', 'Career Path Planning'],
    caseStudies: [
      {
        title: 'Career Switch Success',
        desc: 'Guided a marketing professional to become a frontend developer.',
        client: 'John D.',
        outcome: 'Hired at top tech firm'
      }
    ],
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop',
    longDescription: 'Get personalized career guidance from industry experts to accelerate your tech career.'
  },
  {
    id: 'industry-workshops',
    title: 'Industry Workshops & Bootcamps',
    description: 'Intensive hands-on workshops on cutting-edge technologies.',
    icon: Code,
    features: ['Latest Tech Stack', 'Real-world Projects', 'Expert Instructors'],
    caseStudies: [
      {
        title: 'AI/ML Bootcamp Success',
        desc: 'Conducted 3-day intensive bootcamp on Machine Learning for 80+ participants.',
        client: 'Tech Enthusiasts',
        outcome: '85% project completion'
      }
    ],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
    longDescription: 'Our intensive workshops and bootcamps provide hands-on experience with the latest technologies, helping you stay ahead in the rapidly evolving tech landscape.',
    process: [
      { title: 'Topic Selection', desc: 'Choose from trending technologies and frameworks.' },
      { title: 'Hands-on Sessions', desc: 'Build real projects with expert guidance.' },
      { title: 'Peer Learning', desc: 'Collaborate with fellow learners and share knowledge.' },
      { title: 'Certification', desc: 'Receive completion certificate and project portfolio.' }
    ]
  }
];

// Course Categories
export const COURSE_CATEGORIES = ['All', 'Development', 'Design', 'Business', 'Marketing'];

// FAQ Items
export const FAQ_ITEMS = [
  { question: 'What is the refund policy?', answer: 'We offer a 30-day money-back guarantee.' },
  { question: 'Do I get a certificate?', answer: 'Yes, upon completion of the course.' }
];

// Core Values
export const CORE_VALUES = [
  { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' },
  { title: 'Innovation', description: 'We embrace new technologies and teaching methods.' }
];

// Team Members
export const TEAM_MEMBERS = [
  { name: 'Alice Johnson', role: 'CEO', image: '/team/alice.jpg' },
  { name: 'Bob Smith', role: 'CTO', image: '/team/bob.jpg' }
];

// Success Stories Types
export interface SuccessStory {
  id: string;
  name: string;
  image: string;
  company: string;
  story: string;
  previousRole: string;
  role: string;
  outcome: string;
}

