import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
      {/* Accessible skip link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent operational header */}
      <AppHeader />

      {/* Main content viewport */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Operational footer */}
      <footer className="border-t border-border-subtle bg-surface text-ink-secondary py-5 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Nagarkot Forwarders Pvt. Ltd. &bull; Consignment Status Tracking System
          </span>
          <span className="text-ink-muted">
            Batch 1 Foundation Active &bull; Operations v1.0
          </span>
        </div>
      </footer>
    </div>
  );
};
