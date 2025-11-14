/**
 * Asset Data Setup Step Definitions (Tier 1/2)
 *
 * Seed database with test assets for Given steps
 */

import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AssetKind } from '../../support/fixtures/AssetBuilder.js';
import type { CustomWorld } from '../../support/world.js';

Given('I own {int} Object assets', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Test Object ${i + 1}`)
      .withKind(AssetKind.Object)
      .create();
    this.createdAssets.push(asset);
  }
});

Given('I own {int} Monster assets', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Test Monster ${i + 1}`)
      .withKind(AssetKind.Monster)
      .create();
    this.createdAssets.push(asset);
  }
});

// Helper function for creating multiple assets
async function createAssets(world: CustomWorld, count: number, kind: AssetKind): Promise<void> {
  const kindName = kind === AssetKind.Object ? 'Object' : 'Monster';
  for (let i = 0; i < count; i++) {
    const asset = await world
      .assetBuilder()
      .withName(`Test ${kindName} ${i + 1}`)
      .withKind(kind)
      .create();
    world.createdAssets.push(asset);
  }
}

Given('{int} Object assets exist in my library', async function (this: CustomWorld, count: number) {
  await createAssets(this, count, AssetKind.Object);
});

Given('{int} Monster assets exist in my library', async function (this: CustomWorld, count: number) {
  await createAssets(this, count, AssetKind.Monster);
});

Given('I own {int} Object assets \\(private\\)', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Private Object ${i + 1}`)
      .withKind(AssetKind.Object)
      .create();
    this.createdAssets.push(asset);
  }
});

Given('I own {int} public Object assets', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Public Object ${i + 1}`)
      .withKind(AssetKind.Object)
      .public()
      .create();
    this.createdAssets.push(asset);
  }
});

Given('I own {int} published Object assets', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const asset = await this.assetBuilder()
      .withName(`Published Object ${i + 1}`)
      .withKind(AssetKind.Object)
      .published()
      .create();
    this.createdAssets.push(asset);
  }
});

Given('I own asset {string}', async function (this: CustomWorld, name: string) {
  const asset = await this.assetBuilder().withName(name).create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('an Object asset named {string} exists in my library', async function (this: CustomWorld, name: string) {
  const asset = await this.assetBuilder().withName(name).withKind(AssetKind.Object).create();
  this.createdAssets.push(asset);
  this.currentAsset = asset;
});

Given('I own {int} assets', async function (this: CustomWorld, count: number) {
  await createAssets(this, count, AssetKind.Object);
});

Given('I own no assets', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to verify no assets exist for current user (query database Assets table with OwnerId)',
  );
});

Then('the asset should be created successfully', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
  await this.page.waitForResponse((resp) => resp.url().includes('/api/assets'));
});

Then('the asset should be updated successfully', async function (this: CustomWorld) {
  await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
});

// REMOVED: Duplicate - Keep in shared/ steps
// Then('the dialog should close') - Use shared dialog steps

Then('no asset should be created', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to verify no asset was created (check no POST to /api/assets or query database Assets table count unchanged)',
  );
});
