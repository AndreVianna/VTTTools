/**
 * Theme Step Definitions (Tier 2 - Shared)
 *
 * Reusable steps for theme/color scheme operations
 */

import { Given } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world.js';

Given('I have dark mode enabled', async function (this: CustomWorld) {
  await this.page.emulateMedia({ colorScheme: 'dark' });
});

Given('I have light mode enabled', async function (this: CustomWorld) {
  await this.page.emulateMedia({ colorScheme: 'light' });
});
