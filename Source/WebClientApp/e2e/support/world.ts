/**
 * Custom World - Cucumber World with Playwright Page Objects
 *
 * Provides shared state and helpers across all step definitions
 */

import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, APIResponse } from '@playwright/test';
import { AssetLibraryPage } from '../page-objects/pages/AssetLibraryPage.js';
import { AssetCreateDialog } from '../page-objects/dialogs/AssetCreateDialog.js';
import { AssetEditDialog } from '../page-objects/dialogs/AssetEditDialog.js';
import { DeleteConfirmDialog } from '../page-objects/dialogs/DeleteConfirmDialog.js';
import { AssetResourceManager } from '../page-objects/components/AssetResourceManager.js';
import { KeyboardModifierHelper } from './helpers/keyboard.helper.js';
import { DatabaseHelper } from './helpers/database.helper.js';
import { AssetBuilder } from './fixtures/AssetBuilder.js';

export interface CustomWorldOptions extends IWorldOptions {
    parameters: {
        baseUrl?: string;
        headless?: boolean;
    };
}

export class CustomWorld extends World {
    // Playwright instances
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;

    // Page Objects
    assetLibrary!: AssetLibraryPage;
    assetCreateDialog!: AssetCreateDialog;
    assetEditDialog!: AssetEditDialog;
    deleteConfirmDialog!: DeleteConfirmDialog;
    assetResourceManager!: AssetResourceManager;

    // Helpers
    keyboard!: KeyboardModifierHelper;
    db!: DatabaseHelper;

    // Fixture Builders
    assetBuilder!: () => AssetBuilder;

    // Shared Test State
    currentUser!: { id: string; email: string; name: string };
    currentAsset: any = null;
    currentSession: any = null;  // Added: Dedicated field for GameSession
    currentSceneId?: string;      // Added: For Scene Management tests
    currentAssetInstanceId?: string;  // Added: For asset placement tests
    createdAssets: any[] = [];
    createdSessions: any[] = [];  // Added: Track sessions for cleanup
    createdTestUsers: string[] = [];  // Added: Track test users created via DB for cleanup
    createdUserIds: string[] = [];  // Added: Track precondition users for cleanup (registration tests)
    uploadedResourceIds: string[] = [];
    lastApiResponse: APIResponse | null = null;

    // Configuration
    baseUrl: string;
    headless: boolean;

    constructor(options: CustomWorldOptions) {
        super(options);
        this.baseUrl = options.parameters.baseUrl || 'http://localhost:5173';
        this.headless = options.parameters.headless !== false;
    }

    /**
     * Initialize browser and page objects
     */
    async init(): Promise<void> {
        this.browser = await chromium.launch({
            headless: this.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.context = await this.browser.newContext({
            baseURL: this.baseUrl,
            viewport: { width: 1920, height: 1080 },
        });

        this.page = await this.context.newPage();

        // Initialize page objects (lazy loading)
        this.assetLibrary = new AssetLibraryPage(this.page);
        this.assetCreateDialog = new AssetCreateDialog(this.page);
        this.assetEditDialog = new AssetEditDialog(this.page);
        this.deleteConfirmDialog = new DeleteConfirmDialog(this.page);

        // Initialize helpers
        this.keyboard = new KeyboardModifierHelper(this.page);

        // Initialize AssetResourceManager with keyboard helper
        this.assetResourceManager = new AssetResourceManager(this.page, this.keyboard);

        // Initialize database helper (fail-fast if not configured)
        this.db = new DatabaseHelper(this.getRequiredEnv('DATABASE_CONNECTION_STRING'));

        // Initialize AssetBuilder factory (only if user exists - not needed for @anonymous tests)
        this.assetBuilder = () => {
            if (!this.currentUser) {
                throw new Error('AssetBuilder requires authenticated user - use @anonymous tag for guest tests');
            }
            return new AssetBuilder(this.db, this.currentUser.id);
        };
    }

    /**
     * Get required environment variable (fail-fast if missing)
     * SECURITY: Never use hard-coded fallback credentials
     */
    private getRequiredEnv(key: string): string {
        const value = process.env[key];
        if (!value) {
            throw new Error(
                `CRITICAL: Required environment variable ${key} is not set. ` +
                `Tests cannot run without proper configuration. ` +
                `Set ${key} in your environment or .env file.`
            );
        }
        return value;
    }

    /**
     * Cleanup after scenario
     */
    async cleanup(): Promise<void> {
        // Clean up test data
        if (this.createdAssets.length > 0) {
            // Separate assets from game sessions
            const assetIds = this.createdAssets
                .filter(item => item.kind !== undefined) // Assets have 'kind'
                .map(a => a.id);

            const sessionIds = this.createdAssets
                .filter(item => item.status !== undefined) // Sessions have 'status'
                .map(s => s.id);

            if (assetIds.length > 0) {
                await this.db.cleanupAssets(assetIds);
            }

            if (sessionIds.length > 0) {
                await this.db.cleanupGameSessions(sessionIds);
            }
        }

        // Close Playwright instances
        if (this.page) {
            await this.page.close();
        }
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }

        // Reset state
        this.currentAsset = null;
        this.createdAssets = [];
        this.uploadedResourceIds = [];
    }

    /**
     * Encode user ID to base64 for x-user header (matches .NET Guid.ToByteArray())
     * Made public for use in step definitions
     */
    encodeUserId(userId: string): string {
        // Convert GUID string to byte array matching .NET Guid.ToByteArray() format
        // This is critical for authorization to work correctly
        const hex = userId.replace(/-/g, '');
        const buffer = Buffer.from(hex, 'hex');
        return buffer.toString('base64');
    }
}

setWorldConstructor(CustomWorld);
