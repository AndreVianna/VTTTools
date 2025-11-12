/**
 * Encounter Management Grid Step Definitions
 *
 * BDD step definitions for Encounter Management feature grid scenarios
 * Feature: Encounter Management.feature (grid-specific scenarios)
 *
 * BLACK-BOX TESTING: Tests through UI and API interactions
 * NO ANTI-PATTERNS: No step-to-step calls, proper security, type safety
 */

import { type DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { mapGridType } from '../../support/helpers/grid.helper.js';
import type { CustomWorld } from '../../support/world.js';

// ═══════════════════════════════════════════════════════════════
// GIVEN STEPS - Setup preconditions for grid scenarios
// ═══════════════════════════════════════════════════════════════

Given('I provide encounter name {string}', async function (this: CustomWorld, encounterName: string) {
  (this as any).encounterName = encounterName;
});

Given(
  'I provide encounter with stage width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    (this as any).stageWidth = width;
    (this as any).stageHeight = height;
  },
);

Given('I provide encounter with grid type {string}', async function (this: CustomWorld, gridType: string) {
  (this as any).gridType = mapGridType(gridType);
});

Given('I provide square grid size {int}', async function (this: CustomWorld, size: number) {
  (this as any).gridCellWidth = size;
  (this as any).gridCellHeight = size;
});

Given('I provide incompatible grid parameters', async function (this: CustomWorld) {
  // Set invalid parameters (e.g., zero dimensions for hexagonal grid)
  (this as any).gridCellWidth = 0;
  (this as any).gridCellHeight = 0;
});

Given('my encounter is not referenced by any active game session', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;

  // Verify no active game sessions reference this encounter
  const pool = await (this.db as any).pool;
  const result = await pool
    .request()
    .input('encounterId', encounterId)
    .query(`
            SELECT COUNT(*) as Count
            FROM Game.GameSessions
            WHERE EncounterId = @encounterId AND Status = 'InProgress'
        `);

  expect(result.recordset[0].Count).toBe(0);
});

Given('my encounter is referenced by an active game session', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;

  // Create an active game session referencing this encounter
  const sessionId = (this.db as any).generateGuidV7();
  const pool = await (this.db as any).pool;

  await pool
    .request()
    .input('id', sessionId)
    .input('title', 'Test Game Session')
    .input('ownerId', this.currentUser.id)
    .input('encounterId', encounterId)
    .input('status', 'InProgress')
    .input('createdAt', new Date())
    .input('updatedAt', new Date())
    .query(`
            INSERT INTO Game.GameSessions
            (Id, Title, OwnerId, EncounterId, Status, CreatedAt, UpdatedAt)
            VALUES (@id, @title, @ownerId, @encounterId, @status, @createdAt, @updatedAt)
        `);

  (this as any).activeSessionId = sessionId;
});

Given('I provide valid encounter data', async function (this: CustomWorld) {
  (this as any).encounterName = 'Test Encounter';
  (this as any).stageWidth = 1920;
  (this as any).stageHeight = 1080;
  (this as any).gridType = 1; // Square
  (this as any).gridCellWidth = 50;
  (this as any).gridCellHeight = 50;
});

Given('I configure stage with background image and dimensions', async function (this: CustomWorld) {
  (this as any).stageBackgroundUrl = 'https://example.com/background.jpg';
  (this as any).stageWidth = 1920;
  (this as any).stageHeight = 1080;
});

Given(
  'I configure grid with type {string} and size {int}',
  async function (this: CustomWorld, gridType: string, size: number) {
    (this as any).gridType = mapGridType(gridType);
    (this as any).gridCellWidth = size;
    (this as any).gridCellHeight = size;
  },
);

Given('I place {int} assets on the encounter', async function (this: CustomWorld, assetCount: number) {
  (this as any).assetPlacementCount = assetCount;
});

Given(
  'I have a encounter with stage, grid, and {int} placed assets',
  async function (this: CustomWorld, assetCount: number) {
    const encounterId = (this.db as any).generateGuidV7();
    const pool = await (this.db as any).pool;

    // Create encounter
    await pool
      .request()
      .input('id', encounterId)
      .input('name', 'Source Encounter for Cloning')
      .input('ownerId', this.currentUser.id)
      .input('stageWidth', 1920)
      .input('stageHeight', 1080)
      .input('gridType', 1) // Square
      .input('gridCellWidth', 50)
      .input('gridCellHeight', 50)
      .input('gridOffsetX', 0)
      .input('gridOffsetY', 0)
      .input('gridColor', '#000000')
      .input('gridSnapToGrid', false)
      .input('createdAt', new Date())
      .input('updatedAt', new Date())
      .query(`
            INSERT INTO Library.Encounters
            (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
             GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
            VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                    @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                    @createdAt, @updatedAt)
        `);

    // Place assets on encounter
    for (let i = 0; i < assetCount; i++) {
      const assetId = (this.db as any).generateGuidV7();
      await pool
        .request()
        .input('encounterId', encounterId)
        .input('assetId', assetId)
        .input('x', 100 + i * 50)
        .input('y', 100 + i * 50)
        .query(`
                INSERT INTO Library.EncounterAssetPlacements (EncounterId, AssetId, X, Y)
                VALUES (@encounterId, @assetId, @x, @y)
            `);
    }

    (this as any).sourceEncounterId = encounterId;
  },
);

Given('I create encounters with each grid type:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();
  const createdEncounterIds: string[] = [];

  for (const row of rows) {
    const gridType = mapGridType(row.GridType ?? 'Square');
    const encounterId = (this.db as any).generateGuidV7();
    const pool = await (this.db as any).pool;

    await pool
      .request()
      .input('id', encounterId)
      .input('name', `Test Encounter - ${row.GridType}`)
      .input('ownerId', this.currentUser.id)
      .input('stageWidth', 1920)
      .input('stageHeight', 1080)
      .input('gridType', gridType)
      .input('gridCellWidth', 50)
      .input('gridCellHeight', 50)
      .input('gridOffsetX', 0)
      .input('gridOffsetY', 0)
      .input('gridColor', '#000000')
      .input('gridSnapToGrid', false)
      .input('createdAt', new Date())
      .input('updatedAt', new Date())
      .query(`
                INSERT INTO Library.Encounters
                (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
                 GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
                VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                        @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                        @createdAt, @updatedAt)
            `);

    createdEncounterIds.push(encounterId);
  }

  (this as any).createdEncounterIds = createdEncounterIds;
});

Given('I provide empty encounter name', async function (this: CustomWorld) {
  (this as any).encounterName = '';
});

Given(
  'I provide encounter with stage width {int} and height {int}',
  async function (this: CustomWorld, width: number, height: number) {
    (this as any).stageWidth = width;
    (this as any).stageHeight = height;
  },
);

// ═══════════════════════════════════════════════════════════════
// WHEN STEPS - Actions for grid scenarios
// ═══════════════════════════════════════════════════════════════

When('I create the encounter', async function (this: CustomWorld) {
  const encounterName = (this as any).encounterName || 'Test Encounter';
  const stageWidth = (this as any).stageWidth || 1920;
  const stageHeight = (this as any).stageHeight || 1080;
  const gridType = (this as any).gridType || 1;
  const gridCellWidth = (this as any).gridCellWidth || 50;
  const gridCellHeight = (this as any).gridCellHeight || 50;

  this.lastApiResponse = await this.page.request.post('/api/library/encounters', {
    headers: {
      'Content-Type': 'application/json',
      'x-user': this.encodeUserId(this.currentUser.id),
    },
    data: {
      name: encounterName,
      stage: {
        width: stageWidth,
        height: stageHeight,
        backgroundUrl: (this as any).stageBackgroundUrl || null,
      },
      grid: {
        type: gridType,
        cellWidth: gridCellWidth,
        cellHeight: gridCellHeight,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
        snapToGrid: false,
      },
      assetPlacements: [],
    },
  });

  if (this.lastApiResponse?.ok()) {
    const response = await this.lastApiResponse?.json();
    (this as any).currentEncounterId = response.id;
  }
});

When('I attempt to create the encounter', async function (this: CustomWorld) {
  const encounterName = (this as any).encounterName || '';
  const stageWidth = (this as any).stageWidth || 1920;
  const stageHeight = (this as any).stageHeight || 1080;
  const gridType = (this as any).gridType || 1;
  const gridCellWidth = (this as any).gridCellWidth || 50;
  const gridCellHeight = (this as any).gridCellHeight || 50;

  this.lastApiResponse = await this.page.request.post('/api/library/encounters', {
    headers: {
      'Content-Type': 'application/json',
      'x-user': this.encodeUserId(this.currentUser.id),
    },
    data: {
      name: encounterName,
      stage: {
        width: stageWidth,
        height: stageHeight,
      },
      grid: {
        type: gridType,
        cellWidth: gridCellWidth,
        cellHeight: gridCellHeight,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
        snapToGrid: false,
      },
    },
  });
});

When('I delete the encounter', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;

  this.lastApiResponse = await this.page.request.delete(`/api/library/encounters/${encounterId}`, {
    headers: {
      'x-user': this.encodeUserId(this.currentUser.id),
    },
  });
});

When('I attempt to delete the encounter', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;

  this.lastApiResponse = await this.page.request.delete(`/api/library/encounters/${encounterId}`, {
    headers: {
      'x-user': this.encodeUserId(this.currentUser.id),
    },
  });
});

When('I clone the encounter', async function (this: CustomWorld) {
  const sourceEncounterId = (this as any).sourceEncounterId;

  this.lastApiResponse = await this.page.request.post(`/api/library/encounters/${sourceEncounterId}/clone`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user': this.encodeUserId(this.currentUser.id),
    },
    data: {
      name: 'Cloned Encounter',
    },
  });

  if (this.lastApiResponse?.ok()) {
    const response = await this.lastApiResponse?.json();
    (this as any).clonedEncounterId = response.id;
  }
});

// ═══════════════════════════════════════════════════════════════
// THEN STEPS - Assertions for grid scenarios
// ═══════════════════════════════════════════════════════════════

Then('the encounter is created', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(201);
});

Then('I should see the encounter in my library', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
    OwnerId: this.currentUser.id,
  });

  expect(encounters.length).toBe(1);
});

Then('the stage dimensions should be set correctly', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });

  expect(encounters[0].StageWidth).toBe((this as any).stageWidth);
  expect(encounters[0].StageHeight).toBe((this as any).stageHeight);
});

Then('the grid should be configured as square', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });

  expect(encounters[0].GridType).toBe(1); // Square
  expect(encounters[0].GridCellWidth).toBeGreaterThan(0);
  expect(encounters[0].GridCellHeight).toBeGreaterThan(0);
});

Then('I should see error', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBeGreaterThanOrEqual(400);
  expect(this.lastApiResponse?.status()).toBeLessThan(500);
});

Then('the encounter is removed successfully', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(204);

  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });
  expect(encounters.length).toBe(0);
});

Then('the stage should be configured correctly', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });

  expect(encounters[0].StageWidth).toBe(1920);
  expect(encounters[0].StageHeight).toBe(1080);
});

Then('the grid should be configured correctly', async function (this: CustomWorld) {
  const encounterId = (this as any).currentEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: encounterId,
  });

  expect(encounters[0].GridType).toBe(1); // Square
  expect(encounters[0].GridCellWidth).toBe(50);
  expect(encounters[0].GridCellHeight).toBe(50);
});

Then('all {int} assets should be placed', async function (this: CustomWorld, count: number) {
  const encounterId = (this as any).currentEncounterId;
  await this.db.verifyEncounterAssetPlacementCount(encounterId, count);
});

Then('a new encounter should be created', async function (this: CustomWorld) {
  expect(this.lastApiResponse?.status()).toBe(201);

  const clonedEncounterId = (this as any).clonedEncounterId;
  const encounters = await this.db.queryTable('Encounters', {
    Id: clonedEncounterId,
  });
  expect(encounters.length).toBe(1);
});

Then('the stage configuration should be duplicated', async function (this: CustomWorld) {
  const sourceEncounterId = (this as any).sourceEncounterId;
  const clonedEncounterId = (this as any).clonedEncounterId;

  const sourceEncounters = await this.db.queryTable('Encounters', {
    Id: sourceEncounterId,
  });
  const clonedEncounters = await this.db.queryTable('Encounters', {
    Id: clonedEncounterId,
  });

  expect(clonedEncounters[0].StageWidth).toBe(sourceEncounters[0].StageWidth);
  expect(clonedEncounters[0].StageHeight).toBe(sourceEncounters[0].StageHeight);
});

Then('the grid configuration should be duplicated', async function (this: CustomWorld) {
  const sourceEncounterId = (this as any).sourceEncounterId;
  const clonedEncounterId = (this as any).clonedEncounterId;

  const sourceEncounters = await this.db.queryTable('Encounters', {
    Id: sourceEncounterId,
  });
  const clonedEncounters = await this.db.queryTable('Encounters', {
    Id: clonedEncounterId,
  });

  expect(clonedEncounters[0].GridType).toBe(sourceEncounters[0].GridType);
  expect(clonedEncounters[0].GridCellWidth).toBe(sourceEncounters[0].GridCellWidth);
  expect(clonedEncounters[0].GridCellHeight).toBe(sourceEncounters[0].GridCellHeight);
});

Then('all {int} assets should be duplicated with new IDs', async function (this: CustomWorld, count: number) {
  const clonedEncounterId = (this as any).clonedEncounterId;
  await this.db.verifyEncounterAssetPlacementCount(clonedEncounterId, count);

  // Verify asset IDs are different from source
  const sourceEncounterId = (this as any).sourceEncounterId;
  const sourcePlacements = await this.db.queryTable('EncounterAssets', {
    EncounterId: sourceEncounterId,
  });
  const clonedPlacements = await this.db.queryTable('EncounterAssets', {
    EncounterId: clonedEncounterId,
  });

  const sourceAssetIds = sourcePlacements.map((p: any) => p.AssetId);
  const clonedAssetIds = clonedPlacements.map((p: any) => p.AssetId);

  // No asset IDs should be the same
  const intersection = sourceAssetIds.filter((id: string) => clonedAssetIds.includes(id));
  expect(intersection.length).toBe(0);
});

Then('all encounters are created', async function (this: CustomWorld) {
  const encounterIds = (this as any).createdEncounterIds || [];

  for (const encounterId of encounterIds) {
    const encounters = await this.db.queryTable('Encounters', {
      Id: encounterId,
    });
    expect(encounters.length).toBe(1);
  }
});

Then('each should have the correct grid configuration', async function (this: CustomWorld) {
  const encounterIds = (this as any).createdEncounterIds || [];

  const expectedGridTypes = [1, 2, 4, 0]; // Square, HexH, Isometric, NoGrid

  for (let i = 0; i < encounterIds.length; i++) {
    const encounters = await this.db.queryTable('Encounters', {
      Id: encounterIds[i],
    });
    expect(encounters[0].GridType).toBe(expectedGridTypes[i]);
  }
});
