import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Menu } from 'lucide-react';
import { AppSidebar } from './AppSidebar';

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
      {/* Accessible skip link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 1. Desktop Fixed Left Sidebar (>=768px) */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[240px] h-screen bg-surface border-r border-border-subtle z-30"
        aria-label="Sidebar Navigation"
      >
        <AppSidebar />
      </aside>

      {/* 2. Mobile Compact Top Bar (<768px) */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-border-subtle sticky top-0 z-30">
        <Link
          to="/shipments"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded p-1"
          aria-label="Nagarkot Shipment Operations Home"
        >
          <div className="w-7 h-7 rounded-md bg-brand-700 flex items-center justify-center text-white shrink-0">
            <Box className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="font-bold text-sm tracking-wider uppercase font-mono text-ink-primary">
            Nagarkot
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* 3. Mobile Slide-out Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 w-[240px] max-w-[80vw] bg-surface shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            <AppSidebar isMobile onNavClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 4. Main Area (Offset on desktop to sit to the right of the fixed sidebar) */}
      <div className="md:pl-[240px] flex flex-col flex-1 min-w-0">
        {/* Main content viewport */}
        <main
          id="main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
