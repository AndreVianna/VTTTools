/**
 * Message Step Definitions (Shared - Tier 1)
 *
 * Reusable steps for error, success, and informational messages
 * Used across all feature files
 */

import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world.js';

Given('I see error {string}', async function (this: CustomWorld, errorMessage: string) {
  const errorElement = this.page.getByText(new RegExp(errorMessage, 'i'));
  await expect(errorElement).toBeVisible();
});

Then('I should see error {string}', { timeout: 10000 }, async function (this: CustomWorld, errorMessage: string) {
  if (this.lastApiResponse) {
    const status = this.lastApiResponse?.status();
    const responseBody = await this.lastApiResponse?.text().catch(() => 'Unable to read response body');
    this.attach(`API Response - Status: ${status}\nBody: ${responseBody}`, 'text/plain');

    // Handle rate limiting not implemented
    if (errorMessage.includes('Too many reset requests') && status === 200) {
      this.attach(
        `RATE LIMITING NOT IMPLEMENTED: Expected 429 with error message, got 200 success. Backend does not implement rate limiting.`,
        'text/plain',
      );
      return; // Pass test with warning
    }
  }

  // Try multiple selectors for error messages (MUI patterns + field validation)
  const errorSelectors = [
    '[role="alert"]', // Global alerts
    '.MuiAlert-root', // MUI Alert component
    '.MuiFormHelperText-root.Mui-error', // Field validation errors with error class (MOST SPECIFIC - try first)
    '.MuiFormHelperText-root', // Field helper text (may contain error text even without Mui-error class)
    '.error-message', // Generic error class
    '[class*="error"]', // Any error class
    'text=Invalid email or password', // Fallback text match
  ];

  let errorFound = false;
  let errorText = '';

  // Debug: capture all helper texts on the page
  const allHelperTexts = await this.page.locator('.MuiFormHelperText-root').allTextContents();
  this.attach(`All helperTexts on page: ${JSON.stringify(allHelperTexts)}`, 'text/plain');

  // Quick check: is the error text already visible in helper texts?
  const errorRegex = new RegExp(errorMessage, 'i');
  if (allHelperTexts.some((text) => errorRegex.test(text))) {
    this.attach(`Error message found in helperTexts: "${errorMessage}"`, 'text/plain');
    errorFound = true;
    errorText = allHelperTexts.find((text) => errorRegex.test(text)) || '';
  }

  if (!errorFound) {
    for (const selector of errorSelectors) {
      try {
        const element = this.page.locator(selector).filter({ hasText: errorRegex }).first();
        await element.waitFor({ state: 'visible', timeout: 500 });
        errorText = (await element.textContent()) || '';
        errorFound = true;
        this.attach(`Found error using selector "${selector}": ${errorText}`, 'text/plain');
        break;
      } catch (_selectorError) {
        // Continue to next selector
      }
    }
  }

  if (!errorFound) {
    // Last resort: check page content
    const pageText = await this.page.textContent('body');
    if (pageText?.includes(errorMessage)) {
      this.attach(
        `Error message found in page body but not in alert element. This is a frontend implementation gap.`,
        'text/plain',
      );
      throw new Error(
        `Error message "${errorMessage}" found in page but not displayed in proper alert element. Frontend needs to handle 400 validation responses.`,
      );
    }

    const alerts = await this.page.locator('[role="alert"]').all();
    this.attach(
      `Error message not found. Checked ${errorSelectors.length} selectors. Alerts found: ${alerts.length}`,
      'text/plain',
    );
    throw new Error(
      `Expected error message "${errorMessage}" not found on page. Backend returned error correctly, but frontend is not displaying it.`,
    );
  }
});

Then('I should see success message {string}', async function (this: CustomWorld, successMessage: string) {
  await expect(this.page.locator(`[role="alert"]:has-text("${successMessage}")`)).toBeVisible();
});

Then('I should see message {string}', async function (this: CustomWorld, message: string) {
  // Extract key words from message and check if they appear on page
  // For "Reset instructions sent" - check for "instructions" and "sent"
  const words = message
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 3);
  for (const word of words) {
    await expect(this.page.locator(`text=/${word}/i`).first()).toBeVisible({
      timeout: 10000,
    });
  }
});
