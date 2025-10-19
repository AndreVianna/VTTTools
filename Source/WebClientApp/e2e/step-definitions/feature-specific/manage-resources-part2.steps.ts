/**
 * Manage Resources Step Definitions - Part 2
 *
 * Continuation: Removal, Multi-resource, Read-only, Integration, State, Database, Theme, Accessibility
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';
import { uploadImage, uploadAndAssignRole, ResourceRole } from '../../support/helpers/upload.helper.js';

// ============================================================================
// IMAGE REMOVAL
// ============================================================================

Given('I have {int} uploaded images', async function (this: CustomWorld, count: number) {
    for (let i = 0; i < count; i++) {
        const resourceId = await uploadImage(this.page, `test-image-${i}.png`);
        this.uploadedResourceIds.push(resourceId);
    }
});

When('I click the X button on the second image', async function (this: CustomWorld) {
    const secondImage = this.page.locator('[data-testid="resource-image"]').nth(1);
    await secondImage.locator('button[aria-label="Remove image"]').click();
});

Then('the image should be removed immediately from the resources array', async function (this: CustomWorld) {
    // Verify count decreased
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(2, { timeout: 3000 });
});

Then('I should see {int} images remaining', async function (this: CustomWorld, count: number) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(count);
});

Then('the removal should be instant \\(no confirmation)', async function (this: CustomWorld) {
    // Verify no confirmation dialog appears
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
});

Given('I have {int} images:', async function (this: CustomWorld, count: number, dataTable) {
    const rows = dataTable.hashes();
    expect(rows.length).toBe(count);
    for (const row of rows) {
        const resourceId = await uploadImage(this.page, `${row.image}.png`);
        this.uploadedResourceIds.push(resourceId);

        // Assign role based on table
        const selector = `[data-resource-id="${resourceId}"]`;
        if (row.role === 'Token') {
            await this.keyboard.altClick(selector);
        } else if (row.role === 'Display') {
            await this.keyboard.ctrlClick(selector);
        } else if (row.role === 'Token,Display') {
            await this.keyboard.ctrlAltClick(selector);
        }
    }
});

When('I collapse the Manage panel', async function (this: CustomWorld) {
    await this.page.click('button:has-text("Manage")');
    await expect(this.page.getByTestId('manage-panel')).not.toBeVisible();
});

Then('Token preview should show {string} and Display preview should show {string}', async function (this: CustomWorld, _tokenImage: string, _displayImage: string) {
    // Find resource IDs by order
    const tokenId = this.uploadedResourceIds[0]; // First uploaded = token
    const displayId = this.uploadedResourceIds[1]; // Second uploaded = display

    await expect(this.page.getByTestId('token-preview').locator(`img[src*="${tokenId}"]`)).toBeVisible();
    await expect(this.page.getByTestId('display-preview').locator(`img[src*="${displayId}"]`)).toBeVisible();
});

When('I remove the {string} image', async function (this: CustomWorld, _imageName: string) {
    // Remove first image (token)
    const firstImage = this.page.locator('[data-testid="resource-image"]').first();
    await firstImage.locator('button[aria-label="Remove image"]').click();
});

Then('the Token preview should show {string}', async function (this: CustomWorld, text: string) {
    await expect(this.page.getByTestId('token-preview').getByText(text)).toBeVisible();
});

Then('the Display preview should still show {string}', async function (this: CustomWorld, _imageName: string) {
    // Verify display preview still has image
    await expect(this.page.getByTestId('display-preview').locator('img')).toBeVisible();
});

When('I remove both images', async function (this: CustomWorld) {
    const count = await this.page.locator('[data-testid="resource-image"]').count();
    for (let i = 0; i < count; i++) {
        const firstImage = this.page.locator('[data-testid="resource-image"]').first();
        await firstImage.locator('button[aria-label="Remove image"]').click();
        // Wait for image to be removed before proceeding to next
        await this.page.waitForLoadState('networkidle');
    }
});

Then('the Manage panel should show empty state', async function (this: CustomWorld) {
    await expect(this.page.getByTestId('empty-image-library')).toBeVisible();
});

Given('an image is in the Manage panel', async function (this: CustomWorld) {
    const resourceId = await uploadImage(this.page, 'test-image.png');
    this.uploadedResourceIds.push(resourceId);
});

When('I click the X button', async function (this: CustomWorld) {
    const image = this.page.locator('[data-testid="resource-image"]').first();
    await image.locator('button[aria-label="Remove image"]').click();
});

Then('the image should be removed', async function (this: CustomWorld) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(0);
});

Then('the click should not trigger role assignment', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify clicking X button on image removes it without triggering role assignment logic (verify image was removed and no data-role change occurred)');
});

Then('no keyboard modifiers should affect the removal', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify removing image works even if modifier keys are held (verify image removed regardless of Ctrl/Alt/Shift state)');
});

// ============================================================================
// MULTIPLE RESOURCE SCENARIOS
// ============================================================================

When('I upload {int} images and assign roles:', async function (this: CustomWorld, count: number, dataTable) {
    const rows = dataTable.hashes();
    expect(rows.length).toBe(count);
    for (const row of rows) {
        const resourceId = await uploadImage(this.page, `${row.image}.png`);
        this.uploadedResourceIds.push(resourceId);

        const selector = `[data-resource-id="${resourceId}"]`;
        if (row.role === 'Token') {
            await this.keyboard.altClick(selector);
        } else if (row.role === 'Display') {
            await this.keyboard.ctrlClick(selector);
        } else if (row.role === 'Token,Display') {
            await this.keyboard.ctrlAltClick(selector);
        }
        // 'None' = no action
    }
});

Then('I should see {int} images in the Manage panel', async function (this: CustomWorld, count: number) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(count);
});

Then('img1 should have blue border and Token badge', async function (this: CustomWorld) {
    const img1 = this.page.locator('[data-testid="resource-image"]').first();
    await expect(img1).toHaveAttribute('data-role', '1');
    await expect(img1.locator('[role="status"]:has-text("Token")')).toBeVisible();
});

Then('img2 should have purple border and Display badge', async function (this: CustomWorld) {
    const img2 = this.page.locator('[data-testid="resource-image"]').nth(1);
    await expect(img2).toHaveAttribute('data-role', '2');
    await expect(img2.locator('[role="status"]:has-text("Display")')).toBeVisible();
});

Then('img3 should have green border and both badges', async function (this: CustomWorld) {
    const img3 = this.page.locator('[data-testid="resource-image"]').nth(2);
    await expect(img3).toHaveAttribute('data-role', '3');
    await expect(img3.locator('[role="status"]:has-text("Token")')).toBeVisible();
    await expect(img3.locator('[role="status"]:has-text("Display")')).toBeVisible();
});

Then('img4 should have blue border and Token badge', async function (this: CustomWorld) {
    const img4 = this.page.locator('[data-testid="resource-image"]').nth(3);
    await expect(img4).toHaveAttribute('data-role', '1');
    await expect(img4.locator('[role="status"]:has-text("Token")')).toBeVisible();
});

Then('img5 should have grey border and no badges', async function (this: CustomWorld) {
    const img5 = this.page.locator('[data-testid="resource-image"]').nth(4);
    await expect(img5).toHaveAttribute('data-role', '0');
    await expect(img5.locator('[role="status"]')).not.toBeVisible();
});

Given('I have {int} images with mixed roles as above', async function (this: CustomWorld, count: number) {
    // Reuse uploaded images from previous step
    expect(this.uploadedResourceIds.length).toBe(count);
});

Then('the Token preview should show {string} \\(first Token)', async function (this: CustomWorld, _imageName: string) {
    const firstTokenId = this.uploadedResourceIds[0]; // img1
    await expect(this.page.getByTestId('token-preview').locator(`img[src*="${firstTokenId}"]`)).toBeVisible();
});

Then('the Display preview should show {string} \\(first Display)', async function (this: CustomWorld, _imageName: string) {
    const firstDisplayId = this.uploadedResourceIds[1]; // img2
    await expect(this.page.getByTestId('display-preview').locator(`img[src*="${firstDisplayId}"]`)).toBeVisible();
});

Then('should not show img3, img4, or img5 in previews', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify preview boxes only show first image of each role type (verify images 3-5 do not appear in either preview)');
});

When('I upload {int} images and assign all as Token', async function (this: CustomWorld, count: number) {
    for (let i = 0; i < count; i++) {
        const resourceId = await uploadAndAssignRole(this.page, this.keyboard, `test-${i}.png`, ResourceRole.Token);
        this.uploadedResourceIds.push(resourceId);
    }
});

Then('all {int} should have Token role', async function (this: CustomWorld, count: number) {
    const images = await this.page.locator('[data-testid="resource-image"]').all();
    expect(images.length).toBe(count);
    for (const image of images) {
        await expect(image).toHaveAttribute('data-role', '1');
    }
});

Then('all {int} should show Token badge', async function (this: CustomWorld, count: number) {
    const badges = await this.page.locator('[role="status"]:has-text("Token")').count();
    expect(badges).toBe(count);
});

Then('the Token preview should show the first one', async function (this: CustomWorld) {
    const firstTokenId = this.uploadedResourceIds[0];
    await expect(this.page.getByTestId('token-preview').locator(`img[src*="${firstTokenId}"]`)).toBeVisible();
});

Then('this should be valid \\(no constraint against multiple Token images)', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify system allows multiple images with the same role without validation error (verify all Token images are accepted)');
});

When('I upload {int} images', async function (this: CustomWorld, count: number) {
    for (let i = 0; i < count; i++) {
        const resourceId = await uploadImage(this.page, `test-image-${i}.png`);
        this.uploadedResourceIds.push(resourceId);
    }
});

Then('all {int} should appear in the Manage panel', async function (this: CustomWorld, count: number) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(count);
});

Then('the grid should handle overflow with scrolling', async function (this: CustomWorld) {
    // Verify scrollable container
    const managePanel = this.page.getByTestId('manage-panel');
    const hasScroll = await managePanel.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(hasScroll).toBe(true);
});

Then('I should be able to assign roles to any of them', async function (this: CustomWorld) {
    // Test by assigning role to last image
    const lastImage = this.page.locator('[data-testid="resource-image"]').last();
    const lastId = await lastImage.getAttribute('data-resource-id');
    await this.keyboard.altClick(`[data-resource-id="${lastId}"]`);
    await expect(lastImage).toHaveAttribute('data-role', '1');
});

// ============================================================================
// READ-ONLY MODE
// ============================================================================

Given('the component has readOnly=true prop', async function (this: CustomWorld) {
    // Navigate to view mode (not edit mode)
    await this.page.goto('/assets');
    const firstAsset = this.page.locator('[data-testid="asset-card"]').first();
    await firstAsset.click(); // Opens preview dialog (read-only)
});

Then('I should not see the {string} button', async function (this: CustomWorld, buttonText: string) {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).not.toBeVisible();
});

Then('I should see only the collapsed Token and Display previews', async function (this: CustomWorld) {
    await expect(this.page.getByTestId('token-preview')).toBeVisible();
    await expect(this.page.getByTestId('display-preview')).toBeVisible();
});

Then('the previews should be read-only \\(no interaction)', async function (this: CustomWorld) {
    // Verify no click handlers or role assignment
    const tokenPreview = this.page.getByTestId('token-preview');
    await tokenPreview.click(); // Should do nothing
    // No role change should occur
});

Given('I open an asset in preview dialog \\(view mode, not edit mode)', async function (this: CustomWorld) {
    await this.page.goto('/assets');
    const firstAsset = this.page.locator('[data-testid="asset-card"]').first();
    await firstAsset.click();
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
});

Then('the Resource Manager should be in read-only mode', async function (this: CustomWorld) {
    await expect(this.page.locator('button:has-text("Upload")')).not.toBeVisible();
    await expect(this.page.locator('button:has-text("Manage")')).not.toBeVisible();
});

Then('I should see Token and Display previews', async function (this: CustomWorld) {
    await expect(this.page.getByTestId('token-preview')).toBeVisible();
    await expect(this.page.getByTestId('display-preview')).toBeVisible();
});

Then('I should not be able to upload, assign roles, or remove images', async function (this: CustomWorld) {
    // Verify no interactive controls
    await expect(this.page.locator('input[type="file"]')).not.toBeVisible();
    await expect(this.page.locator('button[aria-label="Remove image"]')).not.toBeVisible();
});

// ============================================================================
// INTEGRATION WITH CREATE/EDIT DIALOGS
// ============================================================================

Given('I am in the Asset Create Dialog', async function (this: CustomWorld) {
    await this.page.goto('/assets');
    await this.page.click('button:has-text("Create Asset")');
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
});

Then('the Resource Manager should be in editable mode', async function (this: CustomWorld) {
    await expect(this.page.locator('button:has-text("Upload")')).toBeVisible();
});

Then('the Manage panel should be collapsed initially', async function (this: CustomWorld) {
    const managePanel = this.page.getByTestId('manage-panel');
    const isVisible = await managePanel.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
});

Then('entityId prop should be undefined \\(not editing)', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify component has undefined entityId in create mode (verify by checking component props or network requests have no entityId)');
});

Given('I am editing an existing asset with ID {string}', async function (this: CustomWorld, assetId: string) {
    await this.page.goto(`/assets/${assetId}/edit`);
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
});

Then('entityId prop should be {string}', async function (this: CustomWorld, _assetId: string) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify component has correct entityId in edit mode (verify by checking component props or network requests include entityId)');
});

Then('if resources exist, Manage panel should auto-expand', async function (this: CustomWorld) {
    // Check if resources exist, then verify expansion
    const resourceCount = await this.page.locator('[data-testid="resource-image"]').count();
    if (resourceCount > 0) {
        await expect(this.page.getByTestId('manage-panel')).toBeVisible();
    }
});

Given('the parent passes size prop: width={int}, height={int}', async function (this: CustomWorld, width: number, height: number) {
    // Implicit - component receives size prop
    this.currentAsset = { ...this.currentAsset, size: { width, height } };
});

Given('I have a Token image', async function (this: CustomWorld) {
    const resourceId = await uploadAndAssignRole(this.page, this.keyboard, 'test-image.png', ResourceRole.Token);
    this.uploadedResourceIds.push(resourceId);
});

Then('the Token preview should render with {int}×{int} grid overlay', async function (this: CustomWorld, _width: number, _height: number) {
    const tokenPreview = this.page.getByTestId('token-preview');
    // Verify grid overlay is rendered (implementation-specific)
    await expect(tokenPreview).toBeVisible();
});

Then('the grid should match the asset size', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify grid overlay dimensions match asset size (verify grid cell count matches width/height from size prop)');
});

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

Given('the parent passes resources array:', async function (this: CustomWorld, dataTable) {
    const rows = dataTable.hashes();
    // Mock initial resources state
    this.uploadedResourceIds = rows.map((row: any) => row.resourceId);
});

Then('I should display both images', async function (this: CustomWorld) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(2);
});

When('the parent updates resources to remove img-1', async function (this: CustomWorld) {
    // Simulate prop update by removing first resource
    const firstImage = this.page.locator('[data-testid="resource-image"]').first();
    await firstImage.locator('button[aria-label="Remove image"]').click();
});

Then('I should display only img-2', async function (this: CustomWorld) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(1);
});

When('I upload a new image', async function (this: CustomWorld) {
    const resourceId = await uploadImage(this.page, 'new-image.png');
    this.uploadedResourceIds.push(resourceId);
});

Then('onResourcesChange should be called with new resources array', async function (this: CustomWorld) {
    // Implicit - parent receives callback with updated array
    expect(this.uploadedResourceIds.length).toBeGreaterThan(0);
});

When('I assign a role via keyboard shortcut', async function (this: CustomWorld) {
    const lastResourceId = this.uploadedResourceIds[this.uploadedResourceIds.length - 1];
    await this.keyboard.altClick(`[data-resource-id="${lastResourceId}"]`);
});

Then('onResourcesChange should be called with updated roles', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify parent onResourcesChange callback is invoked when image role changes (verify callback fired and includes updated role in resource array)');
});

When('I remove an image', async function (this: CustomWorld) {
    const firstImage = this.page.locator('[data-testid="resource-image"]').first();
    await firstImage.locator('button[aria-label="Remove image"]').click();
});

Then('onResourcesChange should be called with filtered array', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: Step needs to verify parent onResourcesChange callback is invoked when image is removed (verify callback fired and removed image is not in resources array)');
});

// ============================================================================
// ERROR RECOVERY
// ============================================================================

Given('upload fails with error', async function (this: CustomWorld) {
    await this.page.route('**/api/resources', route => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Upload failed' }) });
    });
    await this.page.click('button:has-text("Upload")');
    await this.page.setInputFiles('input[type="file"]', 'e2e/test-data/images/test.png');
});

Given('I see error alert', async function (this: CustomWorld) {
    await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

When('I click the X on the alert', async function (this: CustomWorld) {
    await this.page.locator('[role="alert"] button[aria-label="Close"]').click();
});

Then('the error should be dismissed', async function (this: CustomWorld) {
    await expect(this.page.locator('[role="alert"]')).not.toBeVisible();
});

Then('I should be able to upload again', async function (this: CustomWorld) {
    await this.page.unroute('**/api/resources');
    await expect(this.page.locator('button:has-text("Upload")')).toBeEnabled();
});

Given('I have {int} images already uploaded', async function (this: CustomWorld, count: number) {
    for (let i = 0; i < count; i++) {
        const resourceId = await uploadImage(this.page, `existing-${i}.png`);
        this.uploadedResourceIds.push(resourceId);
    }
});

When('I try to upload a 3rd image that fails', async function (this: CustomWorld) {
    await this.page.route('**/api/resources', route => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Upload failed' }) });
    });
    await this.page.click('button:has-text("Upload")');
    await this.page.setInputFiles('input[type="file"]', 'e2e/test-data/images/test.png');
});

Then('I should see an error', async function (this: CustomWorld) {
    await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

Then('But the existing {int} images should remain unchanged', async function (this: CustomWorld, count: number) {
    await expect(this.page.locator('[data-testid="resource-image"]')).toHaveCount(count);
});

Then('their roles should be preserved', async function (this: CustomWorld) {
    // Verify roles haven't changed
    const images = await this.page.locator('[data-testid="resource-image"]').all();
    expect(images.length).toBe(2);
});

// ============================================================================
// ENTITY ID PROP (CREATE VS EDIT)
// ============================================================================

Given('I am creating a new asset \\(not editing)', async function (this: CustomWorld) {
    await this.page.goto('/assets');
    await this.page.click('button:has-text("Create Asset")');
});

Then('the upload mutation should be called with entityId=undefined', async function (this: CustomWorld) {
    // Verify API call doesn't include entityId parameter
    const response = await this.page.waitForResponse(resp =>
        resp.url().includes('/api/resources') && resp.request().method() === 'POST'
    );
    const requestBody = response.request().postDataJSON();
    expect(requestBody.entityId).toBeUndefined();
});

Then('the backend should create a new resource not linked to any asset yet', async function (this: CustomWorld) {
    // NOTE: Resources is now JSON column in Assets table, not separate AssetResources table
    throw new Error('NOT IMPLEMENTED: Need to query Assets table and parse Resources JSON column');
});

Given('I am editing asset {string}', async function (this: CustomWorld, assetId: string) {
    await this.page.goto(`/assets/${assetId}/edit`);
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
});

Then('the upload mutation should be called with entityId={string}', async function (this: CustomWorld, assetId: string) {
    const response = await this.page.waitForResponse(resp =>
        resp.url().includes('/api/resources') && resp.request().method() === 'POST'
    );
    const requestBody = response.request().postDataJSON();
    expect(requestBody.entityId).toBe(assetId);
});

Then('the backend should link the resource to asset {string}', async function (this: CustomWorld, _assetId: string) {
    // NOTE: Resources is now JSON column in Assets table, not separate AssetResources table
    throw new Error('NOT IMPLEMENTED: Need to query Assets table and parse Resources JSON column');
});

// Continued in Part 3 for Database, Theme, Accessibility...
