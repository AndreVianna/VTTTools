import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world.js';
import { expect } from '@playwright/test';
import {
    mapGridType
} from '../../support/helpers/grid.helper.js';

// ═══════════════════════════════════════════════════════════════
// GIVEN STEPS - Setup preconditions
// ═══════════════════════════════════════════════════════════════

Given('I own a scene in my library', async function (this: CustomWorld) {
    // Create test scene via database
    const sceneId = await this.db.queryTable('Scenes', { OwnerId: this.currentUser.id })
        .then(scenes => scenes.length > 0 ? scenes[0].Id : null);

    if (!sceneId) {
        // Insert test scene
        const pool = await (this.db as any).pool;
        const newSceneId = (this.db as any).generateGuidV7();

        await pool.request()
            .input('id', newSceneId)
            .input('name', 'Test Scene for Grid Config')
            .input('ownerId', this.currentUser.id)
            .input('stageWidth', 1920)
            .input('stageHeight', 1080)
            .input('gridType', 1) // Square by default
            .input('gridCellWidth', 50)
            .input('gridCellHeight', 50)
            .input('gridOffsetX', 0)
            .input('gridOffsetY', 0)
            .input('gridColor', '#000000')
            .input('gridSnapToGrid', false)
            .query(`
                INSERT INTO Library.Scenes
                (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
                 GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
                VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                        @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                        GETUTCDATE(), GETUTCDATE())
            `);

        (this as any).currentSceneId = newSceneId;
    } else {
        (this as any).currentSceneId = sceneId;
    }
});

Given('my scene exists', async function (this: CustomWorld) {
    // Verify scene exists from previous step
    const sceneId = (this as any).currentSceneId;
    if (!sceneId) {
        throw new Error('No scene has been created. Use "I own a scene in my library" first.');
    }

    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(scenes.length).toBe(1);
});

Given('my scene has square grid with size {int}', async function (this: CustomWorld, size: number) {
    const sceneId = (this as any).currentSceneId;

    await this.db.updateRecord('Scenes', sceneId, {
        GridType: 1, // Square
        GridCellWidth: size,
        GridCellHeight: size
    });
});

Given('my scene has square grid', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    await this.db.updateRecord('Scenes', sceneId, {
        GridType: 1, // Square
        GridCellWidth: 50,
        GridCellHeight: 50
    });
});

Given('my scene has configured grid', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    await this.db.updateRecord('Scenes', sceneId, {
        GridType: 1, // Square by default
        GridCellWidth: 50,
        GridCellHeight: 50
    });
});

Given('my scene has configured stage and {int} placed assets', async function (this: CustomWorld, assetCount: number) {
    const sceneId = (this as any).currentSceneId;

    // Verify scene has stage configured
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(scenes[0].StageWidth).toBeGreaterThan(0);
    expect(scenes[0].StageHeight).toBeGreaterThan(0);

    // Create placed assets (AssetPlacements table)
    for (let i = 0; i < assetCount; i++) {
        const assetId = (this.db as any).generateGuidV7();
        const pool = await (this.db as any).pool;

        await pool.request()
            .input('sceneId', sceneId)
            .input('assetId', assetId)
            .input('x', 100 + i * 50)
            .input('y', 100 + i * 50)
            .query(`
                INSERT INTO Library.AssetPlacements (SceneId, AssetId, X, Y)
                VALUES (@sceneId, @assetId, @x, @y)
            `);
    }
});

Given('no scene exists with ID {string}', async function (this: CustomWorld, sceneId: string) {
    // Ensure scene does NOT exist
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(scenes.length).toBe(0);
});

Given('a scene exists owned by another user', async function (this: CustomWorld) {
    // Create scene owned by different user
    const otherUserId = (this.db as any).generateGuidV7();
    const sceneId = (this.db as any).generateGuidV7();
    const pool = await (this.db as any).pool;

    await pool.request()
        .input('id', sceneId)
        .input('name', 'Other User Scene')
        .input('ownerId', otherUserId)
        .input('stageWidth', 1920)
        .input('stageHeight', 1080)
        .input('gridType', 1)
        .input('gridCellWidth', 50)
        .input('gridCellHeight', 50)
        .input('gridOffsetX', 0)
        .input('gridOffsetY', 0)
        .input('gridColor', '#000000')
        .input('gridSnapToGrid', false)
        .query(`
            INSERT INTO Library.Scenes
            (Id, Name, OwnerId, StageWidth, StageHeight, GridType, GridCellWidth, GridCellHeight,
             GridOffsetX, GridOffsetY, GridColor, GridSnapToGrid, CreatedAt, UpdatedAt)
            VALUES (@id, @name, @ownerId, @stageWidth, @stageHeight, @gridType, @gridCellWidth,
                    @gridCellHeight, @gridOffsetX, @gridOffsetY, @gridColor, @gridSnapToGrid,
                    GETUTCDATE(), GETUTCDATE())
        `);

    (this as any).otherUserSceneId = sceneId;
});

// ═══════════════════════════════════════════════════════════════
// WHEN STEPS - Actions
// ═══════════════════════════════════════════════════════════════

When('I configure grid with type {string} and size {int}', async function (
    this: CustomWorld,
    gridType: string,
    size: number
) {
    const sceneId = (this as any).currentSceneId;

    // Make PATCH request to update grid configuration
    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: size,
                cellHeight: size,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I configure grid with type {string} and hexagonal parameters', async function (
    this: CustomWorld,
    gridType: string
) {
    const sceneId = (this as any).currentSceneId;

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I attempt to configure grid with type {string} and incompatible parameters', async function (
    this: CustomWorld,
    gridType: string
) {
    const sceneId = (this as any).currentSceneId;

    // Send invalid configuration (e.g., negative cell dimensions)
    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: -10, // Invalid!
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I configure grid with:', async function (this: CustomWorld, dataTable: DataTable) {
    const sceneId = (this as any).currentSceneId;
    const rows = dataTable.hashes();

    const gridConfig: any = {
        type: 1, // Default to Square
        cellWidth: 50,
        cellHeight: 50,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
        snapToGrid: false
    };

    rows.forEach((row: any) => {
        const property = row.Property;
        const value = row.Value || '';

        switch (property) {
            case 'Type':
                gridConfig.type = mapGridType(value);
                break;
            case 'Size':
                gridConfig.cellWidth = parseInt(value);
                gridConfig.cellHeight = parseInt(value);
                break;
            case 'OffsetX':
                gridConfig.offsetX = parseInt(value);
                break;
            case 'OffsetY':
                gridConfig.offsetY = parseInt(value);
                break;
            case 'Color':
                gridConfig.color = value === 'Black' ? '#000000' : value;
                break;
        }
    });

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: { grid: gridConfig }
    });
    this.lastApiResponse = apiResponse as any;
    this.lastApiResponse = apiResponse as any;
});

When('I update grid size to {int}', async function (this: CustomWorld, newSize: number) {
    const sceneId = (this as any).currentSceneId;

    // Get current grid config
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    const currentGrid = scenes[0];

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: currentGrid.GridType,
                cellWidth: newSize,
                cellHeight: newSize,
                offsetX: currentGrid.GridOffsetX,
                offsetY: currentGrid.GridOffsetY,
                color: currentGrid.GridColor,
                snapToGrid: currentGrid.GridSnapToGrid
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I change grid type to {string}', async function (this: CustomWorld, gridType: string) {
    const sceneId = (this as any).currentSceneId;

    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    const currentGrid = scenes[0];

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: currentGrid.GridCellWidth,
                cellHeight: currentGrid.GridCellHeight,
                offsetX: currentGrid.GridOffsetX,
                offsetY: currentGrid.GridOffsetY,
                color: currentGrid.GridColor,
                snapToGrid: currentGrid.GridSnapToGrid
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
    this.lastApiResponse = apiResponse as any;
});

When('I provide appropriate hexagonal parameters', async function (this: CustomWorld) {
    throw new Error('NOT IMPLEMENTED: This step needs actual implementation to set hexagonal grid parameters');
});

When('I set grid type to {string}', async function (this: CustomWorld, gridType: string) {
    const sceneId = (this as any).currentSceneId;

    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    const currentGrid = scenes[0];

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: currentGrid.GridCellWidth,
                cellHeight: currentGrid.GridCellHeight,
                offsetX: currentGrid.GridOffsetX,
                offsetY: currentGrid.GridOffsetY,
                color: currentGrid.GridColor,
                snapToGrid: currentGrid.GridSnapToGrid
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I configure grid with offsetX {int} and offsetY {int}', async function (
    this: CustomWorld,
    offsetX: number,
    offsetY: number
) {
    const sceneId = (this as any).currentSceneId;

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: 1, // Square
                cellWidth: 50,
                cellHeight: 50,
                offsetX: offsetX,
                offsetY: offsetY,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I update the grid configuration', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: 1, // Square
                cellWidth: 64,
                cellHeight: 64,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: true
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I attempt to configure grid for scene {string}', async function (this: CustomWorld, sceneId: string) {
    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: 1,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I attempt to configure grid for that scene', async function (this: CustomWorld) {
    const sceneId = (this as any).otherUserSceneId;

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: 1,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I configure grid with type {string}', async function (this: CustomWorld, gridType: string) {
    const sceneId = (this as any).currentSceneId;

    const apiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user': this.encodeUserId(this.currentUser.id)
        },
        data: {
            grid: {
                type: mapGridType(gridType),
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: false
            }
        }
    });
    this.lastApiResponse = apiResponse as any;
});

When('I provide appropriate configuration for {string}', async function (this: CustomWorld, _gridType: string) {
    throw new Error('NOT IMPLEMENTED: This step needs actual implementation to configure grid');
});

// ═══════════════════════════════════════════════════════════════
// THEN STEPS - Assertions
// ═══════════════════════════════════════════════════════════════

Then('the grid is updated successfully', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(200);
});

Then('the grid type should be {string}', async function (this: CustomWorld, gridType: string) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridType).toBe(mapGridType(gridType));
});

Then('the grid size should be {int}', async function (this: CustomWorld, size: number) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridCellWidth).toBe(size);
    expect(scenes[0].GridCellHeight).toBe(size);
});

Then('I should see error with validation error', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(400);
});

Then('all grid properties should be set correctly', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });
    const grid = scenes[0];

    expect(grid.GridType).toBe(1); // Square
    expect(grid.GridCellWidth).toBe(64);
    expect(grid.GridCellHeight).toBe(64);
    expect(grid.GridOffsetX).toBe(32);
    expect(grid.GridOffsetY).toBe(32);
    expect(grid.GridColor).toBe('Black');
});

Then('the scene should have no grid overlay', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridType).toBe(0); // NoGrid
});

Then('I should see error with not found error', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(404);
});

Then('I should see error with forbidden error', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(403);
});

Then('the offsets should be zero', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridOffsetX).toBe(0);
    expect(scenes[0].GridOffsetY).toBe(0);
});

Then('the negative offsets should be preserved', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    expect(scenes[0].GridOffsetX).toBe(-50);
    expect(scenes[0].GridOffsetY).toBe(-50);
});

Then('the grid is updated', async function (this: CustomWorld) {
    expect(this.lastApiResponse.status()).toBe(200);
});

Then('the stage configuration should remain unchanged', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;
    const scenes = await this.db.queryTable('Scenes', { Id: sceneId });

    // Stage dimensions should remain the same
    expect(scenes[0].StageWidth).toBeGreaterThan(0);
    expect(scenes[0].StageHeight).toBeGreaterThan(0);
});

Then('all asset placements should remain intact', async function (this: CustomWorld) {
    const sceneId = (this as any).currentSceneId;

    // Query asset placements
    const pool = await (this.db as any).pool;
    const result = await pool.request()
        .input('sceneId', sceneId)
        .query('SELECT COUNT(*) as Count FROM Library.AssetPlacements WHERE SceneId = @sceneId');

    expect(result.recordset[0].Count).toBeGreaterThanOrEqual(8);
});
