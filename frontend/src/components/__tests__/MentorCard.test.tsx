import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../tests/utils/test-utils';
import { MentorCard } from '../MentorCard';
import { mockMentor } from '../../../tests/utils/test-utils';

describe('MentorCard', () => {
  const mockOnViewDetails = vi.fn();
  const mockOnBookAppointment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mentor information correctly', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    expect(screen.getByText('Test Mentor')).toBeInTheDocument();
    expect(screen.getByText('5 years experience')).toBeInTheDocument();
    expect(screen.getByText('Experienced developer')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should display rating stars correctly', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    // Should show 4.5 rating
    expect(screen.getByText('4.5')).toBeInTheDocument();
    
    // Check for star elements (4 full stars + 1 half star)
    const stars = screen.getAllByRole('img', { hidden: true });
    expect(stars).toHaveLength(5); // 4 full + 1 half
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockMentor.id);
  });

  it('should call onBookAppointment when Book Appointment button is clicked', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    const bookButton = screen.getByText('Book Appointment');
    fireEvent.click(bookButton);

    expect(mockOnBookAppointment).toHaveBeenCalledWith(mockMentor.id);
  });

  it('should not render Book Appointment button when onBookAppointment is not provided', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.queryByText('Book Appointment')).not.toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('should handle mentor without rating', () => {
    const mentorWithoutRating = {
      ...mockMentor,
      ratingAverage: undefined,
    };

    render(
      <MentorCard
        mentor={mentorWithoutRating}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    expect(screen.getByText('No ratings yet')).toBeInTheDocument();
  });

  it('should handle mentor without bio', () => {
    const mentorWithoutBio = {
      ...mockMentor,
      bio: undefined,
    };

    render(
      <MentorCard
        mentor={mentorWithoutBio}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    expect(screen.queryByText('Experienced developer')).not.toBeInTheDocument();
  });

  it('should handle mentor without expertise', () => {
    const mentorWithoutExpertise = {
      ...mockMentor,
      expertise: '',
    };

    render(
      <MentorCard
        mentor={mentorWithoutExpertise}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(
      <MentorCard
        mentor={mockMentor}
        onViewDetails={mockOnViewDetails}
        onBookAppointment={mockOnBookAppointment}
      />
    );

    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: 'Test Mentor' })).toBeInTheDocument();
    
    // Check for proper button accessibility
    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Appointment' })).toBeInTheDocument();
  });
});