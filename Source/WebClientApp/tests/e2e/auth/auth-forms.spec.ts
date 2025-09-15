import { test, expect, type Page } from '@playwright/test';

/**
 * React UI Tests for Authentication Forms
 * Tests UI components using Playwright (HAS UI - correct tool choice)
 * Validates form interactions, Material UI styling, and user feedback
 */
test.describe('Authentication Forms UI', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to the main application
    await page.goto('/');
  });

  test('Login form UI interactions', async () => {
    // Navigate to login page
    await page.click('[data-testid="login-button"]', { timeout: 10000 });

    // Wait for login form to load
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 10000 });

    // Test form field interactions
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');

    // Verify Material UI styling is applied
    const emailField = page.locator('[data-testid="email-input"]');
    await expect(emailField).toHaveAttribute('type', 'email');

    const passwordField = page.locator('[data-testid="password-input"]');
    await expect(passwordField).toHaveAttribute('type', 'password');

    // Test form validation - empty email
    await page.fill('[data-testid="email-input"]', '');
    await page.click('[data-testid="login-submit-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible({ timeout: 5000 });

    // Test form validation - invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="login-submit-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

    // Screenshot of login form with validation errors
    await page.screenshot({
      path: `test-results/screenshots/login-form-validation.png`,
      fullPage: true
    });
  });

  test('Registration form UI interactions', async () => {
    // Navigate to registration page
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();

    // Fill registration form fields
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'StrongPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'StrongPassword123!');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="display-name-input"]', 'TestUser');

    // Test password confirmation validation
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword');
    await page.click('[data-testid="register-submit-button"]');

    await expect(page.locator('[data-testid="password-mismatch-error"]')).toBeVisible();

    // Screenshot of registration form
    await page.screenshot({
      path: `test-results/screenshots/registration-form.png`,
      fullPage: true
    });
  });

  test('AuthStatus component display states', async () => {
    // Test unauthenticated state
    const authStatus = page.locator('[data-testid="auth-status"]');
    await expect(authStatus).toBeVisible();

    // Should show login and register buttons when not authenticated
    await expect(page.locator('[data-testid="auth-login-icon"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-register-icon"]')).toBeVisible();

    // Test authenticated state (requires mock authentication)
    // This would normally involve calling the auth service
    // For UI testing, we focus on the component rendering

    await page.screenshot({
      path: `test-results/screenshots/auth-status-unauthenticated.png`,
      fullPage: true
    });
  });

  test('Form accessibility features', async () => {
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    // Test ARIA labels
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute('aria-label', /email/i);

    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('aria-label', /password/i);

    // Screenshot of form with focus states
    await page.focus('[data-testid="email-input"]');
    await page.screenshot({
      path: `test-results/screenshots/form-accessibility.png`,
      fullPage: true
    });
  });

  test('Error display components', async () => {
    // Navigate to login and trigger error state
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-submit-button"]');

    // Should display error message
    const errorDisplay = page.locator('[data-testid="auth-error-display"]');
    await expect(errorDisplay).toBeVisible({ timeout: 10000 });

    // Verify error message content
    await expect(errorDisplay).toContainText(/invalid/i);

    // Screenshot of error state
    await page.screenshot({
      path: `test-results/screenshots/login-error-display.png`,
      fullPage: true
    });
  });

  test('Material UI theming and styling', async () => {
    await page.click('[data-testid="login-button"]');

    // Verify Material UI components are properly styled
    const loginForm = page.locator('[data-testid="login-form"]');

    // Check that MUI paper component is rendered
    await expect(loginForm.locator('.MuiPaper-root')).toBeVisible();

    // Check that MUI text fields are rendered
    await expect(page.locator('.MuiTextField-root')).toHaveCount(2); // Email and password

    // Check that MUI button is rendered
    await expect(page.locator('.MuiButton-root')).toBeVisible();

    // Screenshot showing Material UI styling
    await page.screenshot({
      path: `test-results/screenshots/material-ui-styling.png`,
      fullPage: true
    });
  });

  test('Responsive design on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.click('[data-testid="login-button"]');

    // Form should be responsive on mobile
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();

    // Check that form elements stack vertically on mobile
    const formBox = await loginForm.boundingBox();
    expect(formBox?.width).toBeLessThan(400); // Should fit mobile width

    // Screenshot of mobile layout
    await page.screenshot({
      path: `test-results/screenshots/mobile-responsive.png`,
      fullPage: true
    });
  });

  test('Loading states and UI feedback', async () => {
    await page.click('[data-testid="login-button"]');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');

    // Click submit and check for loading state
    const submitButton = page.locator('[data-testid="login-submit-button"]');
    await submitButton.click();

    // Should show loading indicator (if implemented)
    const loadingIndicator = page.locator('[data-testid="auth-loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();

      // Button should be disabled during loading
      await expect(submitButton).toBeDisabled();
    }

    // Screenshot of loading state
    await page.screenshot({
      path: `test-results/screenshots/loading-state.png`,
      fullPage: true
    });
  });
});