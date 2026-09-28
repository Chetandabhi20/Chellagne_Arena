import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { NextActionBar } from './NextActionBar';
import { StatusLine } from './StatusLine';
import { TabBar } from './TabBar';
import { ToastContainer } from '../ui/Toast';

export const Shell = () => {
  return (
    <div className="min-h-screen flex flex-col pb-14 md:pb-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-panel p-4 border border-border">Skip to content</a>
      <Header />
      <NextActionBar />
      <main id="main" className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
      <StatusLine />
      <TabBar />
      <ToastContainer />
    </div>
  );
};
