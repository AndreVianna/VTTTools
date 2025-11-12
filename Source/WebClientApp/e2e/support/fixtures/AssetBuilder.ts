import type { DatabaseHelper } from '../helpers/database.helper.js';

export enum AssetKind {
  Object = 'Object',
  Creature = 'Creature',
}

export enum CreatureCategory {
  Character = 'Character',
  Monster = 'Monster',
}

export enum ResourceType {
  Image = 'Image',
  Audio = 'Audio',
  Video = 'Video',
  Document = 'Document',
}

export interface AssetToken {
  tokenId: string;
  isDefault: boolean;
  token?: MediaResource;
}

export interface MediaResource {
  id: string;
  type: ResourceType;
  path: string;
  metadata: {
    contentType: string;
    fileName: string;
    fileLength: number;
    imageSize?: { width: number; height: number };
  };
  tags: string[];
}

export interface NamedSize {
  width: number;
  height: number;
  isSquare: boolean;
}

export interface ObjectData {
  isMovable: boolean;
  isOpaque: boolean;
  triggerEffectId?: string;
}

export interface CreatureData {
  statBlockId?: string;
  category: CreatureCategory;
  tokenStyle?: {
    borderColor?: string;
    backgroundColor?: string;
    shape: 'Circle' | 'Square';
  };
}

export interface Asset {
  id?: string;
  ownerId: string;
  kind: AssetKind;
  name: string;
  description: string;
  isPublished: boolean;
  isPublic: boolean;
  tokens: AssetToken[];
  portrait?: MediaResource;
  size: NamedSize;
  properties?: ObjectData | CreatureData;
  createdAt?: string;
  updatedAt?: string;
}

export class AssetBuilder {
  private id?: string;
  private kind: AssetKind = AssetKind.Object;
  private name: string = 'Test Asset';
  private description: string = '';
  private tokens: AssetToken[] = [];
  private portrait?: MediaResource;
  private size: NamedSize = { width: 1, height: 1, isSquare: true };
  private isPublic: boolean = false;
  private isPublished: boolean = false;
  private properties: ObjectData | CreatureData = {
    isMovable: true,
    isOpaque: false,
  };

  constructor(
    private db: DatabaseHelper,
    private ownerId: string,
  ) {}

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withKind(kind: AssetKind): this {
    this.kind = kind;

    if (kind === AssetKind.Creature) {
      this.properties = {
        category: CreatureCategory.Character,
      };
    } else {
      this.properties = {
        isMovable: true,
        isOpaque: false,
      };
    }

    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withSize(width: number, height: number): this {
    this.size = {
      width,
      height,
      isSquare: Math.abs(width - height) < 0.001,
    };
    return this;
  }

  withOwner(ownerId: string): this {
    this.ownerId = ownerId;
    return this;
  }

  withToken(tokenId: string, isDefault: boolean = false): this {
    this.tokens.push({
      tokenId,
      isDefault,
      token: undefined,
    });
    return this;
  }

  withDefaultToken(tokenId: string): this {
    this.tokens.forEach((t) => (t.isDefault = false));
    return this.withToken(tokenId, true);
  }

  withPortrait(resourceId: string): this {
    this.portrait = {
      id: resourceId,
      type: ResourceType.Image,
      path: `/test-media/${resourceId}.png`,
      metadata: {
        contentType: 'image/png',
        fileName: `${resourceId}.png`,
        fileLength: 1024,
        imageSize: { width: 256, height: 256 },
      },
      tags: [],
    };
    return this;
  }

  public(): this {
    this.isPublic = true;
    return this;
  }

  published(): this {
    this.isPublic = true;
    this.isPublished = true;
    return this;
  }

  immovable(): this {
    if (this.kind === AssetKind.Object) {
      (this.properties as ObjectData).isMovable = false;
    }
    return this;
  }

  opaque(): this {
    if (this.kind === AssetKind.Object) {
      (this.properties as ObjectData).isOpaque = true;
    }
    return this;
  }

  asMonster(): this {
    this.kind = AssetKind.Creature;
    this.properties = {
      category: CreatureCategory.Monster,
    };
    return this;
  }

  asCharacter(): this {
    this.kind = AssetKind.Creature;
    this.properties = {
      category: CreatureCategory.Character,
    };
    return this;
  }

  asObject(objectData?: Partial<ObjectData>): this {
    this.kind = AssetKind.Object;
    this.properties = {
      isMovable: true,
      isOpaque: false,
      ...objectData,
    };
    return this;
  }

  asCreature(creatureData?: Partial<CreatureData>): this {
    this.kind = AssetKind.Creature;
    this.properties = {
      category: CreatureCategory.Monster,
      statBlockId: undefined,
      tokenStyle: undefined,
      ...creatureData,
    };
    return this;
  }

  withResources(count: number): this {
    for (let i = 0; i < count; i++) {
      this.tokens.push({
        tokenId: `resource-${i}`,
        isDefault: i === 0,
        token: undefined,
      });
    }
    return this;
  }

  async create(): Promise<Asset> {
    const assetId =
      this.id ||
      (await this.db.insertAsset({
        id: this.id,
        name: this.name,
        description: this.description,
        ownerId: this.ownerId,
        kind: this.kind,
        isPublic: this.isPublic,
        isPublished: this.isPublished,
        tokens: this.tokens,
        portrait: this.portrait,
        size: this.size,
        properties: this.properties,
      }));

    return {
      id: assetId,
      ownerId: this.ownerId,
      kind: this.kind,
      name: this.name,
      description: this.description,
      isPublished: this.isPublished,
      isPublic: this.isPublic,
      tokens: this.tokens,
      portrait: this.portrait,
      size: this.size,
      properties: this.properties,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async build(): Promise<Asset> {
    return await this.create();
  }
}
