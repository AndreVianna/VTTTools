# Feature: System Configuration

**Area**: Admin
**Status**: Planned
**Priority**: High
**Effort Estimate**: 40 hours (26h backend + 10h frontend + 4h testing)
**Dependencies**: None

## Overview

Centralized system configuration management for the VTT Tools platform. Provides administrators with a unified interface to manage security settings, feature flags, storage configuration, email settings, service API settings, and maintenance mode without requiring code deployments or direct database access.

## Business Context

### Problem Statement

System administrators need:
- Centralized control over system-wide settings without code changes
- Ability to toggle features on/off without redeployment (feature flags)
- Configuration of security policies (password strength, session timeouts, 2FA enforcement)
- Management of external service integrations (SMTP, blob storage, APIs)
- Quick activation of maintenance mode for planned downtime
- Audit trail of configuration changes

### Target Users

- **System Administrators**: Full access to all configuration categories
- **Operations Team**: Limited access to maintenance mode only (future)

### Success Metrics

- Configuration changes applied within 30 seconds without restart
- Zero downtime configuration updates (hot reload)
- Feature flags toggle instantly affects new requests
- Maintenance mode activates within 10 seconds
- 100% of configuration changes audited

## Functional Requirements

### FR-001: Security Settings Configuration
**Priority**: Critical

Manage authentication and session security policies.

**Acceptance Criteria**:
- Configuration UI section: "Security Settings"
- **Max Login Attempts**:
  - Number input (range: 3-10, default: 5)
  - Helper text: "Account locked after N failed login attempts"
  - Validation: Must be between 3-10
- **Password Policy**:
  - Minimum length: Number input (range: 8-32, default: 8)
  - Require uppercase letter: Checkbox (default: true)
  - Require lowercase letter: Checkbox (default: true)
  - Require digit: Checkbox (default: true)
  - Require special character: Checkbox (default: true)
  - Password expiration days: Number input (0 = never, 30-365, default: 0)
- **2FA Enforcement**:
  - Radio buttons: Optional (default) / Required for Admins / Required for All Users
  - Warning: "Requiring 2FA for all users will force logout and require setup"
- **Session Timeout**:
  - Number input (minutes, range: 15-1440, default: 60)
  - Idle timeout: Checkbox (logout on inactivity)
  - Absolute timeout: Checkbox (logout after N minutes regardless of activity)
- Save button applies settings immediately (no restart required)
- Confirmation dialog for 2FA enforcement changes
- Audit log entry created on save

### FR-002: Feature Flags Management
**Priority**: High

Enable/disable platform features without code deployment.

**Acceptance Criteria**:
- Configuration UI section: "Feature Flags"
- Table/list of feature flags with columns: Feature Name, Description, Enabled Status, Last Modified
- **Feature flags to manage**:
  - **Encounter Collaboration**: Enable/disable real-time collaboration features
  - **Public Asset Gallery**: Show/hide public library in main app
  - **2FA Enforcement**: Override 2FA requirement (linked to Security Settings)
  - **New UI Components**: Beta UI features toggle (e.g., new encounter editor tools)
  - **Asset Upload**: Enable/disable asset upload functionality
  - **Campaign Sharing**: Enable/disable campaign sharing between users
- Toggle switches for each feature (instant on/off)
- "Add New Feature Flag" button (admin can define custom flags):
  - Dialog: Feature key (snake_case), Display name, Description
  - Validation: Unique key, alphanumeric + underscores only
- Delete feature flag option (confirmation required)
- Feature flag changes apply immediately to new requests (cached for 30 seconds)
- Audit log entry per toggle change

### FR-003: Storage Configuration
**Priority**: High

Manage database and blob storage settings.

**Acceptance Criteria**:
- Configuration UI section: "Storage Configuration"
- **Database Connection**:
  - Connection string: Encrypted text input (display as ********, "Show" button to reveal)
  - Connection pool size: Number input (min: 10, max: 100, default: 20)
  - Connection timeout (seconds): Number input (range: 10-60, default: 30)
  - Command timeout (seconds): Number input (range: 30-300, default: 60)
  - Retry on failure: Checkbox (default: true)
  - Max retry count: Number input (range: 0-5, default: 3)
  - "Test Connection" button (validates connection, shows success/error)
  - Warning: "Changing connection string requires app restart"
- **Blob Storage Configuration**:
  - Provider: Dropdown (Azure Blob Storage, AWS S3, Local File System)
  - Connection string/credentials: Encrypted text input
  - Container/bucket name: Text input
  - "Test Connection" button
- **Blob Storage Quotas**:
  - Per-user quota (GB): Number input (range: 0.1-100, default: 5)
  - Total system quota (GB): Number input (range: 10-10000, default: 500)
  - Display current usage: "Used: 127 GB / 500 GB (25%)"
- **File Size Limits**:
  - Max asset file size (MB): Number input (range: 1-500, default: 50)
  - Max image file size (MB): Number input (range: 1-50, default: 10)
  - Max document file size (MB): Number input (range: 1-100, default: 25)
- **Allowed File Types**:
  - Whitelist mode: Multi-select dropdown with common extensions (.png, .jpg, .pdf, .mp3, .mp4, etc.)
  - Custom extensions: Text input for additional types (comma-separated)
  - Blacklist mode: Multi-select for blocked extensions (alternative to whitelist)
- Save button applies settings immediately
- Audit log entry created on save

### FR-004: Email Settings Configuration
**Priority**: High

Configure SMTP server and email templates.

**Acceptance Criteria**:
- Configuration UI section: "Email Settings"
- **SMTP Configuration**:
  - SMTP host: Text input (e.g., smtp.gmail.com)
  - SMTP port: Number input (range: 25-587-465-2525, default: 587)
  - Use SSL/TLS: Checkbox (default: true)
  - Username: Text input (email address)
  - Password: Encrypted text input (display as ********)
  - From email: Text input (validated email format)
  - From name: Text input (e.g., "VTT Tools Support")
  - "Send Test Email" button:
    - Dialog: Enter recipient email
    - Sends test email with success/error message
- **Email Templates**:
  - Template list: Welcome Email, Password Reset, Email Confirmation, 2FA Setup, Account Locked
  - Click template to edit in modal dialog:
    - Subject: Text input (supports variables: {{UserName}}, {{ResetLink}}, etc.)
    - Body: Rich text editor or markdown editor
    - Preview pane (renders with sample data)
    - Variables help panel (lists available variables)
  - Save button updates template
  - Reset to default button (confirmation required)
- Audit log entry per template change

### FR-005: Service API Settings Configuration
**Priority**: Medium

Configure external service integrations (per-service settings).

**Acceptance Criteria**:
- Configuration UI section: "Service API Settings"
- **Service list**: Add Service button, table of configured services
- **Per-service configuration**:
  - Service name: Text input (e.g., "Payment Gateway", "Map Tile API")
  - Service type: Dropdown (REST API, GraphQL, gRPC, WebSocket)
  - Host: Text input (URL or hostname)
  - Port: Number input (optional)
  - API key/credentials: Encrypted text input
  - Timeout (seconds): Number input (range: 5-120, default: 30)
  - Retry on failure: Checkbox
  - Max retry count: Number input (range: 0-5, default: 3)
  - Rate limits:
    - Requests per second: Number input (range: 1-1000, default: 10)
    - Requests per day: Number input (range: 100-1000000, default: 10000)
  - "Test Connection" button (sends health check request)
- Delete service configuration (confirmation required)
- Save button applies settings immediately
- Audit log entry per service change

### FR-006: Maintenance Mode Management
**Priority**: High

Control platform availability for planned maintenance.

**Acceptance Criteria**:
- Configuration UI section: "Maintenance Mode"
- **Master toggle**: Large switch "Enable Maintenance Mode" (default: off)
  - Confirmation dialog: "This will log out all users and prevent logins. Continue?"
  - When enabled:
    - Main app displays maintenance page (not admin app)
    - All main app API requests return 503 Service Unavailable
    - Admin app remains accessible
- **Maintenance message**:
  - Rich text editor or markdown editor (supports formatting)
  - Preview pane (shows how users will see message)
  - Default message: "VTT Tools is undergoing scheduled maintenance. We'll be back soon!"
  - Supports HTML/markdown for links, formatting
- **Scheduled maintenance** (optional):
  - Start time: DateTime picker (future datetime)
  - End time: DateTime picker (future datetime)
  - Auto-enable checkbox: "Automatically enter maintenance mode at start time"
  - Auto-disable checkbox: "Automatically exit maintenance mode at end time"
  - Display countdown: "Maintenance starts in 2 hours 15 minutes"
- **Current status display**:
  - If maintenance mode on: Red banner "MAINTENANCE MODE ACTIVE" with disable button
  - If scheduled: Yellow banner "Scheduled maintenance: Oct 31 2025 10:00 PM - 11:00 PM UTC"
- Audit log entry when maintenance mode toggled

## Non-Functional Requirements

### NFR-001: Performance
- Configuration loads within 1 second
- Save operation completes within 2 seconds
- Feature flag changes apply within 30 seconds (cache TTL)
- Maintenance mode activates within 10 seconds

### NFR-002: Security
- All operations require Administrator role
- Sensitive fields encrypted in database (connection strings, passwords, API keys)
- Encrypted fields never sent to frontend (display as ********, server-side decrypt only)
- "Test Connection" buttons use temporary credentials (don't save until explicit save)
- Configuration changes audited (old value → new value)

### NFR-003: Usability
- Grouped configuration by category (tabs or accordion)
- Validation errors displayed inline (red text under field)
- Confirmation dialogs for destructive changes (maintenance mode, 2FA enforcement)
- Success toast on save: "Configuration saved successfully"
- Error toast on failure: "Failed to save configuration: {error message}"

### NFR-004: Hot Reload
- Configuration changes apply without app restart (except database connection string)
- Use `IOptionsMonitor<T>` for hot reload support in .NET
- Configuration cached with short TTL (30 seconds) for performance

## Technical Design

### Frontend Components

**Component Structure**:
```
WebAdminApp/src/features/configuration/
├── ConfigurationView.tsx         # Main view with tabs
├── SecuritySettingsTab.tsx       # Security settings form
├── FeatureFlagsTab.tsx           # Feature flags table
├── StorageConfigTab.tsx          # Storage configuration
├── EmailSettingsTab.tsx          # Email/SMTP settings
├── ServiceApiSettingsTab.tsx     # External services
├── MaintenanceModeTab.tsx        # Maintenance mode
└── components/
    ├── EncryptedTextField.tsx    # Password/key input
    ├── TestConnectionButton.tsx  # Test connection UI
    ├── RichTextEditor.tsx        # Email template editor
    └── MaintenanceBanner.tsx     # Active maintenance warning
```

**State Management**:
- RTK Query for configuration fetching/updating
- Local state for form editing (React Hook Form)
- Optimistic updates for feature flags (toggle feels instant)
- Validation with Yup schemas

### Backend Endpoints

**REST API** (`/api/admin/configuration`):

1. `GET /api/admin/configuration/security`
   - Returns: `SecuritySettingsDto`
   - Authorization: [Authorize(Roles = "Administrator")]

2. `PUT /api/admin/configuration/security`
   - Request body: `UpdateSecuritySettingsRequest`
   - Returns: `{ success: bool, message: string }`

3. `GET /api/admin/configuration/feature-flags`
   - Returns: `FeatureFlagDto[]`

4. `PUT /api/admin/configuration/feature-flags/{flagKey}`
   - Request body: `{ enabled: bool }`
   - Returns: `FeatureFlagDto`

5. `POST /api/admin/configuration/feature-flags`
   - Request body: `CreateFeatureFlagRequest { Key, DisplayName, Description }`
   - Returns: `FeatureFlagDto`

6. `DELETE /api/admin/configuration/feature-flags/{flagKey}`
   - Returns: `{ success: bool }`

7. `GET /api/admin/configuration/storage`
   - Returns: `StorageConfigDto` (connection strings encrypted)

8. `PUT /api/admin/configuration/storage`
   - Request body: `UpdateStorageConfigRequest`
   - Returns: `{ success: bool }`

9. `POST /api/admin/configuration/storage/test-database`
   - Request body: `{ connectionString: string }` (temporary test)
   - Returns: `{ success: bool, message: string, latencyMs: int }`

10. `POST /api/admin/configuration/storage/test-blob`
    - Request body: `{ provider: string, connectionString: string }`
    - Returns: `{ success: bool, message: string }`

11. `GET /api/admin/configuration/email`
    - Returns: `EmailConfigDto` (SMTP password encrypted)

12. `PUT /api/admin/configuration/email`
    - Request body: `UpdateEmailConfigRequest`
    - Returns: `{ success: bool }`

13. `POST /api/admin/configuration/email/send-test`
    - Request body: `{ recipientEmail: string }`
    - Returns: `{ success: bool, message: string }`

14. `GET /api/admin/configuration/email/templates`
    - Returns: `EmailTemplateDto[]`

15. `PUT /api/admin/configuration/email/templates/{templateKey}`
    - Request body: `{ subject: string, body: string }`
    - Returns: `EmailTemplateDto`

16. `GET /api/admin/configuration/services`
    - Returns: `ServiceApiConfigDto[]`

17. `POST /api/admin/configuration/services`
    - Request body: `CreateServiceApiConfigRequest`
    - Returns: `ServiceApiConfigDto`

18. `PUT /api/admin/configuration/services/{serviceId}`
    - Request body: `UpdateServiceApiConfigRequest`
    - Returns: `ServiceApiConfigDto`

19. `DELETE /api/admin/configuration/services/{serviceId}`
    - Returns: `{ success: bool }`

20. `GET /api/admin/configuration/maintenance`
    - Returns: `MaintenanceModeDto`

21. `PUT /api/admin/configuration/maintenance`
    - Request body: `UpdateMaintenanceModeRequest { Enabled, Message, ScheduledStart, ScheduledEnd }`
    - Returns: `{ success: bool }`

**DTOs**:
```csharp
public record SecuritySettingsDto {
    public int MaxLoginAttempts { get; init; }
    public int PasswordMinLength { get; init; }
    public bool PasswordRequireUppercase { get; init; }
    public bool PasswordRequireLowercase { get; init; }
    public bool PasswordRequireDigit { get; init; }
    public bool PasswordRequireSpecialChar { get; init; }
    public int PasswordExpirationDays { get; init; }
    public string TwoFactorEnforcement { get; init; } // "Optional", "RequiredForAdmins", "RequiredForAll"
    public int SessionTimeoutMinutes { get; init; }
    public bool IdleTimeout { get; init; }
    public bool AbsoluteTimeout { get; init; }
}

public record FeatureFlagDto {
    public string Key { get; init; }
    public string DisplayName { get; init; }
    public string Description { get; init; }
    public bool Enabled { get; init; }
    public DateTime LastModified { get; init; }
}

public record StorageConfigDto {
    public string DatabaseConnectionString { get; init; } // Always "********" (never decrypted for frontend)
    public int ConnectionPoolSize { get; init; }
    public int ConnectionTimeoutSeconds { get; init; }
    public int CommandTimeoutSeconds { get; init; }
    public bool RetryOnFailure { get; init; }
    public int MaxRetryCount { get; init; }
    public string BlobStorageProvider { get; init; }
    public string BlobConnectionString { get; init; } // Always "********"
    public string ContainerName { get; init; }
    public decimal PerUserQuotaGB { get; init; }
    public decimal TotalQuotaGB { get; init; }
    public decimal CurrentUsageGB { get; init; }
    public int MaxAssetFileSizeMB { get; init; }
    public int MaxImageFileSizeMB { get; init; }
    public int MaxDocumentFileSizeMB { get; init; }
    public string[] AllowedFileExtensions { get; init; }
}
```

### Service Layer

**Interface**: `IConfigurationService`

**Implementation**: `ConfigurationService`
- Uses `IOptionsMonitor<T>` for hot reload
- Stores configuration in database table: `SystemConfiguration`
- Encrypts sensitive fields with `IDataProtector` before saving
- Updates in-memory cache on save (invalidates cache)
- Publishes configuration change events for hot reload

**Database Schema**:
```sql
CREATE TABLE SystemConfiguration (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Category NVARCHAR(50) NOT NULL, -- "Security", "FeatureFlags", "Storage", "Email", "ServiceApi", "Maintenance"
    ConfigKey NVARCHAR(100) NOT NULL,
    ConfigValue NVARCHAR(MAX) NOT NULL, -- JSON or encrypted string
    IsEncrypted BIT NOT NULL DEFAULT 0,
    LastModified DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedBy UNIQUEIDENTIFIER NOT NULL, -- Admin user ID
    UNIQUE (Category, ConfigKey)
);

CREATE INDEX IX_SystemConfiguration_Category ON SystemConfiguration(Category);
```

**Feature Flag Evaluation**:
```csharp
public class FeatureFlagService : IFeatureFlagService {
    private readonly IMemoryCache _cache;
    private readonly IConfigurationService _config;

    public async Task<bool> IsEnabledAsync(string featureKey) {
        return await _cache.GetOrCreateAsync($"feature:{featureKey}", async entry => {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30);
            return await _config.GetFeatureFlagAsync(featureKey);
        });
    }
}
```

## Testing Strategy

### Unit Tests (Backend)
**Target**: 80% coverage

**Test Suites**:
- `ConfigurationServiceTests.cs`:
  - GetSecuritySettingsAsync_ReturnsSettings
  - UpdateSecuritySettingsAsync_ValidData_UpdatesSettings
  - GetFeatureFlagsAsync_ReturnsAllFlags
  - ToggleFeatureFlagAsync_ChangesState
  - CreateFeatureFlagAsync_UniqueName_CreatesFlag
  - CreateFeatureFlagAsync_DuplicateName_ThrowsException
  - GetStorageConfigAsync_EncryptsConnectionStrings
  - UpdateStorageConfigAsync_DecryptsAndSaves
  - TestDatabaseConnectionAsync_ValidConnectionString_ReturnsSuccess
  - TestDatabaseConnectionAsync_InvalidConnectionString_ReturnsError
  - SendTestEmailAsync_ValidSMTP_SendsEmail
  - UpdateMaintenanceModeAsync_EnablesMode_LogsAudit

### Unit Tests (Frontend)
**Target**: 70% coverage

**Test Suites**:
- `SecuritySettingsTab.test.tsx`:
  - Renders security settings form
  - Validates password min length range
  - Shows confirmation for 2FA enforcement change
  - Saves settings on submit
- `FeatureFlagsTab.test.tsx`:
  - Renders feature flag list
  - Toggles feature flag
  - Creates new feature flag
  - Deletes feature flag with confirmation
- `MaintenanceModeTab.test.tsx`:
  - Toggles maintenance mode
  - Shows confirmation dialog
  - Schedules maintenance window
  - Displays countdown timer

### BDD E2E Tests
**Framework**: Cucumber + Playwright

**Feature File**: `AdminSystemConfiguration.feature`

**Critical Scenarios**:
1. Admin updates max login attempts in security settings
2. Admin enables 2FA enforcement for all users (with confirmation)
3. Admin toggles feature flag (encounter collaboration on/off)
4. Admin creates new custom feature flag
5. Admin updates database connection pool size
6. Admin tests SMTP connection (success)
7. Admin edits password reset email template
8. Admin adds new service API configuration
9. Admin enables maintenance mode (main app shows maintenance page)
10. Admin schedules future maintenance window

**Smoke Scenario**: Admin login → Configuration page loads → All tabs accessible

## UI/UX Design

### Configuration View
**Layout**: Tabbed interface (MUI Tabs) with 6 tabs
**Tabs**: Security Settings, Feature Flags, Storage, Email, Service APIs, Maintenance Mode
**Actions**: Each tab has "Save Changes" button (disabled until form edited)

### Security Settings Tab
**Layout**: Form with sections (Password Policy, 2FA, Session)
**Validation**: Inline error messages (red text under field)
**Confirmation**: Dialog for 2FA enforcement changes

### Feature Flags Tab
**Layout**: Table with toggle switches
**Actions**: Add Feature Flag button, Delete icon per row
**Indicators**: Green (enabled), Gray (disabled)

### Storage Configuration Tab
**Layout**: Form with Database and Blob Storage sections
**Encrypted Fields**: Show as ******** with "Show" button (temporarily reveals for 5 seconds)
**Test Buttons**: "Test Database Connection", "Test Blob Storage Connection"
**Usage Meter**: Progress bar for storage quota (green <75%, yellow 75-90%, red >90%)

### Maintenance Mode Tab
**Layout**: Large toggle switch at top, message editor below, schedule section at bottom
**Active State**: Red banner across top of admin app "MAINTENANCE MODE ACTIVE" with disable button
**Schedule**: Calendar picker for start/end times

### Dark/Light Theme
- Light theme: White background, dark text
- Dark theme: Dark gray (#1e1e1e), light text (#e0e0e0)
- Accent color: Primary blue (#1976d2)
- Success: Green (#4caf50)
- Warning: Orange (#ff9800)
- Error: Red (#f44336)

## Dependencies

### EPIC-002 Dependencies
- **Phase 1 (Admin Infrastructure)**: Admin app routing, layout, authentication

### External Dependencies
- ASP.NET Core Configuration (IOptionsMonitor)
- ASP.NET Core Data Protection (IDataProtector for encryption)
- System.Net.Mail (SMTP test email)
- MUI Tabs, TextField, Checkbox, Switch

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Configuration changes break production | Medium | Critical | Validation before save, "Test Connection" buttons, audit log rollback |
| Maintenance mode accidentally enabled | Low | High | Confirmation dialog, red banner warning |
| Encrypted credentials lost | Low | Critical | Backup encryption keys, key rotation plan |
| Feature flag cache not cleared | Medium | Medium | Short TTL (30s), manual cache clear endpoint |

## Out of Scope (Future Enhancements)

- Configuration versioning and rollback
- Configuration import/export (backup/restore)
- Multi-environment configuration (dev, staging, prod)
- Configuration change approval workflow (require second admin)
- Feature flag A/B testing (percentage-based rollout)
- Advanced email template editor (drag-and-drop)
- Notification when scheduled maintenance approaches

## Acceptance Checklist

- [ ] All 6 functional requirements implemented
- [ ] Backend unit tests ≥80% coverage
- [ ] Frontend unit tests ≥70% coverage
- [ ] 10 BDD scenarios pass
- [ ] Sensitive fields encrypted (connection strings, passwords)
- [ ] Feature flags hot reload within 30 seconds
- [ ] Maintenance mode activates within 10 seconds
- [ ] SMTP test email sends successfully
- [ ] Database connection test validates connection string
- [ ] Audit log captures all configuration changes
- [ ] Dark/light theme working
- [ ] Mobile responsive
- [ ] Code review passed (security, OWASP checks)
