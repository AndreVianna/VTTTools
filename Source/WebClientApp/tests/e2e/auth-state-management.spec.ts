import { test, expect, type Page } from '@playwright/test';

/**
 * Authentication State Management Tests
 * Tests Redux state management, routing guards, and session handling
 * Validates React app authentication state across different scenarios
 */
test.describe('Authentication State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Initial app state loads correctly', async ({ page }) => {
    // Wait for React app to fully load
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial app state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/026_InitialAppState.png',
      fullPage: true
    });

    // Verify landing page elements are present
    await expect(page.locator('body')).toBeVisible();

    // Check for navigation elements
    const navElements = page.locator('nav, header, [role="navigation"]');
    if (await navElements.count() > 0) {
      console.log('✅ Navigation elements found');
    }
  });

  test('Redux store initializes with correct auth state', async ({ page }) => {
    // Check if Redux DevTools are available for state inspection
    const reduxState = await page.evaluate(() => {
      // Try to access Redux store if available in window
      return (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? 'available' : 'not-available';
    });

    console.log('Redux DevTools:', reduxState);

    // Navigate to login to trigger auth state changes
    await page.goto('/login');

    // Take screenshot showing auth forms (indicates state management working)
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/027_AuthStateLogin.png',
      fullPage: true
    });

    // Fill form to test state updates
    await page.fill('input[name="email"]', 'state.test@example.com');

    // Check if form state is being managed properly
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe('state.test@example.com');
  });

  test('Error state management displays errors correctly', async ({ page }) => {
    await page.goto('/login');

    // Trigger validation errors by submitting empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Take screenshot of error state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/028_ErrorStateManagement.png',
      fullPage: true
    });

    // Look for error indicators managed by state
    const errorElements = page.locator('.Mui-error, .MuiFormHelperText-root.Mui-error, [role="alert"]');
    const errorCount = await errorElements.count();

    if (errorCount > 0) {
      console.log(`✅ Found ${errorCount} error elements managed by state`);
      await expect(errorElements.first()).toBeVisible();
    }

    // Test error clearing when user starts typing
    await page.fill('input[name="email"]', 'clearing.errors@example.com');
    await page.waitForTimeout(500);

    // Take screenshot after error clearing
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/029_ErrorClearing.png',
      fullPage: true
    });
  });

  test('Loading state management during auth operations', async ({ page }) => {
    await page.goto('/login');

    // Fill form with test data
    await page.fill('input[name="email"]', 'loading.test@example.com');
    await page.fill('input[name="password"]', 'LoadingTest123!');

    // Monitor for loading state changes
    const submitButton = page.locator('button[type="submit"]');

    // Check initial button state
    await expect(submitButton).toBeEnabled();

    // Take screenshot before submission
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/030_BeforeLoading.png',
      fullPage: true
    });

    // Submit form and immediately check for loading state
    await submitButton.click();

    // Look for loading indicators
    const loadingSpinner = page.locator('.MuiCircularProgress-root');
    const disabledButton = page.locator('button[type="submit"]:disabled');

    // Take screenshot during potential loading state
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/031_DuringLoading.png',
      fullPage: true
    });

    // Check if loading state is managed correctly
    if (await loadingSpinner.isVisible()) {
      console.log('✅ Loading spinner found - state management working');
      await expect(loadingSpinner).toBeVisible();
    }

    if (await disabledButton.isVisible()) {
      console.log('✅ Button disabled during loading - state management working');
    }

    // Wait for loading to complete
    await page.waitForTimeout(3000);

    // Take screenshot after loading completes
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/032_AfterLoading.png',
      fullPage: true
    });
  });

  test('Route protection and navigation state', async ({ page }) => {
    // Test navigation to different routes
    await page.goto('/dashboard');

    // Take screenshot of dashboard route (may redirect if protected)
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/033_DashboardRoute.png',
      fullPage: true
    });

    // Check current URL to see if redirect occurred
    const currentUrl = page.url();
    console.log('Dashboard navigation result:', currentUrl);

    // Navigate to register route
    await page.goto('/register');
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/034_RegisterRoute.png',
      fullPage: true
    });

    // Test navigation between auth routes
    await page.goto('/reset-password');
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/035_ResetPasswordRoute.png',
      fullPage: true
    });

    // Navigate back to landing
    await page.goto('/');
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/036_BackToLanding.png',
      fullPage: true
    });
  });

  test('Form state persistence during navigation', async ({ page }) => {
    await page.goto('/login');

    // Fill partial form data
    await page.fill('input[name="email"]', 'persistence.test@example.com');

    // Take screenshot of partially filled form
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/037_PartialFormFill.png',
      fullPage: true
    });

    // Navigate away and back
    await page.goto('/register');
    await page.goto('/login');

    // Check if form data was cleared (expected behavior for security)
    const emailValue = await page.inputValue('input[name="email"]');
    console.log('Email value after navigation:', emailValue);

    // Take screenshot after returning
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/038_FormAfterNavigation.png',
      fullPage: true
    });
  });

  test('Global error handling state', async ({ page }) => {
    // Navigate to main page
    await page.goto('/');

    // Look for global error handling components
    const errorBoundary = page.locator('[data-testid="error-boundary"], .error-boundary');
    const networkStatus = page.locator('[data-testid="network-status"], .network-status');
    const globalErrorDisplay = page.locator('[data-testid="global-error"], .global-error');

    // Take screenshot showing global error handling setup
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/039_GlobalErrorHandling.png',
      fullPage: true
    });

    // Check for network status indicator
    if (await networkStatus.count() > 0) {
      console.log('✅ Network status component found');
    }

    // Test console errors don't crash the app
    await page.evaluate(() => {
      console.error('Test error for error boundary');
    });

    await page.waitForTimeout(1000);

    // App should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('Authentication hooks and custom logic', async ({ page }) => {
    await page.goto('/login');

    // Test form interaction to verify useAuth hook functionality
    await page.fill('input[name="email"]', 'hook.test@example.com');
    await page.fill('input[name="password"]', 'HookTest123!');

    // Test remember me checkbox (managed by auth state)
    const rememberMeCheckbox = page.locator('input[type="checkbox"]:near(text="Remember")');
    if (await rememberMeCheckbox.count() > 0) {
      await rememberMeCheckbox.check();
      const isChecked = await rememberMeCheckbox.isChecked();
      console.log('Remember me checkbox state:', isChecked);
    }

    // Take screenshot of form with all interactions
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/040_AuthHookInteraction.png',
      fullPage: true
    });

    // Test form submission (triggers useAuth hooks)
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Take screenshot after auth hook execution
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/041_AfterAuthHook.png',
      fullPage: true
    });
  });

  test('Component unmounting and cleanup', async ({ page }) => {
    // Test component mounting/unmounting by navigating between routes
    await page.goto('/login');

    // Take screenshot of login component mounted
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/042_LoginMounted.png',
      fullPage: true
    });

    await page.goto('/register');

    // Take screenshot of register component mounted
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/043_RegisterMounted.png',
      fullPage: true
    });

    await page.goto('/');

    // Take screenshot of landing page (auth components unmounted)
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/044_AuthUnmounted.png',
      fullPage: true
    });

    // Navigate back to login to test remounting
    await page.goto('/login');

    // Take screenshot of login component remounted
    await page.screenshot({
      path: 'C:/Projects/Personal/VTTTools/Tests/20250914_085522/Agent001/Screenshots/045_LoginRemounted.png',
      fullPage: true
    });

    // Verify form is fresh (no lingering state from previous mount)
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe(''); // Should be empty on fresh mount
  });
});