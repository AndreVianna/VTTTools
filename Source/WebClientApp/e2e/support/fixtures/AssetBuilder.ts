/**
 * Asset Builder - Fluent Builder for Creating Test Assets
 *
 * Provides a fluent API for creating assets with various configurations
 * Used in Given steps to seed test data
 */

import { DatabaseHelper } from '../helpers/database.helper.js';

export enum AssetKind {
    Object = 'Object',
    Creature = 'Creature'
}

export enum CreatureCategory {
    Character = 'Character',
    Monster = 'Monster'
}

export enum ResourceRole {
    None = 0,
    Token = 1,
    Display = 2,
    Both = 3
}

interface AssetResource {
    resourceId: string;
    role: ResourceRole;
}

interface AssetSize {
    width: number;
    height: number;
    isSquare: boolean;
}

export class AssetBuilder {
    private data: any = {
        kind: AssetKind.Object,
        name: 'Test Asset',
        description: '',
        resources: [] as AssetResource[],
        isPublic: false,
        isPublished: false,
        objectProps: {
            size: { width: 1, height: 1, isSquare: true },
            isMovable: true,
            isOpaque: false
        }
    };

    constructor(
        private db: DatabaseHelper,
        private ownerId: string
    ) {}

    withName(name: string): this {
        this.data.name = name;
        return this;
    }

    withKind(kind: AssetKind): this {
        this.data.kind = kind;

        // Set default properties for kind
        if (kind === AssetKind.Creature) {
            this.data.creatureProps = {
                size: { width: 1, height: 1, isSquare: true },
                category: CreatureCategory.Character
            };
            delete this.data.objectProps;
        } else {
            this.data.objectProps = {
                size: { width: 1, height: 1, isSquare: true },
                isMovable: true,
                isOpaque: false
            };
            delete this.data.creatureProps;
        }

        return this;
    }

    withDescription(description: string): this {
        this.data.description = description;
        return this;
    }

    withSize(width: number, height: number): this {
        const size: AssetSize = {
            width,
            height,
            isSquare: width === height
        };

        if (this.data.objectProps) {
            this.data.objectProps.size = size;
        } else if (this.data.creatureProps) {
            this.data.creatureProps.size = size;
        }

        return this;
    }

    withOwner(ownerId: string): this {
        this.ownerId = ownerId;
        return this;
    }

    withTokenResource(resourceId: string): this {
        this.data.resources.push({
            resourceId,
            role: ResourceRole.Token
        });
        return this;
    }

    withDisplayResource(resourceId: string): this {
        this.data.resources.push({
            resourceId,
            role: ResourceRole.Display
        });
        return this;
    }

    withBothRoles(resourceId: string): this {
        this.data.resources.push({
            resourceId,
            role: ResourceRole.Both
        });
        return this;
    }

    public(): this {
        this.data.isPublic = true;
        return this;
    }

    published(): this {
        this.data.isPublic = true;
        this.data.isPublished = true;
        return this;
    }

    immovable(): this {
        if (this.data.objectProps) {
            this.data.objectProps.isMovable = false;
        }
        return this;
    }

    opaque(): this {
        if (this.data.objectProps) {
            this.data.objectProps.isOpaque = true;
        }
        return this;
    }

    asMonster(): this {
        if (this.data.creatureProps) {
            this.data.creatureProps.category = CreatureCategory.Monster;
        }
        return this;
    }

    asCharacter(): this {
        if (this.data.creatureProps) {
            this.data.creatureProps.category = CreatureCategory.Character;
        }
        return this;
    }

    withId(id: string): this {
        this.data.id = id;
        return this;
    }

    withResources(count: number): this {
        // Add placeholder resources (will be created in test)
        for (let i = 0; i < count; i++) {
            this.data.resources.push({
                resourceId: `resource-${i}`,
                role: ResourceRole.None
            });
        }
        return this;
    }

    /**
     * Create asset in database
     */
    async create(): Promise<any> {
        const assetId = this.data.id || await this.db.insertAsset({
            name: this.data.name,
            description: this.data.description,
            ownerId: this.ownerId,
            kind: this.data.kind,
            isPublic: this.data.isPublic,
            isPublished: this.data.isPublished
        });

        return {
            id: assetId,
            ...this.data,
            ownerId: this.ownerId
        };
    }

    /**
     * Build configuration (async for database creation)
     */
    async build(): Promise<any> {
        return await this.create();
    }
}

// Usage examples:
// Simple: await builder.withName('Dragon').create();
// Complex: await builder.withName('Wall').withSize(1, 2).immovable().opaque().public().create();
