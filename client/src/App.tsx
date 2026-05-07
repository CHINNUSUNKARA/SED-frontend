import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';

// Layout
import { Header, Footer, Hero } from './components/layout';
// Common
import { WhyChooseUs, Partners, CTASection } from './components/common';
// Courses
import { TopCourses, CoursesPage } from './features/courses';
// Services
import { ServicesPage, ServiceDetailPage, Chatbot } from './features/services';
// Dashboards
import {
  AdminDashboard,
  StudentDashboard,
  InstructorDashboard,
  NotificationsPage,
} from './features/dashboard';
// Auth pages
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth';
import VerifyEmailPage from './pages/VerifyEmailPage';
// Public pages
import {
  AboutPage,
  ContactPage,
  GetStartedPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  SuccessStoriesPage,
} from './pages';
import ConnectionTestPage from './pages/ConnectionTestPage';
// Auth guard
import { ProtectedRoute } from './contexts/AuthContext';

// ---------------------------------------------------------------------------
// Legacy ViewState — kept for backward compat with component prop signatures.
// New components should use useNavigate() directly instead.
// ---------------------------------------------------------------------------
export type ViewState =
  | 'home' | 'courses' | 'services' | 'service-detail' | 'about' | 'contact'
  | 'get-started' | 'login' | 'verify-email' | 'forgot-password' | 'reset-password'
  | 'instructor' | 'admin' | 'student' | 'student-dashboard' | 'instructor-dashboard'
  | 'privacy' | 'terms' | 'success-stories' | 'notifications' | 'connection-test';

const VIEW_TO_PATH: Record<ViewState, string> = {
  home: '/',
  courses: '/courses',
  services: '/services',
  'service-detail': '/service-detail',
  about: '/about',
  contact: '/contact',
  'get-started': '/get-started',
  login: '/login',
  'verify-email': '/verify-email',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  instructor: '/instructor',
  admin: '/admin',
  student: '/student-dashboard',
  'student-dashboard': '/student-dashboard',
  'instructor-dashboard': '/instructor-dashboard',
  privacy: '/privacy',
  terms: '/terms',
  'success-stories': '/success-stories',
  notifications: '/notifications',
  'connection-test': '/connection-test',
};

function pathToView(pathname: string): ViewState {
  const match = Object.entries(VIEW_TO_PATH).find(([, p]) => p === pathname);
  return (match?.[0] ?? 'home') as ViewState;
}

/** Bridge hook: converts a ViewState string to a real navigation call. */
function useNavigateTo(): (view: ViewState) => void {
  const navigate = useNavigate();
  return (view) => navigate(VIEW_TO_PATH[view] ?? '/');
}

// ---------------------------------------------------------------------------
// Layout wrappers — each renders <Outlet /> for its child routes
// ---------------------------------------------------------------------------

/** Standard public layout: Header + main content + Footer + Chatbot. */
const PublicLayout: React.FC = () => {
  const navigateTo = useNavigateTo();
  const { pathname } = useLocation();
  return (
    <>
      <Header onNavigate={navigateTo} currentView={pathToView(pathname)} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer onNavigate={navigateTo} />
      <Chatbot />
    </>
  );
};

/** Auth layout: no header/footer, minimal mobile logo strip. */
const AuthLayout: React.FC = () => {
  const navigateTo = useNavigateTo();
  return (
    <>
      <div className="absolute top-0 left-0 w-full p-6 z-50 lg:hidden">
        <div className="flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            className="text-2xl font-display font-bold text-brand-600 tracking-tight"
          >
            SED<span className="text-slate-800">.</span>
          </a>
          <button
            onClick={() => navigateTo('home')}
            className="text-slate-500 hover:text-slate-900"
          >
            Back to Home
          </button>
        </div>
      </div>
      <main className="flex-grow">
        <Outlet />
      </main>
    </>
  );
};

/** Dashboard layout: full-screen, no public chrome. */
const DashboardLayout: React.FC = () => (
  <main className="flex-grow">
    <Outlet />
  </main>
);

// ---------------------------------------------------------------------------
// Route-level page components
// ---------------------------------------------------------------------------

const HomePage: React.FC = () => {
  const navigateTo = useNavigateTo();
  return (
    <>
      <Hero onNavigate={navigateTo} />
      <TopCourses onNavigate={navigateTo} onViewInstructor={() => {}} />
      <WhyChooseUs />
      <Partners />
      <CTASection onNavigate={navigateTo} />
    </>
  );
};

/** Reads the serviceId passed via React Router navigation state. */
const ServiceDetailRoute: React.FC = () => {
  const { state } = useLocation();
  const navigateTo = useNavigateTo();
  return <ServiceDetailPage serviceId={state?.serviceId ?? ''} onNavigate={navigateTo} />;
};

const ServicesRoute: React.FC = () => {
  const navigate = useNavigate();
  const navigateTo = useNavigateTo();
  return (
    <ServicesPage
      onNavigate={navigateTo}
      onViewService={(id) => navigate('/service-detail', { state: { serviceId: id } })}
    />
  );
};

// ---------------------------------------------------------------------------
// App — single source of truth for all routes
// ---------------------------------------------------------------------------
const App: React.FC = () => (
  <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
    <Routes>
      {/* Standalone — email verification has its own full-page layout */}
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Auth routes — minimal chrome, no header/footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login"            element={<LoginPage           onNavigate={function useNav() { const n = useNavigateTo(); return n; }()} />} />
        <Route path="/get-started"      element={<GetStartedPageRoute />} />
        <Route path="/forgot-password"  element={<ForgotPasswordRoute />} />
        <Route path="/reset-password"   element={<ResetPasswordRoute />} />
      </Route>

      {/* Dashboard routes — protected, full-screen, role-gated */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/admin"
          element={
              <AdminDashboardRoute />
          }
        />
        <Route
          path="/student-dashboard"
          element={
              <StudentDashboardRoute />
          }
        />
        <Route
          path="/instructor-dashboard"
          element={
              <InstructorDashboardRoute />
          }
        />
      </Route>

      {/* Public routes — standard header + footer */}
      <Route element={<PublicLayout />}>
        <Route index                    element={<HomePage />} />
        <Route path="/courses"          element={<CoursesRoute />} />
        <Route path="/services"         element={<ServicesRoute />} />
        <Route path="/service-detail"   element={<ServiceDetailRoute />} />
        <Route path="/about"            element={<AboutRoute />} />
        <Route path="/contact"          element={<ContactRoute />} />
        <Route path="/privacy"          element={<PrivacyRoute />} />
        <Route path="/terms"            element={<TermsRoute />} />
        <Route path="/success-stories"  element={<SuccessStoriesRoute />} />
        <Route path="/connection-test"  element={<ConnectionTestPage />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsRoute />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default App;

// ---------------------------------------------------------------------------
// Thin route wrappers — keep JSX in App readable; each just injects navigateTo
// ---------------------------------------------------------------------------
const CoursesRoute          = () => { const n = useNavigateTo(); return <CoursesPage onNavigate={n} onViewInstructor={() => {}} />; };
const AboutRoute            = () => { const n = useNavigateTo(); return <AboutPage onNavigate={n} />; };
const ContactRoute          = () => <ContactPage />;
const PrivacyRoute          = () => { const n = useNavigateTo(); return <PrivacyPolicyPage onNavigate={n} />; };
const TermsRoute            = () => { const n = useNavigateTo(); return <TermsOfServicePage onNavigate={n} />; };
const SuccessStoriesRoute   = () => { const n = useNavigateTo(); return <SuccessStoriesPage onNavigate={n} />; };
const NotificationsRoute    = () => { const n = useNavigateTo(); return <NotificationsPage onNavigate={n} />; };
const GetStartedPageRoute   = () => { const n = useNavigateTo(); return <GetStartedPage onNavigate={n} />; };
const ForgotPasswordRoute   = () => { const n = useNavigateTo(); return <ForgotPasswordPage onNavigate={n} />; };
const ResetPasswordRoute    = () => { const n = useNavigateTo(); return <ResetPasswordPage onNavigate={n} />; };
const AdminDashboardRoute   = () => { const n = useNavigateTo(); return <AdminDashboard onNavigate={n} />; };
const StudentDashboardRoute = () => { const n = useNavigateTo(); return <StudentDashboard onNavigate={n} />; };
const InstructorDashboardRoute = () => { const n = useNavigateTo(); return <InstructorDashboard onNavigate={n} />; };
