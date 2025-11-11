# Upload Resource Use Case

**Original Request**: Upload media file to blob storage and create Resource entity with metadata

**Upload Resource** is a storage operation that uploads a media file to blob storage, extracts metadata, and creates a Resource entity. This use case operates within the Media area and enables Game Masters to store media resources for use throughout the application.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables centralized media storage with automatic metadata extraction
- **User Benefit**: Upload images, animations, and videos with automatic technical property extraction

### Scope Definition
- **Primary Actor**: Game Master
- **Scope**: Complete file upload flow from submission to entity persistence with metadata
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP/GraphQL

- **Endpoint**: POST /api/media/resources
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP multipart/form-data upload
- **Response Format**: JSON with Resource entity (Id, Type, Path, Metadata, Tags)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.UploadAsync(UploadResourceCommand)
- **Domain Entities**: Resource (aggregate root), ResourceMetadata (value object)
- **Domain Services**: IMediaMetadataExtractor, IPathGenerator
- **Infrastructure Dependencies**: IBlobStorageClient, DbContext, IMediaMetadataExtractor implementation

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.UploadAsync(Stream fileStream, string fileName, ResourceType type)
- **Secondary Port Dependencies**:
  - IBlobStorageClient.UploadAsync(stream, path) → Upload file to blob storage
  - IMediaMetadataExtractor.ExtractAsync(stream) → Extract dimensions, file size, content type
  - IPathGenerator.GenerateUniquePath(fileName) → Generate unique storage path
  - IResourceRepository.CreateAsync(resource) → Persist Resource entity
- **Adapter Requirements**: Azure Blob Storage adapter (or local filesystem), ImageSharp adapter for image metadata, FFmpeg adapter for video metadata

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: Upload, resource, blob storage, metadata extraction, path generation
- **Business Invariants**:
  - Path must be unique across all resources (INV-01)
  - Type must match actual file content type (INV-02)
  - Metadata dimensions must match actual media file dimensions (INV-03)
  - Path must represent valid blob storage location (INV-04)
- **Domain Events**: ResourceUploaded(resourceId, path, type, timestamp) [future implementation]

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - fileStream: Stream (required, media file content)
  - fileName: string (required, original file name with extension)
  - type: ResourceType enum (required, Undefined | Image | Animation | Video)
  - tags: string[] (optional, initial tags for organization)
- **Input Validation**:
  - fileStream: Must not be null, must be readable, must have positive length
  - fileName: Non-empty, valid file name format, contains extension
  - type: Must be valid ResourceType enum value
  - tags: Each tag max length 50 characters, alphanumeric with spaces/hyphens
- **Preconditions**:
  - User has upload permissions (authorization handled by API layer)
  - Blob storage is accessible and configured
  - Database is accessible

### Business Logic
- **Business Rules**:
  - BR-01: Resource path must be unique (enforce via generated GUID-based path)
  - BR-02: Resource type must match file content type (validate MIME type against ResourceType)
  - BR-03: Resource metadata must be extracted from actual file (dimensions, file size, content type)
  - BR-05: Resource entity and blob storage file must be synchronized (transactional: upload file first, then create entity with rollback on failure)
  - BR-06: Blob storage path must be valid format (validate via blob storage API)
- **Processing Steps**:
  1. Validate input parameters (file stream readable, fileName valid, type valid)
  2. Generate unique storage path using GUID: `{type}/{guid}/{fileName}`
  3. Extract metadata from file stream (width, height, file size, content type, encoding)
  4. Validate type matches content type (e.g., type=Image requires image/* MIME type)
  5. Upload file stream to blob storage at generated path
  6. Create Resource entity with path, type, metadata, tags
  7. Persist Resource entity to database
  8. Return persisted Resource entity
  9. On error: Rollback blob storage upload if entity creation fails
- **Domain Coordination**:
  - Resource aggregate root created with all properties
  - ResourceMetadata value object populated from extracted metadata
  - Path uniqueness enforced by GUID generation
- **Validation Logic**:
  - Content type validation: image/* for Image, video/* for Video, image/gif or video/* for Animation
  - File size limits: configurable max file size (e.g., 50MB for images, 500MB for videos)
  - Path format validation: blob storage provider validates path structure

### Output Specification
- **Output Data**:
  - Success: Resource entity with Id, Type, Path, Metadata (Width, Height, FileSize, ContentType, Encoding), Tags
  - Error: { error: string, code: string, details?: object }
- **Output Format**: JSON representation of Resource entity
- **Postconditions**:
  - On success: File uploaded to blob storage, Resource entity persisted, unique path assigned, metadata populated
  - On error: No Resource entity created, blob storage file removed if upload succeeded but entity creation failed

### Error Scenarios
- **Empty File Stream**: Return 400 Bad Request, "File stream is empty or null"
- **Invalid File Name**: Return 400 Bad Request, "File name is invalid or missing extension"
- **Invalid Resource Type**: Return 400 Bad Request, "Resource type must be Image, Animation, or Video"
- **Type Content Type Mismatch**: Return 400 Bad Request, "File content type does not match specified resource type"
- **File Too Large**: Return 413 Payload Too Large, "File size exceeds maximum allowed size of {maxSize}MB"
- **Metadata Extraction Failed**: Return 422 Unprocessable Entity, "Failed to extract metadata from file. File may be corrupted."
- **Blob Storage Upload Failed**: Return 502 Bad Gateway, "Failed to upload file to storage. Please try again."
- **Duplicate Path Collision**: Return 500 Internal Server Error, "Path generation collision" (retry with new GUID)
- **Database Persistence Failed**: Return 500 Internal Server Error, "Failed to save resource metadata. Upload rolled back."
- **Blob Storage Unavailable**: Return 503 Service Unavailable, "Media storage is temporarily unavailable"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<Resource> UploadAsync(Stream fileStream, string fileName, ResourceType type, string[]? tags = null);
  }

  public class UploadResourceCommand
  {
      public Stream FileStream { get; init; }
      public string FileName { get; init; }
      public ResourceType Type { get; init; }
      public string[]? Tags { get; init; }
  }
  ```
- **Data Access Patterns**: Repository pattern for Resource creation, blob storage client for file upload
- **External Integration**: Azure Blob Storage SDK (Azure.Storage.Blobs) or local filesystem adapter
- **Performance Requirements**:
  - File upload completes within 30s for files up to 100MB
  - Metadata extraction <1s for images, <5s for videos
  - Total operation time <35s for large files

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept multipart/form-data, authorize user, call MediaStorageService
  - Application: Orchestrate upload flow, coordinate services, enforce business rules
  - Domain: Define Resource aggregate, ResourceType enum, validation rules
  - Infrastructure: Implement blob storage upload, metadata extraction, database persistence
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IBlobStorageClient, IMediaMetadataExtractor, IResourceRepository
- **KISS Validation**: Direct file upload with metadata extraction, no complex state machines

### Testing Strategy
- **Unit Testing**:
  - Test path generation uniqueness
  - Test type/content type validation logic
  - Test metadata extraction with mock files
  - Test error handling for invalid inputs
- **Integration Testing**:
  - Test full upload flow with test blob storage container
  - Test transaction rollback when entity creation fails
  - Test metadata extraction with real image/video files
  - Test duplicate path handling (extremely rare but should retry)
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given valid image file, When upload requested, Then file uploaded to blob storage and Resource entity created
  - Given file with type mismatch, When upload requested, Then validation error returned
  - Given blob storage unavailable, When upload requested, Then service unavailable error returned

---

## Acceptance Criteria

- **AC-01**: Successful image upload with metadata extraction
  - **Given**: Valid PNG image file (1920x1080, 2MB) with fileName "encounter_background.png" and type Image
  - **When**: UploadAsync called with file stream
  - **Then**: File uploaded to blob storage at generated path, Resource entity created with extracted metadata (Width=1920, Height=1080, FileSize=2MB, ContentType="image/png"), ResourceUploaded event published

- **AC-02**: Path uniqueness enforcement via GUID generation
  - **Given**: Multiple uploads with same fileName "image.png"
  - **When**: UploadAsync called twice with identical file names
  - **Then**: Each upload generates unique path with different GUIDs (e.g., "Image/{guid1}/image.png", "Image/{guid2}/image.png")

- **AC-03**: Type content type mismatch rejection
  - **Given**: Video file with type specified as Image
  - **When**: UploadAsync called
  - **Then**: Validation error returned "File content type 'video/mp4' does not match specified resource type 'Image'"

- **AC-04**: Metadata extraction for video files
  - **Given**: Valid MP4 video file (1280x720, 10MB, H.264 encoding)
  - **When**: UploadAsync called with type Video
  - **Then**: Metadata extracted includes Width=1280, Height=720, FileSize=10MB, ContentType="video/mp4", Encoding="H.264"

- **AC-05**: Transaction rollback on entity creation failure
  - **Given**: Valid image file, blob storage upload succeeds, database save fails
  - **When**: UploadAsync encounters database error
  - **Then**: Blob storage file deleted, error returned "Failed to save resource metadata. Upload rolled back."

- **AC-06**: Tag assignment during upload
  - **Given**: Valid image file with tags ["fantasy", "dungeon", "dark"]
  - **When**: UploadAsync called with tags parameter
  - **Then**: Resource entity created with Tags array ["fantasy", "dungeon", "dark"]

- **AC-07**: File size limit enforcement
  - **Given**: Image file exceeding configured max size (e.g., 60MB when limit is 50MB)
  - **When**: UploadAsync called
  - **Then**: 413 error returned "File size exceeds maximum allowed size of 50MB"

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → BlobStorageClient + MetadataExtractor + Repository
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Interfaces: Source/Domain/Media/IMediaStorage.cs, Source/Infrastructure/IBlobStorageClient.cs
  - Entity: Source/Domain/Media/Resource.cs
- **Testing Approach**: XUnit for unit tests, TestContainers for integration tests with Azurite (Azure Blob Storage emulator)

### Dependencies
- **Technical Dependencies**:
  - Azure.Storage.Blobs NuGet package (or local filesystem adapter)
  - SixLabors.ImageSharp for image metadata extraction
  - FFmpeg wrapper (Xabe.FFmpeg or FFMpegCore) for video metadata extraction
  - EF Core DbContext for Resource entity persistence
- **Area Dependencies**: None (Media is foundational storage)
- **External Dependencies**:
  - Azure Blob Storage account (or local Azurite for development)
  - Database (SQL Server via EF Core)

### Architectural Considerations
- **Area Boundary Respect**: Media area owns all storage operations, other areas only reference Resource.Id
- **Interface Design**: IMediaStorage returns Resource entity, no exposure of blob storage details
- **Error Handling**: Transactional operations with rollback, clear error messages for client
- **Security Considerations**:
  - Validate file content type matches declared type (prevent malicious file uploads)
  - Enforce file size limits to prevent DOS attacks
  - Sanitize file names to prevent path traversal attacks
  - Use GUID-based paths to prevent predictable resource URLs

---

This Upload Resource use case provides comprehensive implementation guidance for media file upload with metadata extraction within the Media area while maintaining transactional integrity and security best practices.
