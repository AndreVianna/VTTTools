/**
 * Keyboard Shortcuts Step Definitions (Tier 2)
 *
 * BEST PRACTICE: Extract shared logic to helpers, don't call steps from steps
 */

import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';

// ============================================================================
// HELPER FUNCTIONS (Reusable keyboard actions)
// ============================================================================

async function altClickImage(world: CustomWorld): Promise<void> {
    const selector = '[data-testid="resource-image"]';
    await world.keyboard.altClick(selector);
}

async function ctrlClickImage(world: CustomWorld): Promise<void> {
    const selector = '[data-testid="resource-image"]';
    await world.keyboard.ctrlClick(selector);
}

async function ctrlAltClickImage(world: CustomWorld): Promise<void> {
    const selector = '[data-testid="resource-image"]';
    await world.keyboard.ctrlAltClick(selector);
}

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

When('I Alt+Click the image', async function (this: CustomWorld) {
    await altClickImage(this);
});

When('I Ctrl+Click the image', async function (this: CustomWorld) {
    await ctrlClickImage(this);
});

When('I Ctrl+Alt+Click the image', async function (this: CustomWorld) {
    await ctrlAltClickImage(this);
});

When('I Alt+Click the uploaded image', async function (this: CustomWorld) {
    const lastResourceId = this.uploadedResourceIds[this.uploadedResourceIds.length - 1];
    const selector = `[data-resource-id="${lastResourceId}"]`;
    await this.keyboard.altClick(selector);
});

When('I Ctrl+Click the uploaded image', async function (this: CustomWorld) {
    const lastResourceId = this.uploadedResourceIds[this.uploadedResourceIds.length - 1];
    await this.keyboard.ctrlClick(`[data-resource-id="${lastResourceId}"]`);
});

// Aliases - call helpers, not steps
When('I Alt+Click to assign Token role', async function (this: CustomWorld) {
    await altClickImage(this);
});

When('I Ctrl+Click to assign Display role', async function (this: CustomWorld) {
    await ctrlClickImage(this);
});

When('I Alt+Click again', async function (this: CustomWorld) {
    await altClickImage(this);
});

When('I Ctrl+Click to add Display role', async function (this: CustomWorld) {
    await ctrlClickImage(this);
});

When('I Alt+Click to remove Token role', async function (this: CustomWorld) {
    await altClickImage(this);
});

When('I hold Alt and click the image', async function (this: CustomWorld) {
    await altClickImage(this);
});

When('I hold Ctrl and click the image', async function (this: CustomWorld) {
    await ctrlClickImage(this);
});

When('I hold Ctrl+Alt and click the image', async function (this: CustomWorld) {
    await ctrlAltClickImage(this);
});
