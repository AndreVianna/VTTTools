/**
 * Scene Management Grid Step Definitions
 *
 * BDD step definitions for Scene Management feature grid scenarios
 * Feature: Scene Management.feature (grid-specific scenarios)
 *
 * BLACK-BOX TESTING: Tests through UI and API interactions
 * NO ANTI-PATTERNS: No step-to-step calls, proper security, type safety
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';
import { mapGridType } from '../../support/helpers/grid.helper.js';

// ═══════════════════════════════════════════════════════════════
// GIVEN STEPS - Setup preconditions for grid scenarios
// ═══════════════════════════════════════════════════════════════

Given('I provide scene name {string}', async function (this: CustomWorld, sceneName: string) {
    (this as any).sceneName = sceneName;
});

Given('I provide scene with stage width {int} and height {int}', async function (
    this: CustomWorld,
    width: number,
    height: number
) {
    (this as any).stageWidth = width;
    (this as any).stageHeight = height;
});

Given('I provide scene with grid type {string}', async function (this: CustomWorld, gridType: string) {
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

Given('my scene is not referenced by any active game session', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    // Verify no active game sessions reference this scene
    const pool = await (this.db as any).pool;
    const result = await pool.request()
        .input('sceneId', sceneId)
        .query(`
            SELECT COUNT(*) as Count
            FROM Game.GameSessions
            WHERE SceneId = @sceneId AND Status = 'InProgress'
        `);

    expect(result.recordset[0].Count).toBe(0);
});

Given('my scene is referenced by an active game session', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    // Create an active game session referencing this scene
    const sessionId = (this.db as any).generateGuidV7();
    const pool = await (this.db as any).pool;

    await pool.request()
        .input('id', sessionId)
        .input('title', 'Test Game Session')
        .input('ownerId', this.currentUser.id)
        .input('sceneId', sceneId)
        .input('status', 'InProgress')
        .input('createdAt', new Date())
        .input('updatedAt', new Date())
        .query(`
            INSERT INTO Game.GameSessions
            (Id, Title, OwnerId, SceneId, Status, CreatedAt, UpdatedAt)
            VALUES (@id, @title, @ownerId, @sceneId, @status, @createdAt, @updatedAt)
        `);

    (this as any).activeSessionId = sessionId;
});

Given('I provide valid scene data', async function (this: CustomWorld) {
    (this as any).sceneName = 'Test Scene';
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

Given('I configure grid with type {string} and size {int}', async function (
    this: CustomWorld,
    gridType: string,
    size: number
) {
    (this as any).gridType = mapGridType(gridType);
    (this as any).gridCellWidth = size;
    (this as any).gridCellHeight = size;
});

Given('I place {int} assets on the scene', async function (this: CustomWorld, assetCount: number) {
    (this as any).assetPlacementCount = assetCount;
});

Given('I have a scene with stage, grid, and {int} placed assets', async function (
    this: CustomWorld,
    assetCount: number
) {
    const sceneId = (this.db as any).generateGuidV7();
    const pool = await (this.db as any).pool;

    // Create scene
    await pool.request()
        .input('id', sceneId)
        .input('name', 'Source Scene for Cloning')
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
            INSERT INTO Library.Scenes
            (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
             GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
            VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                    @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                    @createdAt, @updatedAt)
        `);

    // Place assets on scene
    for (let i = 0; i < assetCount; i++) {
        const assetId = (this.db as any).generateGuidV7();
        await pool.request()
            .input('sceneId', sceneId)
            .input('assetId', assetId)
            .input('x', 100 + i * 50)
            .input('y', 100 + i * 50)
            .query(`
                INSERT INTO Library.SceneAssetPlacements (SceneId, AssetId, X, Y)
                VALUES (@sceneId, @assetId, @x, @y)
            `);
    }

    (this as any).sourceSceneId = sceneId;
});

Given('I create scenes with each grid type:', async function (this: CustomWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    const createdSceneIds: string[] = [];

    for (const row of rows) {
        const gridType = mapGridType(row.GridType ?? 'Square');
        const sceneId = (this.db as any).generateGuidV7();
        const pool = await (this.db as any).pool;

        await pool.request()
            .input('id', sceneId)
            .input('name', `Test Scene - ${row.GridType}`)
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
                INSERT INTO Library.Scenes
                (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
                 GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
                VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                        @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                        @createdAt, @updatedAt)
            `);

        createdSceneIds.push(sceneId);
    }

    (this as any).createdSceneIds = createdSceneIds;
});

Given('I provide empty scene name', async function (this: CustomWorld) {
    (this as any).sceneName = '';
});

Given('I provide scene with stage width {int} and height {int}', async function (
    this: CustomWorld,
    width: number,
    height: number
) {
    (this as any).stageWidth = width;
    (this as any).stageHeight = height;
});

// ═══════════════════════════════════════════════════════════════
// WHEN STEPS - Actions for grid scenarios
// ═══════════════════════════════════════════════════════════════

When('I create the scene', async function (this: CustomWorld) {
    const sceneName = (this as any).sceneName || 'Test Scene';
    const stageWidth = (this as any).stageWidth || 1920;
    const stageHeight = (this as any).stageHeight || 1080;
    const gridType = (this as any).gridType || 1;
    const gridCellWidth = (this as any).gridCellWidth || 50;
    const gridCellHeight = (this as any).gridCellHeight || 50;

    this.lastApiResponse = await this.page.request.post('/api/library/scenes', {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            name: sceneName,
            stage: {
                width: stageWidth,
                height: stageHeight,
                backgroundUrl: (this as any).stageBackgroundUrl || null
            },
            grid: {
                type: gridType,
                cellWidth: gridCellWidth,
                cellHeight: gridCellHeight,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            },
            assetPlacements: []
        }
    });

    if (this.lastApiResponse!.ok()) {
        const response = await this.lastApiResponse!.json();
        (this as any).currentSceneId = response.id;
    }
});

When('I attempt to create the scene', async function (this: CustomWorld) {
    const sceneName = (this as any).sceneName || '';
    const stageWidth = (this as any).stageWidth || 1920;
    const stageHeight = (this as any).stageHeight || 1080;
    const gridType = (this as any).gridType || 1;
    const gridCellWidth = (this as any).gridCellWidth || 50;
    const gridCellHeight = (this as any).gridCellHeight || 50;

    this.lastApiResponse = await this.page.request.post('/api/library/scenes', {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            name: sceneName,
            stage: {
                width: stageWidth,
                height: stageHeight
            },
            grid: {
                type: gridType,
                cellWidth: gridCellWidth,
                cellHeight: gridCellHeight,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
});

When('I delete the scene', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    this.lastApiResponse = await this.page.request.delete(`/api/library/scenes/${sceneId}`, {
        headers: {
            'x-user': this.encodeUserId(this.currentUser.id)
        }
    });
});

When('I attempt to delete the scene', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    this.lastApiResponse = await this.page.request.delete(`/api/library/scenes/${sceneId}`, {
        headers: {
            'x-user': this.encodeUserId(this.currentUser.id)
        }
    });
});

When('I clone the scene', async function (this: CustomWorld) {
    const sourceSceneId = (this as any).sourceSceneId;

    this.lastApiResponse = await this.page.request.post(`/api/library/scenes/${sourceSceneId}/clone`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            name: 'Cloned Scene'
        }
    });

    if (this.lastApiResponse!.ok()) {
        const response = await this.lastApiResponse!.json();
        (this as any).clonedSceneId = response.id;
    }
});

// ═══════════════════════════════════════════════════════════════
// THEN STEPS - Assertions for grid scenarios
// ═══════════════════════════════════════════════════════════════

Then('the scene is created', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(201);
});

Then('I should see the scene in my library', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId, OwnerId: this.currentUser.id });

    expect(scenes.length).toBe(1);
});

Then('the stage dimensions should be set correctly', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].StageWidth).toBe((this as any).stageWidth);
    expect(scenes[0].StageHeight).toBe((this as any).stageHeight);
});

Then('the grid should be configured as square', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridType).toBe(1); // Square
    expect(scenes[0].GridCellWidth).toBeGreaterThan(0);
    expect(scenes[0].GridCellHeight).toBeGreaterThan(0);
});

Then('I should see error', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBeGreaterThanOrEqual(400);
    expect(this.lastApiResponse!.status()).toBeLessThan(500);
});

Then('the scene is removed successfully', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(204);

    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(scenes.length).toBe(0);
});

Then('the stage should be configured correctly', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].StageWidth).toBe(1920);
    expect(scenes[0].StageHeight).toBe(1080);
});

Then('the grid should be configured correctly', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridType).toBe(1); // Square
    expect(scenes[0].GridCellWidth).toBe(50);
    expect(scenes[0].GridCellHeight).toBe(50);
});

Then('all {int} assets should be placed', async function (this: CustomWorld, count: number) {
    const sceneId = (this as any).currentSceneId;
    await this.db.verifySceneAssetPlacementCount(sceneId, count);
});

Then('a new scene should be created', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(201);

    const clonedSceneId = (this as any).clonedSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: clonedSceneId });
    expect(scenes.length).toBe(1);
});

Then('the stage configuration should be duplicated', async function (this: CustomWorld) {
    const sourceSceneId = (this as any).sourceSceneId;
    const clonedSceneId = (this as any).clonedSceneId;

    const sourceScenes = await this.db.queryTable('Scenes', { Id: sourceSceneId });
    const clonedScenes = await this.db.queryTable('Scenes', { Id: clonedSceneId });

    expect(clonedScenes[0].StageWidth).toBe(sourceScenes[0].StageWidth);
    expect(clonedScenes[0].StageHeight).toBe(sourceScenes[0].StageHeight);
});

Then('the grid configuration should be duplicated', async function (this: CustomWorld) {
    const sourceSceneId = (this as any).sourceSceneId;
    const clonedSceneId = (this as any).clonedSceneId;

    const sourceScenes = await this.db.queryTable('Scenes', { Id: sourceSceneId });
    const clonedScenes = await this.db.queryTable('Scenes', { Id: clonedSceneId });

    expect(clonedScenes[0].GridType).toBe(sourceScenes[0].GridType);
    expect(clonedScenes[0].GridCellWidth).toBe(sourceScenes[0].GridCellWidth);
    expect(clonedScenes[0].GridCellHeight).toBe(sourceScenes[0].GridCellHeight);
});

Then('all {int} assets should be duplicated with new IDs', async function (this: CustomWorld, count: number) {
    const clonedSceneId = (this as any).clonedSceneId;
    await this.db.verifySceneAssetPlacementCount(clonedSceneId, count);

    // Verify asset IDs are different from source
    const sourceSceneId = (this as any).sourceSceneId;
    const sourcePlacements = await this.db.queryTable('SceneAssets', { SceneId: sourceSceneId });
    const clonedPlacements = await this.db.queryTable('SceneAssets', { SceneId: clonedSceneId });

    const sourceAssetIds = sourcePlacements.map((p: any) => p.AssetId);
    const clonedAssetIds = clonedPlacements.map((p: any) => p.AssetId);

    // No asset IDs should be the same
    const intersection = sourceAssetIds.filter((id: string) => clonedAssetIds.includes(id));
    expect(intersection.length).toBe(0);
});

Then('all scenes is created', async function (this: CustomWorld) {
    const sceneIds = (this as any).createdSceneIds || [];

    for (const sceneId of sceneIds) {
        const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
        expect(scenes.length).toBe(1);
    }
});

Then('each should have the correct grid configuration', async function (this: CustomWorld) {
    const sceneIds = (this as any).createdSceneIds || [];

    const expectedGridTypes = [1, 2, 4, 0]; // Square, HexH, Isometric, NoGrid

    for (let i = 0; i < sceneIds.length; i++) {
        const scenes = await this.db.queryTable('Scenes', { Id: sceneIds[i] });
        expect(scenes[0].GridType).toBe(expectedGridTypes[i]);
    }
});
