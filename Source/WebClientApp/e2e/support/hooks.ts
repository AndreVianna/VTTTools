/**
 * Cucumber Hooks - Setup and Teardown
 *
 * Executes before/after each scenario
 * Manages test user pool for parallel execution
 */

import { Before, After, Status, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world.js';
import { DatabaseHelper } from './helpers/database.helper.js';

// User Pool Management
interface TestUser {
    id: string;
    email: string;
    username: string;
    password: string;
    inUse: boolean;
    currentTest: string | null;
}

const userPool: TestUser[] = [];
let poolInitialized = false;

function isDebugMode(): boolean {
    return process.env.DEBUG_MODE === 'true';
}

function debugLog(message: string): void {
    if (!isDebugMode()) return;
    console.log(`[POOL] ${message}`);
}

/**
 * Acquire user from pool (thread-safe)
 */
function acquireUser(testName: string): TestUser {
    // Find first free user
    const freeUser = userPool.find(u => !u.inUse);

    if (!freeUser) {
        throw new Error(`No free users available (pool size: ${userPool.length})`);
    }

    // Mark as in-use
    freeUser.inUse = true;
    freeUser.currentTest = testName;

    debugLog(`User acquired: ${freeUser.email} for test: ${testName}`);
    return freeUser;
}

/**
 * Release user back to pool
 */
function releaseUser(userId: string): void {
    const user = userPool.find(u => u.id === userId);
    if (user) {
        user.inUse = false;
        user.currentTest = null;
        debugLog(`User released: ${user.email}`);
    }
}


/**
 * Before All Hook
 */
BeforeAll({ timeout: 60000 }, async function () {
    console.log('='.repeat(120));
    console.log('Starting BDD Test Suite - VTTTools');
    console.log('Framework: Cucumber.js + Playwright + TypeScript');
    console.log('='.repeat(120));

    if (poolInitialized) {
        debugLog('Already initialized by another worker');
        return;
    }

    const poolSize = parseInt(process.env.PARALLEL_WORKERS || '1');
    const password = process.env.BDD_TEST_PASSWORD;
    if (!password) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set. Check your .env file.');
    }
    const passwordHash = process.env.BDD_TEST_PASSWORD_HASH
    if (!passwordHash) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD_HASH environment variable is not set. Check your .env file.');
    }

    debugLog(`Initializing test user pool (size: ${poolSize})`);
    const db = new DatabaseHelper(process.env.DATABASE_CONNECTION_STRING!);
    await db.cleanupAllTestUsers();

    for (let i = 1; i <= poolSize; i++) {
        const email = `bdd-test-user-${i}@test.local`;
        const displayName = `BDD Test User ${i}`;

        debugLog(`Creating user ${i}/${poolSize}: ${email}`);

        const userId = await db.insertUser({
            email,
            userName: email,
            emailConfirmed: true,
            passwordHash,
            displayName
        });

        debugLog(`User created in DB: ${userId}`);

        userPool.push({
            id: userId,
            email,
            username: email,
            password,
            inUse: false,
            currentTest: null
        });
    }

    poolInitialized = true;
    debugLog(`User pool initialized with ${userPool.length} users`);
});

/**
 * After All Hook
 * Cleanup test user pool
 */
AfterAll({ timeout: 30000 }, async function () {
    console.log('='.repeat(80));
    console.log('BDD Test Suite Complete');
    console.log('='.repeat(80));

    if (userPool.length > 0) {
        debugLog(`Cleaning up ${userPool.length} test users...`);
        const db = new DatabaseHelper(process.env.DATABASE_CONNECTION_STRING!);
        await db.cleanupAllTestUsers();
        debugLog('User pool cleaned up');
    }
});

/**
 * Before Scenario Hook
 * Acquire user from pool and initialize browser (skip user for @anonymous scenarios)
 */
Before({ timeout: 30000 }, async function (this: CustomWorld, testCase) {
    debugLog(`Starting init for: ${testCase.pickle.name}`);

    // Check if scenario is @anonymous (no user needed)
    const isAnonymous = testCase.pickle.tags.some(tag => tag.name === '@anonymous');

    if (isAnonymous) {
        debugLog('Anonymous scenario - skipping user acquisition');
        // Initialize without user (currentUser will be undefined for anonymous tests)
        await this.init();

        // Clear any custom route flags from previous scenarios
        (this as any)._customRouteSet = false;

        debugLog(`Scenario started: ${testCase.pickle.name}`);
        return;
    }

    // Acquire user from pool for authenticated scenarios
    const poolUser = acquireUser(testCase.pickle.name);

    // Override currentUser with pool user
    this.currentUser = {
        id: poolUser.id,
        email: poolUser.email,
        name: poolUser.username
    };

    await this.init();

    // Clear any custom route flags from previous scenarios
    (this as any)._customRouteSet = false;

    debugLog(`Scenario started: ${testCase.pickle.name}`);
});

/**
 * After Scenario Hook
 */
After(async function (this: CustomWorld, testCase) {
    if (testCase.result?.status === Status.FAILED) {
        // Take screenshot on failure (if page exists)
        if (this.page) {
            try {
                const screenshot = await this.page.screenshot({ fullPage: true });
                this.attach(screenshot, 'image/png');

                // Attach page HTML for debugging
                const html = await this.page.content();
                this.attach(html, 'text/html');
            } catch (screenshotError) {
                console.error('Failed to capture screenshot:', screenshotError);
            }
        }

        console.error(`Scenario failed: ${testCase.pickle.name}`);
        console.error(`Error: ${testCase.result.message}`);
    } else {
        debugLog(`Scenario ${testCase.result?.status}: ${testCase.pickle.name}`);
    }

    try {
        if (this.currentUser && this.db) {
            debugLog(`Cleaning up data for user: ${this.currentUser.email}`);
            await this.db.deleteUserDataOnly(this.currentUser.id);

            // Reset user state to defaults (for reuse in next scenario)
            debugLog(`Resetting user state for: ${this.currentUser.email}`);
            await this.db.updateRecord('Users', this.currentUser.id, {
                TwoFactorEnabled: false,
                LockoutEnd: null,
                LockoutEnabled: true,  // Keep lockout enabled (default ASP.NET Identity setting)
                AccessFailedCount: 0,
                EmailConfirmed: true  // Reset to confirmed (default for pool users)
            });
        }

        // Cleanup test users created during scenario (via createTestUser helper)
        if (this.createdTestUsers && this.createdTestUsers.length > 0) {
            debugLog(`Cleaning up ${this.createdTestUsers.length} test users created during scenario`);
            for (const userId of this.createdTestUsers) {
                await this.db.deleteUser(userId);
            }
            this.createdTestUsers = [];
        }

        // Cleanup precondition users created in registration tests
        if (this.createdUserIds && this.createdUserIds.length > 0) {
            debugLog(`Cleaning up ${this.createdUserIds.length} precondition users`);
            for (const userId of this.createdUserIds) {
                await this.db.deleteUser(userId);
            }
            this.createdUserIds = [];
        }
    } catch (cleanupError) {
        console.error('Data cleanup error:', cleanupError);
    }

    try {
        await this.cleanup();
    } catch (cleanupError) {
        console.error('Browser cleanup error:', cleanupError);
    }

    if (this.currentUser) {
        releaseUser(this.currentUser.id);
    }
});
