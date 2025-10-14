/**
 * Accordion Step Definitions (Tier 2)
 *
 * BEST PRACTICE: Extract shared logic to helper functions, not step-to-step calls
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';
import { Page } from '@playwright/test';

// ============================================================================
// HELPER FUNCTIONS (Reusable logic extracted properly)
// ============================================================================

async function expandAccordion(page: Page, accordionName: string): Promise<void> {
    const header = page.locator(`button:has-text("${accordionName}")`);
    const isExpanded = await header.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
        await header.click();
    }
}

async function verifyAccordionExpanded(page: Page, accordionName: string): Promise<void> {
    const header = page.locator(`button:has-text("${accordionName}")`);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
}

async function verifyAccordionCollapsed(page: Page, accordionName: string): Promise<void> {
    const header = page.locator(`button:has-text("${accordionName}")`);
    await expect(header).toHaveAttribute('aria-expanded', 'false');
}

// ============================================================================
// STEP DEFINITIONS (Call helpers, don't call other steps)
// ============================================================================

When('I expand the {string} accordion', async function (this: CustomWorld, accordionName: string) {
    await expandAccordion(this.page, accordionName);
});

When('I expand {string} accordion', async function (this: CustomWorld, accordionName: string) {
    await expandAccordion(this.page, accordionName);
});

When('I click the {string} header', async function (this: CustomWorld, accordionName: string) {
    await this.page.click(`button:has-text("${accordionName}")`);
});

Then('the {string} accordion should be expanded', async function (this: CustomWorld, accordionName: string) {
    await verifyAccordionExpanded(this.page, accordionName);
});

Then('the {string} accordion should be expanded by default', async function (this: CustomWorld, accordionName: string) {
    await verifyAccordionExpanded(this.page, accordionName);
});

Then('the {string} accordion should be collapsed', async function (this: CustomWorld, accordionName: string) {
    await verifyAccordionCollapsed(this.page, accordionName);
});

Then('the accordion should expand', async function (this: CustomWorld) {
    // Wait for animation to complete using load state
    await this.page.waitForLoadState('domcontentloaded');
});

Then('the {string} accordion should show {string} badge', async function (this: CustomWorld, accordionName: string, badgeText: string) {
    const accordion = this.page.locator(`button:has-text("${accordionName}")`);
    await expect(accordion.locator(`[role="status"]:has-text("${badgeText}")`)).toBeVisible();
});

Then('the {string} accordion should appear and be expanded', async function (this: CustomWorld, accordionName: string) {
    await expect(this.page.locator(`button:has-text("${accordionName}")`)).toBeVisible();
    await verifyAccordionExpanded(this.page, accordionName);
});

Then('the {string} accordion should appear and be collapsed', async function (this: CustomWorld, accordionName: string) {
    await expect(this.page.locator(`button:has-text("${accordionName}")`)).toBeVisible();
    await verifyAccordionCollapsed(this.page, accordionName);
});
