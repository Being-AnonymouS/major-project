import React, { useEffect, useState } from 'react';
import { Appointment } from '../types/appointment';
import { AdminAppointmentFilters, PaginatedResponse } from '../types/admin';
import { adminService } from '../services/adminService';
import { useToast } from '../contexts/ToastContext';

interface AdminAppointmentTableProps {
  onAppointmentAction?: (appointmentId: string, action: string) => void;
}

export const AdminAppointmentTable: React.FC<AdminAppointmentTableProps> = ({ onAppointmentAction }) => {
  const [appointments, setAppointments] = useState<PaginatedResponse<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminAppointmentFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    appointmentId: string;
    action: string;
    mentorName: string;
    menteeName: string;
  }>({ show: false, appointmentId: '', action: '', mentorName: '', menteeName: '' });
  const { success, error } = useToast();

  const fetchAppointments = async (page: number = 1, newFilters: AdminAppointmentFilters = {}) => {
    try {
      setLoading(true);
      const data = await adminService.getAppointments(page, 10, newFilters);
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage, filters);
  }, [currentPage, filters]); // fetchAppointments is recreated on every render, so we don't include it

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof AdminAppointmentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAppointmentAction = async (appointmentId: string, action: string) => {
    try {
      if (action === 'cancel') {
        await adminService.cancelAppointment(appointmentId);
        success('Appointment cancelled successfully');
      }
      
      // Refresh the appointment list
      fetchAppointments(currentPage, filters);
      onAppointmentAction?.(appointmentId, action);
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err);
      error(`Failed to ${action} appointment`);
    }
    setShowConfirmDialog({ 
      show: false, 
      appointmentId: '', 
      action: '', 
      mentorName: '', 
      menteeName: '' 
    });
  };

  const confirmAction = (
    appointmentId: string, 
    action: string, 
    mentorName: string, 
    menteeName: string
  ) => {
    setShowConfirmDialog({ show: true, appointmentId, action, mentorName, menteeName });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !appointments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Appointment Management</h3>
        
        {/* Filters and Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-soft">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label htmlFor="search" className="mb-1 block text-sm font-semibold text-slate-700">
                Search Appointments
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by mentor or mentee name..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                id="status"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Status</option>
                <option value="REQUESTED">Requested</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateFrom" className="mb-1 block text-sm font-semibold text-slate-700">
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" className="mb-1 block text-sm font-semibold text-slate-700">
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-crisp transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Appointments Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Mentor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Mentee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments?.data && appointments.data.length > 0 ? (
                  appointments.data.map((appointment) => (
                    <tr key={appointment.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatDateTime(appointment.datetime)}
                        </div>
                        <div className="text-sm text-slate-500">
                          ID: {appointment.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {appointment.mentor.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {appointment.mentor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {appointment.mentee.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {appointment.mentee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(appointment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                          <button
                            onClick={() => confirmAction(
                              appointment.id, 
                              'cancel', 
                              appointment.mentor.name, 
                              appointment.mentee.name
                            )}
                            className="rounded-lg px-2 py-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        )}
                        {(appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') && (
                          <span className="text-slate-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                )
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {appointments && appointments.totalPages > 1 && (
            <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(appointments.totalPages, currentPage + 1))}
                  disabled={currentPage === appointments.totalPages}
                  className="ml-3 relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, appointments.total)}
                    </span>{' '}
                    of <span className="font-medium">{appointments.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(appointments.totalPages, currentPage + 1))}
                      disabled={currentPage === appointments.totalPages}
                      className="relative inline-flex items-center rounded-r-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog.show && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-slate-900/45 backdrop-blur-[2px]">
          <div className="relative top-20 mx-auto w-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Confirm Appointment Cancellation
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-slate-500">
                  Are you sure you want to cancel the appointment between{' '}
                  <strong>{showConfirmDialog.mentorName}</strong> and{' '}
                  <strong>{showConfirmDialog.menteeName}</strong>?
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowConfirmDialog({ 
                    show: false, 
                    appointmentId: '', 
                    action: '', 
                    mentorName: '', 
                    menteeName: '' 
                  })}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAppointmentAction(showConfirmDialog.appointmentId, showConfirmDialog.action)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};