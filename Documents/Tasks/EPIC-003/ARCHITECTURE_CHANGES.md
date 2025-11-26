# EPIC-003 Architecture Changes Summary

**Date**: 2025-11-26
**Epic**: EPIC003 - Asset Management Enhancement
**Status**: Major Architecture Refactoring Complete

---

## Executive Summary

This document describes the significant architectural changes made to the Asset and Resource domain models as part of EPIC-003. These changes simplify the domain model, improve flexibility, and establish a cleaner separation between asset definitions and their visual representations (tokens).

---

## 1. Asset Model Changes

### 1.1 From Inheritance to Unified Model

**Before (Old Architecture)**:
```
Asset (abstract base)
├── ObjectAsset (environmental items)
└── CreatureAsset (abstract)
    ├── MonsterAsset (NPCs, monsters)
    └── CharacterAsset (player characters)
```

**After (New Architecture)**:
```
Asset (single unified record)
├── Classification: AssetClassification (Kind, Category, Type, Subtype)
├── Portrait: Resource? (single display image)
├── Tokens: List<Resource> (multiple token images)
└── StatBlocks: Dictionary<int, Map<StatBlockValue>> (level-based stats)
```

### 1.2 AssetClassification Value Object

Replaced inheritance hierarchy with a flexible classification system:

```csharp
public sealed record AssetClassification(
    AssetKind Kind,      // Character, Creature, Object
    string Category,     // e.g., "Humanoid", "Beast", "Furniture"
    string Type,         // e.g., "Goblinoid", "Mammal", "Container"
    string? Subtype);    // Optional: "Hobgoblin", "Wolf", null
```

**Benefits**:
- Unlimited categorization flexibility without schema changes
- Supports any taxonomy the user defines
- Single database table (no TPH complexity)
- Easier querying and filtering

### 1.3 AssetKind Enum

**Before**: Object, Monster, Character (3 values)
**After**: Character, Creature, Object (3 values)

Key change: Merged `Monster` into `Creature` - the distinction is now handled via `Category` in the classification.

### 1.4 Image Management

**Before (4 Fixed Image Types)**:
- Portrait (UI display)
- TopDown (encounter map)
- Miniature (small grid token)
- Photo (character photo - creatures only)

**After (Flexible Token System)**:
- `Portrait`: Single optional Resource for UI display
- `Tokens`: List of Resources for encounter placement
- `TokenSize`: NamedSize for grid cell dimensions

**Benefits**:
- Unlimited token variants per asset
- Each token is a full Resource with its own metadata
- Tokens can have different poses, outfits, etc.

### 1.5 Removed Properties

The following properties were removed from the Asset model:
- `Genre` - Removed entirely (not needed with new classification system)
- `Properties` (ObjectProperties, CreatureProperties) - Simplified to direct properties
- `TopDownId`, `MiniatureId`, `PhotoId` - Replaced by `Tokens` collection
- Inheritance-specific columns (IsMovable, IsOpaque, TokenStyle, etc.)

### 1.6 New Asset Record Definition

```csharp
public record Asset {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public AssetClassification Classification { get; init; } = null!;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Resource? Portrait { get; init; }
    public NamedSize TokenSize { get; set; } = NamedSize.Default;
    public List<Resource> Tokens { get; init; } = [];
    public Dictionary<int, Map<StatBlockValue>> StatBlocks { get; init; } = [];
    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}
```

---

## 2. Resource Model Changes

### 2.1 Simplified Resource Structure

**Before (Nested Objects)**:
```csharp
public record Resource {
    public ResourceMetadata Metadata { get; init; }  // Nested object
    public List<string> Tags { get; init; }          // Separate collection
    // ...
}
```

**After (Direct Properties)**:
```csharp
public record Resource {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string? Description { get; init; }
    public Map<HashSet<string>> Features { get; init; } = [];
    public ResourceType Type { get; init; }
    public string Path { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }
    public Size Size { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }
    public Guid OwnerId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }
}
```

### 2.2 Removed Properties

- `Metadata` nested object - Properties now direct on Resource
- `Tags` collection - Replaced by `Features` map

### 2.3 New Features Map

The `Features` property is a `Map<HashSet<string>>` that provides flexible categorization:
- Key: Feature category (e.g., "poses", "equipment", "lighting")
- Value: Set of values for that category

Example:
```json
{
  "poses": ["standing", "combat", "casting"],
  "equipment": ["sword", "shield"],
  "lighting": ["day", "night"]
}
```

---

## 3. Database Schema Changes

### 3.1 Assets Table (Updated)

```sql
CREATE TABLE [Assets] (
    [Id] uniqueidentifier PRIMARY KEY,
    [OwnerId] uniqueidentifier NOT NULL,
    [Name] nvarchar(128) NOT NULL,
    [Description] nvarchar(4096) NOT NULL,
    [IsPublished] bit NOT NULL DEFAULT 0,
    [IsPublic] bit NOT NULL DEFAULT 0,
    -- Classification (owned entity)
    [Kind] nvarchar(max) NOT NULL,      -- "Character", "Creature", "Object"
    [Category] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Subtype] nvarchar(max) NULL,
    -- Token size (owned entity)
    [TokenWidth] float NOT NULL DEFAULT 1.0,
    [TokenHeight] float NOT NULL DEFAULT 1.0,
    -- Portrait reference
    [PortraitId] uniqueidentifier NULL,

    CONSTRAINT [FK_Assets_Portrait] FOREIGN KEY ([PortraitId]) REFERENCES [Resources]([Id])
);
```

### 3.2 New AssetTokens Junction Table

```sql
CREATE TABLE [AssetTokens] (
    [AssetId] uniqueidentifier NOT NULL,
    [TokenId] uniqueidentifier NOT NULL,
    [Index] int NOT NULL,               -- Ordering index

    PRIMARY KEY ([AssetId], [TokenId]),
    UNIQUE INDEX [IX_AssetTokens_AssetId_Index] ([AssetId], [Index]),
    CONSTRAINT [FK_AssetTokens_Asset] FOREIGN KEY ([AssetId]) REFERENCES [Assets]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AssetTokens_Token] FOREIGN KEY ([TokenId]) REFERENCES [Resources]([Id]) ON DELETE CASCADE
);
```

### 3.3 EF Core Configuration

Changed from `ComplexProperty` to `OwnsOne` for InMemory database compatibility:

```csharp
// AssetClassification
entity.OwnsOne(e => e.Classification, classificationBuilder => {
    classificationBuilder.Property(c => c.Kind).IsRequired().HasConversion<string>().HasColumnName("Kind");
    classificationBuilder.Property(c => c.Category).IsRequired().HasColumnName("Category");
    classificationBuilder.Property(c => c.Type).IsRequired().HasColumnName("Type");
    classificationBuilder.Property(c => c.Subtype).IsRequired(false).HasColumnName("Subtype");
});

// TokenSize
entity.OwnsOne(ea => ea.TokenSize, sizeBuilder => {
    sizeBuilder.Property(s => s.Width).IsRequired().HasDefaultValue(1.0).HasColumnName("TokenWidth");
    sizeBuilder.Property(s => s.Height).IsRequired().HasDefaultValue(1.0).HasColumnName("TokenHeight");
});
```

---

## 4. AssetImageManager Changes

### 4.1 Token Index Architecture

**Before**: tokenIndex=0 used for BOTH base images AND first token (collision)
**After**: tokenIndex=0 reserved for base images, tokens start at tokenIndex=1

### 4.2 File Naming Convention

**Before (Subfolders)**:
```
.../goblin/
├── 0/                    ← Base variant folder
│   ├── topdown.png
│   └── portrait.png
├── 1/                    ← Token 1 folder
│   └── topdown.png
└── 2/                    ← Token 2 folder
    └── topdown.png
```

**After (Suffixes in Same Folder)**:
```
.../goblin/
├── topdown.png           ← Base (tokenIndex=0)
├── token.png             ← Base CloseUp (tokenIndex=0)
├── portrait.png          ← Base Portrait (tokenIndex=0)
├── topdown_01.png        ← Token 1 (tokenIndex=1)
├── token_01.png          ← Token 1 CloseUp (tokenIndex=1)
├── topdown_02.png        ← Token 2 (tokenIndex=2)
└── token_02.png          ← Token 2 CloseUp (tokenIndex=2)
```

### 4.3 Image Type Mapping

| Image Type | Base Filename | Token Filename |
|------------|---------------|----------------|
| TopDown    | topdown.png   | topdown_01.png |
| CloseUp    | token.png     | token_01.png   |
| Portrait   | portrait.png  | (base only)    |

### 4.4 Generation Logic

For each asset with N tokens:
1. **Base generation** (tokenIndex=0):
   - Character/Creature: TopDown, CloseUp, Portrait (3 images)
   - Object: TopDown, Portrait (2 images)

2. **Token generation** (tokenIndex=1 to N):
   - Character/Creature: TopDown, CloseUp (2 images per token)
   - Object: TopDown (1 image per token)

---

## 5. Files Modified

### Domain Layer
- `Source/Domain/Assets/Model/Asset.cs` - Complete rewrite
- `Source/Domain/Assets/Model/AssetClassification.cs` - New file
- `Source/Domain/Assets/Model/AssetKind.cs` - Updated enum values
- `Source/Domain/Media/Model/Resource.cs` - Simplified structure

### Data Layer
- `Source/Data/Builders/AssetSchemaBuilder.cs` - New schema configuration
- `Source/Data/Assets/Mapper.cs` - Updated mapping logic
- `Source/Data/Assets/AssetStorage.cs` - Updated queries

### Application Layer
- `Source/Assets/Handlers/AssetHandlers.cs` - Fixed token filtering
- `Source/Assets/Services/AssetService.cs` - Updated business logic

### AssetImageManager
- `Source/AssetImageManager/Application/Commands/GenerateCommand.cs` - tokenIndex starts at 1
- `Source/AssetImageManager/Application/Commands/PrepareCommand.cs` - tokenIndex starts at 1
- `Source/AssetImageManager/Infrastructure/Storage/HierarchicalFileStore.cs` - New file naming

### Removed Files
- `Source/Domain/Assets/Model/ObjectAsset.cs`
- `Source/Domain/Assets/Model/CreatureAsset.cs`
- `Source/Domain/Assets/Model/MonsterAsset.cs`
- `Source/Domain/Assets/Model/CharacterAsset.cs`
- `Source/Domain/Assets/Model/ObjectProperties.cs`
- `Source/Domain/Assets/Model/CreatureProperties.cs`
- `Source/Domain/Media/Model/ResourceMetadata.cs`

---

## 6. Test Status

### AssetImageManager.UnitTests
- **Status**: 125/125 passing (100%)
- All tests updated to new architecture
- New file naming convention verified

### Other Test Projects
- Domain.UnitTests: Updated for new Asset structure
- Data.UnitTests: Updated for EF Core changes (OwnsOne)
- Assets.UnitTests: Updated for service changes

---

## 7. Migration Notes

### Breaking Changes

1. **Asset Model**: Complete restructure - no backward compatibility
2. **Resource Model**: Removed Metadata and Tags - direct properties only
3. **AssetImageManager Files**: New naming convention requires regeneration

### Data Migration Required

Existing assets will need migration to:
1. Convert inheritance hierarchy to Classification
2. Convert image references to Tokens collection
3. Regenerate image files with new naming convention

---

## 8. Benefits of New Architecture

1. **Simplicity**: Single Asset record instead of 5-class hierarchy
2. **Flexibility**: Unlimited classification taxonomy via strings
3. **Scalability**: Multiple tokens per asset without schema changes
4. **Maintainability**: Fewer files, cleaner separation of concerns
5. **Testability**: Simpler models, easier to mock and test
6. **Performance**: Simpler queries, no TPH discrimination overhead

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Author**: Claude Code (Automated Documentation)
