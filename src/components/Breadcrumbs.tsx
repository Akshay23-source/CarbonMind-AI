import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/' || pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 py-3 px-1 text-xs text-slate-400 dark:text-zinc-550 font-sans tracking-wide">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-655 dark:hover:text-zinc-350 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = value.replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3.5 w-3.5" />
            {last ? (
              <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-655 dark:hover:text-zinc-350 transition-colors capitalize"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
