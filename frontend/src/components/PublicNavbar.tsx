import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BrandMark } from './BrandMark';
import { Button } from './ui/Button';

export const PublicNavbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-brand-50/70">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 bg-brand-100/80">
            <BrandMark className="h-6 w-6" />
          </span>
          <span className="font-display text-xl font-semibold text-slate-900">Mentor Connect</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/app">
              <Button className="px-4">Open app</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="px-4">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button className="px-4">Create account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
