# Get Resource File Use Case

**Original Request**: Stream media file from blob storage for serving to clients

**Get Resource File** is a streaming operation that retrieves the actual media file content from blob storage. This use case operates within the Media area and enables applications to serve media files to clients for display in Assets, Encounter backgrounds, and other UI contexts.

---

## Change Log
- *2025-10-02* — **1.0.0** — Use case specification created from domain model

---

## Use Case Overview

### Business Context
- **Parent Feature**: Resource Management
- **Owning Area**: Media
- **Business Value**: Enables efficient file delivery with streaming support for large media files
- **User Benefit**: Fast, efficient access to media file content without loading entire files into memory

### Scope Definition
- **Primary Actor**: Application (Assets, Library, or client applications)
- **Scope**: Database lookup followed by blob storage streaming
- **Level**: User Goal (serving actual file content)

---

## UI Presentation

### Presentation Type
- **UI Type**: API_ENDPOINT
- **Access Method**: Programmatic via HTTP GET with streaming response

- **Endpoint**: GET /api/media/resources/:id/file
- **UI Components**: None (API only)
- **Access**: Programmatic via HTTP GET request with streaming support
- **Response Format**: Binary stream with appropriate Content-Type header (image/png, video/mp4, etc.)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: MediaStorageService.GetFileAsync(Guid resourceId)
- **Domain Entities**: Resource (aggregate root for path lookup)
- **Domain Services**: None (infrastructure streaming operation)
- **Infrastructure Dependencies**: DbContext, IBlobStorageClient

### Hexagonal Architecture
- **Primary Port Operation**: IMediaStorage.GetFileAsync(Guid resourceId)
- **Secondary Port Dependencies**:
  - IResourceRepository.FindByIdAsync(resourceId) → Retrieve Resource.Path
  - IBlobStorageClient.DownloadStreamAsync(path) → Stream file from blob storage
- **Adapter Requirements**: Azure Blob Storage adapter or local filesystem adapter

### DDD Alignment
- **Bounded Context**: Media
- **Ubiquitous Language**: Resource file, stream, blob storage, file retrieval
- **Business Invariants**:
  - Resource entity must exist before file can be retrieved
  - Path must represent valid blob storage location (INV-04)
- **Domain Events**: None (read-only operation)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - resourceId: Guid (required, unique identifier)
- **Input Validation**:
  - resourceId: Must not be empty Guid (Guid.Empty)
- **Preconditions**:
  - User has read permissions (authorization handled by API layer)
  - Resource entity exists in database
  - Blob storage file exists at Resource.Path
  - Blob storage is accessible

### Business Logic
- **Business Rules**:
  - BR-07: Large media files should support streaming (return Stream instead of byte array)
  - BR-05: Resource entity and blob storage file must be synchronized (file must exist if entity exists)
- **Processing Steps**:
  1. Validate resourceId is not empty Guid
  2. Query database for Resource entity by Id
  3. If Resource not found, return 404 error
  4. Extract Resource.Path property
  5. Request file stream from blob storage using path
  6. Return stream to caller (API layer sets Content-Type from Resource.Metadata.ContentType)
- **Domain Coordination**: Resource aggregate provides Path for blob storage lookup
- **Validation Logic**: Guid validation, Resource existence check, blob storage file existence check

### Output Specification
- **Output Data**:
  - Success: Stream of file content with Content-Type header (from Resource.Metadata.ContentType)
  - Not Found: null stream or 404 error
  - Error: { error: string, code: string }
- **Output Format**: Binary stream (image/png, video/mp4, etc.)
- **Postconditions**: None (read-only, no state changes)

### Error Scenarios
- **Empty Resource ID**: Return 400 Bad Request, "Resource ID cannot be empty"
- **Resource Not Found**: Return 404 Not Found, "Resource with ID {resourceId} not found"
- **Blob Storage File Not Found**: Return 404 Not Found, "Resource file not found in storage (path: {path})"
- **Blob Storage Unavailable**: Return 503 Service Unavailable, "Media storage is temporarily unavailable"
- **Database Unavailable**: Return 503 Service Unavailable, "Database is temporarily unavailable"
- **Stream Read Error**: Return 500 Internal Server Error, "Failed to retrieve resource file"

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```csharp
  public interface IMediaStorage
  {
      Task<Stream> GetFileAsync(Guid resourceId);
  }

  public interface IBlobStorageClient
  {
      Task<Stream> DownloadStreamAsync(string path);
  }
  ```
- **Data Access Patterns**: Repository lookup for Resource.Path, blob storage streaming for file content
- **External Integration**: Azure Blob Storage SDK (BlobClient.OpenReadAsync) or filesystem streaming
- **Performance Requirements**:
  - Database lookup <50ms
  - Stream initiation <200ms
  - Support streaming for files up to 1GB without loading into memory
  - Use Azure Blob Storage server-side caching where available

### Architecture Compliance
- **Layer Responsibilities**:
  - API: Accept GET request, authorize user, call MediaStorageService, stream response with Content-Type header
  - Application: Orchestrate lookup and streaming, coordinate Resource and BlobStorageClient
  - Domain: Provide Resource.Path and Resource.Metadata.ContentType
  - Infrastructure: Execute blob storage streaming via Azure SDK or filesystem
- **Dependency Direction**: API → Application → Domain ← Infrastructure
- **Interface Abstractions**: IBlobStorageClient for storage provider abstraction
- **KISS Validation**: Simple path lookup and streaming, no complex caching or transformation

### Testing Strategy
- **Unit Testing**:
  - Test empty Guid validation
  - Test Resource not found handling
  - Test blob storage client call with correct path
- **Integration Testing**:
  - Test full streaming flow with test blob storage (Azurite)
  - Test large file streaming (>100MB) without memory overflow
  - Test concurrent streams from multiple clients
  - Test file not found scenario when entity exists but blob missing
- **Acceptance Criteria**: See section below
- **BDD Scenarios**:
  - Given existing resource, When GetFileAsync called, Then file stream returned with correct Content-Type
  - Given non-existent resource, When GetFileAsync called, Then 404 error returned
  - Given resource entity exists but blob missing, When GetFileAsync called, Then 404 error with path details

---

## Acceptance Criteria

- **AC-01**: Successful file stream retrieval for existing resource
  - **Given**: Resource exists with ID "12345678-1234-1234-1234-123456789abc" and path "Image/guid/encounter.png"
  - **When**: GetFileAsync called with resource ID
  - **Then**: File stream returned, API response has Content-Type "image/png", stream contains file bytes

- **AC-02**: Not found handling for non-existent resource
  - **Given**: No resource exists with ID "00000000-0000-0000-0000-000000000000"
  - **When**: GetFileAsync called
  - **Then**: 404 error returned "Resource with ID {resourceId} not found"

- **AC-03**: Blob file missing scenario (data inconsistency)
  - **Given**: Resource entity exists but blob storage file was deleted manually
  - **When**: GetFileAsync called
  - **Then**: 404 error returned "Resource file not found in storage (path: {path})"

- **AC-04**: Streaming large files without memory overflow
  - **Given**: Resource file is 500MB video
  - **When**: GetFileAsync called
  - **Then**: Stream returned without loading entire file into memory, memory usage remains constant during streaming

- **AC-05**: Content-Type header set from metadata
  - **Given**: Resource has Metadata.ContentType="video/mp4"
  - **When**: GetFileAsync called and API responds
  - **Then**: HTTP response Content-Type header is "video/mp4"

- **AC-06**: Concurrent streaming support
  - **Given**: Multiple clients request same resource simultaneously
  - **When**: GetFileAsync called concurrently by 10 clients
  - **Then**: All clients receive independent streams, no locking or errors

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: API endpoint → MediaStorageService → Repository (path lookup) → BlobStorageClient (streaming)
- **Code Organization**:
  - Service: Source/Media/Services/MediaStorageService.cs
  - Blob Client: Source/Infrastructure/Storage/BlobStorageClient.cs
  - API Controller: Source/API/Controllers/MediaController.cs
- **Testing Approach**: XUnit for unit tests, Azurite (Azure Blob emulator) for integration tests

### Dependencies
- **Technical Dependencies**:
  - Azure.Storage.Blobs NuGet package for streaming (BlobClient.OpenReadAsync)
  - EF Core DbContext for Resource.Path lookup
  - ASP.NET Core FileStreamResult for API response streaming
- **Area Dependencies**: None (self-contained operation)
- **External Dependencies**:
  - Azure Blob Storage account (or Azurite for development)
  - Database for Resource.Path lookup

### Architectural Considerations
- **Area Boundary Respect**: Media area owns file streaming, Assets/Library areas call via IMediaStorage interface
- **Interface Design**: Return Stream for efficiency, caller responsible for disposing stream
- **Error Handling**:
  - Return 404 for both resource not found and blob file not found
  - Log data inconsistency errors (entity exists but blob missing) for investigation
- **Performance Considerations**:
  - Use Azure Blob Storage streaming APIs (OpenReadAsync) to avoid memory loading
  - Consider Azure CDN integration for frequently accessed resources
  - Set appropriate HTTP cache headers (Cache-Control, ETag) in API layer
  - Use blob storage server-side caching (Azure Blob Storage hot/cool tiers)
- **Security Considerations**:
  - Authorize user before streaming file
  - Use SAS tokens or managed identity for blob storage access (no storage keys in code)
  - Consider presigned URLs for direct client access to reduce server load

---

This Get Resource File use case provides comprehensive implementation guidance for efficient file streaming within the Media area while maintaining performance and scalability for large media files.
