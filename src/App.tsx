import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProgressProvider } from '@/data/progress';
import { useTheme } from '@/lib/hooks';
import { Dashboard } from '@/pages/Dashboard';
import { DashboardEmpty } from '@/pages/DashboardEmpty';
import { Subject } from '@/pages/Subject';
import { Module } from '@/pages/Module';
import { Lesson } from '@/pages/Lesson';
import { Quiz } from '@/pages/Quiz';
import { Complete } from '@/pages/Complete';
import { Streak } from '@/pages/Streak';
import { Retry } from '@/pages/Retry';
import { FlowMap } from '@/pages/FlowMap';

const TITLES: Record<string, string> = {
  '/': 'Dashboard', '/welcome': 'Welcome', '/module': 'Data Structures in Python', '/lesson': 'Binary search trees',
  '/quiz': 'Quick check', '/complete': 'Lesson complete', '/streak': 'Streak', '/retry': 'Try a different way', '/flow': 'User flow',
};

/* New page: scroll to the top and name it, so screen readers announce where they landed. */
function PageChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${TITLES[pathname] ?? 'Course'} · Learnova`;
  }, [pathname]);
  return null;
}

function Frame() {
  const { theme } = useTheme();
  return (
    <>
      <PageChange />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/welcome" element={<DashboardEmpty />} />
        <Route path="/course/:id" element={<Subject />} />
        <Route path="/module" element={<Module />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/streak" element={<Streak />} />
        <Route path="/retry" element={<Retry />} />
        <Route path="/flow" element={<FlowMap />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme={theme} position="bottom-center" toastOptions={{ className: 'ln-toast' }} />
    </>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Frame />
        </BrowserRouter>
      </MotionConfig>
    </ProgressProvider>
  );
}
