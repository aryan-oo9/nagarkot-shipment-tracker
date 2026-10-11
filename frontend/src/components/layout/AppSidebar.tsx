import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Box, LayoutDashboard, PackagePlus, History, X } from 'lucide-react';

export interface AppSidebarProps {
  onNavClick?: () => void;
  isMobile?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onNavClick, isMobile }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isHistoryView =
    location.pathname === '/shipments' && searchParams.get('view') === 'history';
  const isHomeView =
    (location.pathname === '/shipments' || location.pathname === '/') && !isHistoryView;
  const isCreateView = location.pathname === '/shipments/new';

  return (
    <div className="flex flex-col h-full bg-surface select-none">
      {/* 1. Brand Area */}
      <div className="h-16 px-5 border-b border-border-subtle flex items-center justify-between shrink-0">
        <Link
          to="/"
          onClick={onNavClick}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-md p-1 -ml-1 transition-colors"
          aria-label="Nagarkot Shipment Operations Home"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-800 transition-colors shrink-0">
            <Box className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-ink-primary tracking-wider leading-tight uppercase font-mono">
              Nagarkot
            </span>
            <span className="text-[11px] text-ink-muted font-medium tracking-normal leading-tight">
              Shipment Operations
            </span>
          </div>
        </Link>

        {isMobile && onNavClick && (
          <button
            type="button"
            onClick={onNavClick}
            className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* 2. Navigation Section */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        {/* Entry 1: Home */}
        <Link
          to="/"
          onClick={onNavClick}
          className={`
            flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700
            ${
              isHomeView
                ? 'bg-brand-50 text-brand-800 font-semibold shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas'
            }
          `}
          aria-current={isHomeView ? 'page' : undefined}
        >
          <LayoutDashboard
            className={`w-4 h-4 shrink-0 ${isHomeView ? 'text-brand-700' : 'text-ink-muted'}`}
            aria-hidden="true"
          />
          <span>Home</span>
        </Link>

        {/* Entry 2: Create Shipment (Slightly more prominent) */}
        <Link
          to="/shipments/new"
          onClick={onNavClick}
          className={`
            flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all border
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700
            ${
              isCreateView
                ? 'bg-brand-50 text-brand-800 border-brand-200 font-semibold shadow-xs'
                : 'border-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas'
            }
          `}
          aria-current={isCreateView ? 'page' : undefined}
        >
          <div
            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
              isCreateView ? 'bg-brand-700 text-white' : 'bg-canvas text-brand-700 border border-border-subtle'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="font-semibold">Create Shipment</span>
        </Link>

        {/* Entry 3: History */}
        <Link
          to="/shipments?view=history"
          onClick={onNavClick}
          className={`
            flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700
            ${
              isHistoryView
                ? 'bg-brand-50 text-brand-800 font-semibold shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas'
            }
          `}
          aria-current={isHistoryView ? 'page' : undefined}
        >
          <History
            className={`w-4 h-4 shrink-0 ${isHistoryView ? 'text-brand-700' : 'text-ink-muted'}`}
            aria-hidden="true"
          />
          <span>History</span>
        </Link>
      </nav>

      {/* 3. Sidebar Bottom Static Footer */}
      <div className="border-t border-border-subtle p-3.5 shrink-0 bg-surface">
        <span className="block text-[11px] font-semibold text-ink-secondary truncate">
          Nagarkot Forwarders Pvt. Ltd.
        </span>
        <span className="block text-[10px] text-ink-muted truncate">
          Shipment Status Tracker
        </span>
      </div>
    </div>
  );
};
