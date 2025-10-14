/**
 * Upload Helper
 *
 * Encapsulates image upload workflow
 * Handles file selection, upload completion, and resource ID extraction
 */

import { Page } from '@playwright/test';
import { KeyboardModifierHelper } from './keyboard.helper.js';

export enum ResourceRole {
    None = 0,
    Token = 1,
    Display = 2,
    Both = 3
}

/**
 * Upload image and wait for completion
 */
export async function uploadImage(
    page: Page,
    filename: string,
    waitForCompletion: boolean = true
): Promise<string> {
    // Click Upload button
    await page.click('button:has-text("Upload")');

    // Set file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(`e2e/test-data/images/${filename}`);

    if (waitForCompletion) {
        // Wait for upload API call
        const response = await page.waitForResponse(resp =>
            resp.url().includes('/api/resources') &&
            resp.request().method() === 'POST' &&
            resp.status() === 201
        );

        // Extract resource ID from response
        const body = await response.json();
        return body.id;
    }

    return '';
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
    page: Page,
    count: number
): Promise<string[]> {
    const resourceIds: string[] = [];

    for (let i = 0; i < count; i++) {
        const id = await uploadImage(page, `test-image-${i}.png`);
        resourceIds.push(id);
    }

    return resourceIds;
}

/**
 * Upload image and assign role via keyboard shortcut
 */
export async function uploadAndAssignRole(
    page: Page,
    keyboard: KeyboardModifierHelper,
    filename: string,
    role: ResourceRole
): Promise<string> {
    const resourceId = await uploadImage(page, filename);
    const selector = `[data-resource-id="${resourceId}"]`;

    switch (role) {
        case ResourceRole.Token:
            await keyboard.altClick(selector);
            break;
        case ResourceRole.Display:
            await keyboard.ctrlClick(selector);
            break;
        case ResourceRole.Both:
            await keyboard.ctrlAltClick(selector);
            break;
        case ResourceRole.None:
            // No action needed
            break;
    }

    return resourceId;
}
