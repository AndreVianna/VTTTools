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
    // Library tables
    'Adventures',
    'Campaigns',
    'Epics',
    'Encounters',
    'EncounterAssets',
    'EncounterEffects',
    'EncounterStructures',
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
    console.log(`[DEBUG] ${message}`);
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
     * Verify asset token count (NEW SCHEMA)
     */
    async verifyAssetTokenCount(assetId: string, expectedCount: number): Promise<void> {
        const [asset] = await this.queryTable('Assets', { Id: assetId });

        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found in database`);
        }

        const tokens = asset.Tokens ? JSON.parse(asset.Tokens) : [];

        if (tokens.length !== expectedCount) {
            throw new Error(
                `Asset token count mismatch: expected ${expectedCount}, got ${tokens.length}`
            );
        }
    }

    /**
     * Verify asset has default token (NEW SCHEMA)
     */
    async verifyAssetHasDefaultToken(assetId: string): Promise<void> {
        const [asset] = await this.queryTable('Assets', { Id: assetId });

        if (!asset) {
            throw new Error(`Asset with ID ${assetId} not found in database`);
        }

        const tokens = asset.Tokens ? JSON.parse(asset.Tokens) : [];
        const hasDefault = tokens.some((t: any) => t.isDefault === true);

        if (!hasDefault) {
            throw new Error(`Asset ${assetId} has no default token`);
        }
    }

    /**
     * Insert test asset into database (NEW SCHEMA)
     */
    async insertAsset(asset: Partial<any>): Promise<string> {
        const assetId = asset.id || this.generateGuidV7();
        const query = `
            INSERT INTO Assets
            (Id, Name, Description, OwnerId, Kind, IsPublic, IsPublished, Tokens, Portrait, Size, ObjectData, CreatureData, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const tokens = asset.tokens || [];
        const portrait = asset.portrait || null;
        const size = asset.size || { width: 1, height: 1, isSquare: true };

        const objectData = asset.kind === 'Object' ? asset.properties : null;
        const creatureData = asset.kind === 'Creature' ? asset.properties : null;

        const params = [
            assetId,
            asset.name,
            asset.description || '',
            asset.ownerId,
            asset.kind || 'Object',
            asset.isPublic || false,
            asset.isPublished || false,
            JSON.stringify(tokens),
            portrait ? JSON.stringify(portrait) : null,
            JSON.stringify(size),
            objectData ? JSON.stringify(objectData) : null,
            creatureData ? JSON.stringify(creatureData) : null,
            new Date(),
            new Date()
        ];

        await this.executeQuery(query, params);
        return assetId;
    }

    /**
     * Clean up test assets (NEW SCHEMA - no AssetResources join table)
     */
    async cleanupAssets(assetIds: string[]): Promise<void> {
        if (assetIds.length === 0) return;

        const placeholders = assetIds.map(() => '?').join(',');
        const query = `DELETE FROM Assets WHERE Id IN (${placeholders})`;

        await this.executeQuery(query, assetIds);
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
     * Update asset properties (NEW SCHEMA)
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
        if (updates.tokens) {
            setClauses.push('Tokens = ?');
            params.push(JSON.stringify(updates.tokens));
        }
        if (updates.portrait !== undefined) {
            setClauses.push('Portrait = ?');
            params.push(updates.portrait ? JSON.stringify(updates.portrait) : null);
        }
        if (updates.size) {
            setClauses.push('Size = ?');
            params.push(JSON.stringify(updates.size));
        }
        if (updates.objectData) {
            setClauses.push('ObjectData = ?');
            params.push(JSON.stringify(updates.objectData));
        }
        if (updates.creatureData) {
            setClauses.push('CreatureData = ?');
            params.push(JSON.stringify(updates.creatureData));
        }

        setClauses.push('UpdatedAt = ?');
        params.push(new Date());
        params.push(assetId);

        const query = `UPDATE Assets SET ${setClauses.join(', ')} WHERE Id = ?`;
        await this.executeQuery(query, params);
    }

    /**
     * Update asset ID (for pre-seeded test data) - NEW SCHEMA
     */
    async updateAssetId(oldId: string, newId: string): Promise<void> {
        const query = `UPDATE Assets SET Id = ? WHERE Id = ?`;
        await this.executeQuery(query, [newId, oldId]);
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
     * Clean up test encounters and related data
     */
    async cleanupEncounters(encounterIds: string[]): Promise<void> {
        if (encounterIds.length === 0) return;

        const placeholders = encounterIds.map(() => '?').join(',');
        const query = `
            DELETE FROM EncounterAssets WHERE EncounterId IN (${placeholders});
            DELETE FROM EncounterEffects WHERE EncounterId IN (${placeholders});
            DELETE FROM EncounterStructures WHERE EncounterId IN (${placeholders});
            DELETE FROM Encounters WHERE Id IN (${placeholders});
        `;

        // encounterIds repeated 4 times (once for each DELETE)
        await this.executeQuery(query, [...encounterIds, ...encounterIds, ...encounterIds, ...encounterIds]);
    }

    /**
     * Verify encounter stage configuration in database
     */
    async verifyEncounterStage(encounterId: string, expectedStage: Partial<any>): Promise<void> {
        const [encounter] = await this.queryTable('Encounters', { Id: encounterId });

        if (!encounter) {
            throw new Error(`Encounter with ID ${encounterId} not found in database`);
        }

        if (!encounter.Stage) {
            throw new Error(`Encounter ${encounterId} has no stage configuration`);
        }

        const stageConfig = JSON.parse(encounter.Stage);

        for (const [key, expectedValue] of Object.entries(expectedStage)) {
            if (stageConfig[key] !== expectedValue) {
                throw new Error(
                    `Stage ${key} mismatch: expected ${expectedValue}, got ${stageConfig[key]}`
                );
            }
        }
    }

    /**
     * Verify encounter grid configuration in database
     */
    async verifyEncounterGrid(encounterId: string, expectedGrid: Partial<any>): Promise<void> {
        const [encounter] = await this.queryTable('Encounters', { Id: encounterId });

        if (!encounter) {
            throw new Error(`Encounter with ID ${encounterId} not found in database`);
        }

        if (!encounter.Grid) {
            throw new Error(`Encounter ${encounterId} has no grid configuration`);
        }

        const gridConfig = JSON.parse(encounter.Grid);

        for (const [key, expectedValue] of Object.entries(expectedGrid)) {
            if (gridConfig[key] !== expectedValue) {
                throw new Error(
                    `Grid ${key} mismatch: expected ${expectedValue}, got ${gridConfig[key]}`
                );
            }
        }
    }

    /**
     * Verify asset placement count on encounter
     */
    async verifyEncounterAssetPlacementCount(encounterId: string, expectedCount: number): Promise<void> {
        const placements = await this.queryTable('EncounterAssets', { EncounterId: encounterId });

        if (placements.length !== expectedCount) {
            throw new Error(
                `Encounter asset placement count mismatch: expected ${expectedCount}, got ${placements.length}`
            );
        }
    }

    /**
     * Insert encounter into database
     */
    async insertEncounter(encounter: {
        name: string;
        ownerId: string;
        adventureId: string;
        gridType: string;
        gridSize: number;
        width: number;
        height: number;
    }): Promise<string> {
        const encounterId = this.generateGuidV7();
        const query = `
            INSERT INTO Encounters
            (Id, Name, OwnerId, AdventureId, GridType, GridSize, Width, Height, CreatedAt, UpdatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            encounterId,
            encounter.name,
            encounter.ownerId,
            encounter.adventureId,
            encounter.gridType,
            encounter.gridSize,
            encounter.width,
            encounter.height,
            new Date(),
            new Date()
        ];

        await this.executeQuery(query, params);
        return encounterId;
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
     * Insert encounter asset (placed asset) into database
     */
    async insertEncounterAsset(encounterAsset: {
        encounterId: string;
        assetId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        layer: number;
    }): Promise<string> {
        const encounterAssetId = this.generateGuidV7();
        const query = `
            INSERT INTO EncounterAssets
            (Id, EncounterId, AssetId, X, Y, Width, Height, Rotation, Layer, Visible, Locked, ScaleX, ScaleY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1.0, 1.0)
        `;

        const params = [
            encounterAssetId,
            encounterAsset.encounterId,
            encounterAsset.assetId,
            encounterAsset.x,
            encounterAsset.y,
            encounterAsset.width,
            encounterAsset.height,
            encounterAsset.rotation,
            encounterAsset.layer
        ];

        await this.executeQuery(query, params);
        return encounterAssetId;
    }

    /**
     * Insert game session into database
     */
    async insertGameSession(session: {
        title: string;
        ownerId: string;
        status?: string;
        encounterId?: string | null;
    }): Promise<string> {
        const sessionId = this.generateGuidV7();
        const players = JSON.stringify([
            { userId: session.ownerId, role: 'Master' }
        ]);

        const query = `
            INSERT INTO GameSessions
            (Id, OwnerId, Title, Status, EncounterId, Players, Messages, Events, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            sessionId,
            session.ownerId,
            session.title,
            session.status || 'Draft',
            session.encounterId || null,
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
     * Delete user and ALL their data (cascade cleanup) - NEW SCHEMA
     */
    async deleteUserDataOnly(userId: string): Promise<void> {
        const query = `
            DELETE FROM EncounterAssets WHERE EncounterId IN (SELECT Id FROM Encounters WHERE OwnerId = ?);
            DELETE FROM EncounterEffects WHERE EncounterId IN (SELECT Id FROM Encounters WHERE OwnerId = ?);
            DELETE FROM EncounterStructures WHERE EncounterId IN (SELECT Id FROM Encounters WHERE OwnerId = ?);
            DELETE FROM Assets WHERE OwnerId = ?;
            DELETE FROM Encounters WHERE OwnerId = ?;
            DELETE FROM Adventures WHERE OwnerId = ?;
            DELETE FROM Campaigns WHERE OwnerId = ?;
            DELETE FROM Epics WHERE OwnerId = ?;
            DELETE FROM Structures WHERE OwnerId = ?;
            DELETE FROM Effects WHERE OwnerId = ?;
            DELETE FROM GameSessions WHERE OwnerId = ?;
            DELETE FROM Schedule WHERE OwnerId = ?;
        `;

        const params = Array(12).fill(userId);
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
