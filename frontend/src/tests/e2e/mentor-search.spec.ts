import { test, expect } from '@playwright/test';

test.describe('Mentor Search and Booking', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login as mentee
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'mentee-search@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Search Test Mentee');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Complete mentee profile
    await page.goto('/profile');
    await page.fill('[data-testid="institute-input"]', 'Test University');
    await page.fill('[data-testid="course-input"]', 'Computer Science');
    await page.fill('[data-testid="goals-input"]', 'Learn web development');
    await page.click('[data-testid="save-profile-button"]');
  });

  test('should search and filter mentors', async ({ page }) => {
    await page.goto('/mentors');

    // Should see mentor search page
    await expect(page.locator('h1:has-text("Find Mentors")')).toBeVisible();

    // Should see search filters
    await expect(page.locator('[data-testid="expertise-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-filter"]')).toBeVisible();

    // Test expertise filter
    await page.selectOption('[data-testid="expertise-filter"]', 'JavaScript');
    await page.click('[data-testid="search-button"]');

    // Should show filtered results
    await expect(page.locator('[data-testid="mentor-card"]')).toBeVisible();
    
    // Mentor cards should contain JavaScript expertise
    const mentorCards = page.locator('[data-testid="mentor-card"]');
    const firstCard = mentorCards.first();
    await expect(firstCard.locator('text=JavaScript')).toBeVisible();
  });

  test('should view mentor details', async ({ page }) => {
    await page.goto('/mentors');

    // Click on first mentor card
    const firstMentorCard = page.locator('[data-testid="mentor-card"]').first();
    await firstMentorCard.locator('[data-testid="view-details-button"]').click();

    // Should navigate to mentor detail page
    await expect(page.url()).toContain('/mentors/');

    // Should show mentor details
    await expect(page.locator('[data-testid="mentor-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentor-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentor-expertise"]')).toBeVisible();
    await expect(page.locator('[data-testid="mentor-rating"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-slots"]')).toBeVisible();
  });

  test('should book appointment with mentor', async ({ page }) => {
    await page.goto('/mentors');

    // Click on first mentor card to view details
    const firstMentorCard = page.locator('[data-testid="mentor-card"]').first();
    await firstMentorCard.locator('[data-testid="view-details-button"]').click();

    // Click book appointment button
    await page.click('[data-testid="book-appointment-button"]');

    // Should show appointment booking modal
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();

    // Select available time slot
    const availableSlot = page.locator('[data-testid="time-slot"]').first();
    await availableSlot.click();

    // Confirm booking
    await page.click('[data-testid="confirm-booking-button"]');

    // Should show success message
    await expect(page.locator('text=Appointment requested successfully')).toBeVisible();

    // Should redirect to appointments page
    await expect(page).toHaveURL('/appointments');

    // Should see the new appointment
    await expect(page.locator('[data-testid="appointment-card"]')).toBeVisible();
    await expect(page.locator('text=REQUESTED')).toBeVisible();
  });

  test('should handle no mentors found', async ({ page }) => {
    await page.goto('/mentors');

    // Filter by non-existent expertise
    await page.selectOption('[data-testid="expertise-filter"]', 'NonExistentSkill');
    await page.click('[data-testid="search-button"]');

    // Should show no results message
    await expect(page.locator('text=No mentors found')).toBeVisible();
    await expect(page.locator('[data-testid="mentor-card"]')).not.toBeVisible();
  });

  test('should show mentor ratings and reviews', async ({ page }) => {
    await page.goto('/mentors');

    // Click on first mentor card to view details
    const firstMentorCard = page.locator('[data-testid="mentor-card"]').first();
    await firstMentorCard.locator('[data-testid="view-details-button"]').click();

    // Should show rating section
    await expect(page.locator('[data-testid="mentor-rating"]')).toBeVisible();
    
    // Should show reviews if any exist
    const reviewsSection = page.locator('[data-testid="reviews-section"]');
    if (await reviewsSection.isVisible()) {
      await expect(page.locator('[data-testid="review-item"]')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/mentors');

    // Should show mobile-friendly layout
    await expect(page.locator('[data-testid="mobile-filter-toggle"]')).toBeVisible();
    
    // Click mobile filter toggle
    await page.click('[data-testid="mobile-filter-toggle"]');
    
    // Should show filter panel
    await expect(page.locator('[data-testid="mobile-filter-panel"]')).toBeVisible();
    
    // Mentor cards should stack vertically
    const mentorCards = page.locator('[data-testid="mentor-card"]');
    const firstCard = mentorCards.first();
    const secondCard = mentorCards.nth(1);
    
    if (await secondCard.isVisible()) {
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      // Second card should be below first card (stacked vertically)
      expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height);
    }
  });
});