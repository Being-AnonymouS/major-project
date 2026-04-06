import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../types/auth';
import { userService } from '../services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AppointmentBooking } from '../components/AppointmentBooking';
import { RatingDisplay } from '../components/RatingDisplay';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';

export const MentorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { error: showToast } = useToast();
  const { user } = useAuth();
  
  const [mentor, setMentor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const loadMentor = async () => {
      if (!id) {
        navigate('/app/mentors');
        return;
      }

      try {
        setIsLoading(true);
        const mentorData = await userService.getMentorById(id);
        setMentor(mentorData);
        
        // Check if we should automatically open booking modal
        if (searchParams.get('book') === 'true') {
          setShowBookingModal(true);
          // Remove the book parameter from URL
          setSearchParams({});
        }
      } catch (error) {
        console.error('Failed to load mentor:', error);
        showToast('Failed to load mentor details. Please try again.');
        navigate('/app/mentors');
      } finally {
        setIsLoading(false);
      }
    };

    loadMentor();
  }, [id, navigate, showToast, searchParams, setSearchParams]);

  const handleBookAppointment = () => {
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    navigate('/app/appointments');
  };

  const handleBackToSearch = () => {
    navigate('/app/mentors');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient id="half-fill-detail">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill-detail)"
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-5 h-5 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  const formatTimeSlot = (slot: { day: string; startTime: string; endTime: string }) => {
    return `${slot.day}: ${slot.startTime} - ${slot.endTime}`;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="mb-6">
            <div className="mb-4 h-8 w-32 rounded bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="surface-card p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="mb-2 h-6 rounded bg-slate-200"></div>
                    <div className="mb-2 h-4 w-2/3 rounded bg-slate-200"></div>
                    <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 rounded bg-slate-200"></div>
                  <div className="h-4 rounded bg-slate-200"></div>
                  <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="surface-card p-6">
                <div className="mb-4 h-6 rounded bg-slate-200"></div>
                <div className="space-y-2">
                  <div className="h-4 rounded bg-slate-200"></div>
                  <div className="h-4 rounded bg-slate-200"></div>
                  <div className="h-4 rounded bg-slate-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Mentor not found</h1>
          <Button onClick={handleBackToSearch}>Back to Search</Button>
        </div>
      </div>
    );
  }

  const hasAvailableSlots = mentor.availabilitySlots && mentor.availabilitySlots.length > 0;
  const canBookAppointment = user?.role === 'MENTEE' && hasAvailableSlots;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBackToSearch}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                  <span className="text-2xl font-bold text-brand-700">
                    {mentor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-slate-900">{mentor.name}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    {mentor.ratingAverage && (
                      <>
                        <div className="flex items-center">
                          {renderStars(mentor.ratingAverage)}
                        </div>
                        <span className="font-medium text-slate-600">
                          ({mentor.ratingAverage.toFixed(1)} rating)
                        </span>
                      </>
                    )}
                    {!mentor.ratingAverage && (
                      <span className="text-slate-500">No ratings yet</span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    {mentor.yearsExperience} years of experience
                  </p>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">About</h2>
                  <p className="leading-relaxed text-slate-700">{mentor.bio}</p>
                </div>
              )}

              {/* Expertise */}
              {mentor.expertise && (
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Contact</h2>
                <p className="text-slate-700">{mentor.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ratings and Reviews */}
          <RatingDisplay
            mentorId={mentor.id}
            mentorName={mentor.name}
            showStats={true}
            maxReviews={5}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              {hasAvailableSlots ? (
                <div className="space-y-2">
                  {mentor.availabilitySlots!.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-slate-700">
                        {formatTimeSlot(slot)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-slate-400"></div>
                  <p className="text-sm text-slate-500">No available slots</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          {canBookAppointment && (
            <Card>
              <CardContent>
                <Button
                  onClick={handleBookAppointment}
                  className="w-full"
                  size="lg"
                >
                  Book a Session
                </Button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Schedule a mentoring session with {mentor.name}
                </p>
              </CardContent>
            </Card>
          )}

          {!canBookAppointment && user?.role === 'MENTEE' && (
            <Card>
              <CardContent>
                <Button
                  disabled
                  className="w-full"
                  size="lg"
                >
                  No Available Slots
                </Button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  This mentor is currently not available for booking
                </p>
              </CardContent>
            </Card>
          )}

          {user?.role !== 'MENTEE' && (
            <Card>
              <CardContent>
                <p className="text-center text-sm text-slate-600">
                  Only mentees can book sessions with mentors
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {mentor && (
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title="Book Appointment"
          size="lg"
        >
          <AppointmentBooking
            mentor={mentor}
            onBookingSuccess={handleBookingSuccess}
            onCancel={() => setShowBookingModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};