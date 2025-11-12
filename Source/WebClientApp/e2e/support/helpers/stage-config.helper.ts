/**
 * Stage Configuration Helper Functions
 * Reusable utilities for stage configuration BDD tests
 *
 * SECURITY: No hard-coded credentials, uses environment configuration
 * PATTERN: Pure functions accepting World as parameter
 */

import { type APIResponse, expect, type Page } from '@playwright/test';
import type { CustomWorld } from '../world.js';

/**
 * Stage configuration data interface matching backend Stage value object
 */
export interface StageConfigData {
  backgroundResourceId?: string | null;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  width: number;
  height: number;
}

/**
 * Default stage configuration for test scenarios
 */
export const DEFAULT_STAGE_CONFIG: StageConfigData = {
  width: 1920,
  height: 1080,
  viewportX: 0,
  viewportY: 0,
  viewportWidth: 1920,
  viewportHeight: 1080,
  backgroundResourceId: null,
};

/**
 * Configure encounter stage via API (black-box testing)
 *
 * @param world - Cucumber World with page and context
 * @param encounterId - Encounter ID to configure
 * @param config - Stage configuration data
 * @returns API response for verification
 */
export async function configureStage(
  world: CustomWorld,
  encounterId: string,
  config: Partial<StageConfigData>,
): Promise<APIResponse> {
  const fullConfig = { ...DEFAULT_STAGE_CONFIG, ...config };

  const response = await world.page.request.patch(`/api/library/encounters/${encounterId}/stage`, {
    data: fullConfig,
  });

  return response;
}

/**
 * Verify stage configuration in database (persistence check)
 *
 * @param world - Cucumber World with database helper
 * @param encounterId - Encounter ID to verify
 * @param expectedConfig - Expected stage configuration
 */
export async function verifyStageInDatabase(
  world: CustomWorld,
  encounterId: string,
  expectedConfig: Partial<StageConfigData>,
): Promise<void> {
  // Query database
  const dbEncounter = await world.db.queryTable('Library.Encounters', {
    Id: encounterId,
  });
  expect(dbEncounter).toBeDefined();
  expect(dbEncounter[0].Stage).toBeDefined();

  // Parse JSON stage configuration
  const stageConfig: StageConfigData = JSON.parse(dbEncounter[0].Stage);

  // Verify expected properties
  if (expectedConfig.width !== undefined) {
    expect(stageConfig.width).toBe(expectedConfig.width);
  }
  if (expectedConfig.height !== undefined) {
    expect(stageConfig.height).toBe(expectedConfig.height);
  }
  if (expectedConfig.viewportX !== undefined) {
    expect(stageConfig.viewportX).toBe(expectedConfig.viewportX);
  }
  if (expectedConfig.viewportY !== undefined) {
    expect(stageConfig.viewportY).toBe(expectedConfig.viewportY);
  }
  if (expectedConfig.viewportWidth !== undefined) {
    expect(stageConfig.viewportWidth).toBe(expectedConfig.viewportWidth);
  }
  if (expectedConfig.viewportHeight !== undefined) {
    expect(stageConfig.viewportHeight).toBe(expectedConfig.viewportHeight);
  }
  if ('backgroundResourceId' in expectedConfig) {
    expect(stageConfig.backgroundResourceId).toBe(expectedConfig.backgroundResourceId);
  }
}

/**
 * Render StageConfigPanel in UI test (Phase 3+ UI testing)
 *
 * @param page - Playwright Page
 * @param encounterId - Encounter ID to configure
 */
export async function openStageConfigPanel(page: Page, encounterId: string): Promise<void> {
  // Navigate to encounter editor
  await page.goto(`/library/encounters/${encounterId}`);

  // Click "Configure Stage" button (assumes UI exists)
  await page.click('button:has-text("Configure Stage")');

  // Wait for panel to be visible
  await page.waitForSelector('[data-testid="stage-config-panel"]', {
    state: 'visible',
  });
}

/**
 * Fill stage configuration form in UI
 *
 * @param page - Playwright Page
 * @param config - Stage configuration to fill
 */
export async function fillStageConfigForm(page: Page, config: Partial<StageConfigData>): Promise<void> {
  if (config.width !== undefined) {
    await page.fill('input[name="width"]', config.width.toString());
  }
  if (config.height !== undefined) {
    await page.fill('input[name="height"]', config.height.toString());
  }
  if (config.viewportX !== undefined) {
    await page.fill('input[name="viewportX"]', config.viewportX.toString());
  }
  if (config.viewportY !== undefined) {
    await page.fill('input[name="viewportY"]', config.viewportY.toString());
  }
  if (config.viewportWidth !== undefined) {
    await page.fill('input[name="viewportWidth"]', config.viewportWidth.toString());
  }
  if (config.viewportHeight !== undefined) {
    await page.fill('input[name="viewportHeight"]', config.viewportHeight.toString());
  }
  if ('backgroundResourceId' in config && config.backgroundResourceId) {
    await page.fill('input[name="backgroundResourceId"]', config.backgroundResourceId);
  }
}

/**
 * Save stage configuration from UI form
 *
 * @param page - Playwright Page
 */
export async function saveStageConfigForm(page: Page): Promise<void> {
  await page.click('button:has-text("Save Stage")');

  // Wait for API response
  await page.waitForResponse((response) => response.url().includes('/stage') && response.status() === 204);
}

/**
 * Verify stage configuration displays correct validation errors
 *
 * @param page - Playwright Page
 * @param expectedErrors - Array of expected error messages
 */
export async function verifyStageValidationErrors(page: Page, expectedErrors: string[]): Promise<void> {
  for (const errorText of expectedErrors) {
    const errorElement = page.locator(`text=${errorText}`);
    await expect(errorElement).toBeVisible();
  }
}

/**
 * Create test encounter with stage configuration for testing
 *
 * @param world - Cucumber World
 * @param stageConfig - Initial stage configuration
 * @returns Created encounter object
 */
export async function createTestEncounterWithStage(
  world: CustomWorld,
  stageConfig?: Partial<StageConfigData>,
): Promise<any> {
  // Create encounter
  const createResponse = await world.page.request.post('/api/library/encounters', {
    data: {
      name: 'Test Encounter with Stage',
      description: 'Test encounter for stage configuration',
      isPublished: false,
    },
  });

  expect(createResponse.ok()).toBeTruthy();
  const encounter = await createResponse.json();

  // Configure stage if provided
  if (stageConfig) {
    const configResponse = await configureStage(world, encounter.id, stageConfig);
    expect(configResponse.status()).toBe(204);
  }

  // Track for cleanup
  world.createdAssets.push(encounter);

  return encounter;
}

/**
 * Verify stage dimensions are positive (INV-09)
 *
 * @param config - Stage configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateStageDimensions(config: StageConfigData): string[] {
  const errors: string[] = [];

  if (config.width <= 0) {
    errors.push('Stage width must be positive (INV-09)');
  }
  if (config.height <= 0) {
    errors.push('Stage height must be positive (INV-09)');
  }
  if (config.viewportWidth <= 0) {
    errors.push('Viewport width must be positive');
  }
  if (config.viewportHeight <= 0) {
    errors.push('Viewport height must be positive');
  }

  return errors;
}

/**
 * Parse stage configuration from database JSON
 *
 * @param stageJson - JSON string from database
 * @returns Parsed stage configuration
 */
export function parseStageConfig(stageJson: string): StageConfigData {
  try {
    return JSON.parse(stageJson) as StageConfigData;
  } catch (error) {
    throw new Error(`Failed to parse stage configuration: ${error}`);
  }
}

/**
 * Compare two stage configurations for equality
 *
 * @param config1 - First configuration
 * @param config2 - Second configuration
 * @returns True if configurations match
 */
export function stageConfigsEqual(config1: StageConfigData, config2: StageConfigData): boolean {
  return (
    config1.width === config2.width &&
    config1.height === config2.height &&
    config1.viewportX === config2.viewportX &&
    config1.viewportY === config2.viewportY &&
    config1.viewportWidth === config2.viewportWidth &&
    config1.viewportHeight === config2.viewportHeight &&
    config1.backgroundResourceId === config2.backgroundResourceId
  );
}
