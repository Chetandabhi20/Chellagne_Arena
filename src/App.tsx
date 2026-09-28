import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import NotFound from './pages/NotFound';
import { Placeholder } from './pages/Placeholder';
import { Skeleton } from './components/ui';

import Arena from './pages/Arena';

// Lazy-loaded heavy routes
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'));

export default function App() {
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
          <Route path="daily" element={<Placeholder title="Daily Commit" />} />
          <Route path="progress" element={<Placeholder title="My Progress" />} />
          <Route path="leaderboard" element={<Placeholder title="League" />} />
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          <Route path="organizer" element={<Placeholder title="Organizer" />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
