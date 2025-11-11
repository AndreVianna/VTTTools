# EPIC-002: Administration Application

**Type**: World (Large-Scale Infrastructure)
**Status**: Planned
**Priority**: Critical (Production Requirement)
**Effort**: 332-352 hours total (includes Audit Infrastructure, Admin Dashboard, Public Library Management; Role Management deferred)
**Created**: 2025-10-31
**Last Updated**: 2025-10-31 (Audit infrastructure added to Phase 1, Dashboard as main page, Public Library Management added, Role Management deferred)

---

## Description

Create a completely independent administrative client application (WebAdminApp) for managing critical backend operations required by the main VTTTools application. This includes authentication management (users, roles), audit tracking, public library management, application settings, and system monitoring. The admin app will be built using the same technology stack as WebClientApp (React 19 + TypeScript + Material-UI) but will be deployed independently with separate authentication and enhanced security controls.

---

## Executive Summary

### Purpose and Scope

The Administration Application (WebAdminApp) is a mission-critical infrastructure component that provides authorized administrators with centralized control over VTTTools backend operations, user management, security auditing, and system configuration. By deploying this as a separate application from the main user-facing WebClientApp, we achieve:

1. **Security Isolation**: Admin functions cannot be accessed through the main application, reducing attack surface
2. **Independent Deployment**: Admin app can be updated, scaled, or locked down without affecting end users
3. **Role Segregation**: Clear separation between administrative and user-facing functionality
4. **Audit Trail**: All administrative actions are logged for compliance and security review
5. **Operational Excellence**: Centralized monitoring and configuration management

### Strategic Importance

This world is a **production requirement** and must be completed before EPIC-001 Phase 13 (Release Preparation). Without an administration interface, the following critical operations would require direct database access or custom scripts:

- User account management (lock/unlock, role assignment, email verification)
- Security incident investigation (audit log analysis, suspicious activity detection)
- Content moderation (published assets, shared adventures)
- System configuration (feature flags, maintenance mode, rate limits)
- Operational monitoring (health checks, error tracking, performance metrics)

### Estimated Effort

**Total: 332-352 hours** (10 weeks with dedicated focus)

- **Audit Infrastructure**: 40-60 hours (built in Phase 1 - eliminates EPIC-001 Phase 12 dependency)
- Infrastructure & Setup: 24 hours
- Admin Dashboard (Main Page): 28 hours (monitoring dashboard as home page)
- User Management: 60 hours
- ~~Role Management: 32 hours~~ **DEFERRED** (see Rationale below)
- Audit Log Viewer: 52 hours (includes live monitoring with WebSocket/SignalR)
- System Configuration: 40 hours
- Public Library Management: 40 hours (content management only, commerce deferred to EPIC-003)
- Backend APIs: 64 hours
- Testing & Security: 48 hours
- Documentation & Deployment: 24 hours

**Role Management Deferral Rationale**:
Currently only 2 roles exist (Administrator, User). User Management already provides promote/demote admin functionality. Role Management will be implemented when additional roles (Game Master, Content Moderator) are introduced and role-centric workflows become necessary. Defers 32 hours to future phase.

---

## Primary Objective

Build a secure, independently deployable React administration application that enables authorized administrators to manage users, roles, audit logs, system configuration, and public content while maintaining complete separation from the main user-facing application and comprehensive audit trails of all administrative actions.

**Target Users**:
- Platform Administrators (full access to all admin functions)
- Security Officers (audit log access, user security management)
- Content Moderators (published asset/adventure management)
- DevOps Engineers (system configuration, monitoring, health checks)
- Support Staff (read-only user profile access, audit trail review)

---

## Success Criteria

### SC-01: User Management Complete
**Measurement**: Admin can perform all user administration tasks
**Target**:
- Search and filter users by email, display name, role, status (active/locked/unconfirmed)
- View comprehensive user profile (registration date, last login, roles, 2FA status)
- Lock/unlock user accounts
- Manually verify user emails
- Assign/remove roles from users
- Reset user passwords (send reset email)
- View user activity summary (sessions created, assets uploaded, last active encounter)

**Verification**: Manual testing + E2E test suite covering all user management operations

### SC-02: Audit Log Analysis Available
**Measurement**: Admin can query, filter, and export audit logs
**Target**:
- Filter logs by date range, user, action type, IP address, result (success/failure)
- Real-time log viewing with auto-refresh
- Export filtered logs to CSV/JSON for compliance reporting
- View detailed log entry with full context (request, response, duration)
- Search logs by keyword or entity ID
- Detect suspicious patterns (failed logins, rate limit violations)

**Verification**: Load test with 100,000+ log entries, verify filtering performance <2s, export functionality

### SC-03: Role-Based Access Control Management ⚠️ DEFERRED
**Status**: Deferred to future phase (when additional roles are implemented)
**Rationale**: Currently only 2 roles exist (Administrator, User). User Management already handles role assignment (promote/demote admin). This feature will be implemented when Game Master and Content Moderator roles are introduced.

**Original Target** (deferred):
- View all roles (User, Administrator, Game Master, Content Moderator)
- Create new roles with custom permissions
- View users assigned to each role
- Understand role hierarchy and inherited permissions
- Role assignment audit trail

**Current Implementation**: Role assignment handled in User Management feature (assign/remove Administrator role)

### SC-04: System Configuration Control
**Measurement**: Admin can configure application settings without code deployment
**Target**:
- Feature flags (enable/disable features without deployment)
- Maintenance mode toggle (gracefully disable user access for updates)
- Rate limiting configuration (API throttling, upload limits)
- Security settings (password policy, session timeout, 2FA enforcement)
- Email service configuration (SMTP settings, template selection)
- Storage configuration (blob storage quotas, file size limits)

**Verification**: Configuration changes reflected in main application without restart (where possible)

### SC-05: Independent and Secure Deployment
**Measurement**: Admin app deployed separately from main application with enhanced security
**Target**:
- Separate deployment URL (e.g., admin.vtttools.com vs app.vtttools.com)
- Separate authentication mechanism (admin users vs regular users)
- IP whitelisting capability (restrict access to corporate IPs)
- All admin actions logged to audit trail
- Role-based access within admin app (admin-only vs read-only support staff)
- HTTPS enforced, secure cookie configuration
- No cross-origin access between admin and main app

**Verification**: Security audit, penetration testing, deployment verification

---

## Technical Architecture

### Frontend Stack (WebAdminApp)

**Technology**: React 19 + TypeScript 5 + Material-UI + Redux Toolkit
**Location**: `Source/WebAdminApp/`
**Justification**: Consistent with WebClientApp for maintainability, leverages existing patterns

**Key Libraries**:
- React 19.1 with TypeScript 5.9 (strict mode)
- Material-UI 7.3 (admin-optimized components: DataGrid, TreeView, Charts)
- Redux Toolkit 2.9 with RTK Query (API integration, state management)
- React Router 7.9 (admin routes)
- Material-UI DataGrid (user list, audit log table with filtering/sorting/pagination)
- Recharts or MUI X Charts (monitoring dashboards)
- React Hook Form + Yup (form validation)

**Distinctive Features from WebClientApp**:
- Data-heavy UI (tables, filters, exports) vs. creative canvas tools
- Admin-specific MUI theme (professional, information-dense layout)
- Enhanced error reporting and detailed logging
- No Konva canvas (no encounter editor)
- Export/import functionality

### Backend Architecture

**Pattern**: DDD Contracts + Service Implementation (consistent with existing backend)

**New Backend Components Required**:

1. **Admin Authentication APIs** (`Source/Auth/`)
   - **Endpoint**: `POST /api/admin/auth/login` (separate from main app `/api/auth/login`)
   - **Validation Sequence** (all must pass):
     1. User exists
     2. Password correct
     3. Email confirmed (reject if false)
     4. Account not locked (reject if locked)
     5. Has Administrator role (reject if not admin)
     6. 2FA enabled (reject if not setup)
     7. 2FA code valid (second authentication step)
   - **Security Principle**: Generic error message for ALL failures
     - All authentication failures return: `"Invalid sign-in attempt."`
     - NEVER reveal specific failure reason to user (prevents user enumeration)
     - Internal audit logging captures actual failure reason (for admin troubleshooting)
   - **No Self-Registration**: Admin accounts created manually by other admins only
   - **Password Reset**: Forgot password flow allowed (still requires admin role after reset)
   - **Session Management**:
     - Shorter timeout than main app (30 min vs 2 hours)
     - Secure cookie configuration (HttpOnly, Secure, SameSite=Strict)
     - Auto-logout on browser close
   - **Admin Onboarding**: First admin created via database seed or CLI tool during deployment
   - **Admin Role Enforcement Middleware**: Validates Administrator role on every admin API request
   - **Rate Limiting**: Stricter than main app (5 login attempts per 15 min per IP)

2. **User Administration APIs** (`Source/Admin/` - new area)
   - `IUserAdminService`: User search, profile view, lock/unlock, role assignment
   - `UserAdminHandlers`: Minimal API handlers for admin operations
   - Domain: No new models (uses existing `User` from Identity)

3. **Role Administration APIs** (`Source/Admin/`)
   - `IRoleAdminService`: Role CRUD, user-role assignment
   - `RoleAdminHandlers`: Minimal API handlers
   - Domain: Uses existing `Role` from Identity

4. **Audit Log APIs** (`Source/Admin/`)
   - `IAuditLogService`: Query logs with filtering, export
   - `AuditLogHandlers`: Minimal API handlers
   - Domain: `AuditLog` model (timestamp, userId, action, entityType, entityId, ipAddress, result, duration, request, response)
   - Storage: `IAuditLogStorage` with EF Core implementation
   - **Note**: Audit logging infrastructure should be implemented in Phase 12 of EPIC-001 (dependency)

5. **System Configuration APIs** (`Source/Admin/`)
   - `ISystemConfigService`: Feature flags, maintenance mode, rate limits
   - `SystemConfigHandlers`: Minimal API handlers
   - Domain: `SystemConfiguration` model (key, value, type, description, lastModified)
   - Storage: `ISystemConfigStorage` with EF Core + caching

6. **Monitoring APIs** (`Source/Admin/`)
   - `IMonitoringService`: Health checks, error logs, performance metrics (optional - Phase 2)
   - Uses existing health check infrastructure (`Source/Common/HealthChecks/`)

### Database Schema

**New Tables Required**:

1. **AuditLogs** (audit trail)
   - Id (Guid, PK)
   - Timestamp (DateTimeOffset)
   - UserId (Guid, FK to Users, nullable)
   - Action (string, indexed)
   - EntityType (string, indexed)
   - EntityId (Guid, nullable, indexed)
   - IpAddress (string)
   - Result (string: Success/Failure/Error)
   - Duration (int milliseconds)
   - RequestData (nvarchar(max), JSON)
   - ResponseData (nvarchar(max), JSON)
   - ErrorMessage (nvarchar(max), nullable)

2. **SystemConfiguration** (application settings)
   - Key (string, PK)
   - Value (nvarchar(max))
   - Type (string: String/Int/Bool/Json)
   - Description (string)
   - Category (string: Security/Features/Storage/Email/RateLimits)
   - LastModified (DateTimeOffset)
   - LastModifiedBy (Guid, FK to Users)

**Existing Tables Used**:
- Users (ASP.NET Core Identity)
- Roles (ASP.NET Core Identity)
- UserRoles (ASP.NET Core Identity)

### Deployment Architecture

**Separate Deployment**:
- **Main App**: `https://app.vtttools.com` → WebClientApp
- **Admin App**: `https://admin.vtttools.com` → WebAdminApp
- **API**: `https://api.vtttools.com` → VttTools.WebApp (serves both apps)

**Security Considerations**:
- Separate subdomain isolates admin app
- API enforces role-based access (Administrator role required for admin endpoints)
- IP whitelisting configured at infrastructure layer (Azure Front Door, Cloudflare, etc.)
- Separate authentication cookies (prevents admin session from being used in main app)
- Admin API endpoints under `/api/admin/*` namespace with authorization middleware

---

## Feature Breakdown

### Component 1: Infrastructure & Setup (24 hours)

**Goal**: Bootstrap WebAdminApp with routing, authentication, theme, and layout

**Deliverables**:
1. React 19 + Vite + TypeScript project scaffolding
2. Material-UI theme (admin-focused: data-dense layout, professional color scheme)
3. Redux store configuration with RTK Query for API
4. React Router with protected routes (AdminRoute component)
5. Admin authentication flow (separate from main app login)
6. Admin layout component (sidebar navigation, header with user menu, breadcrumbs)
7. Basic routing structure:
   - `/admin/dashboard` - Admin homepage
   - `/admin/users` - User management
   - `/admin/roles` - Role management
   - `/admin/audit` - Audit log viewer
   - `/admin/config` - System configuration
   - `/admin/monitoring` - System monitoring (optional)

**Technical Notes**:
- Copy and adapt patterns from WebClientApp (auth context, route protection)
- Use MUI DataGrid for all list views (requires MUI X license or use community edition)
- Admin theme: darker, more professional, information-dense (smaller spacing)

**Testing**: E2E test for admin login flow, routing protection

---

### Component 2: User Management (60 hours)

**Goal**: Complete user administration interface

**Features**:
1. **User List View**:
   - MUI DataGrid with server-side pagination (load 50 users at a time)
   - Filters: email (search), role (dropdown), status (active/locked/unconfirmed), registration date range
   - Sortable columns: email, display name, registration date, last login, role count
   - Row actions: View profile, Edit roles, Lock/Unlock, Verify email, Send password reset
   - Bulk actions: Lock selected, Unlock selected
   - Search bar (real-time search by email or display name)
   - Create User button (create fake/test users)

2. **User Detail View** (modal or side panel):
   - Profile information (read-only): email, display name, phone, avatar, registration date
   - Account status: email confirmed, locked, 2FA enabled, last login
   - Assigned roles with remove button
   - Add role dropdown + button
   - Recent activity log (last 20 actions from audit log)
   - Action buttons: Lock/Unlock account, Verify email, Send password reset, View full audit trail

   **Note**: Activity metrics (sessions, assets, published content) deferred to future phase

3. **User Actions**:
   - **Create user** (create fake/test users for testing purposes)
   - Lock user account (prevents login, preserves data)
   - Unlock user account
   - Manually verify email (bypass confirmation email)
   - Reset user password (trigger password reset email)
   - Assign role to user (with validations)
   - Remove role from user (with validations)

   **Role Assignment Business Rules**:
   - Admin cannot promote/demote themselves
   - System must always have at least one Administrator
   - Cannot remove last Administrator role
   - Can promote regular users to Administrator
   - Can demote other admins to regular users

   **Delete User**: Not implemented - soft delete deferred to future phase (audit requirements)

**Backend APIs** (Source/Admin/):
- `POST /api/admin/users` (body: { email, displayName, password, roles[] }) - Create fake/test user
- `GET /api/admin/users?page=1&size=50&search=email&role=User&status=active`
- `GET /api/admin/users/{userId}`
- `PUT /api/admin/users/{userId}/lock`
- `PUT /api/admin/users/{userId}/unlock`
- `PUT /api/admin/users/{userId}/verify-email`
- `POST /api/admin/users/{userId}/send-password-reset`
- `GET /api/admin/users/{userId}/audit-trail?page=1&size=20`
- `POST /api/admin/users/{userId}/roles` (body: { roleId }) - Validates: not self, at least one admin remains
- `DELETE /api/admin/users/{userId}/roles/{roleId}` - Validates: not self, at least one admin remains
- `GET /api/admin/users/stats` - Get admin count for validation

**Deferred to Future Phase**:
- `GET /api/admin/users/{userId}/activity-summary` - Activity metrics (sessions, assets, etc.)
- `DELETE /api/admin/users/{userId}` - Soft delete (audit/constraint requirements)

**Domain Models** (existing):
- `User` (Source/Domain/Identity/Model/User.cs) - no changes needed
- `Role` (Source/Domain/Identity/Model/Role.cs) - no changes needed

**Service Contracts** (new):
- `IUserAdminService` (Source/Domain/Admin/Contracts/IUserAdminService.cs)
- Methods: SearchUsersAsync, GetUserDetailAsync, LockUserAsync, UnlockUserAsync, VerifyUserEmailAsync, SendPasswordResetAsync, GetUserActivitySummaryAsync, GetUserAuditTrailAsync, AssignRoleAsync, RemoveRoleAsync

**Testing**:
- Unit tests: Service layer (80% coverage)
- Integration tests: Full user management workflows
- E2E tests: Search users, view profile, lock/unlock, assign role

**Estimated Breakdown**:
- Backend APIs + Services: 28 hours
- Frontend UI + Components: 22 hours
- Testing: 10 hours

---

### Component 3: Role Management ⚠️ DEFERRED

**Status**: Deferred to future phase (32 hours removed from EPIC-002 scope)

**Rationale**:
- Currently only 2 roles exist: Administrator and User
- User Management already provides promote/demote admin functionality (assign/remove Administrator role)
- Role-centric workflows (view users by role, role hierarchy visualization) not needed until additional roles (Game Master, Content Moderator) are implemented
- Follows YAGNI principle: build when requirements justify complexity

**When to Revisit**:
- When Game Master role is implemented (for campaign/session management features)
- When Content Moderator role is implemented (for public library curation)
- When 5+ roles exist requiring role-centric administration

**Original Planned Features** (deferred):
- Role List View (name, description, user count, created date)
- Role Detail View with user list DataGrid
- Add/remove users from roles
- Role hierarchy visualization
- Role permissions display

**Current Implementation**:
Role assignment handled in User Management feature via:
- `POST /api/admin/users/{userId}/roles` (assign Administrator role)
- `DELETE /api/admin/users/{userId}/roles/{roleId}` (remove Administrator role)
- Business rules: cannot self-promote, must keep at least one admin

---

### Component 4: Audit Log Viewer (48 hours)

**Goal**: Comprehensive audit log query and analysis interface

**Features**:
1. **Audit Log Table** (MUI DataGrid):
   - Columns: Timestamp, User (email), Action, Entity Type, Entity ID, IP Address, Result, Duration
   - Infinite scroll pagination (load 100 logs per block as user scrolls)
   - Expandable rows (show request/response JSON in formatted view)

1.1 **Live Monitoring View** (separate grid):
   - Tail tracking list (newest entries appear at top, auto-scroll)
   - Must filter by single dimension: User OR Action OR Entity Type OR Result
   - Real-time updates (WebSocket or polling every 2-3 seconds)
   - Limited to last 500 entries for performance
   - Used for production monitoring when thousands of records/second occur
   - Example: "Show me all Login actions in real-time" or "Show me all actions for user@example.com"

2. **Advanced Filters** (filter panel or drawer):
   - Date range picker (start date, end date) with presets (last hour, today, last 7 days, last 30 days)
   - User filter (search by email or select from dropdown)
   - Action filter (multi-select: Login, Logout, CreateAsset, DeleteEncounter, LockUser, etc.)
   - Entity type filter (User, Asset, Encounter, Session, etc.)
   - Result filter (Success, Failure, Error)
   - IP address search
   - Keyword search (searches request/response JSON)

3. **Export Functionality**:
   - Export filtered results to CSV (for Excel analysis)
   - Export filtered results to JSON (for programmatic analysis)
   - Export limit (max 10,000 records per export for performance)

4. **Log Detail View** (modal or side panel):
   - Full log entry display
   - Formatted JSON viewers for request/response data
   - Related logs (same user, same session, same entity)
   - Action timeline visualization

**Backend APIs** (Source/Admin/):
- `GET /api/admin/audit-logs?offset=0&size=100&startDate=...&endDate=...&userId=...&action=...&entityType=...&result=...&ipAddress=...&keyword=...` (infinite scroll - uses offset instead of page)
- `GET /api/admin/audit-logs/live?userId=...` OR `?action=...` OR `?entityType=...` OR `?result=...` (tail tracking - single dimension filter required, returns last 500 entries + WebSocket for real-time updates)
- `GET /api/admin/audit-logs/{logId}`
- `GET /api/admin/audit-logs/export?format=csv&...filters` (returns file download)

**Domain Models** (new):
- `AuditLog` (Source/Domain/Admin/Model/AuditLog.cs)
- Properties: Id, Timestamp, UserId, Action, EntityType, EntityId, IpAddress, Result, Duration, RequestData, ResponseData, ErrorMessage

**Service Contracts** (new):
- `IAuditLogService` (Source/Domain/Admin/Contracts/IAuditLogService.cs)
- Methods: QueryLogsAsync (with offset for infinite scroll), GetLiveLogsAsync (tail tracking with single dimension filter), GetLogDetailAsync, ExportLogsAsync

**Storage** (new):
- `IAuditLogStorage` (Source/Domain/Admin/Storage/IAuditLogStorage.cs)
- Implementation: `AuditLogStorage` (Source/Data/Admin/AuditLogStorage.cs) using EF Core
- Indexing strategy: Composite indexes on (Timestamp, UserId), (Action, Timestamp), (EntityType, EntityId)

**Audit Log Middleware** (infrastructure):
- ASP.NET Core middleware that intercepts all requests
- Logs request/response for configured endpoints
- Async logging (doesn't block request processing)
- Batched writes (performance optimization)
- Located: Source/Common/Middleware/AuditLogMiddleware.cs

**Testing**:
- Unit tests: Service layer, filtering logic (80% coverage)
- Integration tests: Full audit log query workflows
- Performance tests: Query performance with 100,000+ logs
- E2E tests: Filter logs, export to CSV

**Estimated Breakdown**:
- Backend APIs + Services + Storage: 20 hours
- Audit middleware infrastructure: 8 hours
- Frontend UI + Components (includes infinite scroll + live monitoring grid): 14 hours
- Real-time updates infrastructure (WebSocket or SignalR): 4 hours
- Testing: 6 hours
- **Total: 52 hours** (increased from 48 hours due to live monitoring)

---

### Component 5: System Configuration (40 hours)

**Goal**: Application settings management interface

**Features**:
1. **Configuration Categories** (tabs or sections):
   - **Security Settings**:
     - Max login attempts
     - Password policy (min length, complexity requirements, expiration)
     - 2FA enforcement
     - Session timeout
   - **Feature Flags**:
     - Enable/disable features without deployment
     - Examples: Encounter collaboration, public asset gallery, 2FA enforcement, new UI components
     - Toggle switches with immediate effect
   - **Storage Configuration**:
     - Database connection configuration (connection string, pool size, timeouts)
     - Blob storage quotas (per user, total)
     - Max file size limits (assets, images, documents)
     - Allowed file types (whitelist/blacklist)
   - **Email Settings**:
     - SMTP configuration (host, port, credentials)
     - Email templates (password reset, welcome email, etc.)
   - **Service API Settings** (per service):
     - Connection configuration (host, port, credentials)
     - Rate limits (per service)
   - **Maintenance Mode**:
     - Master toggle (enables maintenance mode for main app)
     - Maintenance message (markdown or rich text editor)
     - Scheduled maintenance (optional start/end time)

2. **Configuration List View** (per category):
   - MUI DataGrid or list of settings
   - Columns: Setting Name, Current Value, Type, Last Modified, Modified By
   - Row actions: Edit value

3. **Configuration Edit** (modal or inline):
   - Setting name (read-only)
   - Description (read-only, explains what this setting does)
   - Current value (editable based on type)
   - Input type based on setting type:
     - String: Text field
     - Int: Number field
     - Bool: Switch/checkbox
     - JSON: Code editor (Monaco or simple textarea)
     - Enum: Dropdown
   - Save button
   - Reset to default button

4. **Feature Flags** (dedicated view):
   - Toggle switches for each feature
   - Features: Encounter collaboration, public asset gallery, 2FA enforcement, etc.
   - Immediate effect (cached in backend with short TTL)

5. **Maintenance Mode**:
   - Master toggle switch (enables maintenance mode for main app)
   - Maintenance message editor (markdown or rich text)
   - Scheduled maintenance (optional: set start/end time)
   - Status indicator (maintenance active/inactive)

**Backend APIs** (Source/Admin/):
- `GET /api/admin/config?category=Security`
- `GET /api/admin/config/{key}`
- `PUT /api/admin/config/{key}` (body: { value })
- `POST /api/admin/config/reset/{key}` (reset to default)
- `GET /api/admin/feature-flags`
- `PUT /api/admin/feature-flags/{flagName}` (body: { enabled })
- `GET /api/admin/maintenance`
- `PUT /api/admin/maintenance` (body: { enabled, message })

**Domain Models** (new):
- `SystemConfiguration` (Source/Domain/Admin/Model/SystemConfiguration.cs)
- Properties: Key, Value, Type, Description, Category, LastModified, LastModifiedBy

**Service Contracts** (new):
- `ISystemConfigService` (Source/Domain/Admin/Contracts/ISystemConfigService.cs)
- Methods: GetConfigsByCategoryAsync, GetConfigAsync, UpdateConfigAsync, ResetConfigAsync
- `IFeatureFlagService` (Source/Domain/Admin/Contracts/IFeatureFlagService.cs)
- Methods: GetAllFlagsAsync, UpdateFlagAsync
- `IMaintenanceModeService` (Source/Domain/Admin/Contracts/IMaintenanceModeService.cs)
- Methods: GetMaintenanceStatusAsync, SetMaintenanceModeAsync

**Storage** (new):
- `ISystemConfigStorage` (Source/Domain/Admin/Storage/ISystemConfigStorage.cs)
- Implementation: `SystemConfigStorage` (Source/Data/Admin/SystemConfigStorage.cs) with EF Core + in-memory caching

**Configuration Consumer** (main app):
- Middleware or service that checks maintenance mode before processing requests
- Feature flag service that checks flags before rendering features
- Configuration service for dynamic settings (rate limits, etc.)

**Testing**:
- Unit tests: Service layer (80% coverage)
- Integration tests: Configuration updates reflected in main app
- E2E tests: Toggle feature flag, enable maintenance mode

**Estimated Breakdown**:
- Backend APIs + Services + Storage: 18 hours
- Configuration infrastructure (caching, middleware): 8 hours
- Frontend UI + Components: 10 hours
- Testing: 4 hours

---

### Component 6: Public Library Management (36 hours)

**Goal**: Manage system-owned content available in the public library

**Scope**: Content management only. Commerce/payment features deferred to EPIC-003.

**Features**:
1. **Content Library View**:
   - List all system-owned content (Adventures, Assets, Encounters)
   - MUI DataGrid with server-side pagination
   - Filters: Content type (Adventure/Asset/Encounter), status (Draft/Public/Premium), category, tags
   - Search by name, description
   - Columns: Thumbnail, Name, Type, Status, Price (display only), Downloads, Created Date, Published Date
   - Bulk actions: Publish selected, Unpublish selected, Delete selected
   - Sort by: Name, Downloads, Date created, Date published

2. **Content Upload/Create**:
   - Upload new system-owned adventures
   - Upload new system-owned assets (maps, tokens, props, 3D models)
   - Create new system-owned encounters
   - Drag-and-drop file upload with progress bar
   - Set metadata: Name, Description, Tags, Category, Preview images
   - Content validation (file size, format, required fields)

3. **Content Editor**:
   - Edit content details (name, description, tags, category)
   - Set availability status:
     - **Draft**: Not visible in public library (work in progress)
     - **Public**: Free content, visible to all users
     - **Premium**: Paid content (price field required, payment deferred to EPIC-003)
   - Set pricing information (for EPIC-003 use):
     - Price (decimal)
     - Currency (USD, EUR, etc.)
   - Upload/change preview images and thumbnails
   - Set content license and usage terms (text field)
   - Version history (track changes over time)

4. **Content Detail View**:
   - Full content information display
   - Preview content (similar to main app library)
   - Download statistics (total downloads, downloads per week/month)
   - User ratings/reviews (if main app supports reviews)
   - Related content suggestions

5. **Content Approval Queue** (Optional - if accepting user submissions):
   - Review user-submitted content for inclusion in public library
   - Approve/reject submissions with feedback message
   - Promote approved content to public library (converts user-owned to system-owned)
   - Moderation notes (internal admin notes)

**Backend APIs** (Source/Admin/):
- `GET /api/admin/public-library?type=Adventure&status=Public&category=Fantasy&page=1&size=50`
- `GET /api/admin/public-library/{contentId}`
- `POST /api/admin/public-library` (body: form-data with file upload + metadata)
- `PUT /api/admin/public-library/{contentId}` (update content metadata)
- `DELETE /api/admin/public-library/{contentId}` (soft delete - preserves purchase history for EPIC-003)
- `PUT /api/admin/public-library/{contentId}/publish` (publish to public library)
- `PUT /api/admin/public-library/{contentId}/unpublish` (remove from public, keep as draft)
- `GET /api/admin/public-library/{contentId}/statistics` (download stats, user engagement)

**Domain Models** (new or extended):
- `PublicLibraryContent` (Source/Domain/Admin/Model/PublicLibraryContent.cs)
  - Extends or references existing Asset/Adventure/Encounter models
  - Properties: Id, Type (Adventure/Asset/Encounter), Name, Description, Status (Draft/Public/Premium), Price, Currency, OwnerId (null = system-owned), DownloadCount, CreatedDate, PublishedDate, Tags, Category, LicenseTerms, PreviewImageUrls, Version

**Service Contracts** (new):
- `IPublicLibraryService` (Source/Domain/Admin/Contracts/IPublicLibraryService.cs)
- Methods: SearchContentAsync, GetContentDetailAsync, CreateContentAsync, UpdateContentAsync, DeleteContentAsync, PublishContentAsync, UnpublishContentAsync, GetContentStatisticsAsync

**Storage** (new):
- `IPublicLibraryStorage` (Source/Domain/Admin/Storage/IPublicLibraryStorage.cs)
- Implementation: `PublicLibraryStorage` (Source/Data/Admin/PublicLibraryStorage.cs)
- Reuses existing asset/adventure/encounter storage with OwnerId = null for system-owned content

**Integration with Main App**:
- Main app already has library/asset browsing (Phase 7)
- Public library content appears in main app library with "Public" or "Premium" badge
- Main app filters: Show only Public (free) content for now
- EPIC-003 will add: Purchase flow, shopping cart, user purchase history

**Testing**:
- Unit tests: Service layer (80% coverage)
- Integration tests: Upload content, publish to public library, verify visible in main app
- E2E tests: Create adventure, publish, search, edit, unpublish

**Estimated Breakdown**:
- Backend APIs + Services + Storage: 18 hours
- Frontend UI + Components: 12 hours
- Integration with existing asset/adventure models: 4 hours
- Testing: 6 hours
- **Total: 40 hours**

---

### Component 7: Admin Dashboard (Main Page) (28 hours)

**Goal**: Main monitoring dashboard as the admin app home page

**Scope**: Dashboard serves as the admin app landing page, providing at-a-glance system health, key metrics, and quick navigation to admin tasks.

**Features**:
1. **System Health Status** (top section):
   - **Health Indicators** (card-based layout):
     - Database (green/yellow/red status, response time)
     - Blob Storage (status, available space %)
     - Email Service (status, last successful send)
     - Main App (online/offline, response time)
   - **Quick Stats Cards**:
     - Total Users
     - Active Users (last 24h)
     - Total Public Library Items
     - System Uptime (%)

2. **Recent Activity Feed** (left column):
   - Last 10 audit log entries (user actions)
   - Real-time updates (auto-refresh every 30s)
   - Click entry to view detail
   - Filter by: All actions, Admin actions only, Failed actions
   - "View All" link to Audit Log Viewer

3. **System Alerts & Warnings** (center, prominent if issues exist):
   - Critical alerts (red banner): Database down, storage quota exceeded
   - Warnings (yellow banner): High error rate, slow response times
   - Info (blue): Scheduled maintenance reminder
   - Dismissible alerts (persist until issue resolved)

4. **Performance Metrics** (right column):
   - **API Performance Chart** (line graph, last 24 hours):
     - Average response time
     - Request rate (requests/minute)
   - **Error Rate Chart** (line graph, last 24 hours):
     - Errors per hour
     - Click to view error log
   - **Resource Usage**:
     - Database connections (current/max)
     - Blob storage (used/total GB)
     - Memory usage (if available)

5. **Quick Actions Panel** (bottom section):
   - Large buttons for common tasks:
     - User Management
     - Public Library
     - System Configuration
     - View Audit Logs
   - Recent admin activities (created users, published content)

6. **Error Log Summary** (expandable section):
   - Last 10 errors (timestamp, error type, message)
   - Error severity indicators (critical, warning, info)
   - "View All Errors" link to detailed error log viewer

**Backend APIs** (Source/Admin/):
- `GET /api/admin/dashboard/summary` (aggregated dashboard data)
- `GET /api/admin/dashboard/health-checks` (all health statuses)
- `GET /api/admin/dashboard/recent-activity?limit=10` (recent audit logs)
- `GET /api/admin/dashboard/alerts` (active system alerts)
- `GET /api/admin/dashboard/metrics?hours=24` (performance metrics)
- `GET /api/admin/dashboard/errors?limit=10` (recent errors)

**Domain Models** (new):
- `DashboardSummary` (Source/Domain/Admin/Model/DashboardSummary.cs)
  - TotalUsers, ActiveUsers, PublicLibraryItemCount, SystemUptime
- `HealthCheckStatus` (Source/Domain/Admin/Model/HealthCheckStatus.cs)
  - Service name, status (Healthy/Degraded/Unhealthy), response time, last checked
- `SystemAlert` (Source/Domain/Admin/Model/SystemAlert.cs)
  - Severity (Critical/Warning/Info), message, timestamp, dismissible

**Service Contracts** (new):
- `IDashboardService` (Source/Domain/Admin/Contracts/IDashboardService.cs)
- Methods: GetDashboardSummaryAsync, GetHealthChecksAsync, GetRecentActivityAsync, GetActiveAlertsAsync, GetMetricsAsync, GetRecentErrorsAsync

**Frontend Components**:
- Dashboard layout (grid-based responsive design)
- Health status cards (color-coded: green/yellow/red)
- Activity feed with auto-refresh
- System alerts banner
- Performance charts (Recharts or MUI X Charts)
- Quick actions button panel
- Error log summary with expandable detail

**Integration Points**:
- ASP.NET Core Health Checks (existing infrastructure)
- Audit logging middleware (already planned in Component 4)
- Application logging infrastructure (Serilog, NLog, or built-in)
- Main app health endpoint (verify main app is responsive)

**Real-Time Updates**:
- Dashboard auto-refreshes every 30 seconds
- WebSocket for critical alerts (optional enhancement)
- Activity feed updates without page reload

**Testing**:
- Unit tests: DashboardService (80% coverage)
- Integration tests: Health checks, metrics aggregation
- E2E tests: Dashboard loads, displays data, auto-refreshes

**Estimated Breakdown**:
- Backend APIs + Services: 10 hours
- Dashboard UI + Charts: 12 hours
- Integration with health checks and logging: 4 hours
- Testing: 6 hours
- **Total: 32 hours** (moved from optional to Phase 1 Foundation)

**Note**: This dashboard leverages existing ASP.NET Core Health Checks, audit logging (Component 4), and application logging infrastructure. Detailed error log viewer and advanced performance analytics can be future enhancements.

---

## Affected Backend Components

### Existing Components (Enhancement Required)

1. **Auth Service** (`Source/Auth/Services/AuthService.cs`)
   - Add admin authentication endpoint
   - Validate Administrator role on admin login

2. **User Manager** (ASP.NET Core Identity)
   - Used by UserAdminService for user CRUD operations
   - No code changes needed (leverages built-in UserManager<User>)

3. **Role Manager** (ASP.NET Core Identity)
   - Used by RoleAdminService for role CRUD operations
   - No code changes needed (leverages built-in RoleManager<Role>)

### New Components (To Be Created)

1. **Admin Area** (`Source/Admin/`)
   - New project: VttTools.Admin
   - Handlers: UserAdminHandlers, RoleAdminHandlers, AuditLogHandlers, SystemConfigHandlers, MonitoringHandlers
   - Services: UserAdminService, RoleAdminService, AuditLogService, SystemConfigService, FeatureFlagService, MaintenanceModeService
   - EndpointMappers: AdminEndpointsMapper (maps all admin routes)

2. **Admin Domain Models** (`Source/Domain/Admin/`)
   - Models: AuditLog, SystemConfiguration
   - Contracts: IUserAdminService, IRoleAdminService, IAuditLogService, ISystemConfigService, IFeatureFlagService, IMaintenanceModeService
   - Storage: IAuditLogStorage, ISystemConfigStorage
   - ApiContracts: Request/response DTOs for all admin endpoints

3. **Admin Data Layer** (`Source/Data/Admin/`)
   - Storage: AuditLogStorage, SystemConfigStorage
   - DbContext updates: Add AuditLogs and SystemConfiguration DbSets

4. **Middleware** (`Source/Common/Middleware/`)
   - AuditLogMiddleware: Intercepts requests and logs to audit trail
   - MaintenanceModeMiddleware: Returns 503 Service Unavailable during maintenance
   - AdminAuthorizationMiddleware: Enforces Administrator role on /api/admin/* endpoints

5. **Unit Tests** (`Source/Admin.UnitTests/`)
   - Test coverage for all services (≥80%)
   - Handlers tests (≥80%)

---

## Implementation Strategy

### Phase Breakdown

**Phase 1: Foundation & Infrastructure + Audit System + Dashboard** (92-112 hours, Week 1-3)
- Setup WebAdminApp React project (8h)
- Configure routing, authentication, theme, layout (8h)
- Setup Redux store with RTK Query (4h)
- Backend: Create VttTools.Admin microservice project structure (4h)
- Backend: Implement admin authentication endpoints (8h)
- **Audit Infrastructure** (40-60 hours):
  - Database: Create AuditLog table schema with indexes (4h)
  - Domain: AuditLog entity, IAuditLogStorage interface (4h)
  - Service: AuditLogService with CRUD operations (8h)
  - Middleware: Request/response logging middleware (6h)
  - API: Audit log query endpoints (pagination, filtering, search) (8h)
  - SignalR: Live monitoring hub for tail tracking (8h)
  - Testing: Unit tests for audit service (6-8h)
  - Integration: Wire audit middleware into WebApp, Auth, Admin microservices (4-6h)
  - Migration: EF Core migration for AuditLog table (2h)
- Backend: Create system configuration database schema (4h)
- **Dashboard** (28 hours):
  - Backend APIs for health checks using ASP.NET Core Health Checks (8h)
  - Backend APIs for system stats and performance metrics (6h)
  - Frontend dashboard UI with health indicators and charts (10h)
  - Frontend recent activity feed (uses audit log API) (4h)

**Deliverables**:
- Admin app accessible at `/admin/dashboard`
- Admin login functional (uses Administrator role)
- **Audit infrastructure fully operational**: AuditLog table, middleware, service, APIs, SignalR hub
- **Dashboard page displays system health and metrics**
- Audit log middleware capturing all requests across WebApp, Auth, Admin microservices
- EF Core migrations for AuditLog and SystemConfiguration tables
- Recent activity feed on dashboard pulling from audit log API

**Phase 2: User Management** (60 hours, Week 3-4)
- Backend: User admin service + APIs
- Frontend: User list view with filters, sorting, pagination
- Frontend: User detail view with actions
- Frontend: Lock/unlock, verify email, reset password actions
- Frontend: Role assignment UI
- Testing: E2E tests for user management

**Deliverables**:
- Complete user administration interface
- All user management APIs functional
- 80% unit test coverage

**Phase 3: Role Management** ⚠️ DEFERRED
- **Status**: Deferred to future phase (32 hours removed from scope)
- **Rationale**: Only 2 roles currently exist; User Management handles role assignment
- **When to Revisit**: When Game Master/Content Moderator roles are implemented

**Phase 3: Audit Log Viewer** (48 hours, Week 5-6)
- Backend: Audit log query service + APIs
- Frontend: Audit log table with advanced filters
- Frontend: Export to CSV/JSON
- Frontend: Log detail view
- Testing: Performance tests with 100k+ logs

**Deliverables**:
- Complete audit log analysis interface
- Export functionality
- Real-time monitoring mode

**Phase 4: System Configuration** (40 hours, Week 7)
- Backend: System config service + APIs
- Backend: Feature flag infrastructure
- Backend: Maintenance mode middleware
- Frontend: Configuration management UI
- Frontend: Feature flag toggles
- Frontend: Maintenance mode control
- Testing: Configuration changes reflected in main app

**Deliverables**:
- Complete system configuration interface
- Feature flags functional
- Maintenance mode functional

**Phase 5: Testing, Security, Documentation** (48 hours, Week 8)
- Comprehensive E2E testing across all admin features
- Security audit (OWASP compliance)
- Penetration testing (admin authentication, authorization)
- Performance testing (audit log queries, user searches)
- Documentation (admin user guide, API documentation)
- Deployment scripts and configuration

**Deliverables**:
- Security audit report
- Complete test suite (≥80% backend, ≥70% frontend)
- Admin user documentation
- Production-ready deployment

**Phase 6: Optional - System Monitoring** (32 hours, Post-Release)
- Backend: Monitoring APIs
- Frontend: Health check dashboard
- Frontend: Error log viewer
- Frontend: Performance metrics

---

## Integration Points with EPIC-001

### Dependencies (Blocking EPIC-002)

1. **EPIC-001 Phase 2 (Authentication)**: Admin app uses same auth patterns
   - Status: ✅ Complete
   - Impact: Admin authentication flows leverage existing patterns

2. **EPIC-001 Phase 11 (Account Management)**: User models exist
   - Status: 🔜 Planned
   - Impact: Admin app manages existing User domain model
   - Note: Can proceed in parallel - no blocker

3. **Audit Infrastructure**: Audit backend APIs and storage
   - Status: ⚠️ Not yet implemented (EPIC-001 Phase 12 deferred)
   - Impact: **RESOLVED** - Audit log infrastructure will be built in EPIC-002 Phase 1
   - Resolution: **Build audit infrastructure in EPIC-002 Phase 1** (40-60 hours)
   - Rationale:
     - Admin app requires audit logs immediately for compliance and monitoring
     - EPIC-001 Phase 12 timeline uncertain, creating blocker risk
     - Audit infrastructure is foundational for all admin features
     - Building in EPIC-002 Phase 1 eliminates dependency and unblocks parallel development
   - Scope: AuditLog table, IAuditLogService, audit middleware, SignalR hub for live monitoring

### Tasks Blocked by EPIC-002

1. **EPIC-001 Phase 13 (Release Preparation)**: Cannot release to production without admin app
   - Admin app required for operational management
   - Audit logging required for compliance
   - System configuration required for maintenance

---

## Dependencies

### Prerequisites (Must Complete Before Starting)

1. **EPIC-001 Phase 2 Complete** (Authentication patterns established)
   - Status: ✅ Complete
   - Justification: Admin app reuses auth patterns

2. **ASP.NET Core Identity Infrastructure** (User/Role tables exist)
   - Status: ✅ Complete
   - Justification: Admin app manages existing Identity tables

3. **Backend API Gateway** (VttTools.WebApp project)
   - Status: ✅ Complete
   - Justification: Admin APIs will be added to existing API gateway

### Blocked By

None (this is a parallel infrastructure world)

### Blocks

1. **EPIC-001 Phase 13** (Release Preparation)
   - Cannot release without admin capabilities

2. **Public Asset Gallery** (future feature)
   - Content moderation requires admin interface

3. **Advanced Role-Based Access Control** (future enhancement)
   - Custom role creation requires admin interface

### External Dependencies

1. **Azure Deployment**: Separate subdomain configuration (admin.vtttools.com)
2. **IP Whitelisting**: Infrastructure-level configuration (Azure Front Door, Cloudflare, etc.)
3. **SMTP Service**: Email configuration management requires SMTP credentials
4. **Monitoring Service** (optional): Application Insights or similar APM for system monitoring component

---

## Security Considerations

### Security Isolation

1. **Separate Deployment**:
   - Different subdomain isolates admin app from main app
   - Attack on main app cannot directly access admin functions
   - Admin app can be taken offline without affecting users

2. **Separate Authentication**:
   - Admin users authenticated with separate session
   - Administrator role required (not just any authenticated user)
   - Admin session cannot be used to access main app features

3. **IP Whitelisting**:
   - Recommended: Restrict admin app access to corporate IPs
   - Configuration at infrastructure layer (Azure Front Door, Cloudflare, etc.)
   - Fallback: Admin role enforcement + audit logging

### Role-Based Access Control

1. **Administrator Role Required**:
   - All admin API endpoints require Administrator role
   - Enforced by AdminAuthorizationMiddleware
   - 403 Forbidden returned if user lacks Administrator role

2. **Granular Admin Roles** (future enhancement):
   - Content Moderator: Published asset management only
   - Security Officer: Audit logs and user security settings only
   - Support Staff: Read-only access to user profiles

### Audit Trail

1. **All Admin Actions Logged**:
   - Every admin API call logged to AuditLogs table
   - Includes: admin user, timestamp, action, entity, IP address, result
   - Request/response data stored (for forensic analysis)

2. **Tamper-Proof Logs**:
   - Logs stored in append-only table (no UPDATE or DELETE operations)
   - Audit log deletes require separate permission (database-level)
   - Periodic log exports to immutable storage (Azure Blob, AWS S3)

### OWASP Compliance

1. **A01 (Broken Access Control)**:
   - All admin endpoints require Administrator role
   - Backend validates authorization on every request
   - No client-side-only authorization checks

2. **A02 (Cryptographic Failures)**:
   - HTTPS enforced for admin app
   - Secure cookies (HttpOnly, Secure, SameSite)
   - No sensitive data in audit logs (passwords, tokens redacted)

3. **A03 (Injection)**:
   - EF Core parameterized queries (prevents SQL injection)
   - Input validation on all admin endpoints
   - Audit log queries use parameterized filters

4. **A04 (Insecure Design)**:
   - Admin app designed with security isolation from start
   - Separate deployment reduces attack surface
   - Admin actions require explicit confirmation (delete operations)

5. **A05 (Security Misconfiguration)**:
   - No default admin credentials (Administrator role assigned manually)
   - HTTPS enforced, secure headers configured
   - Error messages don't leak sensitive information

6. **A07 (Identification and Authentication Failures)**:
   - Admin authentication uses same strong password policy as main app
   - 2FA enforcement for admin users (recommended)
   - Session timeout enforced (shorter timeout for admin sessions)

7. **A09 (Security Logging and Monitoring Failures)**:
   - Comprehensive audit logging of all admin actions
   - Failed login attempts logged
   - Suspicious activity detection (multiple failed logins from same IP)

### Additional Security Measures

1. **Rate Limiting**: Admin API endpoints have strict rate limits (prevent brute force)
2. **Concurrent Session Prevention**: Only one active admin session per user (recommended)
3. **Session Expiry**: Shorter session timeout for admin users (e.g., 30 minutes vs. 24 hours)
4. **Password Confirmation**: Sensitive operations (delete user, reset password) require admin password re-confirmation
5. **Activity Notifications**: Email notification to admin when critical actions performed (e.g., user account locked)

---

## Acceptance Criteria

### AC-01: Admin Authentication Functional
**Given**: Administrator user exists in database with Administrator role assigned
**When**: Admin navigates to `https://admin.vtttools.com` and attempts to log in
**Then**: Admin is authenticated successfully and redirected to admin dashboard
**And**: Admin session is separate from main app session (different cookie)
**And**: Non-administrator users cannot access admin app (403 Forbidden)

**Verification Method**: Manual testing + E2E test with admin and non-admin users

---

### AC-02: User Management Complete
**Given**: Admin is logged into admin app
**When**: Admin navigates to User Management section
**Then**: Admin can search, filter, and view list of all users
**And**: Admin can view detailed user profile including roles, activity, and status
**And**: Admin can lock/unlock user accounts
**And**: Admin can manually verify user emails
**And**: Admin can assign/remove roles from users
**And**: Admin can send password reset emails to users
**And**: All user management actions are logged to audit trail

**Verification Method**: E2E tests covering all user management operations + audit trail verification

---

### AC-03: Audit Logging Captures All Admin Actions
**Given**: Admin is logged into admin app
**When**: Admin performs any action (view user, lock account, assign role, update config)
**Then**: Action is logged to AuditLogs table with timestamp, admin user, action type, entity, IP address, and result
**And**: Admin can view audit logs in Audit Log Viewer
**And**: Admin can filter logs by date range, user, action, entity type, and result
**And**: Admin can export filtered logs to CSV or JSON

**Verification Method**: Integration test that performs actions and verifies audit log entries created

---

### AC-04: System Configuration Changes Reflected in Main App
**Given**: Admin is logged into admin app
**When**: Admin toggles maintenance mode ON
**Then**: Main app displays maintenance page to all users (except administrators)
**When**: Admin toggles feature flag "PublicAssetGallery" OFF
**Then**: Public asset gallery is hidden in main app
**When**: Admin updates max file upload size to 10MB
**Then**: Main app enforces 10MB limit on file uploads

**Verification Method**: Integration tests that change config in admin app and verify behavior in main app

---

### AC-05: Admin App Deployed Independently
**Given**: Admin app and main app are deployed
**When**: Admin app is accessed at `https://admin.vtttools.com`
**Then**: Admin app loads successfully without affecting main app
**And**: Admin app uses separate authentication from main app
**And**: Admin app can be updated/restarted without affecting main app
**And**: Admin API endpoints are only accessible with Administrator role
**And**: IP whitelisting can be configured (infrastructure-level)

**Verification Method**: Deployment verification, security audit, penetration testing

---

### AC-06: Role Management Functional ⚠️ DEFERRED
**Status**: Deferred to future phase
**Rationale**: Only 2 roles currently exist; User Management handles Administrator role assignment

**Original Criteria** (deferred):
- ~~Admin can view list of all roles~~
- ~~Admin can view users assigned to each role~~
- ~~Admin can assign users to roles~~ (handled in User Management)
- ~~Admin can remove users from roles~~ (handled in User Management)

**Current Implementation**: Role assignment in User Management feature

---

### AC-06: Audit Log Performance Adequate
**Given**: Database contains 100,000+ audit log entries
**When**: Admin queries audit logs with filters (date range, user, action)
**Then**: Results are returned in less than 2 seconds
**And**: Pagination allows browsing large result sets
**And**: Export functionality handles up to 10,000 records efficiently

**Verification Method**: Performance testing with large dataset

---

## Risk Assessment

### Risk 1: Audit Logging Performance Impact
**Probability**: Medium
**Impact**: High (could slow down main app if not optimized)

**Description**: Writing audit logs synchronously on every request could add latency to API responses.

**Mitigation**:
- Use async logging (fire-and-forget pattern)
- Batch writes to database (write in chunks every 1-5 seconds)
- Use message queue (Azure Service Bus, RabbitMQ) for audit log writes
- Index audit log table properly for fast queries

**Contingency**: If performance issues arise, implement audit log buffer with periodic flush, or move to separate audit database.

---

### Risk 2: Admin Authentication Complexity
**Probability**: Low
**Impact**: Medium

**Description**: Implementing separate admin authentication while reusing Identity infrastructure could be complex.

**Mitigation**:
- Reuse existing authentication patterns from WebClientApp
- Use same cookie-based authentication with role validation
- Leverage ASP.NET Core Identity's built-in role management
- Clear separation: admin login uses same backend, different frontend

**Contingency**: If complexity arises, simplify by using same login page but redirect administrators to admin app after login.

---

### Risk 3: IP Whitelisting Configuration
**Probability**: Low
**Impact**: Medium

**Description**: IP whitelisting configuration varies by deployment infrastructure (Azure, AWS, on-premise).

**Mitigation**:
- Document IP whitelisting for multiple platforms (Azure Front Door, Cloudflare, Nginx)
- Make IP whitelisting optional (rely on role-based access + audit logging as baseline)
- Provide configuration examples for common deployment scenarios

**Contingency**: If IP whitelisting not feasible, rely on strong authentication + shorter session timeout + 2FA enforcement for admins.

---

### Risk 4: Scope Creep (System Monitoring)
**Probability**: Medium
**Impact**: Low

**Description**: System monitoring component (Component 6) could expand beyond 32 hours if full APM integration attempted.

**Mitigation**:
- Mark system monitoring as **Phase 2 (optional)** for post-release implementation
- Start with basic health checks (already implemented in backend)
- Integrate with existing Application Insights or similar service (read-only)
- Avoid building custom monitoring infrastructure from scratch

**Contingency**: If system monitoring becomes too complex, defer to Phase 2 and use external monitoring tools (Azure Monitor, Datadog) in interim.

---

### Risk 5: Separate Deployment Configuration
**Probability**: Low
**Impact**: Medium

**Description**: Deploying admin app separately requires additional infrastructure configuration (subdomain, certificates, load balancer).

**Mitigation**:
- Use same hosting infrastructure as main app (Azure App Service, AWS Elastic Beanstalk)
- Configure subdomain routing (admin.vtttools.com → separate app instance)
- Use wildcard SSL certificate (*.vtttools.com) or Let's Encrypt for admin subdomain
- Document deployment process with step-by-step instructions

**Contingency**: If separate deployment too complex initially, deploy admin app as separate path on same domain (/admin/*) with route-based separation, then migrate to subdomain later.

---

## Effort Estimates

### By Component

| Component | Backend | Frontend | Testing | Total |
|-----------|---------|----------|---------|-------|
| Infrastructure & Setup | 12h | 10h | 2h | 24h |
| Admin Dashboard (Main Page) | 10h | 12h | 6h | 28h |
| User Management | 28h | 22h | 10h | 60h |
| ~~Role Management~~ | ~~16h~~ | ~~10h~~ | ~~6h~~ | ~~32h~~ **DEFERRED** |
| Audit Log Viewer | 32h | 14h | 6h | 52h |
| System Configuration | 26h | 10h | 4h | 40h |
| Public Library Management | 22h | 12h | 6h | 40h |
| Testing & Security | - | - | 48h | 48h |
| Documentation & Deployment | 12h | 6h | 6h | 24h |
| **Total (Core Phases)** | **142h** | **86h** | **88h** | **316h** |

### By Phase

| Phase | Effort | Duration (dedicated) |
|-------|--------|---------------------|
| Phase 1: Foundation + Audit Infrastructure + Dashboard | 92-112h | Week 1-3 |
| Phase 2: User Management | 60h | Week 4-5 |
| ~~Phase 3: Role Management~~ | ~~32h~~ | **DEFERRED** |
| Phase 3: Audit Log Viewer | 52h | Week 6-7 |
| Phase 4: System Configuration | 40h | Week 8 |
| Phase 5: Public Library Management | 40h | Week 9 |
| Phase 6: Testing, Security, Documentation | 48h | Week 10 |
| **Total (Phase 1-6)** | **332-352h** | **10 weeks** |

### Confidence Level

**Confidence**: High (80%)
**Rationale**:
- Similar technology stack to WebClientApp (proven patterns)
- Backend leverages existing ASP.NET Core Identity infrastructure
- Most features are standard CRUD operations (user management, audit viewing)
- Role Management deferred (only 2 roles currently exist)
- Audit logging and system configuration are well-understood patterns
- Risk: Audit logging performance optimization may require additional time
- Risk: Separate deployment configuration may have platform-specific challenges

**Contingency Buffer**: +40 hours (14% of total) for unexpected integration challenges, deployment configuration, public library integration, and dashboard health checks

**Total Estimate**: 292-332 hours (7-8 weeks with dedicated focus)

---

## Testing Requirements

### Unit Tests

**Backend (xUnit + FluentAssertions)**:
- Target Coverage: ≥80%
- Services to test: UserAdminService, AuditLogService, SystemConfigService, FeatureFlagService, MaintenanceModeService
- Handlers to test: All admin handlers (UserAdminHandlers, AuditLogHandlers, SystemConfigHandlers, etc.)
- Note: RoleAdminService/Handlers deferred (Role Management feature deferred)
- Key scenarios: Validation, authorization checks, role enforcement, configuration updates

**Frontend (Vitest + React Testing Library)**:
- Target Coverage: ≥70%
- Components to test: All admin UI components (user list, user detail, audit log table, config editor)
- Key scenarios: User interactions, form validation, API error handling, filtering, sorting

### Integration Tests

**Scenarios**:
1. Admin authentication flow (login, role validation, session management)
2. User management workflows (search, lock/unlock, assign role, send password reset)
3. Role management workflows (view roles, assign user to role)
4. Audit logging (action performed → log entry created)
5. Configuration updates (admin changes config → main app reflects change)

**Systems Involved**:
- WebAdminApp (React frontend)
- VttTools.WebApp (API gateway with admin endpoints)
- Database (Identity tables, AuditLogs, SystemConfiguration)

### E2E Tests (Playwright)

**Critical Paths**:
1. Admin login → dashboard → user management → lock user → verify audit log
2. Admin login → role management → assign role to user → verify user has role
3. Admin login → audit log viewer → filter by date range → export to CSV
4. Admin login → system config → toggle feature flag → verify main app behavior
5. Admin login → maintenance mode → enable maintenance → verify main app shows maintenance page

**Coverage Target**: All major admin workflows (authentication, user management, audit viewing, config changes)

### BDD Tests (Cucumber)

**Feature Files** (to be created):
- AdminAuthentication.feature (login, logout, role validation)
- UserManagement.feature (search users, view profile, lock/unlock, assign role)
- RoleManagement.feature (view roles, assign user to role, remove user from role)
- AuditLogViewing.feature (filter logs, export logs, view log detail)
- SystemConfiguration.feature (update config, toggle feature flag, enable maintenance mode)

**Step Definitions**: TypeScript step definitions using Playwright for admin app UI automation

### Security Testing

**OWASP Compliance Verification**:
1. A01 (Broken Access Control): Verify non-admin users cannot access admin endpoints
2. A02 (Cryptographic Failures): Verify HTTPS enforced, secure cookies configured
3. A03 (Injection): Verify SQL injection prevention (parameterized queries)
4. A04 (Insecure Design): Verify admin app isolated from main app
5. A09 (Security Logging): Verify all admin actions logged

**Penetration Testing**:
- Attempt to access admin endpoints without authentication
- Attempt to access admin endpoints with non-admin user
- Attempt SQL injection in audit log filters
- Attempt XSS in configuration values
- Attempt session hijacking (CSRF attacks)

**Tools**:
- OWASP ZAP (automated vulnerability scanning)
- Manual penetration testing by security team
- Security audit report required before production deployment

### Performance Testing

**Scenarios**:
1. User search with 10,000+ users (response time <2s)
2. Audit log query with 100,000+ logs (response time <2s)
3. Export 10,000 audit logs to CSV (response time <10s)
4. Configuration change propagation to main app (latency <1s)

**Tools**: k6, JMeter, or custom load testing scripts

---

## Implementation Notes

### Design Decisions

**Decision 1: Separate React App vs. Embedded in WebClientApp**
- **Decision**: Create separate WebAdminApp project
- **Rationale**:
  - Security isolation (separate deployment, separate subdomain)
  - Independent updates (admin app can be updated without affecting users)
  - Clear separation of concerns (admin UI vs. user UI)
  - Different UI paradigms (data-heavy tables vs. creative canvas tools)
- **Alternatives Considered**:
  - Embed admin routes in WebClientApp with role protection (rejected: less secure, harder to deploy independently)
  - Build admin app with different framework (rejected: maintain consistency with existing stack)

**Decision 2: Use Existing Identity Infrastructure vs. Separate Admin User Table**
- **Decision**: Use existing ASP.NET Core Identity (Users, Roles, UserRoles tables)
- **Rationale**:
  - Leverages proven, secure authentication infrastructure
  - Single source of truth for user data
  - Administrator role already exists (seeded in database)
  - No data synchronization needed
- **Alternatives Considered**:
  - Separate admin user table (rejected: unnecessary complexity, data duplication)
  - External identity provider (Azure AD, Auth0) for admins only (rejected: added complexity, cost)

**Decision 3: Audit Logging Strategy (Middleware vs. Service Layer)**
- **Decision**: Use ASP.NET Core middleware for audit logging
- **Rationale**:
  - Centralized logging (single place to capture all requests)
  - Difficult to bypass (executes before authorization checks)
  - Consistent logging format across all endpoints
  - Minimal code duplication
- **Alternatives Considered**:
  - Log in service layer (rejected: requires adding logging to every service method, easy to forget)
  - Use AOP (Aspect-Oriented Programming) attributes (rejected: adds complexity, harder to debug)

**Decision 4: Configuration Storage (Database vs. File vs. Azure App Configuration)**
- **Decision**: Store configuration in database (SystemConfiguration table)
- **Rationale**:
  - Dynamic updates without deployment
  - Versioned changes (track who changed what and when)
  - Consistent with other VTTTools data storage
  - Simple querying via EF Core
- **Alternatives Considered**:
  - Configuration file (appsettings.json) (rejected: requires deployment to update)
  - Azure App Configuration (rejected: external dependency, vendor lock-in, cost)
  - Environment variables (rejected: not dynamic, harder to manage)

**Decision 5: MUI DataGrid for List Views**
- **Decision**: Use Material-UI DataGrid (MUI X Data Grid)
- **Rationale**:
  - Professional, feature-rich table component
  - Built-in filtering, sorting, pagination
  - Integrates seamlessly with Material-UI theme
  - Supports server-side pagination (essential for large datasets)
- **Alternatives Considered**:
  - Build custom table component (rejected: reinventing the wheel, significant dev time)
  - Use react-table (rejected: Material-UI DataGrid more integrated with MUI ecosystem)
  - MUI X Data Grid Pro (paid license) vs. Community Edition (free): Use Community Edition initially, upgrade if advanced features needed (column pinning, tree data, Excel export)

---

### Code Locations

**WebAdminApp** (new project):
- Path: `Source/WebAdminApp/`
- Structure:
  ```
  WebAdminApp/
  ├── src/
  │   ├── components/
  │   │   ├── auth/          # Admin login components
  │   │   ├── layout/        # Admin layout (sidebar, header)
  │   │   ├── users/         # User management components
  │   │   ├── roles/         # Role management components
  │   │   ├── audit/         # Audit log viewer components
  │   │   ├── config/        # System config components
  │   │   └── monitoring/    # Monitoring components (optional)
  │   ├── pages/
  │   │   ├── DashboardPage.tsx
  │   │   ├── UsersPage.tsx
  │   │   ├── RolesPage.tsx
  │   │   ├── AuditPage.tsx
  │   │   ├── ConfigPage.tsx
  │   │   └── MonitoringPage.tsx
  │   ├── store/             # Redux store (admin slices)
  │   ├── types/             # TypeScript interfaces
  │   └── App.tsx
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
  ```

**Admin Backend** (new project):
- Path: `Source/Admin/`
- Structure:
  ```
  Admin/
  ├── Handlers/
  │   ├── UserAdminHandlers.cs
  │   ├── RoleAdminHandlers.cs
  │   ├── AuditLogHandlers.cs
  │   └── SystemConfigHandlers.cs
  ├── Services/
  │   ├── UserAdminService.cs
  │   ├── RoleAdminService.cs
  │   ├── AuditLogService.cs
  │   └── SystemConfigService.cs
  ├── EndpointMappers/
  │   └── AdminEndpointsMapper.cs
  └── Program.cs
  ```

**Admin Domain** (new):
- Path: `Source/Domain/Admin/`
- Structure:
  ```
  Domain/Admin/
  ├── Model/
  │   ├── AuditLog.cs
  │   └── SystemConfiguration.cs
  ├── Contracts/
  │   ├── IUserAdminService.cs
  │   ├── IRoleAdminService.cs
  │   ├── IAuditLogService.cs
  │   └── ISystemConfigService.cs
  ├── Storage/
  │   ├── IAuditLogStorage.cs
  │   └── ISystemConfigStorage.cs
  └── ApiContracts/
      ├── UserAdminRequest.cs
      ├── UserAdminResponse.cs
      ├── AuditLogQueryRequest.cs
      └── SystemConfigUpdateRequest.cs
  ```

**Admin Data Layer** (new):
- Path: `Source/Data/Admin/`
- Structure:
  ```
  Data/Admin/
  ├── AuditLogStorage.cs
  └── SystemConfigStorage.cs
  ```

**Middleware** (new):
- Path: `Source/Common/Middleware/`
- Files:
  - `AuditLogMiddleware.cs`
  - `MaintenanceModeMiddleware.cs`
  - `AdminAuthorizationMiddleware.cs`

**EF Core Migrations** (updates):
- Path: `Source/Data.MigrationService/Migrations/`
- New migrations:
  - `{timestamp}_CreateAuditLogsTable.cs`
  - `{timestamp}_CreateSystemConfigurationTable.cs`

**Admin Unit Tests** (new):
- Path: `Source/Admin.UnitTests/`
- Structure:
  ```
  Admin.UnitTests/
  ├── Services/
  │   ├── UserAdminServiceTests.cs
  │   ├── RoleAdminServiceTests.cs
  │   ├── AuditLogServiceTests.cs
  │   └── SystemConfigServiceTests.cs
  └── Handlers/
      ├── UserAdminHandlersTests.cs
      └── AuditLogHandlersTests.cs
  ```

---

### Configuration Changes

**appsettings.json** (VttTools.WebApp):
```json
{
  "AdminSettings": {
    "EnableIpWhitelisting": true,
    "AllowedIpAddresses": ["10.0.0.0/8", "172.16.0.0/12"],
    "AdminSessionTimeoutMinutes": 30,
    "MaxAuditLogExportRecords": 10000
  },
  "AuditLogging": {
    "Enabled": true,
    "BatchSize": 100,
    "FlushIntervalSeconds": 5,
    "ExcludedPaths": ["/api/health", "/api/metrics"]
  }
}
```

**VttTools.slnx** (solution file update):
- Add new projects:
  - `Source/Admin/VttTools.Admin.csproj`
  - `Source/WebAdminApp/` (React project, not in .slnx)
  - `Source/Admin.UnitTests/VttTools.Admin.UnitTests.csproj`

**EF Core DbContext** (ApplicationDbContext):
- Add DbSets:
  ```csharp
  public DbSet<AuditLog> AuditLogs { get; set; }
  public DbSet<SystemConfiguration> SystemConfiguration { get; set; }
  ```

---

## Sprint Planning

**World Duration**: 8 weeks (dedicated, full-time focus) or 12-16 weeks (part-time)

**Sprint Goal Alignment**: Incremental delivery with testable milestones

### Sprint 1-2: Foundation + Dashboard (52 hours)
- Goal: Admin app accessible with authentication, audit logging, and monitoring dashboard as main page
- Deliverables: Admin login, dashboard with health checks and metrics, audit middleware, EF migrations
- Testing: Admin authentication E2E test, dashboard rendering and data loading tests

### Sprint 3-4: User Management (60 hours)
- Goal: Complete user administration interface
- Deliverables: User search, profile view, lock/unlock, role assignment
- Testing: User management E2E tests, service unit tests

### Sprint 5: Role Management ⚠️ DEFERRED
- Status: Deferred to future phase (32 hours removed from scope)
- Rationale: Only 2 roles exist; User Management handles role assignment

### Sprint 5: Audit Logging (52 hours)
- Goal: Comprehensive audit log viewer with export and live monitoring
- Deliverables: Audit log table (infinite scroll), live monitoring grid (tail tracking), filters, export to CSV/JSON, WebSocket/SignalR for real-time updates
- Testing: Performance tests with large dataset, real-time update testing

### Sprint 6: System Configuration (40 hours)
- Goal: Application settings management and feature flags
- Deliverables: Config editor, feature flag toggles, maintenance mode, database config
- Testing: Configuration update integration tests

### Sprint 7: Public Library Management (40 hours)
- Goal: Manage system-owned public library content
- Deliverables: Content library view, upload/create, content editor, publish/unpublish workflow
- Testing: Content management E2E tests, main app integration tests

### Sprint 8: Testing & Deployment (48 hours)
- Goal: Production-ready admin app
- Deliverables: Security audit, complete test suite, deployment scripts, documentation
- Testing: Comprehensive E2E testing, security testing, penetration testing

---

## Progress Tracking

### Completion Status (To Be Updated During Implementation)

- **Phase 1 (Foundation + Dashboard)**: 🔜 Planned (0%)
- **Phase 2 (User Management)**: 🔜 Planned (0%)
- ~~**Phase 3 (Role Management)**~~: ⚠️ DEFERRED
- **Phase 3 (Audit Logging)**: 🔜 Planned (0%)
- **Phase 4 (System Configuration)**: 🔜 Planned (0%)
- **Phase 5 (Public Library Management)**: 🔜 Planned (0%)
- **Phase 6 (Testing & Security)**: 🔜 Planned (0%)
- **Overall**: 0% (0/292 hours core)

### Activity Log

- **2025-10-31**: World created with comprehensive specification
- **2025-10-31**: Role Management feature deferred (only 2 roles exist; User Management handles role assignment). Reduced scope from 280-320h to 248-288h.
- **2025-10-31**: Audit Log Viewer updated with infinite scroll pagination and separate live monitoring grid (tail tracking). Increased from 48h to 52h. New scope: 252-292h.
- **2025-10-31**: System Configuration categories clarified: Security (max login attempts, password policy, 2FA, session timeout), Feature Flags, Storage (database connection config, blob storage quotas, file limits), Email, Service API Settings (new category for external services), Maintenance Mode.
- **2025-10-31**: Public Library Management added (40h) - manage system-owned content for public library. Commerce features deferred to EPIC-003. New scope: 288-328h.
- **2025-10-31**: Admin Dashboard made core feature (was optional System Monitoring) - serves as admin app main page with health checks, metrics, recent activity. Moved to Phase 1. Added 28h. New scope: 292-332h (core only, no optional features).
- **2025-10-31**: Audit Infrastructure dependency resolved - will be built in EPIC-002 Phase 1 instead of waiting for EPIC-001 Phase 12. Added 40-60h to Phase 1. Total effort increased from 292-332h to 332-352h. Duration increased from 9 weeks to 10 weeks. Created 5 comprehensive feature specifications (UserManagement, AuditLogViewing, SystemConfiguration, PublicLibraryManagement, AdminDashboard) in Documents/Areas/Admin/Features/. Created BDD scenario outlines for all admin features. Updated STRUCTURE.md with WebAdminApp and VttTools.Admin components.

---

## Related Documentation

### Implementation Planning
- **📋 Implementation Roadmap**: `Documents/Tasks/EPIC-002/ROADMAP.md` ✅
  - 6 phases, 352 hours, 10 weeks
  - Dependency graph, critical path, quality gates
  - 7 implementation risks with mitigation strategies

### Business Layer (Features)
- **UserManagement**: `Documents/Areas/Admin/Features/UserManagement/FEATURE.md` ✅
- **AuditLogViewing**: `Documents/Areas/Admin/Features/AuditLogViewing/FEATURE.md` ✅
- **SystemConfiguration**: `Documents/Areas/Admin/Features/SystemConfiguration/FEATURE.md` ✅
- **PublicLibraryManagement**: `Documents/Areas/Admin/Features/PublicLibraryManagement/FEATURE.md` ✅
- **AdminDashboard**: `Documents/Areas/Admin/Features/AdminDashboard/FEATURE.md` ✅
- **Account Management** (Area: Identity): User profile management - admin app manages these users

### BDD Test Scenarios
- **UserManagement**: `Documents/Areas/Admin/Features/UserManagement/UserManagement.feature` (10 scenarios) ✅
- **AuditLogViewing**: `Documents/Areas/Admin/Features/AuditLogViewing/AuditLogViewing.feature` (13 scenarios) ✅
- **SystemConfiguration**: `Documents/Areas/Admin/Features/SystemConfiguration/SystemConfiguration.feature` (13 scenarios) ✅
- **PublicLibraryManagement**: `Documents/Areas/Admin/Features/PublicLibraryManagement/PublicLibraryManagement.feature` (12 scenarios) ✅
- **AdminDashboard**: `Documents/Areas/Admin/Features/AdminDashboard/AdminDashboard.feature` (15 scenarios) ✅
- **Total**: 63 BDD scenarios across 5 feature files

### Structure Documentation
- **WebAdminApp Component**: `Documents/Structure/STRUCTURE.md` ✅
- **VttTools.Admin Backend**: `Documents/Structure/STRUCTURE.md` ✅

### Implementation Guides
- **TypeScript Style Guide**: `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md`
- **C# Style Guide**: `Documents/Guides/CSHARP_STYLE_GUIDE.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Common Commands**: `Documents/Guides/COMMON_COMMANDS.md`

### Security & Compliance
- **Authorization Requirements**: `Documents/Guides/AUTHORIZATION_REQUIREMENTS.md`
- **OWASP Security Standards**: To be documented in security audit (Phase 6)

---

## EPIC-003 Reference: E-Commerce & Monetization (Future)

**Status**: Deferred - Post-Release Feature
**Dependency**: Requires EPIC-002 Public Library Management completion
**Estimated Effort**: 120-160 hours (to be refined when created)

### Deferred Features for EPIC-003

#### 1. **Payment Integration**
- Payment provider integration (Stripe, PayPal)
- Payment gateway configuration in System Configuration
- Secure payment processing (PCI compliance)
- Webhook handling for payment notifications
- Payment retry logic for failed transactions

#### 2. **Product & Bundle Management** (Admin App)
- Create product listings from public library content
- Bundle creation (group multiple adventures/assets into packages)
- Bundle pricing and discount strategies
- Product SKU management
- Inventory tracking (for limited editions)

#### 3. **Subscription Management** (Admin App)
- Define subscription tiers (Basic, Pro, Enterprise)
- Subscription pricing configuration (monthly, annual)
- Trial period configuration
- Subscription feature access control
- Billing cycle management

#### 4. **Shopping Cart & Checkout** (Main App)
- Shopping cart UI (add/remove items)
- Cart persistence (survive sessions)
- Checkout flow (review order, payment, confirmation)
- Order confirmation emails
- Purchase receipt generation

#### 5. **Order Management** (Admin App)
- View all orders (with filters: date, status, customer)
- Order detail view (items, payment info, shipping if applicable)
- Process refunds (full/partial)
- Order status tracking (pending, completed, refunded, failed)
- Export order history to CSV

#### 6. **User Purchase Management** (Main App & Admin App)
- User purchase history (in main app profile)
- Download purchased content (from user library)
- Re-download access (unlimited)
- Gift purchases to other users
- Admin view: User's purchase history and access management

#### 7. **Subscription User Experience** (Main App)
- Subscribe to tier (monthly/annual)
- Access subscription-only content
- Manage subscription (upgrade/downgrade/cancel)
- View billing history
- Update payment method

#### 8. **Revenue & Analytics** (Admin App)
- Revenue dashboard (daily, weekly, monthly sales)
- Top-selling products report
- Subscription metrics (active, churned, MRR, ARR)
- Customer lifetime value (CLV)
- Sales by product type (adventures, assets, bundles, subscriptions)
- Revenue forecasting

#### 9. **Discount & Promo Codes** (Admin App & Main App)
- Create promo codes (fixed amount, percentage off)
- Promo code restrictions (min purchase, specific products, first-time users)
- Expiration dates
- Usage limits (total uses, per-user uses)
- Apply promo codes at checkout

#### 10. **Merchandise (Physical Goods)** (Future Phase)
- Physical product management (t-shirts, dice, books)
- Shipping address collection
- Shipping cost calculation
- Integration with fulfillment services
- Tracking number management

#### 11. **Tax & Compliance**
- Tax calculation (by jurisdiction)
- VAT/GST support (EU/international)
- Sales tax reporting
- Compliance with regional e-commerce laws
- Invoice generation for business customers

#### 12. **Fraud Prevention**
- Fraud detection rules (velocity checks, suspicious patterns)
- Manual order review queue
- Blacklist management (emails, IPs, credit cards)
- Chargeback handling

### Technical Components (EPIC-003)

**Backend**:
- Payment provider SDK integration (Stripe .NET, PayPal SDK)
- Order/Transaction domain models and storage
- Subscription billing engine (recurring charges)
- Webhook handlers for payment events
- Tax calculation service integration

**Frontend (Main App)**:
- Shopping cart UI components
- Checkout flow pages (cart → payment → confirmation)
- User purchase library view
- Subscription management page

**Frontend (Admin App)**:
- Product/Bundle management UI
- Order management interface
- Revenue dashboard with charts
- Subscription management UI
- Promo code management UI

**Database**:
- Orders table (order details, status, totals)
- OrderItems table (line items in each order)
- Payments table (payment transactions, status)
- Subscriptions table (user subscriptions, billing info)
- PromoCodes table (promo code definitions and usage tracking)

**Integration Points**:
- Stripe API (charges, subscriptions, webhooks)
- PayPal API (PayPal Checkout, subscriptions)
- Email service (order confirmations, receipts, subscription notifications)
- Audit logging (all purchases, refunds, subscription changes)

### Success Criteria (EPIC-003)

1. Users can purchase individual adventures/assets with credit card
2. Users can subscribe to monthly/annual plans
3. Admins can create bundles and set pricing
4. Revenue dashboard shows accurate sales data
5. Payment processing is secure (PCI compliant via Stripe/PayPal)
6. Order management allows refunds and customer support
7. Tax calculation handles US sales tax and international VAT

---

## Change Log

- **2025-10-31**: EPIC-002 created with full specification (executive summary, features, architecture, risks, estimates)
- **2025-10-31**: EPIC-003 reference section created for deferred commerce features

---

<!--
═══════════════════════════════════════════════════════════════
TASK SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Task Identity & Scope (15 points)
✅ 5pts: Task type clearly specified (World - Large-Scale Infrastructure)
✅ 5pts: Clear, actionable title and description (Administration Application)
✅ 5pts: Priority (Critical) and effort estimate (292-332 hours core, includes Admin Dashboard as main page, Public Library Management, Role Management deferred) provided

## Cross-References (35 points)
✅ 10pts: All affected features documented (User Management, ~~Role Management~~ DEFERRED, Audit Logging, System Config, Public Library Management)
✅ 10pts: All affected structure components documented (WebAdminApp, Admin backend, middleware)
✅ 10pts: Domain impact clarified (new AuditLog, SystemConfiguration models; uses existing User, Role models)
✅ 5pts: Affected BDD files identified (new admin feature files to be created)

## Success Criteria (15 points)
✅ 10pts: 5 clear, measurable success criteria (user management, audit logging, RBAC, config, deployment)
✅ 5pts: 7 acceptance criteria in Given/When/Then format

## Implementation Plan (20 points)
✅ 10pts: Technical approach documented (5 core phases + 1 optional, incremental delivery)
✅ 5pts: 5 core implementation phases with time estimates (40h, 60h, 48h, 40h, 48h) + 1 optional (32h)
✅ 5pts: Dependencies identified (EPIC-001 Phase 2, ASP.NET Core Identity)

## Quality & Testing (15 points)
✅ 5pts: Testing requirements specified (unit, integration, E2E, BDD, security, performance)
✅ 5pts: Risk assessment completed (5 risks with mitigation)
✅ 5pts: Code locations identified (WebAdminApp, Admin backend, middleware, domain, data)

## Score: 100/100 ✅
-->
