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
    if (isDebugMode()) {
        console.log(message);
    }
}

/**
 * Acquire user from pool (thread-safe)
 */
function acquireUser(testName: string): TestUser {
    // Find first free user
    const freeUser = userPool.find(u => !u.inUse);

    if (!freeUser) {
        throw new Error(`[POOL] No free users available (pool size: ${userPool.length})`);
    }

    // Mark as in-use
    freeUser.inUse = true;
    freeUser.currentTest = testName;

    debugLog(`[POOL] User acquired: ${freeUser.email} for test: ${testName}`);
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
        debugLog(`[POOL] User released: ${user.email}`);
    }
}

/**
 * Before Scenario Hook
 * Acquire user from pool and initialize browser (skip user for @anonymous scenarios)
 */
Before(async function (this: CustomWorld, testCase) {
    debugLog(`[BEFORE HOOK] Starting init for: ${testCase.pickle.name}`);

    // Check if scenario is @anonymous (no user needed)
    const isAnonymous = testCase.pickle.tags.some(tag => tag.name === '@anonymous');

    if (isAnonymous) {
        debugLog('[BEFORE] Anonymous scenario - skipping user acquisition');
        // Initialize without user (currentUser will be undefined for anonymous tests)
        await this.init();
        debugLog(`[SCENARIO START] ${testCase.pickle.name}`);
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
    debugLog(`[SCENARIO START] ${testCase.pickle.name}`);
});

/**
 * After Scenario Hook
 * Cleanup test data and release user back to pool
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

        console.error(`[SCENARIO FAILED] ${testCase.pickle.name}`);
        console.error(`Error: ${testCase.result.message}`);
    } else {
        debugLog(`[SCENARIO ${testCase.result?.status}] ${testCase.pickle.name}`);
    }

    // Cleanup user's data (keep user for reuse)
    // Skip cleanup for @anonymous scenarios (no user assigned)
    try {
        if (this.currentUser && this.db) {
            debugLog(`[POOL] Cleaning up data for user: ${this.currentUser.email}`);
            await this.db.deleteUserAndAllData(this.currentUser.id);

            // Note: We DON'T delete the user, just their data
            // Re-insert the user for next test
            const poolUser = userPool.find(u => u.id === this.currentUser.id);
            if (poolUser) {
                // User still exists, just cleaned their data
                // (User deletion happens in AfterAll only)
            }
        }
    } catch (cleanupError) {
        console.error('Data cleanup error:', cleanupError);
    }

    // Cleanup browser
    try {
        await this.cleanup();
    } catch (cleanupError) {
        console.error('Browser cleanup error:', cleanupError);
    }

    // Release user back to pool (skip for @anonymous)
    if (this.currentUser) {
        releaseUser(this.currentUser.id);
    }
});

/**
 * Before All Hook
 * Initialize test user pool
 */
BeforeAll({ timeout: 60000 }, async function () {
    console.log('='.repeat(80));
    console.log('Starting BDD Test Suite - VTTTools Asset Management Phase 5');
    console.log('Framework: Cucumber.js + Playwright + TypeScript');
    console.log('='.repeat(80));

    // Only initialize pool once (BeforeAll runs per worker in parallel mode)
    if (poolInitialized) {
        debugLog('[POOL] Already initialized by another worker');
        return;
    }

    // Note: User pool is created for all test runs
    // Individual scenarios with @anonymous tag skip user acquisition in Before hook
    const poolSize = parseInt(process.env.PARALLEL_WORKERS || '1');
    const password = process.env.BDD_TEST_PASSWORD;

    if (!password) {
        throw new Error('CRITICAL: BDD_TEST_PASSWORD environment variable is not set. Check your .env file.');
    }

    debugLog(`[POOL] Initializing test user pool (size: ${poolSize})`);

    // Connect to database for cleanup
    const db = new DatabaseHelper(process.env.DATABASE_CONNECTION_STRING!);

    // Step 1: Cleanup orphaned test users from crashed runs
    debugLog('[POOL] Cleaning up orphaned test users from previous runs...');
    await db.cleanupAllTestUsers();

    debugLog('[POOL] Cleaning finished.');
    // Step 2: Create test user pool via backend API (not UI)
    // This is test infrastructure setup - registration page has its own tests
    const apiBaseUrl = process.env.VITE_API_URL || 'http://localhost:5173/api';

    for (let i = 1; i <= poolSize; i++) {
        const email = `bdd-test-user-${i}@test.local`;
        const displayName = `BDD Test User ${i}`;

        debugLog(`[POOL] Creating user ${i}/${poolSize}: ${email}`);

        // Call backend registration API directly
        // Note: userName is same as email in this application
        const response = await fetch(`${apiBaseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                userName: email,  // userName = email
                displayName,
                password
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            debugLog(`[POOL] Registration failed: ${response.status} - ${errorBody}`);
            throw new Error(`Failed to create test user ${email}: ${response.status}`);
        }

        const result = await response.json();
        debugLog(`[POOL] User created: ${result.user.id}`);

        userPool.push({
            id: result.user.id,
            email,
            username: email,  // username = email
            password,
            inUse: false,
            currentTest: null
        });
    }

    poolInitialized = true;
    debugLog(`[POOL] User pool initialized with ${userPool.length} users`);
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
        debugLog(`[POOL] Cleaning up ${userPool.length} test users...`);
        const db = new DatabaseHelper(process.env.DATABASE_CONNECTION_STRING!);
        await db.cleanupAllTestUsers();
        debugLog('[POOL] User pool cleaned up');
    }
});
