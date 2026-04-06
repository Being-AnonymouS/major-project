import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../tests/utils/test-utils';
import { AppointmentCard } from '../AppointmentCard';
import { createMockAppointment } from '../../../tests/utils/test-utils';

describe('AppointmentCard', () => {
  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnMessage = vi.fn();
  const mockOnRate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render appointment information correctly', () => {
    const appointment = createMockAppointment();
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024 at 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
  });

  it('should show correct actions for mentee with accepted appointment', () => {
    const appointment = createMockAppointment({ status: 'ACCEPTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('should show correct actions for mentor with requested appointment', () => {
    const appointment = createMockAppointment({ status: 'REQUESTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTOR"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
  });

  it('should show rate button for completed appointment as mentee', () => {
    const appointment = createMockAppointment({ status: 'COMPLETED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('Rate Session')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should call onAccept when Accept button is clicked', () => {
    const appointment = createMockAppointment({ status: 'REQUESTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTOR"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    fireEvent.click(screen.getByText('Accept'));
    expect(mockOnAccept).toHaveBeenCalledWith(appointment.id);
  });

  it('should call onReject when Reject button is clicked', () => {
    const appointment = createMockAppointment({ status: 'REQUESTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTOR"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    fireEvent.click(screen.getByText('Reject'));
    expect(mockOnReject).toHaveBeenCalledWith(appointment.id);
  });

  it('should call onMessage when Message button is clicked', () => {
    const appointment = createMockAppointment({ status: 'ACCEPTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    fireEvent.click(screen.getByText('Message'));
    expect(mockOnMessage).toHaveBeenCalledWith(appointment.id);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const appointment = createMockAppointment({ status: 'ACCEPTED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledWith(appointment.id);
  });

  it('should call onRate when Rate Session button is clicked', () => {
    const appointment = createMockAppointment({ status: 'COMPLETED' });
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    fireEvent.click(screen.getByText('Rate Session'));
    expect(mockOnRate).toHaveBeenCalledWith(appointment.id);
  });

  it('should display correct status styling', () => {
    const requestedAppointment = createMockAppointment({ status: 'REQUESTED' });
    const { rerender } = render(
      <AppointmentCard
        appointment={requestedAppointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('REQUESTED')).toHaveClass('bg-yellow-100', 'text-yellow-800');

    const acceptedAppointment = createMockAppointment({ status: 'ACCEPTED' });
    rerender(
      <AppointmentCard
        appointment={acceptedAppointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    expect(screen.getByText('ACCEPTED')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should be accessible', () => {
    const appointment = createMockAppointment();
    
    render(
      <AppointmentCard
        appointment={appointment}
        currentUserRole="MENTEE"
        onAccept={mockOnAccept}
        onReject={mockOnReject}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        onMessage={mockOnMessage}
        onRate={mockOnRate}
      />
    );

    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});