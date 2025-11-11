# Feature: Public Library Management

**Area**: Admin
**Status**: Planned
**Priority**: High
**Effort Estimate**: 40 hours (22h backend + 12h frontend + 6h testing)
**Dependencies**: EPIC-001 Phase 5 (Content Management - Assets), EPIC-001 Phase 7 (Adventures), EPIC-001 Phase 8 (Encounters)

## Overview

Content management system for system-owned public library assets in the VTT Tools Admin Application. Enables administrators to upload, publish, and manage adventures, assets, and encounters that are available to all users through the public library. Prepares data model for future e-commerce features (EPIC-003) by including pricing fields, but does NOT implement payment processing.

## Business Context

### Problem Statement

System administrators need:
- Centralized interface to upload and manage public content (adventures, assets, encounters)
- Ability to control content visibility (Draft, Public, Premium)
- Preparation for future commercialization (pricing fields) without implementing payments yet
- Bulk operations for efficient content management
- Preview and quality control before publishing to public library
- Analytics on content downloads and usage

### Target Users

- **System Administrators**: Full content management access
- **Content Curators**: Upload and edit content (future role)

### Success Metrics

- Admin can publish new content within 5 minutes
- Content appears in public library within 30 seconds of publishing
- Zero unauthorized access to draft content
- 100% of content changes audited
- Content downloads tracked for analytics

## Functional Requirements

### FR-001: Content Library View
**Priority**: Critical

Display searchable, filterable, paginated list of all system-owned content.

**Acceptance Criteria**:
- MUI DataGrid displays content with columns:
  - Thumbnail (64x64px preview image)
  - Name
  - Type (Adventure, Asset, Encounter)
  - Status (Draft, Public, Premium)
  - Category (Fantasy, Sci-Fi, Modern, etc.)
  - Price (display only, USD)
  - Downloads (count)
  - Created Date
  - Published Date
  - Actions (Edit, Publish/Unpublish, Delete)
- Server-side pagination (50 items per page)
- Search bar (debounced 300ms): Search by name, description
- Filters (sidebar):
  - Content Type: Multi-select (Adventure, Asset, Encounter)
  - Status: Multi-select (Draft, Public, Premium)
  - Category: Multi-select (dynamic list based on content type)
  - Price Range: Min/Max input (for Premium content)
- Sort by: Name, Created Date, Published Date, Downloads (ascending/descending)
- Bulk selection with checkboxes
- Bulk actions dropdown:
  - Publish Selected (Draft → Public/Premium)
  - Unpublish Selected (Public/Premium → Draft)
  - Delete Selected (confirmation required)
- Click row to open content detail dialog

### FR-002: Content Upload/Create
**Priority**: Critical

Upload new system-owned content to the public library.

**Acceptance Criteria**:
- "Upload Content" button in toolbar
- Upload dialog:
  - **Content Type**: Radio buttons (Adventure, Asset, Encounter)
  - **File Upload**:
    - Drag-and-drop zone with progress bar
    - Multiple file support (for assets with multiple images)
    - Max file size validation (50MB for assets, 100MB for adventures)
    - Allowed file types based on content type:
      - Adventures: .json, .zip (campaign export format)
      - Assets: .png, .jpg, .svg, .mp3, .mp4, .pdf
      - Encounters: .json (encounter export format)
  - **Metadata**:
    - Name: Text input (required, 3-100 chars)
    - Description: Multiline text (optional, max 1000 chars, markdown support)
    - Category: Dropdown (Fantasy, Sci-Fi, Modern, Horror, Historical, Other)
    - Tags: Multi-select chips (searchable, create new tags)
  - **Preview Images**:
    - Upload up to 5 preview images (drag-and-drop)
    - First image becomes thumbnail
    - Crop/resize preview (aspect ratio 16:9 recommended)
  - **Availability Status** (default: Draft):
    - Radio buttons: Draft, Public, Premium
    - If Premium: Price field required (decimal, USD)
- Upload button processes files:
  - Uploads to blob storage
  - Creates database entry with OwnerId = null (system-owned)
  - Sets status to Draft initially
  - Success toast: "Content uploaded successfully"
  - Opens content detail dialog for further editing
- Validation errors displayed inline
- Audit log entry created

### FR-003: Content Editor
**Priority**: Critical

Edit content metadata, availability status, and pricing.

**Acceptance Criteria**:
- Content detail dialog with tabs:
  - **Details Tab**:
    - Name: Text input (editable)
    - Description: Rich text editor or markdown editor
    - Category: Dropdown (editable)
    - Tags: Multi-select chips (add/remove)
    - Created Date: Read-only
    - Published Date: Read-only (null if not published)
    - Downloads Count: Read-only
  - **Availability Tab**:
    - Status: Radio buttons (Draft, Public, Premium)
    - If **Draft**: Not visible in public library (work in progress)
    - If **Public**: Free content, visible to all users in public library
    - If **Premium**: Paid content (visible in public library with "Premium" badge)
    - Price: Number input (decimal, USD, visible only if Premium)
    - Currency: Dropdown (USD, EUR, GBP) - for EPIC-003 use
    - Helper text: "Payment processing deferred to EPIC-003. Price is display-only for now."
  - **Preview Images Tab**:
    - Gallery of uploaded preview images
    - Upload additional images (max 5 total)
    - Delete image button
    - Set as thumbnail button (drag to reorder)
  - **Files Tab** (for adventures/encounters):
    - List of associated files (JSON, images, etc.)
    - Download file button
    - Replace file button (re-upload)
- Save button updates content
- Publish button (visible only if status = Draft):
  - Confirmation dialog: "Publish {name} to public library? Users will see this content immediately."
  - Changes status to Public or Premium
  - Sets PublishedDate to current timestamp
- Unpublish button (visible only if status = Public/Premium):
  - Confirmation dialog: "Unpublish {name}? Users will no longer see this in public library."
  - Changes status to Draft
  - Clears PublishedDate
- Delete button:
  - Confirmation dialog: "Delete {name}? This action cannot be undone. {downloads} users have downloaded this content."
  - Soft delete (sets IsDeleted flag, not hard delete)
- Audit log entry per action

### FR-004: Content Preview
**Priority**: Medium

Preview content before publishing to verify quality.

**Acceptance Criteria**:
- "Preview" button in content detail dialog
- Preview mode depends on content type:
  - **Adventures**: Display campaign structure (acts, encounters, NPCs) in read-only view
  - **Assets**: Display image/audio/video player
  - **Encounters**: Render encounter on canvas with grid, walls, tokens (read-only)
- Preview opens in full-screen modal or new browser tab
- "Close Preview" button returns to content editor
- Preview does NOT affect content status (stays Draft)

### FR-005: Content Analytics
**Priority**: Medium

Track content downloads and usage for analytics.

**Acceptance Criteria**:
- Analytics tab in content detail dialog:
  - **Download Statistics**:
    - Total downloads (count)
    - Downloads last 7 days (count)
    - Downloads last 30 days (count)
    - Downloads trend chart (line graph, daily downloads over last 30 days)
  - **Top Downloaders** (if available):
    - List of users who downloaded this content (email, download date)
    - Privacy note: "Only shown for Premium content for analytics purposes"
  - **Revenue Projection** (for Premium content):
    - Price x Downloads = Projected revenue
    - Note: "Actual revenue tracking in EPIC-003"
- Analytics updated in real-time (or cached for 5 minutes)
- No editing allowed in analytics tab (read-only)

### FR-006: Category and Tag Management
**Priority**: Low

Manage content categories and tags for better organization.

**Acceptance Criteria**:
- Settings button in content library toolbar
- Settings dialog:
  - **Categories**:
    - List of categories (Fantasy, Sci-Fi, Modern, Horror, Historical, Other)
    - Add new category: Text input + Add button
    - Delete category: Confirmation required, only if no content uses it
    - Rename category: Inline edit
  - **Tags**:
    - List of all tags used in content
    - Delete tag: Confirmation required
    - Merge tags: Select 2+ tags, merge into single tag
- Save button updates categories/tags globally
- Audit log entry per change

## Non-Functional Requirements

### NFR-001: Performance
- Content library loads within 2 seconds for 10,000 items
- Upload 50MB file completes within 30 seconds (depends on bandwidth)
- Publish content appears in public library within 30 seconds (cache refresh)
- Search results appear within 500ms (debounced)

### NFR-002: Security
- All operations require Administrator role
- Draft content NOT accessible via public library API
- Premium content accessible in library but payment not required (EPIC-003)
- Blob storage URLs signed with short expiration (SAS tokens for Azure, presigned URLs for S3)
- Content deletion is soft delete (preserve audit trail)

### NFR-003: Usability
- Drag-and-drop file upload with progress bar
- Thumbnail preview in content list (lazy-loaded)
- Confirmation dialogs for destructive actions (delete, unpublish)
- Success/error toast notifications
- Loading skeletons while fetching data

### NFR-004: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatible
- Keyboard navigation (tab order, enter to select)
- Sufficient color contrast for status badges

## Technical Design

### Frontend Components

**Component Structure**:
```
WebAdminApp/src/features/publicLibrary/
├── ContentLibraryView.tsx         # Main view with DataGrid
├── ContentUploadDialog.tsx        # Upload new content
├── ContentDetailDialog.tsx        # Edit content (tabs)
├── ContentPreviewDialog.tsx       # Preview content
├── ContentAnalyticsTab.tsx        # Analytics tab
├── CategoryTagSettingsDialog.tsx  # Manage categories/tags
└── components/
    ├── ContentStatusBadge.tsx     # Draft/Public/Premium indicator
    ├── ContentTypeIcon.tsx        # Adventure/Asset/Encounter icon
    ├── FileUploadZone.tsx         # Drag-and-drop upload
    ├── PreviewImageGallery.tsx    # Image gallery editor
    └── DownloadsChart.tsx         # Downloads trend chart
```

**State Management**:
- RTK Query for content fetching/updating
- Local state for dialog open/close, file upload progress
- Form state with React Hook Form + Yup validation

### Backend Endpoints

**REST API** (`/api/admin/public-library`):

1. `GET /api/admin/public-library/content?page={page}&pageSize={pageSize}&type={type}&status={status}&category={category}&search={search}&sortBy={column}&sortOrder={asc|desc}`
   - Returns: `{ content: PublicContentDto[], totalCount: int, page: int, pageSize: int }`
   - Authorization: [Authorize(Roles = "Administrator")]

2. `GET /api/admin/public-library/content/{contentId}`
   - Returns: `PublicContentDetailDto`
   - Authorization: [Authorize(Roles = "Administrator")]

3. `POST /api/admin/public-library/content`
   - Request body: `CreatePublicContentRequest { Type, Name, Description, Category, Tags, Files }`
   - Multipart form-data for file upload
   - Returns: `PublicContentDto`

4. `PUT /api/admin/public-library/content/{contentId}`
   - Request body: `UpdatePublicContentRequest { Name, Description, Category, Tags, Status, Price }`
   - Returns: `PublicContentDto`

5. `POST /api/admin/public-library/content/{contentId}/publish`
   - Returns: `{ success: bool, message: string }`
   - Side effect: Sets PublishedDate, updates cache

6. `POST /api/admin/public-library/content/{contentId}/unpublish`
   - Returns: `{ success: bool, message: string }`
   - Side effect: Clears PublishedDate, updates cache

7. `DELETE /api/admin/public-library/content/{contentId}`
   - Returns: `{ success: bool, message: string }`
   - Soft delete: Sets IsDeleted flag

8. `POST /api/admin/public-library/content/bulk-publish`
   - Request body: `{ contentIds: Guid[] }`
   - Returns: `{ successCount: int, failedCount: int, errors: string[] }`

9. `POST /api/admin/public-library/content/bulk-unpublish`
   - Request body: `{ contentIds: Guid[] }`
   - Returns: `{ successCount: int, failedCount: int, errors: string[] }`

10. `DELETE /api/admin/public-library/content/bulk-delete`
    - Request body: `{ contentIds: Guid[] }`
    - Returns: `{ successCount: int, failedCount: int, errors: string[] }`

11. `GET /api/admin/public-library/content/{contentId}/analytics`
    - Returns: `ContentAnalyticsDto { TotalDownloads, Downloads7Days, Downloads30Days, DailyDownloads[], TopDownloaders[] }`

12. `POST /api/admin/public-library/content/{contentId}/preview-images`
    - Multipart form-data for image upload
    - Returns: `{ imageUrl: string }`

13. `DELETE /api/admin/public-library/content/{contentId}/preview-images/{imageId}`
    - Returns: `{ success: bool }`

14. `GET /api/admin/public-library/categories`
    - Returns: `CategoryDto[]`

15. `POST /api/admin/public-library/categories`
    - Request body: `{ name: string }`
    - Returns: `CategoryDto`

16. `DELETE /api/admin/public-library/categories/{categoryId}`
    - Returns: `{ success: bool }` (fails if content uses category)

17. `GET /api/admin/public-library/tags`
    - Returns: `TagDto[]`

18. `DELETE /api/admin/public-library/tags/{tagId}`
    - Returns: `{ success: bool }`

**DTOs**:
```csharp
public record PublicContentDto {
    public Guid Id { get; init; }
    public string Type { get; init; } // "Adventure", "Asset", "Encounter"
    public string Name { get; init; }
    public string Description { get; init; }
    public string Category { get; init; }
    public string[] Tags { get; init; }
    public string Status { get; init; } // "Draft", "Public", "Premium"
    public decimal? Price { get; init; }
    public string Currency { get; init; } // "USD", "EUR", "GBP"
    public string ThumbnailUrl { get; init; }
    public int Downloads { get; init; }
    public DateTime CreatedDate { get; init; }
    public DateTime? PublishedDate { get; init; }
}

public record PublicContentDetailDto : PublicContentDto {
    public string[] PreviewImageUrls { get; init; }
    public string[] FileUrls { get; init; } // Associated content files
    public Guid CreatedBy { get; init; } // Admin who uploaded
    public DateTime LastModified { get; init; }
}

public record ContentAnalyticsDto {
    public int TotalDownloads { get; init; }
    public int Downloads7Days { get; init; }
    public int Downloads30Days { get; init; }
    public DailyDownloadDto[] DailyDownloads { get; init; }
    public TopDownloaderDto[] TopDownloaders { get; init; }
    public decimal ProjectedRevenue { get; init; } // Price * TotalDownloads
}

public record DailyDownloadDto {
    public DateTime Date { get; init; }
    public int Count { get; init; }
}

public record TopDownloaderDto {
    public string UserEmail { get; init; }
    public DateTime DownloadDate { get; init; }
}
```

### Service Layer

**Interface**: `IPublicLibraryAdminService`

**Implementation**: `PublicLibraryAdminService`
- Uses Entity Framework Core for querying PublicContent table
- Uses `IBlobStorageService` for file uploads (assets, preview images)
- Uses `IAuditLogService` to record all admin actions
- Uses `IMemoryCache` to cache published content (TTL: 30 seconds)
- Publishes cache invalidation events when content published/unpublished

**Database Schema**:
```sql
CREATE TABLE PublicContent (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Type NVARCHAR(50) NOT NULL, -- "Adventure", "Asset", "Encounter"
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Category NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft', -- "Draft", "Public", "Premium"
    Price DECIMAL(10, 2) NULL,
    Currency NVARCHAR(3) NULL DEFAULT 'USD',
    ThumbnailBlobId NVARCHAR(100) NULL,
    OwnerId UNIQUEIDENTIFIER NULL, -- NULL for system-owned content
    Downloads INT NOT NULL DEFAULT 0,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL, -- Admin user ID
    PublishedDate DATETIME2 NULL,
    LastModified DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE INDEX IX_PublicContent_Status ON PublicContent(Status);
CREATE INDEX IX_PublicContent_Type ON PublicContent(Type);
CREATE INDEX IX_PublicContent_Category ON PublicContent(Category);
CREATE INDEX IX_PublicContent_PublishedDate ON PublicContent(PublishedDate);

CREATE TABLE PublicContentTags (
    PublicContentId UNIQUEIDENTIFIER NOT NULL,
    TagName NVARCHAR(50) NOT NULL,
    PRIMARY KEY (PublicContentId, TagName),
    FOREIGN KEY (PublicContentId) REFERENCES PublicContent(Id) ON DELETE CASCADE
);

CREATE TABLE PublicContentPreviewImages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PublicContentId UNIQUEIDENTIFIER NOT NULL,
    BlobId NVARCHAR(100) NOT NULL,
    DisplayOrder INT NOT NULL,
    FOREIGN KEY (PublicContentId) REFERENCES PublicContent(Id) ON DELETE CASCADE
);

CREATE TABLE PublicContentFiles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PublicContentId UNIQUEIDENTIFIER NOT NULL,
    BlobId NVARCHAR(100) NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileSizeBytes BIGINT NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    FOREIGN KEY (PublicContentId) REFERENCES PublicContent(Id) ON DELETE CASCADE
);

CREATE TABLE PublicContentDownloads (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PublicContentId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    DownloadDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (PublicContentId) REFERENCES PublicContent(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PublicContentDownloads_PublicContentId ON PublicContentDownloads(PublicContentId);
CREATE INDEX IX_PublicContentDownloads_UserId ON PublicContentDownloads(UserId);
CREATE INDEX IX_PublicContentDownloads_DownloadDate ON PublicContentDownloads(DownloadDate);
```

## Testing Strategy

### Unit Tests (Backend)
**Target**: 80% coverage

**Test Suites**:
- `PublicLibraryAdminServiceTests.cs`:
  - GetPublicContentAsync_NoFilters_ReturnsAllPublic
  - GetPublicContentAsync_FilterByStatus_ReturnsFiltered
  - GetContentByIdAsync_ValidId_ReturnsDetail
  - CreateContentAsync_ValidData_CreatesContent
  - CreateContentAsync_SetsOwnerIdNull_SystemOwned
  - UpdateContentAsync_ValidData_UpdatesContent
  - PublishContentAsync_DraftContent_SetsPublishedDate
  - UnpublishContentAsync_PublicContent_ClearsPublishedDate
  - DeleteContentAsync_ExistingContent_SoftDeletes
  - BulkPublishAsync_MultipleContent_PublishesAll
  - GetAnalyticsAsync_ValidContentId_ReturnsDownloadStats
  - UploadPreviewImageAsync_ValidImage_SavesBlob

### Unit Tests (Frontend)
**Target**: 70% coverage

**Test Suites**:
- `ContentLibraryView.test.tsx`:
  - Renders content list with data
  - Filters by content type
  - Searches by name
  - Opens content detail on row click
  - Bulk selects and publishes content
- `ContentUploadDialog.test.tsx`:
  - Validates required fields
  - Uploads file with progress
  - Creates content on submit
- `ContentDetailDialog.test.tsx`:
  - Displays content data
  - Edits name and description
  - Publishes content (confirmation)
  - Unpublishes content (confirmation)
  - Deletes content (confirmation)
- `ContentAnalyticsTab.test.tsx`:
  - Displays download statistics
  - Renders downloads chart

### BDD E2E Tests
**Framework**: Cucumber + Playwright

**Feature File**: `AdminPublicLibraryManagement.feature`

**Critical Scenarios**:
1. Admin uploads new asset to public library (status = Draft)
2. Admin edits asset metadata (name, description, tags)
3. Admin publishes asset to public library (Draft → Public)
4. Admin sets asset as Premium with price $9.99
5. Admin unpublishes asset (Public → Draft)
6. Admin deletes asset (soft delete)
7. Admin bulk publishes 5 assets
8. Admin views content analytics (download stats)
9. Admin uploads preview images for adventure
10. Admin filters content by category and status

**Smoke Scenario**: Admin login → Public Library page loads → Content list displays

## UI/UX Design

### Content Library View
**Layout**: Full-page DataGrid with filter sidebar
**Toolbar**: Search bar, "Upload Content" button, Bulk actions dropdown, Settings button
**Filters**: Left collapsible sidebar (280px width)
**Table**: MUI DataGrid with thumbnails, sticky header, pagination
**Status Badges**:
- Draft: Gray badge
- Public: Green badge
- Premium: Gold badge with price

### Content Upload Dialog
**Layout**: Modal dialog (responsive, fullscreen on mobile)
**Sections**:
1. Content Type selection (radio buttons with icons)
2. File upload drag-and-drop zone
3. Metadata form (name, description, category, tags)
4. Preview images upload (5 slots)
5. Availability status (default: Draft)
**Footer**: Upload button, Cancel button

### Content Detail Dialog
**Layout**: Modal dialog with tabs (Details, Availability, Preview Images, Files, Analytics)
**Tabs**:
- Details: Form with editable fields
- Availability: Status radio buttons, price input
- Preview Images: Gallery with upload/delete/reorder
- Files: List of associated files
- Analytics: Charts and statistics (read-only)
**Footer**: Save button, Publish/Unpublish button, Delete button, Close button

### Dark/Light Theme
- Light theme: White background, dark text
- Dark theme: Dark gray (#1e1e1e), light text (#e0e0e0)
- Status badges:
  - Draft: Gray (#9e9e9e)
  - Public: Green (#4caf50)
  - Premium: Gold (#ffc107)

## Dependencies

### EPIC-001 Dependencies
- **Phase 5 (Content Management - Assets)**: Asset model, blob storage integration
- **Phase 7 (Adventures)**: Adventure model, campaign structure
- **Phase 8 (Encounters)**: Encounter model, rendering engine

### EPIC-002 Dependencies
- **Phase 1 (Admin Infrastructure)**: Admin app routing, layout, authentication

### EPIC-003 Dependencies (Deferred)
- **Payment Integration**: Payment processing for Premium content
- **Shopping Cart**: Add Premium content to cart
- **Order Management**: Track purchases

### External Dependencies
- Blob storage service (Azure Blob Storage / AWS S3)
- MUI DataGrid (frontend table)
- React Dropzone (file upload)
- Chart.js (analytics charts)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large file uploads timeout | Medium | Medium | Chunked upload, resumable upload support |
| Draft content accidentally published | Low | Medium | Confirmation dialog, audit log |
| Blob storage quota exceeded | Medium | Medium | Monitor storage usage, quota alerts |
| Premium content accessible without payment | High | Critical | Public library API checks status (EPIC-003 enforces payment) |

## Out of Scope (Future Enhancements)

- Payment processing (EPIC-003)
- Shopping cart integration (EPIC-003)
- Order management (EPIC-003)
- Revenue analytics (EPIC-003)
- Bundle creation (group multiple items) (EPIC-003)
- Subscription-based access (EPIC-003)
- Content versioning (track changes over time)
- Content approval workflow (draft → review → publish)
- Content duplication detection
- Advanced search (full-text search on description)

## Acceptance Checklist

- [ ] All 6 functional requirements implemented
- [ ] Backend unit tests ≥80% coverage
- [ ] Frontend unit tests ≥70% coverage
- [ ] 10 BDD scenarios pass
- [ ] System-owned content has OwnerId = null
- [ ] Draft content NOT accessible via public library API
- [ ] Published content appears in public library within 30 seconds
- [ ] Premium content displays price but does NOT require payment
- [ ] File uploads support 50MB+ assets
- [ ] Audit log captures all content changes
- [ ] Dark/light theme working
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA compliance verified
- [ ] Code review passed (security, OWASP checks)
