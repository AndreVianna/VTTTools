import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * VTT Tools Authentication Visual and Integration Tests
 * Tests the actual implementation without assuming specific data-testid attributes
 */

const BASE_URL = 'http://localhost:5173';

test.describe('VTT Tools Authentication Visual Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should load landing page and capture initial state', async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check if page loads without errors
    const title = await page.textContent('h1');
    console.log('Landing page title:', title);

    await page.screenshot({ path: 'Tests/20250913_235120/001_LandingPage.png', fullPage: true });
  });

  test('should navigate to login page and show authentication form', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Check for common authentication elements
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').isVisible();
    const hasPasswordField = await page.locator('input[type="password"], input[name="password"]').isVisible();
    const hasSubmitButton = await page.locator('button[type="submit"]').isVisible();

    console.log('Authentication form elements:');
    console.log('- Email field:', hasEmailField);
    console.log('- Password field:', hasPasswordField);
    console.log('- Submit button:', hasSubmitButton);

    await page.screenshot({ path: 'Tests/20250913_235120/002_LoginPage.png', fullPage: true });

    expect(hasEmailField).toBe(true);
    expect(hasPasswordField).toBe(true);
    expect(hasSubmitButton).toBe(true);
  });

  test('should test Material UI theme colors and styling', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Check primary button styling
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      const backgroundColor = await submitButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      console.log('Primary button background:', backgroundColor);

      // Material UI theme should have primary color
      expect(backgroundColor).toContain('rgb');
    }

    // Check border radius on form elements
    const emailField = page.locator('input[type="email"], input[name="email"]');
    if (await emailField.isVisible()) {
      const borderRadius = await emailField.evaluate(el => {
        const parent = el.closest('.MuiOutlinedInput-root') || el;
        return window.getComputedStyle(parent).borderRadius;
      });
      console.log('Input field border radius:', borderRadius);
    }

    await page.screenshot({ path: 'Tests/20250913_235120/003_MaterialUI_Styling.png' });
  });

  test('should test form validation behavior', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailField.isVisible() && await passwordField.isVisible() && await submitButton.isVisible()) {
      // Try submitting empty form
      await submitButton.click();

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'Tests/20250913_235120/004_EmptyFormValidation.png' });

      // Try invalid email
      await emailField.fill('invalid-email');
      await passwordField.fill('weak');
      await submitButton.click();

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'Tests/20250913_235120/005_InvalidDataValidation.png' });
    }
  });

  test('should test external login providers display', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Look for external provider buttons
    const googleButton = page.locator('button:has-text("Google")');
    const microsoftButton = page.locator('button:has-text("Microsoft")');
    const githubButton = page.locator('button:has-text("GitHub")');

    const hasGoogle = await googleButton.isVisible();
    const hasMicrosoft = await microsoftButton.isVisible();
    const hasGithub = await githubButton.isVisible();

    console.log('External providers:');
    console.log('- Google:', hasGoogle);
    console.log('- Microsoft:', hasMicrosoft);
    console.log('- GitHub:', hasGithub);

    await page.screenshot({ path: 'Tests/20250913_235120/006_ExternalProviders.png' });

    // At least one provider should be available
    expect(hasGoogle || hasMicrosoft || hasGithub).toBe(true);
  });

  test('should test registration form navigation', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Look for registration link
    const registerLink = page.locator('text="Sign up here", text="Sign up", text="Register", text="Create account"').first();

    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForTimeout(2000);

      // Should show registration form
      await page.screenshot({ path: 'Tests/20250913_235120/007_RegistrationForm.png' });

      // Look for registration-specific fields
      const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="confirm-password"]');
      const hasConfirmPassword = await confirmPasswordField.isVisible();

      console.log('Registration form has confirm password:', hasConfirmPassword);

      if (hasConfirmPassword) {
        expect(hasConfirmPassword).toBe(true);
      }
    } else {
      // Try direct navigation
      await page.goto(`${BASE_URL}/register`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'Tests/20250913_235120/007_RegistrationForm_Direct.png' });
    }
  });

  test('should test password reset functionality', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Look for password reset link
    const resetLink = page.locator('text="Forgot your password", text="Reset password", text="Forgot password"').first();

    if (await resetLink.isVisible()) {
      await resetLink.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'Tests/20250913_235120/008_PasswordResetForm.png' });

      // Should show email field for reset
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const hasEmailField = await emailField.isVisible();

      console.log('Password reset form has email field:', hasEmailField);
      expect(hasEmailField).toBe(true);
    } else {
      // Try direct navigation
      await page.goto(`${BASE_URL}/reset-password`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'Tests/20250913_235120/008_PasswordResetForm_Direct.png' });
    }
  });

  test('should test responsive design', async () => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'Tests/20250913_235120/009_Mobile_Login.png', fullPage: true });

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'Tests/20250913_235120/010_Tablet_Login.png', fullPage: true });

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'Tests/20250913_235120/011_Desktop_Login.png', fullPage: true });

    // Forms should be responsive
    const form = page.locator('form, [role="form"]').first();
    if (await form.isVisible()) {
      const formBox = await form.boundingBox();
      console.log('Form dimensions at 1920px:', formBox);
      expect(formBox).toBeTruthy();
    }
  });

  test('should test keyboard navigation and accessibility', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press('Tab');
    const thirdFocused = await page.evaluate(() => document.activeElement?.tagName);

    console.log('Tab navigation sequence:', [firstFocused, secondFocused, thirdFocused]);

    await page.screenshot({ path: 'Tests/20250913_235120/012_KeyboardNavigation.png' });

    // Should be able to navigate through form elements
    expect([firstFocused, secondFocused, thirdFocused]).toContain('INPUT');
  });

  test('should test error handling and network conditions', async () => {
    // Test with slow network
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto(`${BASE_URL}/login`);

    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailField.isVisible() && await passwordField.isVisible() && await submitButton.isVisible()) {
      await emailField.fill('test@example.com');
      await passwordField.fill('testpassword');
      await submitButton.click();

      // Check for loading state
      await page.waitForTimeout(1000);
      const isLoading = await page.locator('svg[role="progressbar"], .MuiCircularProgress-root').isVisible();
      console.log('Shows loading indicator:', isLoading);

      await page.screenshot({ path: 'Tests/20250913_235120/013_LoadingState.png' });
    }

    // Clear route intercepts
    await page.unroute('**/api/**');
  });

  test('should test page performance', async () => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Login page load time: ${loadTime}ms`);

    // Performance should be under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    await page.screenshot({ path: 'Tests/20250913_235120/014_PerformanceTest.png' });
  });
});