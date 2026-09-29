import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import NotFound from './pages/NotFound';
import { Placeholder } from './pages/Placeholder';
import { Skeleton } from './components/ui';
import { useStore } from './store/useStore';

import Arena from './pages/Arena';
import League from './pages/League';
import Progress from './pages/Progress';

// Lazy-loaded heavy routes
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'));
const DailyCommit = lazy(() => import('./pages/DailyCommit'));

export default function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Arena />} />
          <Route
            path="challenges/:slug"
            element={
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <ChallengeDetail />
              </Suspense>
            }
          />
          <Route path="daily" element={<Suspense fallback={<Skeleton className="h-96 w-full" />}><DailyCommit /></Suspense>} />
          <Route path="progress" element={<Progress />} />
          <Route path="leaderboard" element={<League />} />
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          <Route path="organizer" element={<Placeholder title="Organizer" />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
