import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Box, Plus, LayoutDashboard } from 'lucide-react';

export const AppHeader: React.FC = () => {
  return (
    <header className="bg-brand-900 text-white shadow-sm sticky top-0 z-40 border-b border-brand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link
          to="/shipments"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 rounded p-1"
          aria-label="Nagarkot Shipment Operations Home"
        >
          <div className="w-9 h-9 rounded bg-brand-700 border border-brand-600 flex items-center justify-center text-white shrink-0 group-hover:bg-brand-600 transition-colors">
            <Box className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm sm:text-base leading-tight uppercase">
              Nagarkot
            </span>
            <span className="text-[11px] text-brand-300 font-medium tracking-wide">
              Shipment Operations
            </span>
          </div>
        </Link>

        {/* Navigation actions */}
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main Navigation">
          <NavLink
            to="/shipments"
            end
            className={({ isActive }) => `
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200
              ${
                isActive
                  ? 'bg-brand-800 text-white border border-brand-700'
                  : 'text-brand-200 hover:text-white hover:bg-brand-800/60'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/shipments/new"
            className={({ isActive }) => `
              inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200
              ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-brand-700 hover:bg-brand-600 text-white shadow-sm'
              }
            `}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>New Shipment</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
