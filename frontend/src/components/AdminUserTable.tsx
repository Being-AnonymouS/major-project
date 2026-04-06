import React, { useEffect, useState } from 'react';
import { UserListItem, AdminUserFilters, PaginatedResponse } from '../types/admin';
import { adminService } from '../services/adminService';
import { useToast } from '../contexts/ToastContext';

interface AdminUserTableProps {
  onUserAction?: (userId: string, action: string) => void;
}

export const AdminUserTable: React.FC<AdminUserTableProps> = ({ onUserAction }) => {
  const [users, setUsers] = useState<PaginatedResponse<UserListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    userId: string;
    action: string;
    userName: string;
  }>({ show: false, userId: '', action: '', userName: '' });
  const { success, error } = useToast();

  const fetchUsers = async (page: number = 1, newFilters: AdminUserFilters = {}) => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(page, 10, newFilters);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, filters);
  }, [currentPage, filters]); // fetchUsers is recreated on every render, so we don't include it

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof AdminUserFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'suspend') {
        await adminService.updateUserStatus(userId, { status: 'SUSPENDED' });
        success('User suspended successfully');
      } else if (action === 'activate') {
        await adminService.updateUserStatus(userId, { status: 'ACTIVE' });
        success('User activated successfully');
      } else if (action === 'delete') {
        await adminService.deleteUser(userId);
        success('User deleted successfully');
      }
      
      // Refresh the user list
      fetchUsers(currentPage, filters);
      onUserAction?.(userId, action);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      error(`Failed to ${action} user`);
    }
    setShowConfirmDialog({ show: false, userId: '', action: '', userName: '' });
  };

  const confirmAction = (userId: string, action: string, userName: string) => {
    setShowConfirmDialog({ show: true, userId, action, userName });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MENTOR':
        return 'bg-green-100 text-green-800';
      case 'MENTEE':
        return 'bg-blue-100 text-blue-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !users) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">User Management</h3>
        
        {/* Filters and Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-soft">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label htmlFor="search" className="mb-1 block text-sm font-semibold text-slate-700">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-semibold text-slate-700">
                Role
              </label>
              <select
                id="role"
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Roles</option>
                <option value="MENTOR">Mentor</option>
                <option value="MENTEE">Mentee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="mb-1 block text-sm font-semibold text-slate-700">
                Sort By
              </label>
              <select
                id="sortBy"
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="createdAt">Date Joined</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="appointmentCount">Appointments</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-crisp transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Joined
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
                      Loading users...
                    </td>
                  </tr>
                ) : users?.data && users.data.length > 0 ? (
                  users.data.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.appointmentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => confirmAction(user.id, 'suspend', user.name)}
                        className="rounded-lg px-2 py-1 text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-800"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => confirmAction(user.id, 'activate', user.name)}
                        className="rounded-lg px-2 py-1 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => confirmAction(user.id, 'delete', user.name)}
                        className="rounded-lg px-2 py-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users && users.totalPages > 1 && (
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
                  onClick={() => setCurrentPage(Math.min(users.totalPages, currentPage + 1))}
                  disabled={currentPage === users.totalPages}
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
                      {Math.min(currentPage * 10, users.total)}
                    </span>{' '}
                    of <span className="font-medium">{users.total}</span> results
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
                      onClick={() => setCurrentPage(Math.min(users.totalPages, currentPage + 1))}
                      disabled={currentPage === users.totalPages}
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
                Confirm {showConfirmDialog.action}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-slate-500">
                  Are you sure you want to {showConfirmDialog.action} user "{showConfirmDialog.userName}"?
                  {showConfirmDialog.action === 'delete' && ' This action cannot be undone.'}
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowConfirmDialog({ show: false, userId: '', action: '', userName: '' })}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUserAction(showConfirmDialog.userId, showConfirmDialog.action)}
                  className={`rounded-xl px-4 py-2 text-white ${
                    showConfirmDialog.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};