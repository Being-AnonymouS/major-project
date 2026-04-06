import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardTitle, Button } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 sm:p-7">
        <h1 className="section-heading text-balance text-2xl sm:text-3xl">
          Welcome back, {user?.name}!
        </h1>
        <p className="section-subheading max-w-3xl">
          {user?.role === 'MENTOR' 
            ? 'Manage your mentoring sessions and help mentees grow'
            : user?.role === 'MENTEE'
            ? 'Find mentors and book sessions to accelerate your learning'
            : 'Manage the platform and oversee all activities'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === 'MENTEE' && (
          <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">
            <CardContent>
              <CardTitle>Find Mentors</CardTitle>
              <p className="mb-4 mt-2 text-sm text-slate-600">
                Browse and connect with experienced mentors in your field of interest
              </p>
              <Link to="/app/mentors">
                <Button className="w-full">
                  Browse Mentors
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">
          <CardContent>
            <CardTitle>Quick Actions</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Dashboard functionality will be implemented in upcoming tasks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};