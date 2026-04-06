import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProfileCompletionIndicator } from '../components/ProfileCompletionIndicator';
import { MentorProfileForm } from '../components/MentorProfileForm';
import { MenteeProfileForm } from '../components/MenteeProfileForm';
import { useToast } from '../contexts/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !user.role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Loading Profile...</h2>
          <p className="text-slate-600">Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (profileData: any) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(profileData);
      
      // Ensure the updated user has the required fields
      if (updatedUser && updatedUser.id && updatedUser.email) {
        updateUser(updatedUser);
        success('Profile updated successfully!');
      } else {
        throw new Error('Invalid response from server - user data incomplete');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case 'MENTOR': return 'Mentor';
      case 'MENTEE': return 'Mentee';
      case 'ADMIN': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="surface-card mb-8 p-6 sm:p-7">
        <h1 className="section-heading text-2xl sm:text-3xl">Profile Settings</h1>
        <p className="section-subheading">
          Manage your {getRoleDisplayName(user.role)?.toLowerCase() || 'user'} profile and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* Profile Completion Indicator */}
        <div className="lg:col-span-1">
          <ProfileCompletionIndicator user={user} />
          
          {/* User Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
                  <p className="text-sm font-medium text-slate-900">{getRoleDisplayName(user.role)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member Since</label>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date().toLocaleDateString()} {/* This would come from user.createdAt in real app */}
                  </p>
                </div>
                {user.role === 'MENTOR' && user.ratingAverage && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average Rating</label>
                    <div className="flex items-center">
                      <span className="mr-1 text-sm font-medium text-slate-900">
                        {user.ratingAverage.toFixed(1)}
                      </span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(user.ratingAverage!) ? 'fill-current' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {user.role === 'MENTOR' ? 'Mentor Profile' : 'Mentee Profile'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === 'MENTOR' ? (
                <MentorProfileForm
                  user={user}
                  onSubmit={handleProfileUpdate}
                  isLoading={isLoading}
                />
              ) : user.role === 'MENTEE' ? (
                <MenteeProfileForm
                  user={user}
                  onSubmit={handleProfileUpdate}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    Profile management is not available for administrators.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};