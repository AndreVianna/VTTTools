/**
 * Form Fields Step Definitions (Tier 1 - High Frequency)
 *
 * Reusable steps for filling form fields
 * Frequency: 35+ uses across CreateAsset and UpdateAsset
 */

import { When } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world.js';

When('I fill in name {string}', async function (this: CustomWorld, name: string) {
  await this.page.fill('input[name="name"]', name);
});

When('I fill in description {string}', async function (this: CustomWorld, description: string) {
  await this.page.fill('textarea[name="description"]', description);
});

When('I fill in name with {int} characters', async function (this: CustomWorld, charCount: number) {
  const value = 'a'.repeat(charCount);
  await this.page.fill('input[name="name"]', value);
});

When('I fill in description with {int} characters', async function (this: CustomWorld, charCount: number) {
  const value = 'a'.repeat(charCount);
  await this.page.fill('textarea[name="description"]', value);
});

When('I fill in name with exactly {int} characters', async function (this: CustomWorld, charCount: number) {
  const value = 'a'.repeat(charCount);
  await this.page.fill('input[name="name"]', value);
});

When('I fill in description with exactly {int} characters', async function (this: CustomWorld, charCount: number) {
  const value = 'a'.repeat(charCount);
  await this.page.fill('textarea[name="description"]', value);
});

When('I set size width to {float}', async function (this: CustomWorld, width: number) {
  await this.page.fill('input[name="width"]', width.toString());
});

When('I set size height to {float}', async function (this: CustomWorld, height: number) {
  await this.page.fill('input[name="height"]', height.toString());
});

When('I set size to {float}×{float} cells', async function (this: CustomWorld, width: number, height: number) {
  await this.page.fill('input[name="width"]', width.toString());
  await this.page.fill('input[name="height"]', height.toString());
});

When('I set size to {float}×{float}', async function (this: CustomWorld, width: number, height: number) {
  await this.page.fill('input[name="width"]', width.toString());
  await this.page.fill('input[name="height"]', height.toString());
});

When('I leave description empty', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Step needs to leave description field empty (clear field if filled or verify it is already empty)',
  );
});

When('I clear the name', async function (this: CustomWorld) {
  await this.page.fill('input[name="name"]', '');
});

When('I change the name to {string}', async function (this: CustomWorld, name: string) {
  await this.page.fill('input[name="name"]', name);
});
