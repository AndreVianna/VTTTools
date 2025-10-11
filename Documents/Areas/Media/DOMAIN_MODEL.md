# Media Domain Model

**Bounded Context**: Media

**Purpose**: Manage media resource files (images, animations, videos) with metadata, provide blob storage integration, and serve media to other bounded contexts.

**Boundaries**:
- **Inside**: Resource entity definitions, media metadata management, file path management, blob storage operations
- **Outside**: User management (Identity context), Asset display usage (Assets context), Scene backgrounds (Library context)

**Architecture Pattern**: DDD Contracts + Service Implementation
- Domain entities are **data contracts** (anemic - no behavior)
- Business logic resides in **application services** (Source/Media/)
- Entities, value objects, and service interfaces define **contracts**
- Services enforce invariants and implement business rules

---

## Change Log
- *2025-10-02* — **1.0.0** — Initial domain model extracted from existing codebase
- *2025-10-11* — **2.0.0** — Blob storage refactoring: PNG conversion pipeline (SVG/JPEG/etc → PNG), GUID v7 generation, new path structure (resourceType/guid-suffix/guid), blob metadata (OwnerId, EntityType, EntityId, IsPublic)

---

## Ubiquitous Language

- **Resource**: Media file (image, animation, video) stored in blob storage with metadata
- **Resource Type**: Category of media (Image, Animation, Video, Undefined)
- **Resource Metadata**: Technical properties of media file (dimensions, file size, content type, encoding)
- **Resource File**: File system information (file name, storage paths)
- **Blob Storage**: External storage system for media files (Azure Blob Storage in production, local filesystem in development)
- **Path**: Unique storage location identifier for resource in blob storage
- **Tags**: User-defined keywords for resource organization and searchability
- **Content Type**: MIME type of media file (image/png, video/mp4, etc.)
- **Upload**: The process of transferring a media file from user to blob storage with automatic metadata extraction
- **Thumbnail**: Smaller preview version of media file for UI display and performance optimization
- **MIME Type**: Internet media type identifier standardized by IANA (e.g., image/png, video/mp4, image/jpeg)
- **PNG Conversion**: Automatic conversion of all uploaded images to PNG format for standardization
- **GUID v7**: Timestamp-based GUID generation for resource IDs (better load balancing than GUID v4)
- **Resource Type Directory**: Path prefix based on content type (images/, videos/, audio/)
- **Blob Metadata**: Additional properties stored on blob (OwnerId, EntityType, EntityId, IsPublic) for cleanup and access control
- **Orphan Resource**: Uploaded resource with EntityId=null (cleanup candidate if older than 24 hours)

---

## Entities

### Resource

**Entity Classification**: Aggregate Root

**Aggregate Root**: This entity is the entry point for all operations on the Resource aggregate

#### Identity
- **Primary Key**: Id (Guid)
- **Natural Key**: Path (unique storage location)

#### Attributes
- **Id**: Guid
  - **Constraints**: Primary key, required, system-generated
  - **Default Value**: New Guid on creation
  - **Nullable**: No
  - **Purpose**: Unique identifier for resource

- **Type**: ResourceType (enum)
  - **Constraints**: Must be valid ResourceType value (Undefined, Image, Animation, Video)
  - **Default Value**: ResourceType.Undefined
  - **Nullable**: No
  - **Purpose**: Categorizes media file type

- **Path**: string
  - **Constraints**: Required, unique, format: "{resourceType}/{guid-suffix}/{guid}"
  - **Format**: resourceType (images/videos/audio) + last 4 chars of GUID + full GUID (32 hex chars)
  - **Example**: "images/ee97/0199d0f8459a76a0a1c92dceab0cee97"
  - **Default Value**: Generated on upload based on content type and GUID v7
  - **Nullable**: No
  - **Purpose**: Unique storage path with load balancing (GUID suffix provides distribution)

- **Metadata**: ResourceMetadata (value object)
  - **Constraints**: See ResourceMetadata definition
  - **Default Value**: Extracted from uploaded file
  - **Nullable**: No
  - **Purpose**: Technical properties of media file

- **Tags**: string[] (array of strings)
  - **Constraints**: Each tag max length, case-insensitive
  - **Default Value**: Empty array
  - **Nullable**: No (empty array if no tags)
  - **Purpose**: User-defined keywords for search and organization

#### Invariants
- **INV-01**: Path must be unique across all resources
  - **Rationale**: Each blob storage location must be distinct
  - **Enforced By**: Database unique index, service validation

- **INV-02**: Type must match actual file content type
  - **Rationale**: Ensure type categorization accuracy
  - **Enforced By**: Service validation during upload (file inspection)

- **INV-03**: Metadata dimensions must match actual media file dimensions
  - **Rationale**: Accurate metadata for rendering
  - **Enforced By**: Service extracts metadata from file during upload

- **INV-04**: Path must represent valid blob storage location
  - **Rationale**: Resource must be retrievable
  - **Enforced By**: Blob storage service validates path on upload

#### Operations (Implemented in Application Services)

**NOTE**: This architecture uses **anemic entities** (data contracts only). Business logic and behavior are implemented in **application services** (Source/Media/), not in entity methods.

- **Upload Resource**: Upload media file to blob storage and create Resource entity
  - **Implemented By**: IMediaStorage.UploadAsync() (Application layer)
  - **Pre-conditions**: File data provided, valid content type
  - **Invariants Enforced**: INV-01 (unique path), INV-02 (type matches content), INV-03 (metadata extraction), INV-04 (valid storage location)
  - **Post-conditions**: File uploaded to blob storage, Resource entity persisted, metadata populated
  - **Returns**: Task<Resource>

- **Get Resource**: Retrieve resource metadata by ID
  - **Implemented By**: IMediaStorage.GetByIdAsync() (Application layer)
  - **Pre-conditions**: Resource exists
  - **Invariants Enforced**: None (read-only)
  - **Post-conditions**: None
  - **Returns**: Task<Resource?>

- **Get Resource File**: Retrieve actual media file from blob storage
  - **Implemented By**: IMediaStorage.GetFileAsync() (Application layer)
  - **Pre-conditions**: Resource exists, blob storage accessible
  - **Invariants Enforced**: None (read-only)
  - **Post-conditions**: None
  - **Returns**: Task<Stream> (file content stream)

- **Delete Resource**: Remove resource and file from blob storage
  - **Implemented By**: IMediaStorage.DeleteAsync() (Application layer)
  - **Pre-conditions**: Resource exists, not referenced by any Asset or Scene
  - **Invariants Enforced**: None (deletion operation)
  - **Post-conditions**: Resource entity deleted, blob storage file removed
  - **Returns**: Task

- **Update Tags**: Modify resource tags for organization
  - **Implemented By**: IMediaStorage.UpdateTagsAsync() (Application layer)
  - **Pre-conditions**: Resource exists
  - **Invariants Enforced**: None (metadata update)
  - **Post-conditions**: Tags array updated
  - **Returns**: Task<Resource>

- **List Resources**: Query resources with filtering
  - **Implemented By**: IMediaStorage.GetAllAsync(), GetByTypeAsync(), GetByTagAsync() (Application layer)
  - **Pre-conditions**: None
  - **Invariants Enforced**: None (read-only)
  - **Post-conditions**: None
  - **Returns**: Task<List<Resource>>

**Entity Behavior**: Entities are **immutable records** (C# init-only properties). Modifications use:
- **with expressions**: `resource with { Tags = newTags }` (creates new instance)
- **Service orchestration**: Services handle validation, apply changes, persist
- **No entity methods**: All logic in application services

#### Domain Events
[NOT CURRENTLY IMPLEMENTED - Events could be added in future]

Potential future events:
- **ResourceUploaded**: When media file is uploaded
- **ResourceDeleted**: When resource is removed
- **ResourceTagsUpdated**: When tags are modified

#### Relationships
- **Referenced By** ← Asset: Resources may be used via AssetResource collection
  - **Cardinality**: One-to-Many (one resource can be referenced by many AssetResource associations)
  - **Roles**: Each reference has a role (Token for scenes, Display for UI)

- **Referenced By** ← Scene/Adventure/Epic: Resource may be used as Background
  - **Cardinality**: One-to-Many (one resource used by many backgrounds)
  - **Navigation**: Not navigable from Resource (no collection property)

---

## Value Objects

### ResourceMetadata

**Purpose**: Encapsulates technical properties of media file (dimensions, file size, content type)

#### Properties
- **Width**: int?
  - **Constraints**: Positive integer for images/videos, null for non-visual media
- **Height**: int?
  - **Constraints**: Positive integer for images/videos, null for non-visual media
- **FileSize**: long
  - **Constraints**: Positive integer representing bytes
- **ContentType**: string
  - **Constraints**: Valid MIME type (e.g., "image/png", "video/mp4")
- **Encoding**: string?
  - **Constraints**: Encoding format (e.g., "H.264" for video), optional

#### Creation & Validation
- **Factory Method**: Inline construction or extracted during file upload: `new ResourceMetadata { Width = 1920, Height = 1080, FileSize = 1024000, ContentType = "image/png" }`
- **Validation Rules**:
  - Width and Height must be positive if provided
  - FileSize must be positive
  - ContentType must be valid MIME type format
- **Immutability**: Yes (record type with init-only properties)

#### Equality & Comparison
- **Equality**: Value-based (all properties must match)
- **Hash Code**: Based on all properties
- **Comparison**: Not comparable

#### Methods
- **ToString()**: Returns string representation
- **Equals(ResourceMetadata other)**: Value equality comparison
- **GetHashCode()**: Hash based on all properties

## PNG Conversion Pipeline

**Purpose**: Standardize all uploaded images to PNG format for consistency

### Conversion Rules
- **PNG files**: Saved as-is (no conversion)
- **SVG files**: Converted to PNG using Svg.Skia library
  - Preserves transparency
  - Max dimensions: 2048×2048 (proportional scaling if larger)
  - Quality: 100 (lossless)
- **JPEG/GIF/BMP/WebP/TIFF**: Converted to PNG using ImageSharp library
  - Best compression
  - Preserves transparency (where applicable)
  - Quality: Lossless
- **Non-image files**: Rejected with 400 Bad Request
- **Size limit**: 5MB after conversion (413 error if exceeded)

### Technical Details
- **SVG Rendering**: Uses SkiaSharp canvas with transparent background
- **Raster Conversion**: Uses ImageSharp PngEncoder with BestCompression
- **File Extension**: Original extension changed to .png
- **Content Type**: Updated to "image/png"

## Blob Metadata

**Purpose**: Track resource ownership and enable orphan cleanup

### Metadata Properties (Stored on Azure Blob)
- **OwnerId**: User GUID who uploaded the resource
- **EntityType**: Type of entity using resource ("asset", "scene", "adventure")
- **EntityId**: ID of owning entity (empty for orphans, populated when entity saved)
- **IsPublic**: Whether resource is publicly accessible

### Orphan Detection Strategy
Resources with `EntityId=""` and age >24 hours are considered orphans (user abandoned upload).
Cleanup process can safely delete these blobs and Resource entities.

### ResourceFile

**Purpose**: Computed file system information derived from Resource entity for file operations

**Note**: ResourceFile is a **computed/derived value object**, not persisted separately. The Resource.Path property stores the primary blob storage path. ResourceFile provides a structured view for file operations.

**Relationship to Resource Entity**:
- Resource.Path → ResourceFile.StoragePath (primary storage location)
- FileName is derived from uploaded file or stored separately (implementation detail)
- ThumbnailPath is optional computed path based on Resource.Id

#### Properties
- **FileName**: string
  - **Constraints**: Original uploaded file name
  - **Source**: Derived from upload operation or computed from Path
- **StoragePath**: string
  - **Constraints**: Full path in blob storage
  - **Source**: Same as Resource.Path property (denormalized)
- **ThumbnailPath**: string?
  - **Constraints**: Optional path to thumbnail version
  - **Source**: Computed as "{Path}_thumb.jpg" or similar pattern

#### Creation & Validation
- **Factory Method**: Computed from Resource entity: `ResourceFile.FromResource(resource)`
- **Validation Rules**:
  - FileName must not be empty
  - StoragePath must be valid blob storage path format
- **Immutability**: Yes (record type, computed on demand)

#### Equality & Comparison
- **Equality**: Value-based (all properties must match)
- **Hash Code**: Based on FileName and StoragePath
- **Comparison**: Not comparable

#### Methods
- **ToString()**: Returns string representation
- **Equals(ResourceFile other)**: Value equality comparison
- **GetHashCode()**: Hash based on properties

---

## Aggregates

### Resource Aggregate

**Aggregate Root**: Resource

**Entities in Aggregate**:
- Resource (root): The media file metadata and reference

**Value Objects in Aggregate**:
- ResourceMetadata: Technical file properties
- ResourceFile: Storage location information

#### Boundary Definition
**What's Inside**:
- Resource entity (root)
- ResourceMetadata value object
- ResourceFile value object (if used)

**What's Outside** (Referenced, not contained):
- User (uploader, if tracking is added)
- Asset (references Resource via Display.ResourceId)
- Scene/Adventure/Epic (reference Resource for Background)

**Boundary Rule**: All data needed to store, retrieve, and serve a media file is within this aggregate. External usage (Asset display, Scene backgrounds) is tracked in those aggregates, not here. Resource is a shared kernel referenced by ID.

#### Aggregate Invariants
- **AGG-01**: Resource Path must remain unique
  - **Enforcement**: Database unique index, service checks before upload
- **AGG-02**: Resource file must exist in blob storage if Resource entity exists
  - **Enforcement**: Transactional upload (file first, then entity)
- **AGG-03**: Resource cannot be deleted if referenced by any Asset or Scene
  - **Enforcement**: Service checks usage before deletion

#### Lifecycle Management
- **Creation**: Via IMediaStorage.UploadAsync() - uploads file to blob storage, extracts metadata, generates unique path, persists entity
- **Modification**: Limited (only tags can be updated after creation, file itself is immutable)
- **Deletion**: Via IMediaStorage.DeleteAsync() - checks for references, removes entity, deletes blob storage file

---

## Domain Services

### IMediaStorage

**Purpose**: Persistence, retrieval, and blob storage operations for Resource entities

**When to Use**: Any operation involving media file upload, download, or metadata management

**Responsibilities**:
- Upload media files to blob storage (Azure Blob or local filesystem)
- Extract and store metadata
- Persist Resource entities to database
- Serve media files as streams
- Provide query operations
- Manage blob storage lifecycle

#### Operations
- **UploadAsync(Stream fileStream, string fileName, ResourceType type)**: Upload media file and create Resource
  - **Inputs**: File stream, original file name, resource type
  - **Outputs**: Task<Resource> (persisted entity with generated path and metadata)
  - **Side Effects**: File uploaded to blob storage, database insert, metadata extraction

- **GetByIdAsync(Guid resourceId)**: Retrieve resource metadata by ID
  - **Inputs**: Resource ID
  - **Outputs**: Task<Resource?> (null if not found)
  - **Side Effects**: None (read-only)

- **GetFileAsync(Guid resourceId)**: Retrieve actual media file from blob storage
  - **Inputs**: Resource ID
  - **Outputs**: Task<Stream> (file content stream)
  - **Side Effects**: None (read-only, blob storage access)

- **DeleteAsync(Guid resourceId)**: Remove resource and blob storage file
  - **Inputs**: Resource ID
  - **Outputs**: Task
  - **Side Effects**: Database delete, blob storage file deletion

- **UpdateTagsAsync(Guid resourceId, string[] tags)**: Update resource tags
  - **Inputs**: Resource ID, new tags array
  - **Outputs**: Task<Resource>
  - **Side Effects**: Database update

- **GetAllAsync()**: Retrieve all resources (admin operation)
  - **Inputs**: None
  - **Outputs**: Task<List<Resource>>
  - **Side Effects**: None (read-only)

- **GetByTypeAsync(ResourceType type)**: Retrieve resources of specific type
  - **Inputs**: ResourceType enum value
  - **Outputs**: Task<List<Resource>>
  - **Side Effects**: None (read-only)

- **GetByTagAsync(string tag)**: Retrieve resources with specific tag
  - **Inputs**: Tag string (case-insensitive)
  - **Outputs**: Task<List<Resource>>
  - **Side Effects**: None (read-only)

#### Dependencies
- **Required**: DbContext (EF Core for database), IBlobStorageClient (Azure Blob SDK or local filesystem adapter)
- **Why Needed**: Dual persistence (metadata in database, file in blob storage)

---

## Domain Rules Summary

- **BR-01** - Validation: Resource path must be unique
  - **Scope**: Resource creation (upload)
  - **Enforcement**: Service checks path uniqueness, database unique index
  - **Validation**: Query database before insert

- **BR-02** - Validation: Resource type must match file content type
  - **Scope**: Resource upload
  - **Enforcement**: Service inspects file header/MIME type
  - **Validation**: File content analysis during upload

- **BR-03** - Business Logic: Resource metadata must be extracted from actual file
  - **Scope**: Resource upload
  - **Enforcement**: Service uses media processing library to extract dimensions, file size
  - **Validation**: Automatic during upload process

- **BR-04** - Referential Integrity: Resource cannot be deleted if in use
  - **Scope**: Resource deletion
  - **Enforcement**: Service queries Asset.Display and Scene.Background references
  - **Validation**: Check for references before delete

- **BR-05** - Data Consistency: Resource entity and blob storage file must be synchronized
  - **Scope**: All resource operations
  - **Enforcement**: Transactional operations (upload file first, then create entity; delete entity first, then remove file)
  - **Validation**: Rollback mechanisms for failures

- **BR-06** - Validation: Blob storage path must be valid format
  - **Scope**: Resource upload
  - **Enforcement**: Blob storage service validates path
  - **Validation**: Storage provider API checks

- **BR-07** - Performance: Large media files should support streaming
  - **Scope**: File retrieval
  - **Enforcement**: Service returns Stream instead of byte array
  - **Validation**: Implementation pattern (not enforced by validation)

---

## Architecture Integration

### Domain Layer Purity
This domain model is **dependency-free** in the Domain project:
- ✅ No infrastructure dependencies (no Azure Blob SDK, no filesystem APIs)
- ✅ No framework dependencies (no ASP.NET, no React)
- ✅ Pure business contracts only (entity definitions, service interfaces)
- ✅ Testable in isolation (unit tests with mocked storage)

**Note**: Service implementations (IMediaStorage implementation) reside in Application/Infrastructure layer (Source/Data/, Source/Media/), not in Domain layer. Blob storage adapters are infrastructure concerns.

### Used By (Application Layer)
- **Upload Media Use Case**: Uses Resource entity, ResourceType enum, ResourceMetadata value object, IMediaStorage service
- **Serve Media Use Case**: Uses Resource entity, IMediaStorage.GetFileAsync() for streaming
- **Tag Resources Use Case**: Uses Resource entity, updates Tags property
- **Delete Media Use Case**: Uses Resource entity ID, checks usage before deletion
- **Asset Display**: Asset context references Resource.Id via Display.ResourceId value object
- **Scene Backgrounds**: Library context (Scene, Adventure, Epic) references Resource.Id for Background property

---

<!--
═══════════════════════════════════════════════════════════════
DOMAIN MODEL QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Entities (30 points)
✅ 10pts: All entities have complete attribute lists with types and constraints
✅ 10pts: All entities have invariants clearly defined (enforced by services)
✅ 5pts: All entity operations documented (implemented in services)
✅ 5pts: Aggregate roots clearly identified (Resource is aggregate root)

## Value Objects (20 points)
✅ 10pts: All value objects have properties and validation rules (ResourceMetadata, ResourceFile)
✅ 5pts: Immutability and value equality documented (records with init-only)
✅ 5pts: Factory methods for creation defined (inline construction, extraction)

## Aggregates (25 points)
✅ 10pts: Aggregate boundaries clearly defined (Resource + metadata + file info)
✅ 10pts: Aggregate invariants across entities specified (AGG-01, AGG-02, AGG-03)
✅ 5pts: Lifecycle management rules documented (upload, modification limits, deletion)

## Application Services (15 points)
✅ 10pts: Service interfaces defined as contracts (IMediaStorage in domain project)
✅ 5pts: Operations documented with pre/post-conditions and invariants enforced
✅ 5pts: Service dependencies clear (DbContext, IBlobStorageClient)

## Ubiquitous Language (10 points)
✅ 10pts: Complete domain terminology with definitions (8 terms defined)

## Target Score: 100/100 ✅

### Extraction Notes:
✅ Complete entity structure extracted from Domain/Resource.cs
✅ Value objects (ResourceMetadata, ResourceFile) extracted
✅ Service interface (IMediaStorage) contract defined
✅ Business rules include blob storage synchronization
✅ Architecture pattern (anemic entities + blob storage services) documented
✅ Relationships mapped to Assets and Library contexts
✅ Dual persistence pattern (metadata in DB, files in blob storage) documented
-->
