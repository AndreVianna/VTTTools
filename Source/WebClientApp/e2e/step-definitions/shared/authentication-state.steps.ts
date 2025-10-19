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

Given('I am authenticated as {string}', { timeout: 30000 }, async function (this: CustomWorld, _displayName: string) {
    const password = process.env.BDD_TEST_PASSWORD!;
    await this.page.goto('/login');
    await this.page.getByLabel(/email/i).fill(this.currentUser.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
});
