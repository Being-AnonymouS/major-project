import React, { useEffect, useState } from 'react';
import { AdminStats } from '../types/admin';
import { adminService } from '../services/adminService';
import { useToast } from '../contexts/ToastContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft`}>
    <div className={`mb-4 h-1.5 w-12 rounded-full ${color.replace('border-l-', 'bg-')}`} />
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl ${color.replace('border-l-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Failed to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm text-slate-600">Snapshot of platform health and activity.</p>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="border-l-blue-500"
          />
          <StatCard
            title="Mentors"
            value={stats.totalMentors}
            icon="🎓"
            color="border-l-green-500"
          />
          <StatCard
            title="Mentees"
            value={stats.totalMentees}
            icon="📚"
            color="border-l-purple-500"
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
            icon="⭐"
            color="border-l-yellow-500"
          />
        </div>
      </div>

      {/* Appointment Statistics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Appointment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon="📅"
            color="border-l-indigo-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedAppointments}
            icon="✅"
            color="border-l-green-500"
          />
          <StatCard
            title="Pending"
            value={stats.pendingAppointments}
            icon="⏳"
            color="border-l-orange-500"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelledAppointments}
            icon="❌"
            color="border-l-red-500"
          />
        </div>
      </div>
    </div>
  );
};