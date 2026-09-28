import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import Dev from './pages/Dev';
import NotFound from './pages/NotFound';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Placeholder title="Arena" />} />
          <Route path="daily" element={<Placeholder title="Daily Commit" />} />
          <Route path="progress" element={<Placeholder title="My Progress" />} />
          <Route path="leaderboard" element={<Placeholder title="League" />} />
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          <Route path="organizer" element={<Placeholder title="Organizer" />} />
          <Route path="dev" element={<Dev />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
