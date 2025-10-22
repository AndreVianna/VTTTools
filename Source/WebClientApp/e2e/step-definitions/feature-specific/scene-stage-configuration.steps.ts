/**
 * Scene Stage Configuration Step Definitions
 * BDD E2E tests for Configure Stage use case
 *
 * FEATURE: Documents/Areas/Library/Features/SceneManagement/UseCases/Configurestage/Configurestage.feature
 * UI_COMPONENT: Source/WebClientApp/src/components/scene/StageConfigPanel.tsx
 * INVARIANT: INV-09 - Stage dimensions must be positive
 *
 * Test Approach: Black-box testing
 * - Interact through UI (StageConfigPanel component)
 * - Verify against REAL backend API
 * - Query REAL database for persistence validation
 * - NO mocking of business logic
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world.js';

// ============================================================================
// GIVEN STEPS - Scene and Stage Preconditions
// ============================================================================

Given('I own a scene in my library', async function (this: CustomWorld) {
    // Create a test scene in the database via API
    const createSceneResponse = await this.page.request.post('/api/library/scenes', {
        data: {
            name: 'Test Scene for Stage Config',
            description: 'Test scene created for stage configuration testing',
            isPublished: false
        }
    });

    expect(createSceneResponse.ok()).toBeTruthy();
    const scene = await createSceneResponse.json();

    this.currentAsset = scene; // Store scene in world state
    this.createdAssets.push(scene); // Track for cleanup
});

Given('my scene exists', async function (this: CustomWorld) {
    // Reuse existing scene from previous step
    if (!this.currentAsset) {
        // If no scene exists, create one
        const createSceneResponse = await this.page.request.post('/api/library/scenes', {
            data: {
                name: 'Test Scene for Stage Config',
                description: 'Test scene created for stage configuration testing',
                isPublished: false
            }
        });

        expect(createSceneResponse.ok()).toBeTruthy();
        const scene = await createSceneResponse.json();

        this.currentAsset = scene; // Store scene in world state
        this.createdAssets.push(scene); // Track for cleanup
    }

    // Verify scene exists in database
    const sceneId = this.currentAsset.id;
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(dbScene).toBeDefined();
});

Given('my scene has no stage background', async function (this: CustomWorld) {
    // Verify stage configuration has no background resource
    const scene = this.currentAsset;
    expect(scene.stage).toBeDefined();
    expect(scene.stage.backgroundResourceId).toBeNull();
});

Given('I have a valid image resource', async function (this: CustomWorld) {
    // Upload a test image resource
    const imagePath = ((this.page.context() as any)['testDataDir']) || 'e2e/test-data/images/test-background.png';

    const uploadResponse = await this.page.request.post('/api/resources', {
        multipart: {
            file: imagePath,
            resourceKind: '1' // Image kind
        }
    });

    expect(uploadResponse.ok()).toBeTruthy();
    const resource = await uploadResponse.json();

    this.uploadedResourceIds.push(resource.id); // Track for cleanup
    const ctx = this as any; ctx['testImageResourceId'] = resource.id; // Store for scenario use
});

Given('my scene has stage with width {int} and height {int}', async function (this: CustomWorld, width: number, height: number) {
    // Configure stage via API
    const sceneId = this.currentAsset.id;

    const patchResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width,
            height,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: width,
            viewportHeight: height
        }
    });

    expect(patchResponse.status()).toBe(204); // No Content

    // Update current asset with new stage dimensions
    this.currentAsset.stage = { width, height };
});

Given('my scene has stage with background resource', async function (this: CustomWorld) {
    // First, create an image resource
    const imagePath = ((this.page.context() as any)['testDataDir']) || 'e2e/test-data/images/test-background.png';

    const uploadResponse = await this.page.request.post('/api/resources', {
        multipart: {
            file: imagePath,
            resourceKind: '1' // Image kind
        }
    });

    expect(uploadResponse.ok()).toBeTruthy();
    const resource = await uploadResponse.json();

    this.uploadedResourceIds.push(resource.id); // Track for cleanup
    const ctx = this as any;
    ctx['testImageResourceId'] = resource.id; // Store for scenario use

    // Then configure stage with that background
    const sceneId = this.currentAsset.id;
    const backgroundResourceId = ctx['testImageResourceId'];

    const patchResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            backgroundResourceId,
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });

    expect(patchResponse.status()).toBe(204);
    this.currentAsset.stage = { backgroundResourceId };
});

Given('my scene has configured grid and {int} placed assets', async function (this: CustomWorld, assetCount: number) {
    const sceneId = this.currentAsset.id;

    // Configure grid
    await this.page.request.patch(`/api/library/scenes/${sceneId}/grid`, {
        data: {
            enabled: true,
            cellSize: 50,
            offsetX: 0,
            offsetY: 0,
            color: '#000000',
            opacity: 0.3
        }
    });

    // Place assets on scene
    for (let i = 0; i < assetCount; i++) {
        // Create test asset
        const asset = await this.assetBuilder()
            .withName(`Test Asset ${i + 1}`)
            .withKind(1 as any) // Character kind
            .build();

        // Place asset on scene
        await this.page.request.post(`/api/library/scenes/${sceneId}/assets`, {
            data: {
                assetId: asset.id,
                x: 100 + (i * 100),
                y: 100,
                rotation: 0,
                scale: 1.0
            }
        });
    }

    // Store for verification
    const ctx = this as any;
    ctx['initialGridConfig'] = { cellSize: 50, offsetX: 0, offsetY: 0 };
    ctx['placedAssetCount'] = assetCount;
});

Given('a scene exists owned by another user', async function (this: CustomWorld) {
    const differentUserId = '019639ea-c7de-7a01-8548-41edfccde999'; // Different from test user

    // Create scene owned by different user (requires admin or direct DB access)
    await this.db.insertRecord('Scenes', {
        Id: '019639ea-c7de-7a01-8548-41edfccde888',
        Name: 'Other User Scene',
        OwnerId: differentUserId,
        IsPublished: false
    });

    const ctx = this as any; ctx['otherUserSceneId'] = '019639ea-c7de-7a01-8548-41edfccde888';
});

Given('no scene exists with ID {string}', async function (this: CustomWorld, sceneId: string) {
    // Verify scene does not exist in database
    const scene = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(scene).toBeUndefined();
});

// ============================================================================
// WHEN STEPS - Stage Configuration Actions
// ============================================================================

When('I configure stage with width {int} and height {int}', async function (this: CustomWorld, width: number, height: number) {
    const sceneId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width,
            height,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: width,
            viewportHeight: height
        }
    });
});

When('I attempt to configure stage with width {int} and height {int}', async function (this: CustomWorld, width: number, height: number) {
    const sceneId = this.currentAsset.id;

    // Expect this to fail with validation error
    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width,
            height,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: Math.max(width, 100), // Provide valid viewport
            viewportHeight: Math.max(height, 100)
        }
    });
});

When('I configure stage with that background resource', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;
    const ctx = this as any;
    const backgroundResourceId = ctx['testImageResourceId'];

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            backgroundResourceId,
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });
});

When('I configure stage with:', async function (this: CustomWorld, dataTable) {
    const config = dataTable.rowsHash(); // Convert table to key-value pairs
    const sceneId = this.currentAsset.id;

    const stageData = {
        backgroundResourceId: config['Background'] !== 'null' ? config['Background'] : undefined,
        width: parseInt(config['Width'], 10),
        height: parseInt(config['Height'], 10),
        viewportX: parseInt(config['ViewportX'], 10),
        viewportY: parseInt(config['ViewportY'], 10),
        viewportWidth: parseInt(config['Width'], 10), // Match width
        viewportHeight: parseInt(config['Height'], 10) // Match height
    };

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: stageData
    });
});

When('I update stage dimensions to width {int} and height {int}', async function (this: CustomWorld, width: number, height: number) {
    const sceneId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width,
            height,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: width,
            viewportHeight: height
        }
    });
});

When('I configure stage to remove background', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            backgroundResourceId: null, // Remove background
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });
});

When('I attempt to configure stage for scene {string}', async function (this: CustomWorld, sceneId: string) {
    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });
});

When('I attempt to configure stage with non-existent background resource', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;
    const nonExistentResourceId = '019639ea-c7de-7a01-8548-41edfccde777';

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            backgroundResourceId: nonExistentResourceId,
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });
});

When('I attempt to configure stage for that scene', async function (this: CustomWorld) {
    const ctx = this as any;
    const otherSceneId = ctx['otherUserSceneId'];

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${otherSceneId}/stage`, {
        data: {
            width: 1920,
            height: 1080,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 1920,
            viewportHeight: 1080
        }
    });
});

When('I update the stage dimensions', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width: 2560,
            height: 1440,
            viewportX: 0,
            viewportY: 0,
            viewportWidth: 2560,
            viewportHeight: 1440
        }
    });
});

When('I configure viewport to X={int} and Y={int}', async function (this: CustomWorld, viewportX: number, viewportY: number) {
    const sceneId = this.currentAsset.id;
    const stage = this.currentAsset.stage;

    this.lastApiResponse = await this.page.request.patch(`/api/library/scenes/${sceneId}/stage`, {
        data: {
            width: stage.width,
            height: stage.height,
            viewportX,
            viewportY,
            viewportWidth: stage.width,
            viewportHeight: stage.height
        }
    });
});

// ============================================================================
// THEN STEPS - Verification and Assertions
// ============================================================================

Then('the stage is updated successfully', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(204); // No Content success
});

Then('the stage width should be {int}', async function (this: CustomWorld, expectedWidth: number) {
    const sceneId = this.currentAsset.id;

    // Query database to verify persistence
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(dbScene).toBeDefined();
    expect(dbScene[0].Stage).toBeDefined();

    const stageConfig = JSON.parse(dbScene[0].Stage); // Stage is stored as JSON
    expect(stageConfig.width).toBe(expectedWidth);
});

Then('the stage height should be {int}', async function (this: CustomWorld, expectedHeight: number) {
    const sceneId = this.currentAsset.id;

    // Query database to verify persistence
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    expect(dbScene).toBeDefined();
    expect(dbScene[0].Stage).toBeDefined();

    const stageConfig = JSON.parse(dbScene[0].Stage);
    expect(stageConfig.height).toBe(expectedHeight);
});

Then('the background resource should be associated', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;
    const ctx = this as any;
    const expectedResourceId = ctx['testImageResourceId'];

    // Query database
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    expect(stageConfig.backgroundResourceId).toBe(expectedResourceId);
});

Then('all stage properties should be set correctly', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    // Query database
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    // Verify all properties exist and have valid values
    expect(stageConfig.width).toBe(1920);
    expect(stageConfig.height).toBe(1080);
    expect(stageConfig.viewportX).toBe(100);
    expect(stageConfig.viewportY).toBe(50);
    expect(stageConfig.backgroundResourceId).toBeDefined();
});

Then('the new dimensions should be preserved', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    // Query database
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    expect(stageConfig.width).toBe(2560);
    expect(stageConfig.height).toBe(1440);
});

Then('the background should be null', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    // Query database
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    expect(stageConfig.backgroundResourceId).toBeNull();
});

Then('the dimensions should be preserved', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    // Query database - verify large dimensions work
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    expect(stageConfig.width).toBe(8192);
    expect(stageConfig.height).toBe(8192);
});

Then('the viewport coordinates should be set', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;

    // Query database
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const stageConfig = JSON.parse(dbScene[0].Stage);

    expect(stageConfig.viewportX).toBe(2000);
    expect(stageConfig.viewportY).toBe(1200);
});

Then('the stage is updated', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(204);
});

Then('the grid configuration should remain unchanged', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;
    const ctx = this as any;
    const initialGridConfig = ctx['initialGridConfig'];

    // Query database to verify grid unchanged
    const dbScene = await this.db.queryTable('Scenes', { Id: sceneId });
    const gridConfig = JSON.parse(dbScene[0].Grid);

    expect(gridConfig.cellSize).toBe(initialGridConfig.cellSize);
    expect(gridConfig.offsetX).toBe(initialGridConfig.offsetX);
    expect(gridConfig.offsetY).toBe(initialGridConfig.offsetY);
});

Then('all asset placements should remain intact', async function (this: CustomWorld) {
    const sceneId = this.currentAsset.id;
    const ctx = this as any;
    const expectedAssetCount = ctx['placedAssetCount'];

    // Query database for asset placements
    const placements = await this.db.queryTable('SceneAssets', { SceneId: sceneId });

    expect(placements.length).toBe(expectedAssetCount);
});

// ============================================================================
// ERROR HANDLING ASSERTIONS
// ============================================================================

Then('I should see error with validation error', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(400); // Bad Request
});

Then('I should see error with not found error', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(404); // Not Found
});

Then('I should see error with forbidden error', async function (this: CustomWorld) {
    expect(this.lastApiResponse!.status()).toBe(403); // Forbidden
});
