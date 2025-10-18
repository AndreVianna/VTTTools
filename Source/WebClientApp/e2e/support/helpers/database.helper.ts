/**
 * Database Helper - msnodesqlv8 Edition
 *
 * Provides database queries and verification for BDD scenarios
 * Uses msnodesqlv8 for LocalDB Named Pipes support
 *
 * SECURITY: SQL injection protection via whitelisted table names
 */

import sql from 'msnodesqlv8';

// Whitelisted table names (SECURITY: Prevents SQL injection)
// Based on actual schema from backend migrations (NO schema prefixes)
const ALLOWED_TABLES = [
    // Identity tables
    'Users',
    'UserClaims',
    'UserLogins',
    'UserRoles',
    'UserTokens',
    'Roles',
    'RoleClaims',
    // Asset tables
    'Assets',
    'AssetResources',  // Join table for Asset-Resource many-to-many
    // Library tables
    'Adventures',
    'Campaigns',
    'Epics',
    'Scenes',
    'SceneAssets',
    'SceneEffects',
    'SceneStructures',
    // Game tables
    'GameSessions',
    'Schedule',
    'Messages',
    'Events',
    'Participants',
    'Players',
    // Media tables
    'Resources',
    // Other tables
    'Effects',
    'Structures',
    'StatBlocks',
    // Password Reset & Audit tables (may or may not exist - allow for testing)
    'PasswordResetTokens',
    'PasswordResetAttempts',
    'UserSessions',
    'SentEmails',
    'AuditLogs',
    'ErrorLogs'
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];

function isDebugMode(): boolean {
    return process.env.DEBUG_MODE === 'true';
}

function debugLog(message: string): void {
    if (!isDebugMode()) return;
    console.log(`[POOL] ${message}`);
}

export class DatabaseHelper {
    constructor(private connectionString: string) {
    }

    /**
     * Execute query with promisified callback
     */
    private executeQuery(query: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            sql.query(this.connectionString, query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Query table with optional WHERE conditions
     * SECURITY: Table name must be in whitelist to prevent SQL injection
     */
    async queryTable(tableName: AllowedTable, where?: Record<string, any>): Promise<any[]> {
        // Validate table name against whitelist
        if (!ALLOWED_TABLES.includes(tableName)) {
            throw new Error(
                `SECURITY: Table '${tableName}' is not in the allowed list for testing. ` +
                `Allowed tables: ${ALLOWED_TABLES.join(', ')}`
            );
        }

        const params: any[] = [];
        const conditions = where
            ? 'WHERE ' + Object.keys(where).map(key => {
                params.push(where[key]);
                return `${key} = ?`;
            }).join(' AND ')
            : '';

        const query = `SELECT * FROM ${tableName} ${conditions}`;
        return await this.executeQuery(query, params);
    }

    /**
     * Verify asset exists with expected fields
     */
    async verifyAssetExists(assetId: string, expectedFields: Partial<any>): Promise<void> {
        const [asset] = await this.queryTable('Assets', { Id: assetId });

        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found in database`);
        }

        for (const [key, expectedValue] of Object.entries(expectedFields)) {
            if (asset[key] !== expectedValue) {
                throw new Error(
                    `Asset ${key} mismatch: expected ${expectedValue}, got ${asset[key]}`
                );
            }
        }
    }

    /**
     * Verify asset resource count
     */
    async verifyAssetResourceCount(assetId: string, expectedCount: number): Promise<void> {
        const records = await this.queryTable('Assets', { AssetId: assetId });

        if (records.length !== expectedCount) {
            throw new Error(
                `Asset resource count mismatch: expected ${expectedCount}, got ${records.length}`
            );
        }
    }

    /**
     * Verify asset resource roles
     */
    async verifyAssetResourceRoles(assetId: string, expectedRoles: number[]): Promise<void> {
        const records = await this.queryTable('Assets', { AssetId: assetId });
        const actualRoles = records.map(r => r.Role).sort();
        const sortedExpected = expectedRoles.sort();

        if (JSON.stringify(actualRoles) !== JSON.stringify(sortedExpected)) {
            throw new Error(
                `Asset resource roles mismatch: expected ${sortedExpected}, got ${actualRoles}`
            );
        }
    }

    /**
     * Insert test asset into database
     */
    async insertAsset(asset: Partial<any>): Promise<string> {
        const assetId = asset.id || this.generateGuidV7();
        const query = `
            INSERT INTO Assets
            (Id, Name, OwnerId, Kind, IsPublic, IsPublished, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            assetId,
            asset.name,
            asset.ownerId,
            asset.kind || 'Object',
            asset.isPublic || false,
            asset.isPublished || false,
            new Date(),
            new Date()
        ];

        await this.executeQuery(query, params);
        return assetId;
    }

    /**
     * Clean up test assets and their resources
     */
    async cleanupAssets(assetIds: string[]): Promise<void> {
        if (assetIds.length === 0) return;

        const placeholders = assetIds.map(() => '?').join(',');
        const query = `
            DELETE FROM AssetResources WHERE AssetId IN (${placeholders});
            DELETE FROM Assets WHERE Id IN (${placeholders});
        `;

        // assetIds repeated twice
        await this.executeQuery(query, [...assetIds, ...assetIds]);
    }

    /**
     * Close database connection (msnodesqlv8 manages connections automatically)
     */
    async close(): Promise<void> {
        // msnodesqlv8 manages connections automatically - no explicit close needed
        debugLog('Close called - msnodesqlv8 auto-manages connections');
    }

    /**
     * Insert test resource into database
     */
    async insertResource(resource: { filename: string; ownerId: string }): Promise<string> {
        const resourceId = this.generateGuidV7();
        const query = `
            INSERT INTO Resources
            (Id, Filename, OwnerId, CreatedAt)
            VALUES (?, ?, ?, ?)
        `;

        await this.executeQuery(query, [resourceId, resource.filename, resource.ownerId, new Date()]);
        return resourceId;
    }

    /**
     * Update asset properties
     */
    async updateAsset(assetId: string, updates: Partial<any>): Promise<void> {
        const setClauses: string[] = [];
        const params: any[] = [];

        if (updates.name) {
            setClauses.push('Name = ?');
            params.push(updates.name);
        }
        if (updates.description !== undefined) {
            setClauses.push('Description = ?');
            params.push(updates.description);
        }
        if (updates.objectProps) {
            setClauses.push('ObjectPropsJson = ?');
            params.push(JSON.stringify(updates.objectProps));
        }
        if (updates.creatureProps) {
            setClauses.push('CreaturePropsJson = ?');
            params.push(JSON.stringify(updates.creatureProps));
        }

        setClauses.push('UpdatedAt = ?');
        params.push(new Date());
        params.push(assetId); // WHERE Id = ?

        const query = `UPDATE Assets SET ${setClauses.join(', ')} WHERE Id = ?`;
        await this.executeQuery(query, params);
    }

    /**
     * Update asset ID (for pre-seeded test data)
     */
    async updateAssetId(oldId: string, newId: string): Promise<void> {
        const query = `
            UPDATE AssetResources SET AssetId = ? WHERE AssetId = ?;
            UPDATE Assets SET Id = ? WHERE Id = ?;
        `;

        await this.executeQuery(query, [newId, oldId, newId, oldId]);
    }

    /**
     * Insert asset resource record into AssetResources join table
     */
    async insertAssetResource(assetId: string, resourceId: string, role: number): Promise<void> {
        const query = `
            INSERT INTO AssetResources (AssetId, ResourceId, Role)
            VALUES (?, ?, ?)
        `;

        await this.executeQuery(query, [assetId, resourceId, role]);
    }

    /**
     * Delete asset resource record from AssetResources join table
     */
    async deleteAssetResource(assetId: string, resourceId: string): Promise<void> {
        const query = `DELETE FROM AssetResources WHERE AssetId = ? AND ResourceId = ?`;
        await this.executeQuery(query, [assetId, resourceId]);
    }

    /**
     * Generate GUID v7 (time-ordered UUID)
     */
    generateGuidV7(): string {
        const timestamp = Date.now();
        const hex = timestamp.toString(16).padStart(12, '0');
        const random1 = Math.random().toString(16).substring(2, 14);
        const random2 = Math.random().toString(16).substring(2, 14);

        return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-7${random1.substring(0, 3)}-${random1.substring(3, 7)}-${random1.substring(7, 12)}${random2.substring(0, 7)}`;
    }

    /**
     * Insert user into database for testing
     * Creates user with full control over initial state (confirmed/unconfirmed, locked/unlocked, etc.)
     */
    async insertUser(user: {
        email: string;
        userName: string;
        emailConfirmed: boolean;
        passwordHash: string;
        name?: string;
        displayName?: string;
    }): Promise<string> {
        const userId = this.generateGuidV7();
        const displayName = user.displayName || user.name || '';
        const query = `
            INSERT INTO Users
            (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash,
             SecurityStamp, ConcurrencyStamp, Name, DisplayName, LockoutEnabled, AccessFailedCount, TwoFactorEnabled, PhoneNumberConfirmed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            user.userName,
            user.userName.toUpperCase(),
            user.email,
            user.email.toUpperCase(),
            user.emailConfirmed,
            user.passwordHash,
            this.generateGuidV7(),
            this.generateGuidV7(),
            user.name || '',
            displayName,
            true,
            0,
            false,
            false
        ];

        await this.executeQuery(query, params);
        return userId;
    }

    /**
     * Insert password reset token
     */
    async insertPasswordResetToken(token: {
        userId: string;
        token: string;
        expiresAt: Date;
        createdAt?: Date;
    }): Promise<void> {
        const query = `
            INSERT INTO PasswordResetTokens
            (UserId, Token, ExpiresAt, CreatedAt, Used, Invalidated)
            VALUES (?, ?, ?, ?, 0, 0)
        `;

        await this.executeQuery(query, [token.userId, token.token, token.expiresAt, token.createdAt || new Date()]);
    }

    /**
     * Insert password reset attempt for rate limiting
     */
    async insertPasswordResetAttempt(attempt: {
        email: string;
        attemptedAt: Date;
    }): Promise<void> {
        const query = `
            INSERT INTO PasswordResetAttempts
            (Email, AttemptedAt)
            VALUES (?, ?)
        `;

        await this.executeQuery(query, [attempt.email, attempt.attemptedAt]);
    }

    /**
     * Insert user session
     */
    async insertUserSession(session: {
        userId: string;
        deviceInfo: string;
        createdAt: Date;
    }): Promise<void> {
        const query = `
            INSERT INTO UserSessions
            (UserId, DeviceInfo, CreatedAt, IsActive)
            VALUES (?, ?, ?, 1)
        `;

        await this.executeQuery(query, [session.userId, session.deviceInfo, session.createdAt]);
    }

    /**
     * Update record in any allowed table
     */
    async updateRecord(tableName: AllowedTable, id: string, updates: Record<string, any>): Promise<void> {
        if (!ALLOWED_TABLES.includes(tableName)) {
            throw new Error(`SECURITY: Table '${tableName}' is not in the allowed list for testing.`);
        }

        const setClauses: string[] = [];
        const params: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
            setClauses.push(`${key} = ?`);
            params.push(value);
        }

        params.push(id); // WHERE Id = ?
        const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE Id = ?`;

        await this.executeQuery(query, params);
    }

    /**
     * Insert test record into any allowed table (generic)
     */
    async insertRecord(tableName: AllowedTable, record: Record<string, any>): Promise<void> {
        if (!ALLOWED_TABLES.includes(tableName)) {
            throw new Error(`SECURITY: Table '${tableName}' is not in the allowed list for testing.`);
        }

        const columns = Object.keys(record);
        const placeholders = columns.map(() => '?').join(', ');
        const params = Object.values(record);

        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await this.executeQuery(query, params);
    }

    /**
     * Clean up test scenes and related data
     */
    async cleanupScenes(sceneIds: string[]): Promise<void> {
        if (sceneIds.length === 0) return;

        const placeholders = sceneIds.map(() => '?').join(',');
        const query = `
            DELETE FROM SceneAssets WHERE SceneId IN (${placeholders});
            DELETE FROM SceneEffects WHERE SceneId IN (${placeholders});
            DELETE FROM SceneStructures WHERE SceneId IN (${placeholders});
            DELETE FROM Scenes WHERE Id IN (${placeholders});
        `;

        // sceneIds repeated 4 times (once for each DELETE)
        await this.executeQuery(query, [...sceneIds, ...sceneIds, ...sceneIds, ...sceneIds]);
    }

    /**
     * Verify scene stage configuration in database
     */
    async verifySceneStage(sceneId: string, expectedStage: Partial<any>): Promise<void> {
        const [scene] = await this.queryTable('Scenes', { Id: sceneId });

        if (!scene) {
            throw new Error(`Scene with ID ${sceneId} not found in database`);
        }

        if (!scene.Stage) {
            throw new Error(`Scene ${sceneId} has no stage configuration`);
        }

        const stageConfig = JSON.parse(scene.Stage);

        for (const [key, expectedValue] of Object.entries(expectedStage)) {
            if (stageConfig[key] !== expectedValue) {
                throw new Error(
                    `Stage ${key} mismatch: expected ${expectedValue}, got ${stageConfig[key]}`
                );
            }
        }
    }

    /**
     * Verify scene grid configuration in database
     */
    async verifySceneGrid(sceneId: string, expectedGrid: Partial<any>): Promise<void> {
        const [scene] = await this.queryTable('Scenes', { Id: sceneId });

        if (!scene) {
            throw new Error(`Scene with ID ${sceneId} not found in database`);
        }

        if (!scene.Grid) {
            throw new Error(`Scene ${sceneId} has no grid configuration`);
        }

        const gridConfig = JSON.parse(scene.Grid);

        for (const [key, expectedValue] of Object.entries(expectedGrid)) {
            if (gridConfig[key] !== expectedValue) {
                throw new Error(
                    `Grid ${key} mismatch: expected ${expectedValue}, got ${gridConfig[key]}`
                );
            }
        }
    }

    /**
     * Verify asset placement count on scene
     */
    async verifySceneAssetPlacementCount(sceneId: string, expectedCount: number): Promise<void> {
        const placements = await this.queryTable('SceneAssets', { SceneId: sceneId });

        if (placements.length !== expectedCount) {
            throw new Error(
                `Scene asset placement count mismatch: expected ${expectedCount}, got ${placements.length}`
            );
        }
    }

    /**
     * Insert scene into database
     */
    async insertScene(scene: {
        name: string;
        ownerId: string;
        adventureId: string;
        gridType: string;
        gridSize: number;
        width: number;
        height: number;
    }): Promise<string> {
        const sceneId = this.generateGuidV7();
        const query = `
            INSERT INTO Scenes
            (Id, Name, OwnerId, AdventureId, GridType, GridSize, Width, Height, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            sceneId,
            scene.name,
            scene.ownerId,
            scene.adventureId,
            scene.gridType,
            scene.gridSize,
            scene.width,
            scene.height,
            new Date(),
            new Date()
        ];

        await this.executeQuery(query, params);
        return sceneId;
    }

    /**
     * Insert adventure into database
     */
    async insertAdventure(adventure: {
        name: string;
        ownerId: string;
        type: string;
    }): Promise<string> {
        const adventureId = this.generateGuidV7();
        const query = `
            INSERT INTO Adventures
            (Id, Name, OwnerId, Type, Description, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            adventureId,
            adventure.name,
            adventure.ownerId,
            adventure.type,
            '',
            new Date(),
            new Date()
        ];

        await this.executeQuery(query, params);
        return adventureId;
    }

    /**
     * Insert scene asset (placed asset) into database
     */
    async insertSceneAsset(sceneAsset: {
        sceneId: string;
        assetId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        layer: number;
    }): Promise<string> {
        const sceneAssetId = this.generateGuidV7();
        const query = `
            INSERT INTO SceneAssets
            (Id, SceneId, AssetId, X, Y, Width, Height, Rotation, Layer, Visible, Locked, ScaleX, ScaleY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1.0, 1.0)
        `;

        const params = [
            sceneAssetId,
            sceneAsset.sceneId,
            sceneAsset.assetId,
            sceneAsset.x,
            sceneAsset.y,
            sceneAsset.width,
            sceneAsset.height,
            sceneAsset.rotation,
            sceneAsset.layer
        ];

        await this.executeQuery(query, params);
        return sceneAssetId;
    }

    /**
     * Insert game session into database
     */
    async insertGameSession(session: {
        title: string;
        ownerId: string;
        status?: string;
        sceneId?: string | null;
    }): Promise<string> {
        const sessionId = this.generateGuidV7();
        const players = JSON.stringify([
            { userId: session.ownerId, role: 'Master' }
        ]);

        const query = `
            INSERT INTO GameSessions
            (Id, OwnerId, Title, Status, SceneId, Players, Messages, Events, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            sessionId,
            session.ownerId,
            session.title,
            session.status || 'Draft',
            session.sceneId || null,
            players,
            '[]',
            '[]',
            new Date()
        ];

        await this.executeQuery(query, params);
        return sessionId;
    }

    /**
     * Update game session status
     */
    async updateGameSessionStatus(sessionId: string, status: string): Promise<void> {
        const query = `
            UPDATE GameSessions
            SET Status = ?, UpdatedAt = ?
            WHERE Id = ?
        `;

        await this.executeQuery(query, [status, new Date(), sessionId]);
    }

    /**
     * Verify game session exists with expected fields
     */
    async verifyGameSessionExists(sessionId: string, expectedFields: Partial<any>): Promise<void> {
        const [session] = await this.queryTable('GameSessions', { Id: sessionId });

        if (!session) {
            throw new Error(`Game session with ID ${sessionId} not found in database`);
        }

        for (const [key, expectedValue] of Object.entries(expectedFields)) {
            if (session[key] !== expectedValue) {
                throw new Error(
                    `GameSession ${key} mismatch: expected ${expectedValue}, got ${session[key]}`
                );
            }
        }
    }

    /**
     * Clean up test game sessions
     */
    async cleanupGameSessions(sessionIds: string[]): Promise<void> {
        if (sessionIds.length === 0) return;

        const placeholders = sessionIds.map(() => '?').join(',');
        const query = `DELETE FROM GameSessions WHERE Id IN (${placeholders})`;

        await this.executeQuery(query, sessionIds);
    }

    /**
     * Verify game session participant exists
     */
    async verifyGameSessionParticipant(
        sessionId: string,
        userId: string,
        expectedRole: string
    ): Promise<void> {
        const [session] = await this.queryTable('GameSessions', { Id: sessionId });

        if (!session) {
            throw new Error(`Game session with ID ${sessionId} not found`);
        }

        const players = JSON.parse(session.Players || '[]');
        const participant = players.find((p: any) => p.userId === userId);

        if (!participant) {
            throw new Error(`Participant with userId ${userId} not found in session ${sessionId}`);
        }

        if (participant.role !== expectedRole) {
            throw new Error(
                `Participant role mismatch: expected ${expectedRole}, got ${participant.role}`
            );
        }
    }

    /**
     * Find all BDD test users (pattern: bdd-test-user-%)
     */
    async findAllTestUsers(): Promise<any[]> {
        const query = `SELECT * FROM Users WHERE Email LIKE 'bdd-test-user-%@test.local'`;
        return await this.executeQuery(query, []);
    }

    /**
     * Delete user and ALL their data (cascade cleanup)
     * Based on actual schema (AssetResources is a separate join table)
     */
    async deleteUserDataOnly(userId: string): Promise<void> {
        const query = `
            DELETE FROM AssetResources WHERE AssetId IN (SELECT Id FROM Assets WHERE OwnerId = ?);
            DELETE FROM SceneAssets WHERE SceneId IN (SELECT Id FROM Scenes WHERE OwnerId = ?);
            DELETE FROM SceneEffects WHERE SceneId IN (SELECT Id FROM Scenes WHERE OwnerId = ?);
            DELETE FROM SceneStructures WHERE SceneId IN (SELECT Id FROM Scenes WHERE OwnerId = ?);
            DELETE FROM Assets WHERE OwnerId = ?;
            DELETE FROM Scenes WHERE OwnerId = ?;
            DELETE FROM Adventures WHERE OwnerId = ?;
            DELETE FROM Campaigns WHERE OwnerId = ?;
            DELETE FROM Epics WHERE OwnerId = ?;
            DELETE FROM Structures WHERE OwnerId = ?;
            DELETE FROM Effects WHERE OwnerId = ?;
            DELETE FROM GameSessions WHERE OwnerId = ?;
            DELETE FROM Schedule WHERE OwnerId = ?;
        `;

        const params = Array(13).fill(userId);
        await this.executeQuery(query, params);
    }

    async deleteUser(userId: string): Promise<void> {
        await this.deleteUserDataOnly(userId);
        await this.executeQuery('DELETE FROM Users WHERE Id = ?', [userId]);
    }

    /**
     * Cleanup all BDD test users
     */
    async cleanupAllTestUsers(): Promise<void> {
        debugLog('Cleaning up orphaned test users from previous runs...');

        const testUsers = await this.findAllTestUsers();
        debugLog(`Found ${testUsers.length} test users to cleanup`);
        for (const user of testUsers) {
            debugLog(`Deleting user ${user.Email} (ID: ${user.Id})`);
            await this.deleteUser(user.Id);
        }
        debugLog('Cleaning finished.');
    }
}
