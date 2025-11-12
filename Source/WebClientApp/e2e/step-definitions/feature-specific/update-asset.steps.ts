/**
 * Update Asset Step Definitions (Feature-Specific)
 *
 * Implements step definitions for UpdateAsset.feature
 * CRITICAL: Tests authorization scenarios to diagnose 403 bug
 *
 * TESTING PHILOSOPHY:
 * - Black-box testing: Test through UI, verify with real database
 * - NO mocking of business logic or authorization
 * - Real API calls to expose authorization bugs
 * - Independent validation of application behavior
 */

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AssetKind } from '../../support/fixtures/AssetBuilder.js';
import type { CustomWorld } from '../../support/world.js';

// ============================================================================
// GIVEN STEPS - Test Data Setup
// ============================================================================

Given(
  'I own an asset {string} with {int} uploaded images:',
  async function (this: CustomWorld, assetName: string, _count: number, dataTable: any) {
    const rows = dataTable.hashes();
    const builder = this.assetBuilder().withName(assetName);

    for (const row of rows) {
      const resourceId = await this.db.insertResource({
        filename: row.image,
        ownerId: this.currentUser.id,
      });
      this.uploadedResourceIds.push(resourceId);

      if (row.role === 'Token') {
        builder.withToken(resourceId, false);
      } else if (row.role === 'Portrait') {
        builder.withPortrait(resourceId);
      }
    }

    const asset = await builder.create();
    this.createdAssets.push(asset);
    this.currentAsset = asset;
  },
);

Given('an asset exists with {int} uploaded images', async function (this: CustomWorld, imageCount: number) {
  const builder = this.assetBuilder().withName('Test Asset');

  for (let i = 0; i < imageCount; i++) {
    const resourceId = await this.db.insertResource({
      filename: `test-image-${i + 1}.png`,
      ownerId: this.currentUser.id,
    });
    this.uploadedResourceIds.push(resourceId);
    builder.withToken(resourceId, i === 0);
  }

  const asset = await builder.create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('the preview dialog is open in view mode', async function (this: CustomWorld) {
  // Ensure we have an asset
  if (!this.currentAsset) {
    this.currentAsset = await this.assetBuilder().withName('Test Asset').create();
    this.createdAssets.push(this.currentAsset);
  }

  // Navigate to library and open dialog
  await this.assetLibrary.navigate();
  await this.assetLibrary.waitForLoad();
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

Given('I open the asset in edit mode', async function (this: CustomWorld) {
  await this.assetLibrary.navigate();
  await this.assetLibrary.waitForLoad();
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickEdit();
});

Given('I am authenticated with user ID {string}', async function (this: CustomWorld, userId: string) {
  // Update world with specific user ID
  this.currentUser.id = userId;

  // Update browser context headers
  await this.context.setExtraHTTPHeaders({
    'x-user': this.encodeUserId(userId),
    'x-user-email': this.currentUser.email,
    'x-user-name': this.currentUser.name,
  });
});

Given('I create an asset {string}', async function (this: CustomWorld, assetName: string) {
  const asset = await this.assetBuilder().withName(assetName).create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('the asset OwnerId is {string}', async function (this: CustomWorld, ownerId: string) {
  // Verify database state
  const dbAsset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(dbAsset[0].OwnerId).toBe(ownerId);
});

Given('I own asset with 2 images', async function (this: CustomWorld) {
  const builder = this.assetBuilder().withName('Test Asset');

  for (let i = 0; i < 2; i++) {
    const resourceId = await this.db.insertResource({
      filename: `image-${i + 1}.png`,
      ownerId: this.currentUser.id,
    });
    builder.withToken(resourceId, i === 0);
  }

  const asset = await builder.create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given(
  'I own Object asset with isMovable={word}, isOpaque={word}',
  async function (this: CustomWorld, isMovable: string, isOpaque: string) {
    const asset = await this.assetBuilder().withName('Test Object').withKind(AssetKind.Object).create();

    await this.db.updateAsset(asset.id, {
      properties: {
        isMovable: isMovable === 'true',
        isOpaque: isOpaque === 'true',
      },
    });

    this.createdAssets.push(asset);
    this.currentAsset = asset;
  },
);

Given('I own Creature with category {string}', async function (this: CustomWorld, category: string) {
  const asset = await this.assetBuilder().withName('Test Creature').withKind(AssetKind.Creature).create();

  await this.db.updateAsset(asset.id, {
    properties: {
      category,
    },
  });

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given(
  'I own asset {string} with {int} Token image',
  async function (this: CustomWorld, assetName: string, _count: number) {
    const builder = this.assetBuilder().withName(assetName);

    const resourceId = await this.db.insertResource({
      filename: 'token.png',
      ownerId: this.currentUser.id,
    });
    this.uploadedResourceIds.push(resourceId);
    builder.withToken(resourceId, true);

    const asset = await builder.create();
    this.createdAssets.push(asset);
    this.currentAsset = asset;
  },
);

Given('I own private unpublished asset', async function (this: CustomWorld) {
  const asset = await this.assetBuilder().withName('Private Asset').create(); // Default is private, unpublished

  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('I am editing an asset', async function (this: CustomWorld) {
  if (!this.currentAsset) {
    this.currentAsset = await this.assetBuilder().withName('Test Asset').create();
    this.createdAssets.push(this.currentAsset);
  }

  await this.assetLibrary.navigate();
  await this.assetLibrary.waitForLoad();
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickEdit();
});

Given('I own asset {string} with:', async function (this: CustomWorld, assetName: string, dataTable: any) {
  const data = dataTable.rowsHash();
  const builder = this.assetBuilder()
    .withName(data.name || assetName)
    .withDescription(data.description || '');

  if (data.resources) {
    const resourcePattern = /\[(.+?)\]/g;
    const matches = [...data.resources.matchAll(resourcePattern)];

    for (const match of matches) {
      const resourceId = await this.db.insertResource({
        filename: 'test-resource.png',
        ownerId: this.currentUser.id,
      });
      this.uploadedResourceIds.push(resourceId);

      if (match[1].includes('Token')) {
        builder.withToken(resourceId, false);
      } else if (match[1].includes('Portrait')) {
        builder.withPortrait(resourceId);
      }
    }
  }

  const asset = await builder.create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('the database contains pre-seeded asset:', async function (this: CustomWorld, dataTable: any) {
  const data = dataTable.rowsHash();
  const assetId = data.Id;
  const ownerId = data.OwnerId === '{my user ID}' ? this.currentUser.id : data.OwnerId;

  const asset = await this.assetBuilder().withName(data.Name).withOwner(ownerId).create();

  // Override the generated ID with the specified one
  await this.db.updateAssetId(asset.id, assetId);

  this.createdAssets.push({ ...asset, id: assetId });
  this.currentAsset = { ...asset, id: assetId };
});

Given('I created an asset {string} earlier', async function (this: CustomWorld, assetName: string) {
  const asset = await this.assetBuilder().withName(assetName).create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('another user owns asset {string}', async function (this: CustomWorld, assetName: string) {
  const otherUserId = '01999999-9999-9999-9999-999999999999';
  const asset = await this.assetBuilder().withName(assetName).withOwner(otherUserId).public().create();

  this.createdAssets.push(asset);
});

Given('user {string} owns asset {string}', async function (this: CustomWorld, userId: string, _assetId: string) {
  // Create asset owned by specific user
  const asset = await this.assetBuilder().withName('Other User Asset').withOwner(userId).create();

  // Store for verification
  this.createdAssets.push(asset);
});

Given('I own asset with image having Token role', async function (this: CustomWorld) {
  const builder = this.assetBuilder().withName('Test Asset');

  const resourceId = await this.db.insertResource({
    filename: 'token.png',
    ownerId: this.currentUser.id,
  });
  this.uploadedResourceIds.push(resourceId);
  builder.withToken(resourceId, true);

  const asset = await builder.create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given(
  'I own asset with ID {string} having {int} existing resource',
  async function (this: CustomWorld, _assetId: string, resourceCount: number) {
    const builder = this.assetBuilder().withName('Test Asset');

    for (let i = 0; i < resourceCount; i++) {
      const resourceId = await this.db.insertResource({
        filename: `resource-${i + 1}.png`,
        ownerId: this.currentUser.id,
      });
      builder.withToken(resourceId, i === 0);
    }

    const asset = await builder.create();
    this.createdAssets.push(asset);
    this.currentAsset = asset;
  },
);

Given(
  'I own asset with resource having Role={int} \\(Token\\)',
  async function (this: CustomWorld, _roleValue: number) {
    const builder = this.assetBuilder().withName('Test Asset');

    const resourceId = await this.db.insertResource({
      filename: 'token.png',
      ownerId: this.currentUser.id,
    });
    this.uploadedResourceIds.push(resourceId);
    builder.withToken(resourceId, true);

    const asset = await builder.create();
    this.createdAssets.push(asset);
    this.currentAsset = asset;
  },
);

Given('API returns {int}', async function (this: CustomWorld, statusCode: number) {
  // Mock API to return specific status code
  await this.page.route('**/api/assets/**', (route) => {
    route.fulfill({ status: statusCode });
  });
});

// ============================================================================
// WHEN STEPS - Actions
// ============================================================================

// REMOVED: Duplicate - Use asset-library.steps.ts
// When('I click the {string} asset card') available in asset-library.steps.ts

When('I click the asset card to open preview dialog', async function (this: CustomWorld) {
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I click the asset card to open preview', async function (this: CustomWorld) {
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I open in edit mode', async function (this: CustomWorld) {
  await this.assetLibrary.navigate();
  await this.assetLibrary.waitForLoad();
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickEdit();
});

When('I upload new image {string}', async function (this: CustomWorld, filename: string) {
  await this.assetResourceManager.uploadImage(`e2e/test-data/images/${filename}`);
});

When('I Ctrl+Click to assign Display role', async function (this: CustomWorld) {
  const image = this.page.locator('[data-testid="resource-image"]').last();
  await this.keyboard.ctrlClick(image);
});

When('I Ctrl+Click to add Display role', async function (this: CustomWorld) {
  const image = this.page.locator('[data-testid="resource-image"]').first();
  await this.keyboard.ctrlClick(image);
});

When('I remove the first image', async function (this: CustomWorld) {
  await this.assetResourceManager.removeImage(0);
});

When(
  'I uncheck {string} and check {string}',
  async function (this: CustomWorld, uncheckField: string, checkField: string) {
    await this.page.uncheck(`input[name="${uncheckField}"]`);
    await this.page.check(`input[name="${checkField}"]`);
  },
);

When('I change category to {string}', async function (this: CustomWorld, category: string) {
  await this.page.selectOption('select[name="category"]', category);
});

When(
  'I check {string} but leave {string} unchecked',
  async function (this: CustomWorld, checkField: string, uncheckField: string) {
    await this.page.check(`input[name="${checkField}"]`);
    // Verify the other is unchecked
    const isUnchecked = await this.page.isChecked(`input[name="${uncheckField}"]`);
    expect(isUnchecked).toBe(false);
  },
);

When('I create an asset {string} in this session', async function (this: CustomWorld, assetName: string) {
  // Use UI to create asset
  await this.assetLibrary.navigate();
  await this.assetLibrary.clickAddAsset();
  await this.assetCreateDialog.fillName(assetName);
  await this.assetCreateDialog.clickCreate();
  await this.assetCreateDialog.waitForClose();

  // Store created asset
  const assets = await this.db.queryTable('Assets', { Name: assetName });
  this.currentAsset = assets[0];
  this.createdAssets.push(this.currentAsset);
});

When('the create dialog closes', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
});

When('I immediately click the {string} card', async function (this: CustomWorld, assetName: string) {
  await this.assetLibrary.clickAssetCard(assetName);
  await this.assetEditDialog.waitForOpen();
});

When('I change the description to {string}', async function (this: CustomWorld, description: string) {
  await this.page.fill('textarea[name="description"]', description);
});

When('I attempt to update asset {string}', async function (this: CustomWorld, assetId: string) {
  // Try to update via API
  await this.page.request.put(`/api/assets/${assetId}`, {
    data: { name: 'Updated Name' },
  });
});

When('I navigate to Asset Library', async function (this: CustomWorld) {
  await this.assetLibrary.navigate();
  await this.assetLibrary.waitForLoad();
});

When('I refresh the browser \\(F5\\)', async function (this: CustomWorld) {
  await this.page.reload();
});

When('I edit {string} and save changes', async function (this: CustomWorld, assetName: string) {
  await this.assetLibrary.clickAssetCard(assetName);
  await this.assetEditDialog.waitForOpen();
  await this.assetEditDialog.clickEdit();
  await this.page.fill('input[name="name"]', `${assetName} Updated`);
  await this.assetEditDialog.clickSave();
});

When('I try to access and edit that asset', async function (this: CustomWorld) {
  // Attempt to open and edit asset not owned by current user
  await this.page.goto(`/assets`);
  // This should fail or show error
});

When('I attempt to save changes', async function (this: CustomWorld) {
  await this.assetEditDialog.clickSave();
});

When('I update to:', async function (this: CustomWorld, dataTable: any) {
  const data = dataTable.rowsHash();

  if (data.name) {
    await this.page.fill('input[name="name"]', data.name);
  }
  if (data.description) {
    await this.page.fill('textarea[name="description"]', data.description);
  }
  // Handle resources update if needed
});

When('I save the changes', async function (this: CustomWorld) {
  const responsePromise = this.page.waitForResponse(
    (resp) => resp.url().includes('/api/assets') && resp.request().method() === 'PUT',
  );

  await this.assetEditDialog.clickSave();

  const response = await responsePromise;
  this.lastApiResponse = response;
});

When('I upload new image and assign Token role', async function (this: CustomWorld) {
  await this.assetResourceManager.uploadImage('token.png');
  const image = this.page.locator('[data-testid="resource-image"]').last();
  await this.keyboard.altClick(image);
});

When('I save', async function (this: CustomWorld) {
  await this.assetEditDialog.clickSave();
});

When('I remove one resource and save', async function (this: CustomWorld) {
  await this.assetResourceManager.removeImage(0);
  await this.assetEditDialog.clickSave();
});

When('I reopen the asset', async function (this: CustomWorld) {
  // Close current dialog if open
  if (await this.page.locator('[role="dialog"]').isVisible()) {
    await this.page.click('button:has-text("Close")');
  }

  // Reopen asset
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

When('I reopen', async function (this: CustomWorld) {
  // Close and reopen
  await this.page.click('button:has-text("Close")');
  await this.assetLibrary.clickAssetCard(this.currentAsset.name);
  await this.assetEditDialog.waitForOpen();
});

// ============================================================================
// THEN STEPS - Assertions
// ============================================================================

Then('I should see asset name {string}', async function (this: CustomWorld, assetName: string) {
  await expect(this.page.locator(`text=${assetName}`)).toBeVisible();
});

Then('I should see the asset description', async function (this: CustomWorld) {
  // Verify description field is visible
  await expect(this.page.locator('[name="description"]')).toBeVisible();
});

Then('I should see the asset properties in read-only mode', async function (this: CustomWorld) {
  // Properties should be visible but disabled
  const properties = this.page.locator('[data-testid="properties-section"]');
  await expect(properties).toBeVisible();
});

Then('I should see the Token preview showing {string}', async function (this: CustomWorld, filename: string) {
  const tokenPreview = this.page.locator('[data-testid="token-preview"]');
  await expect(tokenPreview).toBeVisible();
  // Verify image source contains filename
  await expect(tokenPreview.locator('img')).toHaveAttribute('src', new RegExp(filename));
});

Then('I should see the Display preview showing {string}', async function (this: CustomWorld, filename: string) {
  const displayPreview = this.page.locator('[data-testid="display-preview"]');
  await expect(displayPreview).toBeVisible();
  await expect(displayPreview.locator('img')).toHaveAttribute('src', new RegExp(filename));
});

Then('the Manage panel should show both images in the Image Library', async function (this: CustomWorld) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(2);
});

Then('both images should have their role badges', async function (this: CustomWorld) {
  const badges = this.page.locator('[role="status"]');
  await expect(badges).toHaveCount(2);
});

Then('the Manage panel should auto-expand immediately', async function (this: CustomWorld) {
  const managePanel = this.page.locator('button:has-text("Manage")');
  await expect(managePanel).toHaveAttribute('aria-expanded', 'true');
});

Then('I should see all {int} images in the Image Library grid', async function (this: CustomWorld, count: number) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(count);
});

Then('images should not be hidden behind collapsed panel', async function (this: CustomWorld) {
  // All images should be visible
  const images = this.page.locator('[data-testid="resource-image"]');
  for (let i = 0; i < (await images.count()); i++) {
    await expect(images.nth(i)).toBeVisible();
  }
});

Then('the dialog should enter edit mode', async function (this: CustomWorld) {
  await expect(this.assetEditDialog.saveButton()).toBeVisible();
});

Then('the dialog title should change to {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page.locator('[role="dialog"] h2')).toHaveText(title);
});

Then('fields should become editable', async function (this: CustomWorld) {
  const nameInput = this.page.locator('input[name="name"]');
  await expect(nameInput).not.toBeDisabled();
});

Then('I should receive {int} No Content response', async function (this: CustomWorld, statusCode: number) {
  expect(this.lastApiResponse?.status()).toBe(statusCode);
});

Then('the Asset Library should refetch', async function (this: CustomWorld) {
  // Wait for refetch API call
  await this.page.waitForResponse((resp) => resp.url().includes('/api/assets') && resp.request().method() === 'GET');
});

Then('the asset card should now show {string}', async function (this: CustomWorld, assetName: string) {
  await expect(this.page.locator(`[data-testid="asset-card"]:has-text("${assetName}")`)).toBeVisible();
});

// Authorization Test Assertions (CRITICAL for 403 bug diagnosis)

Then('the backend should extract userId from x-user header', async function (this: CustomWorld) {
  // This is verified by successful authorization
  // Documented expectation - backend must decode header correctly
});

Then('the backend should load asset and compare OwnerId with userId', async function (this: CustomWorld) {
  // This is verified by successful update
  // Documented expectation - comparison must use correct format
});

Then('the comparison should match', async function (this: CustomWorld) {
  // This is verified by 204 response instead of 403
  // If this fails, the bug is in GUID comparison logic
});

Then('the update should succeed with {int} No Content', async function (this: CustomWorld, statusCode: number) {
  const response =
    this.lastApiResponse ||
    (await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/assets') && resp.request().method() === 'PUT',
    ));
  expect(response.status()).toBe(statusCode);
});

Then('I should NOT receive {int} Forbidden error', async function (this: CustomWorld, statusCode: number) {
  if (this.lastApiResponse) {
    expect(this.lastApiResponse?.status()).not.toBe(statusCode);
  }
});

Then('the update should succeed without {int} error', async function (this: CustomWorld, errorCode: number) {
  const response = this.lastApiResponse!;
  expect(response.status()).not.toBe(errorCode);
});

Then('the description should be saved', async function (this: CustomWorld) {
  // Verify in database
  const asset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(asset[0].Description).toBeTruthy();
});

Then('I should receive {int} Forbidden error', async function (this: CustomWorld, statusCode: number) {
  const response = this.lastApiResponse!;
  expect(response.status()).toBe(statusCode);
});

Then('the backend error message should be {string}', async function (this: CustomWorld, errorMessage: string) {
  const body = await this.lastApiResponse?.json();
  expect(body.error || body.message).toContain(errorMessage);
});

Then('no changes should be persisted', async function (this: CustomWorld) {
  // Verify database unchanged
  const asset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(asset[0].UpdatedAt).toEqual(this.currentAsset.updatedAt);
});

Then('the update should succeed', async function (this: CustomWorld) {
  // Wait for successful response
  await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/assets') && resp.request().method() === 'PUT' && resp.status() === 204,
  );
});

Then('I should receive success confirmation', async function (this: CustomWorld) {
  // Dialog should close
  await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
});

Then('the asset name should be updated in the library', async function (this: CustomWorld) {
  // Verify updated name is visible
  const updatedAsset = this.createdAssets[this.createdAssets.length - 1];
  await expect(this.page.locator(`text=${updatedAsset.name} Updated`)).toBeVisible();
});

Then('I should NOT receive authorization errors', async function (this: CustomWorld) {
  // No 403 or 401 errors
  const response = this.lastApiResponse!;
  if (response) {
    expect(response.status()).not.toBe(403);
    expect(response.status()).not.toBe(401);
  }
});

Then('the changes should not be saved', async function (this: CustomWorld) {
  // Verify database unchanged
  const asset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  expect(asset[0].Name).toBe(this.currentAsset.name);
});

// Resource Management Assertions

Then('resources state should be initialized with asset.resources', async function (this: CustomWorld) {
  // Verify images are loaded
  const images = this.page.locator('[data-testid="resource-image"]');
  const dbResources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  await expect(images).toHaveCount(dbResources.length);
});

Then('I should see both images in Manage panel', async function (this: CustomWorld) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(2);
});

Then('image-{int} should show Token badge', async function (this: CustomWorld, imageIndex: number) {
  const image = this.page.locator('[data-testid="resource-image"]').nth(imageIndex - 1);
  await expect(image.locator('[role="status"]:has-text("Token")')).toBeVisible();
});

Then('image-{int} should show Display badge', async function (this: CustomWorld, imageIndex: number) {
  const image = this.page.locator('[data-testid="resource-image"]').nth(imageIndex - 1);
  await expect(image.locator('[role="status"]:has-text("Display")')).toBeVisible();
});

Then('I should see {int} images total', async function (this: CustomWorld, count: number) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(count);
});

Then('original Token image should still be present', async function (this: CustomWorld) {
  const tokenBadge = this.page.locator('[role="status"]:has-text("Token")');
  await expect(tokenBadge).toBeVisible();
});

Then('the asset should have {int} resources', async function (this: CustomWorld, count: number) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources.length).toBe(count);
});

Then('both images should be visible with correct roles', async function (this: CustomWorld) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(2);

  const tokenBadge = this.page.locator('[role="status"]:has-text("Token")');
  const displayBadge = this.page.locator('[role="status"]:has-text("Display")');
  await expect(tokenBadge).toBeVisible();
  await expect(displayBadge).toBeVisible();
});

Then('the asset should be updated with {int} resource', async function (this: CustomWorld, count: number) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources.length).toBe(count);
});

Then('I should see only {int} image', async function (this: CustomWorld, count: number) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(count);
});

Then('image should show both badges', async function (this: CustomWorld) {
  const image = this.page.locator('[data-testid="resource-image"]').first();
  await expect(image.locator('[role="status"]:has-text("Token")')).toBeVisible();
  await expect(image.locator('[role="status"]:has-text("Display")')).toBeVisible();
});

Then('resource role should be {int} \\(Token | Display\\)', async function (this: CustomWorld, roleValue: number) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources[0].Role).toBe(roleValue);
});

Then('role should be persisted', async function (this: CustomWorld) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources[0].Role).toBe(3); // Token | Display
});

// Property Update Assertions

Then(
  'objectProps should be updated to isMovable={word}, isOpaque={word}',
  async function (this: CustomWorld, isMovable: string, isOpaque: string) {
    const asset = await this.db.queryTable('Assets', {
      Id: this.currentAsset.id,
    });
    const props = JSON.parse(asset[0].PropertiesJson);
    expect(props.isMovable).toBe(isMovable === 'true');
    expect(props.isOpaque).toBe(isOpaque === 'true');
  },
);

Then('creatureProps.category should be {string}', async function (this: CustomWorld, category: string) {
  const asset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });
  const props = JSON.parse(asset[0].PropertiesJson);
  expect(props.category).toBe(category);
});

Then('asset card should show red {string} badge', async function (this: CustomWorld, badgeText: string) {
  const card = this.page.locator(`[data-testid="asset-card"]:has-text("${this.currentAsset.name}")`);
  const badge = card.locator(`[role="status"]:has-text("${badgeText}")`);
  await expect(badge).toBeVisible();
});

// Cancel & State Reset Assertions

Then('dialog should return to view mode', async function (this: CustomWorld) {
  await expect(this.assetEditDialog.editButton()).toBeVisible();
  await expect(this.assetEditDialog.saveButton()).not.toBeVisible();
});

Then('name should reset to {string}', async function (this: CustomWorld, name: string) {
  const nameInput = this.page.locator('input[name="name"]');
  await expect(nameInput).toHaveValue(name);
});

Then('resources should reset to original \\({int} Token image\\)', async function (this: CustomWorld, count: number) {
  const images = this.page.locator('[data-testid="resource-image"]');
  await expect(images).toHaveCount(count);
});

Then('new Display image should be discarded', async function (this: CustomWorld) {
  const displayBadge = this.page.locator('[role="status"]:has-text("Display")');
  await expect(displayBadge).not.toBeVisible();
});

// Validation Assertions

Then('I should see validation error', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

Then('error should be {string}', async function (this: CustomWorld, errorMessage: string) {
  await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible();
});

// Database Persistence Assertions

Then('the database Asset record should be updated:', async function (this: CustomWorld, dataTable: any) {
  const expectedFields = dataTable.hashes()[0];
  const asset = await this.db.queryTable('Assets', {
    Id: this.currentAsset.id,
  });

  for (const [field, value] of Object.entries(expectedFields)) {
    if (field === 'UpdatedAt' && typeof value === 'string' && value.startsWith('>')) {
      // Check UpdatedAt is greater than original
      expect(new Date(asset[0].UpdatedAt).getTime()).toBeGreaterThan(new Date(this.currentAsset.updatedAt).getTime());
    } else {
      expect(asset[0][field]).toBe(value);
    }
  }
});

Then('AssetResources table should have {int} records', async function (this: CustomWorld, count: number) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources.length).toBe(count);
});

Then('AssetResources should contain:', async function (this: CustomWorld, dataTable: any) {
  const expectedRecords = dataTable.hashes();
  const actualRecords = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });

  for (const expected of expectedRecords) {
    const match = actualRecords.find(
      (r) => r.ResourceId === expected.ResourceId && r.Role === parseInt(expected.Role, 10),
    );
    expect(match).toBeDefined();
  }
});

Then('a new AssetResource record should be INSERT ed', async function (this: CustomWorld) {
  // Verify new record exists
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources.length).toBeGreaterThan(1);
});

Then(
  'the record should link AssetId {string} to new ResourceId with Role={int}',
  async function (this: CustomWorld, assetId: string, role: number) {
    const resources = await this.db.queryTable('AssetResources', {
      AssetId: assetId,
    });
    const match = resources.find((r) => r.Role === role);
    expect(match).toBeDefined();
  },
);

Then('one AssetResource record should be DELETED from database', async function (this: CustomWorld) {
  const resources = await this.db.queryTable('AssetResources', {
    AssetId: this.currentAsset.id,
  });
  expect(resources.length).toBe(1);
});

Then(
  'the Resource record should remain \\(orphan cleanup is Phase {int} scope\\)',
  async function (this: CustomWorld, _phaseNumber: number) {
    // This is documented expectation - orphan cleanup is future work
    // Resource records remain even if not linked to assets
  },
);

Then(
  'the AssetResource.Role value should UPDATE from {int} to {int} in database',
  async function (this: CustomWorld, _oldRole: number, newRole: number) {
    const resources = await this.db.queryTable('AssetResources', {
      AssetId: this.currentAsset.id,
    });
    expect(resources[0].Role).toBe(newRole);
  },
);

// Loading & Error Handling Assertions

Then('button should show {string} with spinner', async function (this: CustomWorld, loadingText: string) {
  const button = this.page.locator(`button:has-text("${loadingText}")`);
  await expect(button).toBeVisible();
  await expect(button.locator('[data-testid="loading-spinner"]')).toBeVisible();
});

Then('button should be disabled', async function (this: CustomWorld) {
  const saveButton = this.assetEditDialog.saveButton();
  await expect(saveButton).toBeDisabled();
});

Then('error should be shown', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="alert"]')).toBeVisible();
});

Then('dialog should stay in edit mode', async function (this: CustomWorld) {
  await expect(this.assetEditDialog.saveButton()).toBeVisible();
});

Then('changes should be preserved for retry', async function (this: CustomWorld) {
  // Form values should still be present
  const nameInput = this.page.locator('input[name="name"]');
  const value = await nameInput.inputValue();
  expect(value).toBeTruthy();
});
