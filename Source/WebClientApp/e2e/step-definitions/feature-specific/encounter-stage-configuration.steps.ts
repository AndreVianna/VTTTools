/**
 * Encounter Stage Configuration Step Definitions
 * BDD E2E tests for Configure Stage use case
 *
 * FEATURE: Documents/Areas/Library/Features/EncounterManagement/UseCases/Configurestage/Configurestage.feature
 * UI_COMPONENT: Source/WebClientApp/src/components/encounter/StageConfigPanel.tsx
 * INVARIANT: INV-09 - Stage dimensions must be positive
 *
 * Test Approach: Black-box testing
 * - Interact through UI (StageConfigPanel component)
 * - Verify against REAL backend API
 * - Query REAL database for persistence validation
 * - NO mocking of business logic
 */

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world.js';

// ============================================================================
// GIVEN STEPS - Encounter and Stage Preconditions
// ============================================================================

Given('I own a encounter in my library', async function (this: CustomWorld) {
  // Create a test encounter in the database via API
  const createEncounterResponse = await this.page.request.post('/api/library/encounters', {
    data: {
      name: 'Test Encounter for Stage Config',
      description: 'Test encounter created for stage configuration testing',
      isPublished: false,
    },
  });

  expect(createEncounterResponse.ok()).toBeTruthy();
  const encounter = await createEncounterResponse.json();

  this.currentAsset = encounter; // Store encounter in world state
  this.createdAssets.push(encounter); // Track for cleanup
});

Given('my encounter exists', async function (this: CustomWorld) {
  // Reuse existing encounter from previous step
  if (!this.currentAsset) {
    // If no encounter exists, create one
    const createEncounterResponse = await this.page.request.post('/api/library/encounters', {
      data: {
        name: 'Test Encounter for Stage Config',
        description: 'Test encounter created for stage configuration testing',
        isPublished: false,
      },
    });

    expect(createEncounterResponse.ok()).toBeTruthy();
    const encounter = await createEncounterResponse.json();

    this.currentAsset = encounter; // Store encounter in world state
    this.createdAssets.push(encounter); // Track for cleanup
  }

  // Verify encounter exists in database
  const encounterId = this.currentAsset.id;
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(dbEncounter).toBeDefined();
});

Given('my encounter has no stage background', async function (this: CustomWorld) {
  // Verify stage configuration has no background resource
  const encounter = this.currentAsset;
  expect(encounter.stage).toBeDefined();
  expect(encounter.stage.backgroundResourceId).toBeNull();
});

Given('I have a valid image resource', async function (this: CustomWorld) {
  // Upload a test image resource
  const imagePath = this.page.context().testDataDir || 'e2e/test-data/images/test-background.png';

  const uploadResponse = await this.page.request.post('/api/resources', {
    multipart: {
      file: imagePath,
      resourceKind: '1', // Image kind
    },
  });

  expect(uploadResponse.ok()).toBeTruthy();
  const resource = await uploadResponse.json();

  this.uploadedResourceIds.push(resource.id); // Track for cleanup
  this.testImageResourceId = resource.id; // Store for scenario use
});

Given(
  'my encounter has stage with width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    // Configure stage via API
    const encounterId = this.currentAsset.id;

    const patchResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
      data: {
        width,
        height,
        viewportX: 0,
        viewportY: 0,
        viewportWidth: width,
        viewportHeight: height,
      },
    });

    expect(patchResponse.status()).toBe(204); // No Content

    // Update current asset with new stage dimensions
    this.currentAsset.stage = { width, height };
  },
);

Given('my encounter has stage with background resource', async function (this: CustomWorld) {
  // First, create an image resource
  const imagePath = this.page.context().testDataDir || 'e2e/test-data/images/test-background.png';

  const uploadResponse = await this.page.request.post('/api/resources', {
    multipart: {
      file: imagePath,
      resourceKind: '1', // Image kind
    },
  });

  expect(uploadResponse.ok()).toBeTruthy();
  const resource = await uploadResponse.json();

  this.uploadedResourceIds.push(resource.id); // Track for cleanup
  this.testImageResourceId = resource.id; // Store for scenario use

  // Then configure stage with that background
  const encounterId = this.currentAsset.id;
  const backgroundResourceId = this.testImageResourceId;

  const patchResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      backgroundResourceId,
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });

  expect(patchResponse.status()).toBe(204);
  this.currentAsset.stage = { backgroundResourceId };
});

Given(
  'my encounter has configured grid and {int} placed assets',
  async function (this: CustomWorld, assetCount: number) {
    const encounterId = this.currentAsset.id;

    // Configure grid
    await this.page.request.patch(`/api/library/encounters/${encounterId}/grid`, {
      data: {
        enabled: true,
        cellSize: 50,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
        opacity: 0.3,
      },
    });

    // Place assets on encounter
    for (let i = 0; i < assetCount; i++) {
      // Create test asset
      const asset = await this.assetBuilder()
        .withName(`Test Asset ${i + 1}`)
        .withKind(1) // Character kind
        .build();

      // Place asset on encounter
      await this.page.request.post(`/api/library/encounters/${encounterId}/assets`, {
        data: {
          assetId: asset.id,
          x: 100 + i * 100,
          y: 100,
          rotation: 0,
          scale: 1.0,
        },
      });
    }
    this.initialGridConfig = { cellSize: 50, offsetX: 0, offsetY: 0 };
    this.placedAssetCount = assetCount;
  },
);

Given('a encounter exists owned by another user', async function (this: CustomWorld) {
  const differentUserId = '019639ea-c7de-7a01-8548-41edfccde999'; // Different from test user

  // Create encounter owned by different user (requires admin or direct DB access)
  await this.db.insertRecord('Encounters', {
    Id: '019639ea-c7de-7a01-8548-41edfccde888',
    Name: 'Other User Encounter',
    OwnerId: differentUserId,
    IsPublished: false,
  });
  this.otherUserEncounterId = '019639ea-c7de-7a01-8548-41edfccde888';
});

Given('no encounter exists with ID {string}', async function (this: CustomWorld, encounterId: string) {
  // Verify encounter does not exist in database
  const encounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(encounter).toBeUndefined();
});

// ============================================================================
// WHEN STEPS - Stage Configuration Actions
// ============================================================================

When(
  'I configure stage with width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    const encounterId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
      data: {
        width,
        height,
        viewportX: 0,
        viewportY: 0,
        viewportWidth: width,
        viewportHeight: height,
      },
    });
  },
);

When(
  'I attempt to configure stage with width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    const encounterId = this.currentAsset.id;

    // Expect this to fail with validation error
    this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
      data: {
        width,
        height,
        viewportX: 0,
        viewportY: 0,
        viewportWidth: Math.max(width, 100), // Provide valid viewport
        viewportHeight: Math.max(height, 100),
      },
    });
  },
);

When('I configure stage with that background resource', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;
  const backgroundResourceId = this.testImageResourceId;

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      backgroundResourceId,
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });
});

When('I configure stage with:', async function (this: CustomWorld, dataTable) {
  const config = dataTable.rowsHash(); // Convert table to key-value pairs
  const encounterId = this.currentAsset.id;

  const stageData = {
    backgroundResourceId: config.Background !== 'null' ? config.Background : undefined,
    width: parseInt(config.Width, 10),
    height: parseInt(config.Height, 10),
    viewportX: parseInt(config.ViewportX, 10),
    viewportY: parseInt(config.ViewportY, 10),
    viewportWidth: parseInt(config.Width, 10), // Match width
    viewportHeight: parseInt(config.Height, 10), // Match height
  };

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: stageData,
  });
});

When(
  'I update stage dimensions to width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    const encounterId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
      data: {
        width,
        height,
        viewportX: 0,
        viewportY: 0,
        viewportWidth: width,
        viewportHeight: height,
      },
    });
  },
);

When('I configure stage to remove background', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      backgroundResourceId: null, // Remove background
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });
});

When('I attempt to configure stage for encounter {string}', async function (this: CustomWorld, encounterId: string) {
  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });
});

When('I attempt to configure stage with non-existent background resource', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;
  const nonExistentResourceId = '019639ea-c7de-7a01-8548-41edfccde777';

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      backgroundResourceId: nonExistentResourceId,
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });
});

When('I attempt to configure stage for that encounter', async function (this: CustomWorld) {
  const otherEncounterId = this.otherUserEncounterId;

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${otherEncounterId}/stage`, {
    data: {
      width: 1920,
      height: 1080,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 1920,
      viewportHeight: 1080,
    },
  });
});

When('I update the stage dimensions', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: {
      width: 2560,
      height: 1440,
      viewportX: 0,
      viewportY: 0,
      viewportWidth: 2560,
      viewportHeight: 1440,
    },
  });
});

When(
  'I configure viewport to X={int} and Y={int}',
  async function (this: CustomWorld, viewportX: number, viewportY: number) {
    const encounterId = this.currentAsset.id;
    const stage = this.currentAsset.stage;

    this.lastApiResponse = await this.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
      data: {
        width: stage.width,
        height: stage.height,
        viewportX,
        viewportY,
        viewportWidth: stage.width,
        viewportHeight: stage.height,
      },
    });
  },
);

// ============================================================================
// THEN STEPS - Verification and Assertions
// ============================================================================

Then('the stage is updated successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(204); // No Content success
});

Then('the stage width should be {int}', async function (this: CustomWorld, expectedWidth: number) {
  const encounterId = this.currentAsset.id;

  // Query database to verify persistence
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(dbEncounter).toBeDefined();
  expect(dbEncounter[0].Stage).toBeDefined();

  const stageConfig = JSON.parse(dbEncounter[0].Stage); // Stage is stored as JSON
  expect(stageConfig.width).toBe(expectedWidth);
});

Then('the stage height should be {int}', async function (this: CustomWorld, expectedHeight: number) {
  const encounterId = this.currentAsset.id;

  // Query database to verify persistence
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(dbEncounter).toBeDefined();
  expect(dbEncounter[0].Stage).toBeDefined();

  const stageConfig = JSON.parse(dbEncounter[0].Stage);
  expect(stageConfig.height).toBe(expectedHeight);
});

Then('the background resource should be associated', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;
  const expectedResourceId = this.testImageResourceId;

  // Query database
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  expect(stageConfig.backgroundResourceId).toBe(expectedResourceId);
});

Then('all stage properties should be set correctly', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  // Query database
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  // Verify all properties exist and have valid values
  expect(stageConfig.width).toBe(1920);
  expect(stageConfig.height).toBe(1080);
  expect(stageConfig.viewportX).toBe(100);
  expect(stageConfig.viewportY).toBe(50);
  expect(stageConfig.backgroundResourceId).toBeDefined();
});

Then('the new dimensions should be preserved', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  // Query database
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  expect(stageConfig.width).toBe(2560);
  expect(stageConfig.height).toBe(1440);
});

Then('the background should be null', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  // Query database
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  expect(stageConfig.backgroundResourceId).toBeNull();
});

Then('the dimensions should be preserved', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  // Query database - verify large dimensions work
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  expect(stageConfig.width).toBe(8192);
  expect(stageConfig.height).toBe(8192);
});

Then('the viewport coordinates should be set', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;

  // Query database
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const stageConfig = JSON.parse(dbEncounter[0].Stage);

  expect(stageConfig.viewportX).toBe(2000);
  expect(stageConfig.viewportY).toBe(1200);
});

Then('the stage is updated', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(204);
});

Then('the grid configuration should remain unchanged', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;
  const initialGridConfig = this.initialGridConfig;

  // Query database to verify grid unchanged
  const dbEncounter = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  const gridConfig = JSON.parse(dbEncounter[0].Grid);

  expect(gridConfig.cellSize).toBe(initialGridConfig.cellSize);
  expect(gridConfig.offsetX).toBe(initialGridConfig.offsetX);
  expect(gridConfig.offsetY).toBe(initialGridConfig.offsetY);
});

Then('all asset placements should remain intact', async function (this: CustomWorld) {
  const encounterId = this.currentAsset.id;
  const expectedAssetCount = this.placedAssetCount;

  // Query database for asset placements
  const placements = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  expect(placements.length).toBe(expectedAssetCount);
});

// ============================================================================
// ERROR HANDLING ASSERTIONS
// ============================================================================

Then('I should see error with validation error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(400); // Bad Request
});

Then('I should see error with not found error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(404); // Not Found
});

Then('I should see error with forbidden error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(403); // Forbidden
});
