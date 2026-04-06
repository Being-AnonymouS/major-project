import { test, expect } from '@playwright/test';

test.describe('Complete Appointment Flow', () => {
  test('should complete full appointment lifecycle', async ({ page, context }) => {
    // Create two browser contexts for mentor and mentee
    const menteeContext = context;
    const mentorContext = await menteeContext.browser()!.newContext();
    const mentorPage = await mentorContext.newPage();

    // Register mentor
    await mentorPage.goto('/register');
    await mentorPage.fill('[data-testid="email-input"]', 'mentor-flow@example.com');
    await mentorPage.fill('[data-testid="password-input"]', 'TestPassword123!');
    await mentorPage.fill('[data-testid="name-input"]', 'Flow Test Mentor');
    await mentorPage.selectOption('[data-testid="role-select"]', 'MENTOR');
    await mentorPage.click('[data-testid="register-button"]');

    // Complete mentor profile
    await mentorPage.goto('/profile');
    await mentorPage.fill('[data-testid="bio-input"]', 'Experienced web developer');
    await mentorPage.fill('[data-testid="years-experience-input"]', '5');
    await mentorPage.selectOption('[data-testid="expertise-select"]', ['JavaScript', 'React']);
    
    // Add availability slots
    await mentorPage.click('[data-testid="add-availability-button"]');
    await mentorPage.selectOption('[data-testid="day-select"]', 'Monday');
    await mentorPage.fill('[data-testid="start-time-input"]', '09:00');
    await mentorPage.fill('[data-testid="end-time-input"]', '17:00');
    await mentorPage.click('[data-testid="save-slot-button"]');
    
    await mentorPage.click('[data-testid="save-profile-button"]');

    // Register mentee
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'mentee-flow@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Flow Test Mentee');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Complete mentee profile
    await page.goto('/profile');
    await page.fill('[data-testid="institute-input"]', 'Test University');
    await page.fill('[data-testid="course-input"]', 'Computer Science');
    await page.fill('[data-testid="goals-input"]', 'Learn React development');
    await page.click('[data-testid="save-profile-button"]');

    // Step 1: Mentee searches and books appointment
    await page.goto('/mentors');
    await page.selectOption('[data-testid="expertise-filter"]', 'React');
    await page.click('[data-testid="search-button"]');

    const mentorCard = page.locator('[data-testid="mentor-card"]').first();
    await mentorCard.locator('[data-testid="view-details-button"]').click();

    await page.click('[data-testid="book-appointment-button"]');
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();

    // Select next Monday at 10:00 AM
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    const timeSlot = page.locator(`[data-testid="time-slot"][data-date="${nextMonday.toISOString().split('T')[0]}"][data-time="10:00"]`);
    await timeSlot.click();

    await page.click('[data-testid="confirm-booking-button"]');
    await expect(page.locator('text=Appointment requested successfully')).toBeVisible();

    // Step 2: Mentor accepts appointment
    await mentorPage.goto('/appointments');
    await expect(mentorPage.locator('[data-testid="appointment-card"]')).toBeVisible();
    await expect(mentorPage.locator('text=REQUESTED')).toBeVisible();

    await mentorPage.click('[data-testid="accept-appointment-button"]');
    await expect(mentorPage.locator('text=Appointment accepted')).toBeVisible();
    await expect(mentorPage.locator('text=ACCEPTED')).toBeVisible();

    // Step 3: Both users can now message each other
    // Mentee sends message
    await page.goto('/appointments');
    await page.click('[data-testid="message-button"]');
    
    await expect(page.locator('[data-testid="message-thread"]')).toBeVisible();
    await page.fill('[data-testid="message-input"]', 'Hi! Looking forward to our session.');
    await page.click('[data-testid="send-message-button"]');

    await expect(page.locator('text=Hi! Looking forward to our session.')).toBeVisible();

    // Mentor replies
    await mentorPage.goto('/messages');
    await mentorPage.click('[data-testid="conversation-item"]');
    
    await expect(mentorPage.locator('text=Hi! Looking forward to our session.')).toBeVisible();
    await mentorPage.fill('[data-testid="message-input"]', 'Great! I have some resources prepared for you.');
    await mentorPage.click('[data-testid="send-message-button"]');

    // Step 4: Mentor marks appointment as completed
    await mentorPage.goto('/appointments');
    await mentorPage.click('[data-testid="complete-appointment-button"]');
    await expect(mentorPage.locator('text=Appointment completed')).toBeVisible();
    await expect(mentorPage.locator('text=COMPLETED')).toBeVisible();

    // Step 5: Mentee rates the session
    await page.goto('/appointments');
    await expect(page.locator('text=COMPLETED')).toBeVisible();
    await page.click('[data-testid="rate-session-button"]');

    await expect(page.locator('[data-testid="rating-modal"]')).toBeVisible();
    
    // Give 5-star rating
    await page.click('[data-testid="star-5"]');
    await page.fill('[data-testid="rating-comment"]', 'Excellent session! Very helpful and knowledgeable.');
    await page.click('[data-testid="submit-rating-button"]');

    await expect(page.locator('text=Rating submitted successfully')).toBeVisible();

    // Step 6: Verify rating appears on mentor profile
    await page.goto('/mentors');
    const updatedMentorCard = page.locator('[data-testid="mentor-card"]').first();
    await updatedMentorCard.locator('[data-testid="view-details-button"]').click();

    // Should show updated rating
    await expect(page.locator('[data-testid="mentor-rating"]')).toContainText('5.0');
    await expect(page.locator('text=Excellent session! Very helpful and knowledgeable.')).toBeVisible();

    // Cleanup
    await mentorContext.close();
  });

  test('should handle appointment cancellation', async ({ page, context }) => {
    // Setup mentor and mentee (simplified version)
    const mentorContext = await context.browser()!.newContext();
    const mentorPage = await mentorContext.newPage();

    // Register and setup mentor
    await mentorPage.goto('/register');
    await mentorPage.fill('[data-testid="email-input"]', 'mentor-cancel@example.com');
    await mentorPage.fill('[data-testid="password-input"]', 'TestPassword123!');
    await mentorPage.fill('[data-testid="name-input"]', 'Cancel Test Mentor');
    await mentorPage.selectOption('[data-testid="role-select"]', 'MENTOR');
    await mentorPage.click('[data-testid="register-button"]');

    // Register and setup mentee
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'mentee-cancel@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Cancel Test Mentee');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Book appointment (simplified)
    await page.goto('/mentors');
    const mentorCard = page.locator('[data-testid="mentor-card"]').first();
    await mentorCard.locator('[data-testid="book-appointment-button"]').click();
    
    // Select time slot and confirm
    const timeSlot = page.locator('[data-testid="time-slot"]').first();
    await timeSlot.click();
    await page.click('[data-testid="confirm-booking-button"]');

    // Mentor accepts
    await mentorPage.goto('/appointments');
    await mentorPage.click('[data-testid="accept-appointment-button"]');

    // Mentee cancels appointment
    await page.goto('/appointments');
    await page.click('[data-testid="cancel-appointment-button"]');
    
    // Confirm cancellation
    await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-cancel-button"]');

    await expect(page.locator('text=Appointment cancelled')).toBeVisible();
    await expect(page.locator('text=CANCELLED')).toBeVisible();

    // Mentor should see cancelled appointment
    await mentorPage.goto('/appointments');
    await expect(mentorPage.locator('text=CANCELLED')).toBeVisible();

    await mentorContext.close();
  });

  test('should handle appointment rejection', async ({ page, context }) => {
    const mentorContext = await context.browser()!.newContext();
    const mentorPage = await mentorContext.newPage();

    // Setup (simplified)
    await mentorPage.goto('/register');
    await mentorPage.fill('[data-testid="email-input"]', 'mentor-reject@example.com');
    await mentorPage.fill('[data-testid="password-input"]', 'TestPassword123!');
    await mentorPage.fill('[data-testid="name-input"]', 'Reject Test Mentor');
    await mentorPage.selectOption('[data-testid="role-select"]', 'MENTOR');
    await mentorPage.click('[data-testid="register-button"]');

    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'mentee-reject@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Reject Test Mentee');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Book appointment
    await page.goto('/mentors');
    const mentorCard = page.locator('[data-testid="mentor-card"]').first();
    await mentorCard.locator('[data-testid="book-appointment-button"]').click();
    
    const timeSlot = page.locator('[data-testid="time-slot"]').first();
    await timeSlot.click();
    await page.click('[data-testid="confirm-booking-button"]');

    // Mentor rejects appointment
    await mentorPage.goto('/appointments');
    await mentorPage.click('[data-testid="reject-appointment-button"]');
    
    await expect(mentorPage.locator('text=Appointment rejected')).toBeVisible();
    await expect(mentorPage.locator('text=CANCELLED')).toBeVisible();

    // Mentee should see rejected appointment
    await page.goto('/appointments');
    await expect(page.locator('text=CANCELLED')).toBeVisible();

    await mentorContext.close();
  });
});