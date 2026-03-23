import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import * as ReactRouterDOM from 'react-router-dom';

// Layout Components
import { Header, Footer, Hero } from './components/layout';

// Common Components
import { WhyChooseUs, Partners, CTASection } from './components/common';

// Features
import { TopCourses, CoursesPage } from './features/courses';
import { ServicesPage, ServiceDetailPage, Chatbot } from './features/services';
import { AdminDashboard, StudentDashboard, InstructorDashboard, NotificationsPage } from './features/dashboard';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth';

// Pages
import { AboutPage, ContactPage, GetStartedPage, PrivacyPolicyPage, TermsOfServicePage, SuccessStoriesPage } from './pages';
import ConnectionTestPage from './pages/ConnectionTestPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

export type ViewState =
  | 'home'
  | 'courses'
  | 'services'
  | 'service-detail'
  | 'about'
  | 'contact'
  | 'get-started'
  | 'login'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password'
  | 'admin'
  | 'student-dashboard'
  | 'instructor-dashboard'
  | 'privacy'
  | 'terms'
  | 'success-stories'
  | 'notifications'
  | 'connection-test';

// Home Page
const HomePage = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
  <>
    <Hero onNavigate={onNavigate} />
    <TopCourses onNavigate={onNavigate} onViewInstructor={() => { }} />
    <WhyChooseUs />
    <Partners />
    <CTASection onNavigate={onNavigate} />
  </>
);

const App: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();

  const getViewFromPath = (path: string): ViewState => {
    if (path === '/') return 'home';
    if (path.startsWith('/verify-email')) return 'verify-email';

    const cleanPath = path.substring(1);

    const validViews: ViewState[] = [
      'courses', 'services', 'service-detail', 'about', 'contact',
      'get-started', 'login', 'forgot-password', 'reset-password',
      'admin', 'student-dashboard', 'instructor-dashboard',
      'privacy', 'terms', 'success-stories',
      'notifications', 'connection-test'
    ];

    if (validViews.includes(cleanPath as ViewState)) {
      return cleanPath as ViewState;
    }

    return 'home';
  };

  const getPathFromView = (view: ViewState): string => {
    if (view === 'home') return '/';
    return `/${view}`;
  };

  const [currentView, setCurrentView] = useState<ViewState>(() => getViewFromPath(location.pathname));
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  useEffect(() => {
    const newView = getViewFromPath(location.pathname);
    if (newView !== currentView) {
      setCurrentView(newView);
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const handleNavigate = (view: ViewState) => {
    if (view !== currentView) {
      navigate(getPathFromView(view));
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">

      <Routes>

        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        <Route
          path="/*"
          element={
            <>
              {/* HEADER */}
              {!['get-started', 'login', 'forgot-password', 'reset-password'].includes(currentView) &&
                !['admin', 'student-dashboard', 'instructor-dashboard'].includes(currentView) &&
                <Header onNavigate={handleNavigate} currentView={currentView} />}

              {/* MOBILE HEADER */}
              {['get-started', 'login', 'forgot-password', 'reset-password'].includes(currentView) && (
                <div className="absolute top-0 left-0 w-full p-6 z-50 lg:hidden">
                  <div className="flex items-center justify-between">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('home'); }}>
                      SED
                    </a>
                    <button onClick={() => handleNavigate('home')}>
                      Back
                    </button>
                  </div>
                </div>
              )}

              <main className="flex-grow">

                {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
                {currentView === 'courses' && <CoursesPage onNavigate={handleNavigate} onViewInstructor={() => { }} />}
                {currentView === 'services' && <ServicesPage onNavigate={handleNavigate} onViewService={(id) => { setSelectedServiceId(id); handleNavigate('service-detail'); }} />}
                {currentView === 'service-detail' && <ServiceDetailPage serviceId={selectedServiceId} onNavigate={handleNavigate} />}
                {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}
                {currentView === 'contact' && <ContactPage />}
                {currentView === 'get-started' && <GetStartedPage onNavigate={handleNavigate} />}
                {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
                {currentView === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
                {currentView === 'reset-password' && <ResetPasswordPage onNavigate={handleNavigate} />}

                {/* ✅ FIXED DASHBOARDS */}
                {currentView === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
                {currentView === 'student-dashboard' && <StudentDashboard onNavigate={handleNavigate} />}
                {currentView === 'instructor-dashboard' && <InstructorDashboard onNavigate={handleNavigate} />}

                {currentView === 'privacy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
                {currentView === 'terms' && <TermsOfServicePage onNavigate={handleNavigate} />}
                {currentView === 'success-stories' && <SuccessStoriesPage onNavigate={handleNavigate} />}
                {currentView === 'notifications' && <NotificationsPage onNavigate={handleNavigate} />}
                {currentView === 'connection-test' && <ConnectionTestPage />}

              </main>

              {/* FOOTER */}
              {!['get-started', 'login', 'forgot-password', 'reset-password'].includes(currentView) &&
                !['admin', 'student-dashboard', 'instructor-dashboard'].includes(currentView) &&
                <Footer onNavigate={handleNavigate} />}

              {!['admin', 'student-dashboard', 'instructor-dashboard'].includes(currentView) && <Chatbot />}
            </>
          }
        />

      </Routes>
    </div>
  );
};

export default App;