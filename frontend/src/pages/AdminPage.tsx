import React, { useState } from 'react';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminUserTable } from '../components/AdminUserTable';
import { AdminAppointmentTable } from '../components/AdminAppointmentTable';

type AdminTab = 'dashboard' | 'users' | 'appointments';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard' },
    { id: 'users' as AdminTab, label: 'Users' },
    { id: 'appointments' as AdminTab, label: 'Appointments' },
  ];

  const handleUserAction = (_userId: string, _action: string) => {
    // Hook for future telemetry/analytics integrations.
  };

  return (
    <div className="py-2 sm:py-4">
      <div className="mx-auto max-w-7xl px-0">
        {/* Header */}
        <div className="surface-card mb-6 p-6 sm:p-7">
          <h1 className="section-heading text-2xl sm:text-3xl">Admin Panel</h1>
          <p className="section-subheading">
            Manage users, appointments, and monitor platform statistics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="surface-card p-2">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-crisp'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="surface-card">
          <div className="p-6">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <AdminUserTable onUserAction={handleUserAction} />}
            {activeTab === 'appointments' && <AdminAppointmentTable />}
          </div>
        </div>
      </div>
    </div>
  );
};