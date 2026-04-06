import React from 'react';

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'h-6 w-6' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brand-mark-bg" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbeafe" />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
        <linearGradient id="brand-mark-link" x1="14" y1="24" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="40" height="40" rx="13" fill="url(#brand-mark-bg)" />
      <circle cx="15.5" cy="16" r="3.75" fill="#1d4ed8" />
      <circle cx="32.5" cy="16" r="3.75" fill="#0f766e" />

      <path
        d="M9.5 30.25C10.75 25.65 13.55 23.25 15.5 23.25C17.45 23.25 20.25 25.65 21.5 30.25"
        stroke="#1d4ed8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.5 30.25C27.75 25.65 30.55 23.25 32.5 23.25C34.45 23.25 37.25 25.65 38.5 30.25"
        stroke="#0f766e"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18.75 21.25H29.25"
        stroke="url(#brand-mark-link)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="24" cy="21.25" r="2.35" fill="#ffffff" stroke="#1e40af" strokeWidth="1.5" />
    </svg>
  );
};
