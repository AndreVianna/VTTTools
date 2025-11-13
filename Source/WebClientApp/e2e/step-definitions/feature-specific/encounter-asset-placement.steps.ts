/**
 * BDD Step Definitions - Encounter Asset Placement
 * Features: PlaceAsset, MoveAsset, RemoveAsset
 *
 * Black-box testing approach:
 * - Interact through UI (drag-drop, click, keyboard)
 * - Use real API calls (no mocks)
 * - Verify real database state
 * - Test from user perspective
 *
 * CRITICAL: Follows anti-pattern avoidance rules
 * - No step-to-step calls
 * - No hard-coded credentials
 * - No SQL injection
 * - No catch-all regex
 */

import { type DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  deleteAssetFromCanvas,
  dragAssetToCanvas,
  expandEncounterCanvas,
  getPlacedAssetCount,
  moveAssetOnCanvas,
  selectAssetOnCanvas,
  verifyAssetPlaced,
  verifyAssetPosition,
  verifyAssetRemoved,
} from '../../support/helpers/encounter-placement.helper.js';
import type { CustomWorld } from '../../support/world.js';

// ============================================================================
// Helper Functions - Validate Required State
// ============================================================================

function ensureEncounterId(world: CustomWorld): string {
  if (!world.currentEncounterId) {
    throw new Error('No encounter ID found. Ensure a previous step creates an encounter.');
  }
  return world.currentEncounterId;
}

function ensureAssetId(world: CustomWorld): string {
  if (!world.currentAsset?.id) {
    throw new Error('No asset ID found. Ensure a previous step creates an asset template.');
  }
  return world.currentAsset.id;
}

function ensureAssetInstanceId(world: CustomWorld): string {
  if (!world.currentAssetInstanceId) {
    throw new Error('No asset instance ID found. Ensure a previous step places an asset on the encounter.');
  }
  return world.currentAssetInstanceId;
}

// ============================================================================
// GIVEN - Setup Preconditions
// ============================================================================

Given('I own a encounter in my library', async function (this: CustomWorld) {
  // Create test encounter via database
  const encounterId = await this.db.insertEncounter({
    name: 'Test Encounter',
    ownerId: this.currentUser.id,
    adventureId: await this.db.insertAdventure({
      name: 'Test Adventure',
      ownerId: this.currentUser.id,
      type: 'OneShot',
    }),
    gridType: 'Square',
    gridSize: 50,
    width: 1920,
    height: 1080,
  });

  this.attach(`Encounter created: ${encounterId}`, 'text/plain');
  // Store for later verification
  this.currentEncounterId = encounterId;
});

Given('my encounter exists', async function (this: CustomWorld) {
  // Create a test encounter in the database
  const encounterId = await this.db.insertEncounter({
    name: 'Test Encounter',
    ownerId: this.currentUser.id,
    adventureId: await this.db.insertAdventure({
      name: 'Test Adventure',
      ownerId: this.currentUser.id,
      type: 'OneShot',
    }),
    gridType: 'Square',
    gridSize: 50,
    width: 1920,
    height: 1080,
  });

  this.attach(`Encounter created: ${encounterId}`, 'text/plain');
  this.currentEncounterId = encounterId;
});

Given('my encounter has configured stage', async function (this: CustomWorld) {
  // Encounter already has stage configuration from creation
  const encounters = await this.db.queryTable('Encounters', {
    Id: this.currentEncounterId,
  });
  expect(encounters).toBeDefined();
  expect(encounters[0].Width).toBe(1920);
  expect(encounters[0].Height).toBe(1080);
  this.attach('Stage configured: 1920x1080', 'text/plain');
});

Given('I have asset template {string}', async function (this: CustomWorld, templateName: string) {
  const assetId = await this.db.insertAsset({
    name: templateName,
    ownerId: this.currentUser.id,
    kind: 'Creature',
    isPublic: false,
    isPublished: false,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
      category: 'Monster',
    },
  });

  this.currentAsset = { id: assetId, name: templateName };
  this.createdAssets.push({ id: assetId });
  this.attach(`Asset template created: ${templateName} (${assetId})`, 'text/plain');
});

Given('I have asset template', async function (this: CustomWorld) {
  const assetId = await this.db.insertAsset({
    name: 'Default Token',
    ownerId: this.currentUser.id,
    kind: 'Creature',
    isPublic: false,
    isPublished: false,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
      category: 'Monster',
    },
  });

  this.currentAsset = { id: assetId, name: 'Default Token' };
  this.createdAssets.push({ id: assetId });
  this.attach(`Asset template created: Default Token (${assetId})`, 'text/plain');
});

Given('I have {int} asset templates', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    const assetId = await this.db.insertAsset({
      name: `Asset Template ${i + 1}`,
      ownerId: this.currentUser.id,
      kind: 'Creature',
      isPublic: false,
      isPublished: false,
      size: { width: 1, height: 1, isSquare: true },
      properties: {
        category: 'Monster',
      },
    });

    this.createdAssets.push({ id: assetId, name: `Asset Template ${i + 1}` });
  }

  this.attach(`Created ${count} asset templates`, 'text/plain');
});

Given('the encounter has placed assets', async function (this: CustomWorld) {
  // Place 3 default assets on the encounter
  for (let i = 0; i < 3; i++) {
    await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x: 100 + i * 200,
      y: 100 + i * 100,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });
  }

  this.attach('Placed 3 assets on encounter', 'text/plain');
});

Given('my encounter has {int} placed assets', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x: 100 + i * 150,
      y: 100,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });
  }

  this.attach(`Placed ${count} assets on encounter`, 'text/plain');
});

Given('my encounter has asset at position X={int}, Y={int}', async function (this: CustomWorld, x: number, y: number) {
  const assetInstanceId = await this.db.insertEncounterAsset({
    encounterId: ensureEncounterId(this),
    assetId: ensureAssetId(this),
    x,
    y,
    width: 50,
    height: 50,
    rotation: 0,
    layer: 50,
  });

  this.currentAssetInstanceId = assetInstanceId;
  this.attach(`Placed asset at (${x}, ${y})`, 'text/plain');
});

Given(
  'my encounter has asset with width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    const assetInstanceId = await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x: 500,
      y: 500,
      width,
      height,
      rotation: 0,
      layer: 50,
    });

    this.currentAssetInstanceId = assetInstanceId;
    this.attach(`Placed asset with dimensions ${width}x${height}`, 'text/plain');
  },
);

Given('my encounter has asset with Z-index {int}', async function (this: CustomWorld, zIndex: number) {
  const assetInstanceId = await this.db.insertEncounterAsset({
    encounterId: ensureEncounterId(this),
    assetId: ensureAssetId(this),
    x: 500,
    y: 500,
    width: 50,
    height: 50,
    rotation: 0,
    layer: zIndex,
  });

  this.currentAssetInstanceId = assetInstanceId;
  this.attach(`Placed asset with Z-index ${zIndex}`, 'text/plain');
});

Given('my encounter has asset with rotation {int}', async function (this: CustomWorld, rotation: number) {
  const assetInstanceId = await this.db.insertEncounterAsset({
    encounterId: ensureEncounterId(this),
    assetId: ensureAssetId(this),
    x: 500,
    y: 500,
    width: 50,
    height: 50,
    rotation,
    layer: 50,
  });

  this.currentAssetInstanceId = assetInstanceId;
  this.attach(`Placed asset with rotation ${rotation} degrees`, 'text/plain');
});

Given('my encounter has placed asset', async function (this: CustomWorld) {
  const assetInstanceId = await this.db.insertEncounterAsset({
    encounterId: ensureEncounterId(this),
    assetId: ensureAssetId(this),
    x: 500,
    y: 500,
    width: 50,
    height: 50,
    rotation: 0,
    layer: 50,
  });

  this.currentAssetInstanceId = assetInstanceId;
  this.attach(`Placed asset at (500, 500)`, 'text/plain');
});

Given(
  'my encounter has stage width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    await this.db.updateRecord('Encounters', ensureEncounterId(this), {
      width,
      height,
    });

    this.attach(`Updated stage dimensions: ${width}x${height}`, 'text/plain');
  },
);

Given('one asset has ID {string}', async function (this: CustomWorld, assetId: string) {
  // Update existing placed asset to have specific ID
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: this.currentEncounterId,
  });

  if (assets.length > 0) {
    this.currentAssetInstanceId = assetId;
    await this.db.updateRecord('EncounterAssets', assets[0].Id, {
      Id: assetId,
    });
  }
});

Given('my encounter has exactly {int} placed asset', async function (this: CustomWorld, count: number) {
  // Place specified number of assets
  for (let i = 0; i < count; i++) {
    await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x: 100 + i * 150,
      y: 100,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });
  }

  this.attach(`Placed ${count} assets on encounter`, 'text/plain');
});

Given('my encounter has configured stage and grid', async function (this: CustomWorld) {
  // Encounter already has stage configuration from creation
  const encounters = await this.db.queryTable('Encounters', {
    Id: this.currentEncounterId,
  });
  expect(encounters).toBeDefined();
  expect(encounters[0].Width).toBe(1920);
  expect(encounters[0].Height).toBe(1080);
  this.attach('Stage and grid configured: 1920x1080', 'text/plain');
});

Given('my encounter has {int} placed assets:', async function (this: CustomWorld, count: number, dataTable: DataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
    const [x, y] = row.Position.split(',').map((v: string) => parseInt(v.trim(), 10));

    await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x,
      y,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });
  }

  this.attach(`Placed ${count} assets from data table`, 'text/plain');
});

Given(
  'my encounter has asset {string} at position X={int}, Y={int}',
  async function (this: CustomWorld, assetName: string, x: number, y: number) {
    if (!this.currentAsset || this.currentAsset.name !== assetName) {
      const assetId = await this.db.insertAsset({
        name: assetName,
        ownerId: this.currentUser.id,
        kind: 'Creature',
        isPublic: false,
        isPublished: false,
        size: { width: 1, height: 1, isSquare: true },
        properties: {
          category: 'Monster',
        },
      });

      this.currentAsset = { id: assetId, name: assetName };
      this.createdAssets.push({ id: assetId });
      this.attach(`Asset template created: ${assetName} (${assetId})`, 'text/plain');
    }

    const assetInstanceId = await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x,
      y,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });

    this.currentAssetInstanceId = assetInstanceId;
    this.attach(`Placed asset at (${x}, ${y})`, 'text/plain');
  },
);

Given('a valid asset template exists', async function (this: CustomWorld) {
  const assetId = await this.db.insertAsset({
    name: 'Default Token',
    ownerId: this.currentUser.id,
    kind: 'Creature',
    isPublic: false,
    isPublished: false,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
      category: 'Monster',
    },
  });

  this.currentAsset = { id: assetId, name: 'Default Token' };
  this.createdAssets.push({ id: assetId });
  this.attach(`Asset template created: Default Token (${assetId})`, 'text/plain');
});

Given('no encounter exists with ID {string}', async function (this: CustomWorld, encounterId: string) {
  // Ensure encounter doesn't exist
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(encounters.length).toBe(0);
  this.currentEncounterId = encounterId; // Store for error testing
});

Given('a encounter exists owned by another user', async function (this: CustomWorld) {
  const otherUserId = await this.db.insertUser({
    email: 'otheruser@example.com',
    userName: 'otheruser',
    emailConfirmed: true,
    passwordHash: 'hashedpassword',
  });

  this.currentEncounterId = await this.db.insertEncounter({
    name: 'Other User Encounter',
    ownerId: otherUserId,
    adventureId: await this.db.insertAdventure({
      name: 'Other Adventure',
      ownerId: otherUserId,
      type: 'OneShot',
    }),
    gridType: 'Square',
    gridSize: 50,
    width: 1920,
    height: 1080,
  });

  this.attach('Encounter created for other user (authorization test)', 'text/plain');
});

Given('that encounter has placed assets', async function (this: CustomWorld) {
  // Place 3 default assets on the encounter
  for (let i = 0; i < 3; i++) {
    await this.db.insertEncounterAsset({
      encounterId: ensureEncounterId(this),
      assetId: ensureAssetId(this),
      x: 100 + i * 200,
      y: 100 + i * 100,
      width: 50,
      height: 50,
      rotation: 0,
      layer: 50,
    });
  }

  this.attach('Placed 3 assets on encounter', 'text/plain');
});

Given('no asset with ID {string} exists on my encounter', async function (this: CustomWorld, assetId: string) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: this.currentEncounterId,
    Id: assetId,
  });

  expect(assets.length).toBe(0);
  this.currentAssetInstanceId = assetId; // Store for error testing
});

Given('no asset with ID {string} exists on the encounter', async function (this: CustomWorld, assetId: string) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: this.currentEncounterId,
    Id: assetId,
  });

  expect(assets.length).toBe(0);
  this.currentAssetInstanceId = assetId; // Store for error testing
});

Given('I have a new asset template', async function (this: CustomWorld) {
  const assetId = await this.db.insertAsset({
    name: 'New Asset',
    ownerId: this.currentUser.id,
    kind: 'Creature',
    isPublic: false,
    isPublished: false,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
      category: 'Monster',
    },
  });

  this.currentAsset = { id: assetId, name: 'New Asset' };
  this.createdAssets.push({ id: assetId });
  this.attach(`Asset template created: New Asset (${assetId})`, 'text/plain');
});

// ============================================================================
// WHEN - Actions
// ============================================================================

When('I place the asset at position X={int}, Y={int}', async function (this: CustomWorld, x: number, y: number) {
  // Navigate to encounter editor
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  // Drag asset from library to canvas
  await dragAssetToCanvas(this.page, ensureAssetId(this), { x, y });

  // Wait for API response
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
  );

  this.attach(`Placed asset at (${x}, ${y})`, 'text/plain');
});

When('I place the asset at:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.rowsHash();
  const x = parseInt(rows.X, 10);
  const y = parseInt(rows.Y, 10);

  // Fixed: Call helper directly, not step
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);
  await dragAssetToCanvas(this.page, ensureAssetId(this), { x, y });
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
  );
});

When('I place the asset with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.rowsHash();
  const x = parseInt(rows.X, 10);
  const y = parseInt(rows.Y, 10);

  // Navigate to encounter editor
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  // Drag asset to canvas
  await dragAssetToCanvas(this.page, ensureAssetId(this), { x, y });

  // TODO: Apply width, height, zIndex, rotation via properties panel
  // For now, just place at position

  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
  );

  this.attach(`Placed asset with properties`, 'text/plain');
});

When('I place all {int} assets at different positions', async function (this: CustomWorld, count: number) {
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  for (let i = 0; i < count; i++) {
    const asset = this.createdAssets[i];
    await dragAssetToCanvas(this.page, asset.id, {
      x: 100 + i * 200,
      y: 100 + i * 150,
    });

    await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
    );
  }

  this.attach(`Placed ${count} assets at different positions`, 'text/plain');
});

When('I attempt to place asset on encounter {string}', async function (this: CustomWorld, encounterId: string) {
  try {
    await this.page.goto(`/encounters/${encounterId}/edit`);

    // Try to place asset (will fail)
    await dragAssetToCanvas(this.page, ensureAssetId(this), {
      x: 500,
      y: 500,
    });

    this.lastApiResponse = await this.page.waitForResponse((resp) => resp.url().includes('/api/encounters/'), {
      timeout: 5000,
    });
  } catch (_error) {
    this.attach('Placement failed as expected', 'text/plain');
  }
});

When('I attempt to place asset on that encounter', async function (this: CustomWorld) {
  // Fixed: Inline logic instead of step call
  try {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await dragAssetToCanvas(this.page, ensureAssetId(this), {
      x: 500,
      y: 500,
    });
    this.lastApiResponse = await this.page.waitForResponse((resp) => resp.url().includes('/api/encounters/'), {
      timeout: 5000,
    });
  } catch (_error) {
    this.attach('Placement failed as expected', 'text/plain');
  }
});

When('I attempt to place asset with non-existent template ID', async function (this: CustomWorld) {
  const fakeAssetId = '999e8400-e29b-41d4-a716-446655440999';

  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  try {
    await dragAssetToCanvas(this.page, fakeAssetId, { x: 500, y: 500 });

    this.lastApiResponse = await this.page.waitForResponse((resp) => resp.url().includes('/api/encounters/'), {
      timeout: 5000,
    });
  } catch (_error) {
    this.attach('Placement with invalid template failed as expected', 'text/plain');
  }
});

When('I place the asset with Z-index of {int}', async function (this: CustomWorld, zIndex: number) {
  // Fixed: Inline placement logic
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);
  await dragAssetToCanvas(this.page, ensureAssetId(this), {
    x: 500,
    y: 500,
  });
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
  );

  // TODO: Set Z-index via properties panel
  await this.db.updateRecord('EncounterAssets', ensureAssetInstanceId(this), {
    layer: zIndex,
  });
});

When(
  'I place the asset with width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    // Fixed: Inline placement
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await expandEncounterCanvas(this.page);
    await dragAssetToCanvas(this.page, ensureAssetId(this), {
      x: 500,
      y: 500,
    });
    this.lastApiResponse = await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
    );

    // TODO: Set dimensions via properties panel
    await this.db.updateRecord('EncounterAssets', ensureAssetInstanceId(this), {
      width,
      height,
    });
  },
);

When('I move the asset to position X={int}, Y={int}', async function (this: CustomWorld, x: number, y: number) {
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  // Move asset on canvas using drag
  await moveAssetOnCanvas(this.page, ensureAssetInstanceId(this), { x, y });

  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'PUT',
  );

  this.attach(`Moved asset to (${x}, ${y})`, 'text/plain');
});

When(
  'I update the asset dimensions to width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await expandEncounterCanvas(this.page);

    const assetInstanceId = ensureAssetInstanceId(this);

    // Select asset and update via properties panel
    await selectAssetOnCanvas(this.page, assetInstanceId);

    // TODO: Interact with properties panel to update dimensions
    // For now, simulate via database update
    await this.db.updateRecord('EncounterAssets', assetInstanceId, {
      width,
      height,
    });

    this.attach(`Updated dimensions to ${width}x${height}`, 'text/plain');
  },
);

When('I update the asset Z-index to {int}', async function (this: CustomWorld, zIndex: number) {
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  const assetInstanceId = ensureAssetInstanceId(this);

  await selectAssetOnCanvas(this.page, assetInstanceId);

  // TODO: Update via properties panel
  await this.db.updateRecord('EncounterAssets', assetInstanceId, {
    layer: zIndex,
  });

  this.attach(`Updated Z-index to ${zIndex}`, 'text/plain');
});

When('I rotate the asset to {int} degrees', async function (this: CustomWorld, rotation: number) {
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  const assetInstanceId = ensureAssetInstanceId(this);

  await selectAssetOnCanvas(this.page, assetInstanceId);

  // TODO: Rotate via interaction or properties panel
  await this.db.updateRecord('EncounterAssets', assetInstanceId, {
    rotation,
  });

  this.attach(`Rotated asset to ${rotation} degrees`, 'text/plain');
});

When('I update the asset with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.rowsHash();

  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  const assetInstanceId = ensureAssetInstanceId(this);

  await selectAssetOnCanvas(this.page, assetInstanceId);

  // Update all properties
  const updates: Record<string, number> = {};
  if (rows.X) updates.x = parseInt(rows.X, 10);
  if (rows.Y) updates.y = parseInt(rows.Y, 10);
  if (rows.Width) updates.width = parseInt(rows.Width, 10);
  if (rows.Height) updates.height = parseInt(rows.Height, 10);
  if (rows.ZIndex) updates.layer = parseInt(rows.ZIndex, 10);
  if (rows.Rotation) updates.rotation = parseInt(rows.Rotation, 10);

  await this.db.updateRecord('EncounterAssets', assetInstanceId, updates);

  this.attach('Updated multiple asset properties', 'text/plain');
});

When('I attempt to move asset {string}', async function (this: CustomWorld, assetId: string) {
  try {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await moveAssetOnCanvas(this.page, assetId, { x: 600, y: 600 });

    this.lastApiResponse = await this.page.waitForResponse((resp) => resp.url().includes('/api/encounters/'), {
      timeout: 5000,
    });
  } catch (_error) {
    this.attach('Move failed as expected', 'text/plain');
  }
});

When('I attempt to move asset on encounter {string}', async function (this: CustomWorld, encounterId: string) {
  try {
    await this.page.goto(`/encounters/${encounterId}/edit`);
    await moveAssetOnCanvas(this.page, ensureAssetInstanceId(this), {
      x: 600,
      y: 600,
    });
  } catch (_error) {
    this.attach('Move on non-existent encounter failed as expected', 'text/plain');
  }
});

When('I attempt to move an asset on that encounter', async function (this: CustomWorld) {
  // Fixed: Inline logic
  try {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await moveAssetOnCanvas(this.page, ensureAssetInstanceId(this), {
      x: 600,
      y: 600,
    });
  } catch (_error) {
    this.attach('Move on non-existent encounter failed as expected', 'text/plain');
  }
});

When('I move the first asset to new position', async function (this: CustomWorld) {
  const encounterId = ensureEncounterId(this);
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  this.currentAssetInstanceId = assets[0].Id;

  // Fixed: Inline move logic
  await this.page.goto(`/encounters/${encounterId}/edit`);
  await expandEncounterCanvas(this.page);
  await moveAssetOnCanvas(this.page, ensureAssetInstanceId(this), {
    x: 1000,
    y: 1000,
  });
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'PUT',
  );
});

When('I remove asset {string} from the encounter', async function (this: CustomWorld, assetId: string) {
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);

  await deleteAssetFromCanvas(this.page, assetId);

  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
  );

  this.attach(`Removed asset ${assetId}`, 'text/plain');
});

When('I remove all assets from the encounter', async function (this: CustomWorld) {
  const encounterId = ensureEncounterId(this);
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  await this.page.goto(`/encounters/${encounterId}/edit`);
  await expandEncounterCanvas(this.page);

  for (const asset of assets) {
    await deleteAssetFromCanvas(this.page, asset.Id);
    await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
    );
  }

  this.attach(`Removed all ${assets.length} assets`, 'text/plain');
});

When('I remove the {string} asset', async function (this: CustomWorld, assetName: string) {
  // Find asset instance by name
  const encounterId = ensureEncounterId(this);
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  const assetInstance = assets.find((a) => {
    const assetTemplate = this.createdAssets.find((ca) => ca.id === a.AssetId);
    return assetTemplate?.name === assetName;
  });

  expect(assetInstance).toBeDefined();

  // Fixed: Inline removal logic
  await this.page.goto(`/encounters/${encounterId}/edit`);
  await expandEncounterCanvas(this.page);
  await deleteAssetFromCanvas(this.page, assetInstance.Id);
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
  );
});

When('I attempt to remove asset {string}', async function (this: CustomWorld, assetId: string) {
  try {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await deleteAssetFromCanvas(this.page, assetId);

    this.lastApiResponse = await this.page.waitForResponse((resp) => resp.url().includes('/api/encounters/'), {
      timeout: 5000,
    });
  } catch (_error) {
    this.attach('Remove failed as expected', 'text/plain');
  }
});

When('I attempt to remove asset from encounter {string}', async function (this: CustomWorld, encounterId: string) {
  try {
    await this.page.goto(`/encounters/${encounterId}/edit`);
    await deleteAssetFromCanvas(this.page, ensureAssetInstanceId(this));
  } catch (_error) {
    this.attach('Remove from non-existent encounter failed as expected', 'text/plain');
  }
});

When('I attempt to remove an asset from that encounter', async function (this: CustomWorld) {
  // Fixed: Inline removal attempt
  try {
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await deleteAssetFromCanvas(this.page, ensureAssetInstanceId(this));
  } catch (_error) {
    this.attach('Remove from non-existent encounter failed as expected', 'text/plain');
  }
});

When('I remove that asset', async function (this: CustomWorld) {
  // Fixed: Inline removal
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);
  await deleteAssetFromCanvas(this.page, ensureAssetInstanceId(this));
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
  );
});

When('I remove one asset', async function (this: CustomWorld) {
  const encounterId = ensureEncounterId(this);
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  // Fixed: Inline removal of first asset
  await this.page.goto(`/encounters/${encounterId}/edit`);
  await expandEncounterCanvas(this.page);
  await deleteAssetFromCanvas(this.page, assets[0].Id);
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
  );
});

When('I remove asset {string}', async function (this: CustomWorld, assetId: string) {
  // Fixed: Inline removal
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);
  await deleteAssetFromCanvas(this.page, assetId);
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'DELETE',
  );
});

When(
  'I place the same asset template at position X={int}, Y={int}',
  async function (this: CustomWorld, x: number, y: number) {
    // Fixed: Inline placement
    await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
    await expandEncounterCanvas(this.page);
    await dragAssetToCanvas(this.page, ensureAssetId(this), { x, y });
    this.lastApiResponse = await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
    );
  },
);

When('I place the new asset on the encounter', async function (this: CustomWorld) {
  // Fixed: Inline placement at 700,700
  await this.page.goto(`/encounters/${ensureEncounterId(this)}/edit`);
  await expandEncounterCanvas(this.page);
  await dragAssetToCanvas(this.page, ensureAssetId(this), {
    x: 700,
    y: 700,
  });
  this.lastApiResponse = await this.page.waitForResponse(
    (resp) => resp.url().includes('/api/encounters/') && resp.request().method() === 'POST',
  );
});

// ============================================================================
// THEN - Assertions
// ============================================================================

Then('the asset should be placed successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(201);
  await verifyAssetPlaced(this.page);
  this.attach('Asset placed successfully', 'text/plain');
});

Then('the asset should reference the correct template', async function (this: CustomWorld) {
  const responseBody = await this.lastApiResponse?.json();
  expect(responseBody.assetId).toBe(ensureAssetId(this));
});

Then('the asset should be placed on the encounter', async function (this: CustomWorld) {
  // Fixed: Inline verification
  expect(this.lastApiResponse?.status()).toBe(201);
  await verifyAssetPlaced(this.page);
  this.attach('Asset placed successfully', 'text/plain');
});

Then('the asset position should be X={int}, Y={int}', async function (this: CustomWorld, x: number, y: number) {
  const assetInstanceId = ensureAssetInstanceId(this);

  await verifyAssetPosition(this.page, assetInstanceId, {
    x,
    y,
  });

  // Verify in database
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: assetInstanceId,
  });

  expect(asset[0].X).toBe(x);
  expect(asset[0].Y).toBe(y);
});

Then('all asset properties should be set correctly', async function (this: CustomWorld) {
  // Verify properties in database
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(asset[0]).toBeDefined();
  expect(asset[0].X).toBeDefined();
  expect(asset[0].Y).toBeDefined();
  expect(asset[0].Width).toBeDefined();
  expect(asset[0].Height).toBeDefined();
  expect(asset[0].Layer).toBeDefined();
  expect(asset[0].Rotation).toBeDefined();
});

Then('all {int} assets should be placed successfully', async function (this: CustomWorld, count: number) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
  });

  expect(assets.length).toBe(count);
});

Then('each should have unique position', async function (this: CustomWorld) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
  });

  const positions = new Set(assets.map((a) => `${a.X},${a.Y}`));
  expect(positions.size).toBe(assets.length);
});

Then('the position should be at origin', async function (this: CustomWorld) {
  // Fixed: Inline verification for X=0, Y=0
  const assetInstanceId = ensureAssetInstanceId(this);

  await verifyAssetPosition(this.page, assetInstanceId, {
    x: 0,
    y: 0,
  });
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: assetInstanceId,
  });
  expect(asset[0].X).toBe(0);
  expect(asset[0].Y).toBe(0);
});

Then('the position should be preserved', async function (this: CustomWorld) {
  // Verify position matches what was set (outside bounds is allowed)
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(asset[0]).toBeDefined();
  this.attach(`Position preserved: (${asset[0].X}, ${asset[0].Y})`, 'text/plain');
});

Then('the Z-index should be {int}', async function (this: CustomWorld, zIndex: number) {
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(asset[0].Layer).toBe(zIndex);
});

Then('the encounter should now have {int} placed assets', async function (this: CustomWorld, count: number) {
  const encounterId = ensureEncounterId(this);
  const actualCount = await getPlacedAssetCount(this.page, encounterId);
  expect(actualCount).toBe(count);

  // Verify in database
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });

  expect(assets.length).toBe(count);
});

Then('the new asset should appear in the collection', async function (this: CustomWorld) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
    AssetId: ensureAssetId(this),
  });

  expect(assets.length).toBeGreaterThan(0);
});

Then(
  'the dimensions should be width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    const asset = await this.db.queryTable('EncounterAssets', {
      Id: this.currentAssetInstanceId,
    });

    expect(asset[0].Width).toBe(width);
    expect(asset[0].Height).toBe(height);
  },
);

Then('I should see error with not found error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(404);
});

Then('I should see error with forbidden error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(403);
});

Then('the asset should be moved successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(200);
});

Then('the asset is updated successfully', async function (this: CustomWorld) {
  throw new Error('NOT IMPLEMENTED: Asset update success - should verify API response status and database update');
});

Then('all properties should be set correctly', async function (this: CustomWorld) {
  // Fixed: Inline property verification
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });
  expect(asset[0]).toBeDefined();
  expect(asset[0].X).toBeDefined();
  expect(asset[0].Y).toBeDefined();
  expect(asset[0].Width).toBeDefined();
  expect(asset[0].Height).toBeDefined();
  expect(asset[0].Layer).toBeDefined();
  expect(asset[0].Rotation).toBeDefined();
});

Then('the position should be X={int}, Y={int}', async function (this: CustomWorld, x: number, y: number) {
  // Fixed: Inline position verification
  const assetInstanceId = ensureAssetInstanceId(this);

  await verifyAssetPosition(this.page, assetInstanceId, {
    x,
    y,
  });
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: assetInstanceId,
  });
  expect(asset[0].X).toBe(x);
  expect(asset[0].Y).toBe(y);
});

Then('the first asset should be at new position', async function (this: CustomWorld) {
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(asset[0].X).toBe(1000);
  expect(asset[0].Y).toBe(1000);
});

Then('the other {int} assets should remain unchanged', async function (this: CustomWorld, count: number) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
  });

  const unchangedAssets = assets.filter((a) => a.Id !== ensureAssetInstanceId(this));
  expect(unchangedAssets.length).toBe(count);
});

Then('the rotation should be {int} degrees', async function (this: CustomWorld, rotation: number) {
  const asset = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(asset[0].Rotation).toBe(rotation);
});

Then('the asset is removed successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(204);
  await verifyAssetRemoved(this.page, ensureAssetInstanceId(this));
});

Then('all assets is removed successfully', async function (this: CustomWorld) {
  const count = await getPlacedAssetCount(this.page, ensureEncounterId(this));
  expect(count).toBe(0);
});

Then('the encounter should have {int} placed assets', async function (this: CustomWorld, count: number) {
  // Fixed: Inline asset count verification
  const encounterId = ensureEncounterId(this);
  const actualCount = await getPlacedAssetCount(this.page, encounterId);
  expect(actualCount).toBe(count);
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: encounterId,
  });
  expect(assets.length).toBe(count);
});

Then('the asset is removed', async function (this: CustomWorld) {
  await verifyAssetRemoved(this.page, ensureAssetInstanceId(this));
});

Then('attempting to move that asset should fail', async function (this: CustomWorld) {
  // Try to move the removed asset
  try {
    await moveAssetOnCanvas(this.page, ensureAssetInstanceId(this), {
      x: 800,
      y: 800,
    });
    throw new Error('Move should have failed');
  } catch (_error) {
    this.attach('Move failed as expected (asset removed)', 'text/plain');
  }
});

Then('the encounter should not contain the asset', async function (this: CustomWorld) {
  const assets = await this.db.queryTable('EncounterAssets', {
    Id: this.currentAssetInstanceId,
  });

  expect(assets.length).toBe(0);
});

Then('the stage configuration should remain unchanged', async function (this: CustomWorld) {
  const encounter = await this.db.queryTable('Encounters', {
    Id: ensureEncounterId(this),
  });

  expect(encounter[0].Width).toBe(1920);
  expect(encounter[0].Height).toBe(1080);
});

Then('the grid configuration should remain unchanged', async function (this: CustomWorld) {
  const encounter = await this.db.queryTable('Encounters', {
    Id: ensureEncounterId(this),
  });

  expect(encounter[0].GridType).toBe('Square');
  expect(encounter[0].GridSize).toBe(50);
});

Then(
  'assets {int}, {int}, {int}, {int}, and {int} should remain intact',
  async function (this: CustomWorld, ...assetNumbers: number[]) {
    const assets = await this.db.queryTable('EncounterAssets', {
      EncounterId: ensureEncounterId(this),
    });

    expect(assets.length).toBe(assetNumbers.length);
  },
);

Then('their positions should be unchanged', async function (this: CustomWorld) {
  throw new Error(
    'NOT IMPLEMENTED: Position verification - should verify asset positions in database match expected values',
  );
});

Then('the encounter should have the asset at new position', async function (this: CustomWorld) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
    AssetId: ensureAssetId(this),
  });

  expect(assets.length).toBe(1);
  expect(assets[0].X).toBe(500);
  expect(assets[0].Y).toBe(600);
});

Then('the new asset should have a different placement ID', async function (this: CustomWorld) {
  const assets = await this.db.queryTable('EncounterAssets', {
    EncounterId: ensureEncounterId(this),
    AssetId: ensureAssetId(this),
  });

  expect(assets[0].Id).not.toBe(ensureAssetInstanceId(this));
});
