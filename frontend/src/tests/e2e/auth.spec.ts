import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should register a new user and login', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'E2E Test User');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, E2E Test User')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    // First register a user (in a real test, this would be seeded data)
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'login-test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Login Test User');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Now test login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'login-test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, Login Test User')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=Name is required')).toBeVisible();

    // Test invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    // Register and login first
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'logout-test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Logout Test User');
    await page.selectOption('[data-testid="role-select"]', 'MENTEE');
    await page.click('[data-testid="register-button"]');

    // Verify we're logged in
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Should not be able to access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});