/**
 * Shared Authentication State Step Definitions
 *
 * Common steps for managing authentication state across features
 * Used by: Login, Registration, Password Reset, Logout
 *
 * ANTI-PATTERN COMPLIANCE:
 * ✅ No step-to-step calls
 * ✅ Strong TypeScript types
 * ✅ Condition-based waits
 */

import { Given } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';

// ============================================================================
// GIVEN Steps - Authentication State Setup
// ============================================================================

Given('I am not currently authenticated', async function (this: CustomWorld) {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});

Given('I enter valid credentials', async function (this: CustomWorld) {
    const password = process.env.BDD_TEST_PASSWORD!;
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
});
