# List Assets By Type Use Case

**Original Request**: Query assets filtered by AssetType

**List Assets By Type** is a filtered query operation that retrieves assets of a specific type (Creature, Token, Door, etc.). This use case operates within the Assets area and enables users to browse assets by category for easier discovery and selection.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Asset Management
- **Owning Area**: Assets
- **Business Value**: Categorical asset browsing enabling faster asset discovery and selection for specific use cases
- **User Benefit**: Filter asset library by type (e.g., show only Creatures, only Tokens)

### Scope Definition
- **Primary Actor**: Authenticated User (any role)
- **Scope**: Query assets filtered by Type enum value
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: GET /api/assets?type=:assetType
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP/GraphQL
- **Response Format**: JSON array of Asset objects

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: AssetService.GetByTypeAsync(AssetType type)
- **Domain Entities**: Asset (aggregate root), AssetType (enum)
- **Domain Services**: IAssetStorage.GetByTypeAsync()
- **Infrastructure Dependencies**: DbContext (Asset query with Type filter)

### Hexagonal Architecture
- **Primary Port Operation**: IAssetStorage.GetByTypeAsync(AssetType type)
- **Secondary Port Dependencies**:
  - DbContext.Assets.Where(a => a.Type == type).ToListAsync()
- **Adapter Requirements**: HTTP adapter, database adapter (indexed query on Type)

### DDD Alignment
- **Bounded Context**: Assets
- **Ubiquitous Language**: Asset type, creature assets, token assets, filter by type
- **Business Invariants**: None (read-only operation)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: AssetType (enum, required, one of 15 valid types)
- **Input Validation**: Type must be valid AssetType enum value
  - Valid types: Placeholder, Creature, Character, NPC, Object, Wall, Door, Window, Overlay, Elevation, Effect, Sound, Music, Vehicle, Token
- **Preconditions**:
  - User is authenticated

### Business Logic
- **Business Rules**:
  - Returns assets where Type matches specified value
  - Authorization: User sees own assets (all states) + public assets from other users
  - Results filtered by both Type AND visibility (own assets OR IsPublic=true)
- **Processing Steps**:
  1. Validate type is valid AssetType enum
  2. Authenticate user
  3. Query assets where Type = type AND (OwnerId = currentUserId OR IsPublic = true)
  4. Return asset list
- **Domain Coordination**: Simple filtered query with authorization
- **Validation Logic**: Enum validation, authentication check, visibility filter

### Output Specification
- **Output Data**: List of Asset entities matching Type filter and visibility rules
- **Output Format**: JSON array with Asset objects
  ```json
  [
    {
      "id": "guid1",
      "ownerId": "current-user-guid",
      "type": "Creature",
      "name": "Dragon",
      "isPublished": false,
      "isPublic": false
    },
    {
      "id": "guid2",
      "ownerId": "other-user-guid",
      "type": "Creature",
      "name": "Goblin",
      "isPublished": true,
      "isPublic": true
    }
  ]
  ```
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Invalid Type**: Return 400 Bad Request with "Invalid asset type. Valid types: Placeholder, Creature, Character..." (BR-07)
- **Unauthenticated**: Return 401 Unauthorized if user not authenticated
- **Database Error**: Return 500 Internal Server Error with "Failed to retrieve assets by type"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IAssetStorage
  {
      Task<List<Asset>> GetByTypeAsync(AssetType type);
  }

  public enum AssetType
  {
      Placeholder = 0,
      Creature = 1,
      Character = 2,
      NPC = 3,
      Object = 4,
      Wall = 5,
      Door = 6,
      Window = 7,
      Overlay = 8,
      Elevation = 9,
      Effect = 10,
      Sound = 11,
      Music = 12,
      Vehicle = 13,
      Token = 14
  }
  ```
- **Data Access Patterns**: Indexed query on Type enum column with visibility filter
- **External Integration**: None
- **Performance Requirements**: <200ms query, database index on Type column

### Architecture Compliance
- **Layer Responsibilities**:
  - Application: Enum validation, authentication, orchestrate query with visibility filter
  - Domain: Entity definition, enum definition
  - Infrastructure: Database query with Type and visibility filters
- **Dependency Direction**: Application → Domain ← Infrastructure
- **Interface Abstractions**: IAssetStorage
- **KISS Validation**: Simple Type filter with visibility rules

### Testing Strategy
- **Unit Testing**:
  - Test enum validation (valid types accepted, invalid rejected)
  - Test visibility filter logic (own assets + public assets)
- **Integration Testing**:
  - Test query returns only assets of specified type
  - Test visibility rules (own private assets included, others' private excluded)
  - Test empty result when no assets of type exist
  - Test all 15 asset types
  - Test performance with indexed queries
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given 3 Creature assets and 2 Token assets, When filtering by Creature, Then 3 Creature assets returned
  - Given invalid type "InvalidType", When querying, Then validation error returned
  - Given 2 own-private Creature assets and 1 other-public Creature asset, When querying Creature, Then 3 Creature assets returned

---

## Acceptance Criteria

- **AC-01**: Filter by Creature type
  - **Given**: 3 Creature assets, 2 Token assets, 1 Door asset (all visible to user)
  - **When**: GetAssetsByTypeQuery with type="Creature" submitted
  - **Then**: 3 Creature assets returned, other types excluded

- **AC-02**: Visibility rules applied
  - **Given**: User owns 2 private Creature assets, 3 public Creature assets exist from other users
  - **When**: GetAssetsByTypeQuery with type="Creature" submitted
  - **Then**: 5 Creature assets returned (2 own-private + 3 public)

- **AC-03**: Private assets of others excluded
  - **Given**: User owns 1 Creature asset, other users have 2 private Creature assets
  - **When**: GetAssetsByTypeQuery with type="Creature" submitted
  - **Then**: 1 Creature asset returned (own asset only, others' private excluded)

- **AC-04**: Empty result when no assets of type
  - **Given**: No Vehicle assets exist
  - **When**: GetAssetsByTypeQuery with type="Vehicle" submitted
  - **Then**: Empty array [] returned

- **AC-05**: Invalid type rejected
  - **Given**: Invalid AssetType value "InvalidType"
  - **When**: GetAssetsByTypeQuery submitted
  - **Then**: 400 Bad Request with "Invalid asset type. Valid types: Placeholder, Creature..." (BR-07)

- **AC-06**: All 15 asset types supported
  - **Given**: Assets of each of the 15 types exist
  - **When**: Querying each type individually
  - **Then**: Each query returns only assets of requested type

- **AC-07**: Token type commonly used for tactical maps
  - **Given**: 10 Token assets (specific type for character/creature representations)
  - **When**: GetAssetsByTypeQuery with type="Token" submitted
  - **Then**: 10 Token assets returned

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: Enum validation → Authentication → Type + Visibility filter query → Return list
- **Code Organization**: AssetService.GetByTypeAsync() in application layer
- **Testing Approach**: Unit tests for enum validation, integration tests for filtered queries
- **Indexing**: Ensure database index on Type column for performance

### Dependencies
- **Technical Dependencies**: EF Core for database access, enum handling
- **Area Dependencies**: None (self-contained)
- **External Dependencies**: Database

### Architectural Considerations
- **Area Boundary Respect**: Assets owns query, no cross-area dependencies
- **Interface Design**: Clean contract with AssetType enum parameter
- **Error Handling**: Clear validation error with list of valid types
- **Performance**: Index on Type column critical for fast categorical queries
- **Privacy**: Visibility rules (own + public) prevent viewing others' private assets
- **Use Cases**: Common filter for UI asset pickers (e.g., "Select a Creature", "Select a Token")

---

This List Assets By Type use case provides comprehensive implementation guidance for categorical asset queries within the Assets area while maintaining security, performance, and architectural integrity.
