/**
 * Message Step Definitions (Shared - Tier 1)
 *
 * Reusable steps for error, success, and informational messages
 * Used across all feature files
 */

import { Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';

Then('I should see error {string}', async function (this: CustomWorld, errorMessage: string) {
    if (this.lastApiResponse) {
        const status = this.lastApiResponse.status();
        const responseBody = await this.lastApiResponse.text().catch(() => 'Unable to read response body');
        this.attach(`API Response - Status: ${status}\nBody: ${responseBody}`, 'text/plain');
    }

    // Try multiple selectors for error messages (MUI patterns)
    const errorSelectors = [
        '[role="alert"]',
        '.MuiAlert-root',
        '.error-message',
        '[class*="error"]',
        'text=Invalid email or password'
    ];

    let errorFound = false;
    let errorText = '';

    for (const selector of errorSelectors) {
        try {
            const element = this.page.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 3000 });
            errorText = await element.textContent() || '';
            if (errorText.includes(errorMessage)) {
                errorFound = true;
                this.attach(`Found error using selector "${selector}": ${errorText}`, 'text/plain');
                break;
            }
        } catch {
            // Continue to next selector
        }
    }

    if (!errorFound) {
        // Last resort: check page content
        const pageText = await this.page.textContent('body');
        if (pageText?.includes(errorMessage)) {
            this.attach(`Error message found in page body but not in alert element. This is a frontend implementation gap.`, 'text/plain');
            throw new Error(`Error message "${errorMessage}" found in page but not displayed in proper alert element. Frontend needs to handle 400 validation responses.`);
        }

        const alerts = await this.page.locator('[role="alert"]').all();
        this.attach(`Error message not found. Checked ${errorSelectors.length} selectors. Alerts found: ${alerts.length}`, 'text/plain');
        throw new Error(`Expected error message "${errorMessage}" not found on page. Backend returned error correctly, but frontend is not displaying it.`);
    }
});

Then('I should see success message {string}', async function (this: CustomWorld, successMessage: string) {
    await expect(this.page.locator(`[role="alert"]:has-text("${successMessage}")`)).toBeVisible();
});

Then('I should see message {string}', async function (this: CustomWorld, message: string) {
    await expect(this.page.locator(`:has-text("${message}")`)).toBeVisible();
});
