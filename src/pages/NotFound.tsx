import { usePageTitle } from '../hooks';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
  usePageTitle('Not Found');
  const location = useLocation();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-mono font-bold text-danger mb-4">404</h1>
      <p className="text-muted font-mono mb-8">fatal: pathspec '{location.pathname}' did not match any files</p>
      <Link to="/" className="text-accent hover:underline font-mono">git checkout main</Link>
    </div>
  );
}
