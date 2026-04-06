import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Button } from '../components/ui';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hero-mesh">
      <PublicNavbar />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-12">
        <div className="w-full surface-card p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01m8.66-2.74L13.74 4.26a2 2 0 00-3.48 0L3.34 14.26A2 2 0 005.08 17h13.84a2 2 0 001.74-2.74z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-slate-300">403</h1>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Access Denied
          </h2>
          <p className="mt-2 text-slate-600">
            You don't have permission to access this page.
          </p>
          
          <Link to="/app" className="mt-7 inline-flex">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};