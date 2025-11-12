/**
 * Upload Helper
 *
 * Encapsulates image upload workflow
 * Handles file selection, upload completion, and resource ID extraction
 */

import type { Page } from '@playwright/test';

/**
 * Upload image and wait for completion
 */
export async function uploadImage(page: Page, filename: string, waitForCompletion: boolean = true): Promise<string> {
  await page.click('button:has-text("Upload")');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(`e2e/test-data/images/${filename}`);

  if (waitForCompletion) {
    const response = await page.waitForResponse(
      (resp) => resp.url().includes('/api/resources') && resp.request().method() === 'POST' && resp.status() === 201,
    );

    const body = await response.json();
    return body.id;
  }

  return '';
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(page: Page, count: number): Promise<string[]> {
  const resourceIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = await uploadImage(page, `test-image-${i}.png`);
    resourceIds.push(id);
  }

  return resourceIds;
}

/**
 * Upload image for token (new schema - tokens are managed via tokens array)
 */
export async function uploadToken(page: Page, filename: string, setAsDefault: boolean = false): Promise<string> {
  const tokenId = await uploadImage(page, filename);

  if (setAsDefault) {
    await page.locator(`[data-testid="token-${tokenId}"] input[type="radio"]`).check();
  }

  return tokenId;
}

/**
 * Upload portrait (new schema - separate portrait field)
 */
export async function uploadPortrait(page: Page, filename: string): Promise<string> {
  await page.locator('[data-testid="portrait-section"] button:has-text("Upload")').click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(`e2e/test-data/images/${filename}`);

  const response = await page.waitForResponse(
    (resp) => resp.url().includes('/api/resources') && resp.request().method() === 'POST' && resp.status() === 201,
  );

  const body = await response.json();
  return body.id;
}
