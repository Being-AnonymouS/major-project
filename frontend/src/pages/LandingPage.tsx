import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PublicNavbar } from '../components/PublicNavbar';
import { Button } from '../components/ui/Button';

const demoCredentials = [
  {
    role: 'Admin',
    accounts: [
      'admin@mentorconnect.com / admin123',
      'support@mentorconnect.com / admin123',
    ],
  },
  {
    role: 'Mentor',
    accounts: [
      'john.doe@techcorp.com / mentor123',
      'sarah.wilson@datatech.ai / mentor123',
    ],
  },
  {
    role: 'Mentee',
    accounts: [
      'alice.johnson@university.edu / mentee123',
      'priya.patel@bootcamp.tech / mentee123',
    ],
  },
];

const highlightCards = [
  {
    title: 'Smart Mentor Discovery',
    description: 'Filter mentors by expertise and find the right match for your goals in minutes.',
  },
  {
    title: 'Structured Session Flow',
    description: 'Request, accept, schedule, message, and rate sessions from one clean dashboard.',
  },
  {
    title: 'Built-In Real-Time Chat',
    description: 'Discuss preparation and follow-ups instantly with secure appointment-based chat.',
  },
];

const MentorshipIllustration: React.FC = () => {
  return (
    <svg
      viewBox="0 0 620 460"
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-bg" x1="90" y1="70" x2="530" y2="390" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbeafe" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="hero-link" x1="176" y1="234" x2="444" y2="234" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>

      <rect x="70" y="48" width="480" height="350" rx="42" fill="url(#hero-bg)" />

      <g className="animate-float-soft">
        <circle cx="188" cy="188" r="44" fill="#bfdbfe" />
        <circle cx="188" cy="176" r="18" fill="#1d4ed8" />
        <path d="M142 250C151 218 172 205 188 205C204 205 225 218 234 250" fill="#1d4ed8" />
        <rect x="132" y="276" width="112" height="68" rx="16" fill="#eff6ff" />
        <text x="188" y="315" fill="#1e3a8a" fontSize="16" fontWeight="700" textAnchor="middle">Mentor</text>
      </g>

      <g className="animate-float-soft-delayed">
        <circle cx="432" cy="188" r="44" fill="#bae6fd" />
        <circle cx="432" cy="176" r="18" fill="#0f766e" />
        <path d="M386 250C395 218 416 205 432 205C448 205 469 218 478 250" fill="#0f766e" />
        <rect x="376" y="276" width="112" height="68" rx="16" fill="#ecfeff" />
        <text x="432" y="315" fill="#115e59" fontSize="16" fontWeight="700" textAnchor="middle">Mentee</text>
      </g>

      <path
        d="M236 220C282 194 338 194 384 220"
        stroke="url(#hero-link)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="260"
        strokeDashoffset="260"
        className="animate-draw-path"
      />

      <circle cx="310" cy="207" r="14" fill="#ffffff" stroke="#1e40af" strokeWidth="3" />
      <path d="M304 207L308 211L316 203" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      <g>
        <rect x="258" y="94" width="106" height="44" rx="14" fill="#ffffff" opacity="0.95" />
        <text x="311" y="120" fill="#334155" fontSize="14" textAnchor="middle" fontWeight="700">Goal Plan</text>
      </g>
    </svg>
  );
};

export const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface-card flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-700">
          <span className="spinner"></span>
          Preparing Mentor Connect...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-hero-mesh text-slate-800">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Modern Mentorship Platform
            </span>
            <h1 className="text-balance text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Learn faster with mentors who guide you from plan to progress.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Mentor Connect helps mentors and mentees collaborate through structured appointments, real-time chat,
              and transparent feedback, all in one focused workspace.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="px-6">Start with a new account</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-6">Use demo login</Button>
              </Link>
            </div>
          </div>

          <div className="surface-card overflow-hidden p-4 sm:p-6">
            <MentorshipIllustration />
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlightCards.map((card) => (
            <article key={card.title} className="surface-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 surface-card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Quick Demo Credentials</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use these accounts on the login page, or create a new account to test your own flow.
              </p>
            </div>
            <Link to="/login" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Go to login
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoCredentials.map((group) => (
              <article key={group.role} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{group.role}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {group.accounts.map((account) => (
                    <li key={account} className="rounded-xl bg-slate-50 px-3 py-2 font-medium">{account}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
