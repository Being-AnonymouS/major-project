import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { useMessaging } from '../hooks/useMessaging';
import { BrandMark } from './BrandMark';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const { totalUnreadCount, loadConversations, refreshConversations } = useMessaging();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const conversationsLoadedRef = useRef(false);

  // Load conversations on mount to get unread counts
  useEffect(() => {
    // Only load conversations once when user is authenticated
    if (user && !conversationsLoadedRef.current) {
      conversationsLoadedRef.current = true;
      loadConversations();
    } else if (!user) {
      conversationsLoadedRef.current = false;
    }
  }, [user, loadConversations]);

  const handleLogout = async () => {
    await logout();
    success('Logged out', 'You have been successfully logged out.');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMessagesClick = () => {
    // Refresh conversations when navigating to messages to update badge
    refreshConversations();
    closeMobileMenu(); // Also close mobile menu if open
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.5rem] justify-between">
            <div className="flex items-center">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-brand-50">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <BrandMark className="h-4 w-4" />
                </span>
                <span className="font-display text-xl font-semibold tracking-tight text-slate-900">Mentor Connect</span>
              </Link>
            </div>
            
            {user && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden items-center space-x-1 md:flex">
                  <Link
                    to="/app/profile"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Profile
                  </Link>
                  {user.role !== 'ADMIN' && (
                    <Link
                      to="/app/appointments"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Appointments
                    </Link>
                  )}
                  {user.role !== 'ADMIN' && (
                    <Link
                      to="/app/messages"
                      onClick={handleMessagesClick}
                      className="relative rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Messages
                      {totalUnreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-brand-600 px-1.5 py-1 text-[10px] font-bold leading-none text-white shadow-crisp animate-pulse-slow">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {user.role === 'MENTEE' && (
                    <Link
                      to="/app/mentors"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Find Mentors
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/app/admin"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="ml-2 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/85 px-3 py-1.5">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs font-medium text-slate-500 capitalize">
                        {user.role?.toLowerCase() || 'user'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-200/70 hover:text-slate-900"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={toggleMobileMenu}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
                    aria-expanded={isMobileMenuOpen}
                  >
                    <span className="sr-only">Open main menu</span>
                    {!isMobileMenuOpen ? (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {user && isMobileMenuOpen && (
            <div className="md:hidden animate-fade-in pb-3">
              <div className="app-shell mt-2 space-y-1.5 px-2.5 py-3 sm:px-3">
                <div className="mb-1 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
                  <div className="text-base font-semibold text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500 capitalize">
                    {user.role?.toLowerCase() || 'user'}
                  </div>
                </div>
                
                <Link
                  to="/app/profile"
                  className="mobile-nav-item"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                {user.role !== 'ADMIN' && (
                  <Link
                    to="/app/appointments"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Appointments
                  </Link>
                )}
                {user.role !== 'ADMIN' && (
                  <Link
                    to="/app/messages"
                    className="mobile-nav-item flex items-center justify-between"
                    onClick={() => {
                      handleMessagesClick();
                      closeMobileMenu();
                    }}
                  >
                    <span>Messages</span>
                    {totalUnreadCount > 0 && (
                      <span className="inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-brand-600 px-1.5 py-1 text-[10px] font-bold leading-none text-white">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {user.role === 'MENTEE' && (
                  <Link
                    to="/app/mentors"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Find Mentors
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/app/admin"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="mobile-nav-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};