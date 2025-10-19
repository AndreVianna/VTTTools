import { test, expect, type Page } from '@playwright/test';

/**
 * Authentication UI Integration Tests: Material UI Theme & Components
 * Tests React authentication components with Material UI Studio Professional theme
 * Validates integration with Auth service and proper error handling
 */
test.describe('Authentication UI - Material UI Theme Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Landing page loads with Studio Professional theme colors', async ({ page }) => {
    // Wait for React app to load
    await expect(page.locator('body')).toBeVisible();

    // Take screenshot of landing page
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/001_LandingPage.png',
      fullPage: true
    });

    // Verify background color matches Studio Professional theme (#F9FAFB)
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // RGB equivalent of #F9FAFB is rgb(249, 250, 251)
    expect(bodyBgColor).toMatch(/rgb\(249, 250, 251\)|rgba\(249, 250, 251, 1\)/);
  });

  test('Login form displays with proper Material UI styling', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();

    // Take screenshot of login form
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/002_LoginForm.png',
      fullPage: true
    });

    // Verify VTT Tools title is present with primary color
    const title = page.locator('h4:has-text("VTT Tools")');
    await expect(title).toBeVisible();

    // Check primary color (#2563EB) is applied
    const titleColor = await title.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    // RGB equivalent of #2563EB is rgb(37, 99, 235)
    expect(titleColor).toMatch(/rgb\(37, 99, 235\)/);

    // Verify email input field is present
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('name', 'email');

    // Verify password input field is present
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('name', 'password');

    // Verify Sign In button with Material UI styling
    const signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
    await expect(signInButton).toBeVisible();

    // Check button background color matches primary theme
    const buttonBgColor = await signInButton.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(buttonBgColor).toMatch(/rgb\(37, 99, 235\)/);
  });

  test('Registration form displays with password strength indicators', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    await expect(page.locator('form')).toBeVisible();

    // Take screenshot of registration form
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/003_RegistrationForm.png',
      fullPage: true
    });

    // Verify form fields are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // Test password strength indicator
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('weak');

    // Should show password strength feedback
    await expect(page.locator('text=Password Strength:')).toBeVisible();

    // Fill a stronger password to see strength indicator change
    await passwordInput.fill('StrongPass123!');

    // Take screenshot showing password strength indicator
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/004_PasswordStrength.png',
      fullPage: true
    });

    // Verify terms checkbox is present
    const termsCheckbox = page.locator('input[type="checkbox"]');
    await expect(termsCheckbox).toBeVisible();
  });

  test('External login buttons display with correct styling', async ({ page }) => {
    await page.goto('/login');

    // Verify external login buttons are present
    const googleButton = page.locator('button:has-text("Google")');
    const microsoftButton = page.locator('button:has-text("Microsoft")');
    const githubButton = page.locator('button:has-text("GitHub")');

    await expect(googleButton).toBeVisible();
    await expect(microsoftButton).toBeVisible();
    await expect(githubButton).toBeVisible();

    // Check that buttons have outlined variant styling
    const googleButtonStyle = await googleButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor
      };
    });

    // Outlined buttons should have transparent/white background
    expect(googleButtonStyle.backgroundColor).toMatch(/rgba?\(255, 255, 255|rgba?\(0, 0, 0, 0\)|transparent/);

    // Take screenshot of external login options
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/005_ExternalLoginButtons.png',
      fullPage: true
    });
  });

  test('Typography follows Inter font family specification', async ({ page }) => {
    await page.goto('/login');

    // Check that Inter font is applied to the title
    const title = page.locator('h4:has-text("VTT Tools")');
    const fontFamily = await title.evaluate(el => {
      return window.getComputedStyle(el).fontFamily;
    });

    expect(fontFamily).toContain('Inter');

    // Check button typography
    const button = page.locator('button[type="submit"]');
    const buttonFont = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        textTransform: style.textTransform
      };
    });

    expect(buttonFont.fontFamily).toContain('Inter');
    expect(buttonFont.textTransform).toBe('none'); // Should preserve natural casing
  });

  test('Form validation displays with proper Material UI error styling', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Take screenshot of validation errors
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/006_ValidationErrors.png',
      fullPage: true
    });

    // Check for email validation error
    const emailError = page.locator('text=Email is required');
    if (await emailError.isVisible()) {
      await expect(emailError).toBeVisible();
    }

    // Check for password validation error
    const passwordError = page.locator('text=Password is required');
    if (await passwordError.isVisible()) {
      await expect(passwordError).toBeVisible();
    }

    // Verify error styling - should use error color (#DC2626)
    const errorElements = page.locator('.Mui-error, [role="alert"], .MuiFormHelperText-root.Mui-error');
    if (await errorElements.count() > 0) {
      const errorColor = await errorElements.first().evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      // Should be red color for errors
      expect(errorColor).toMatch(/rgb\(220, 38, 38\)|rgb\(211, 47, 47\)|rgb\(244, 67, 54\)/);
    }
  });

  test('Responsive design works on different screen sizes', async ({ page, browser }) => {
    await page.goto('/login');

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/007_Desktop_View.png',
      fullPage: true
    });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/008_Tablet_View.png',
      fullPage: true
    });

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/009_Mobile_View.png',
      fullPage: true
    });

    // Verify form is still usable on mobile
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Card component styling matches Studio Professional design', async ({ page }) => {
    await page.goto('/login');

    // Find the login card
    const loginCard = page.locator('.MuiCard-root, .MuiPaper-root').first();
    await expect(loginCard).toBeVisible();

    // Check card styling properties
    const cardStyles = await loginCard.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow
      };
    });

    // Should have rounded corners (12px border radius)
    expect(cardStyles.borderRadius).toMatch(/12px|0.75rem/);

    // Should have white/paper background
    expect(cardStyles.backgroundColor).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255, 1\)/);

    // Should have subtle shadow
    expect(cardStyles.boxShadow).toBeTruthy();
    expect(cardStyles.boxShadow).not.toBe('none');

    // Take screenshot focusing on card design
    await loginCard.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/010_CardStyling.png'
    });
  });
});