import { usePageTitle } from '../hooks';

export const Placeholder = ({ title }: { title: string }) => {
  usePageTitle(title);
  return (
    <div className="py-12">
      <h1 className="text-3xl font-mono font-bold mb-4">{title}</h1>
      <p className="text-muted">This page is a placeholder.</p>
    </div>
  );
};
