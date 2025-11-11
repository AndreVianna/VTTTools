# Feature: Audit Log Viewing

**Area**: Admin
**Status**: Planned
**Priority**: Critical
**Effort Estimate**: 52 hours (32h backend + 14h frontend + 6h testing)
**Dependencies**: EPIC-001 Phase 12 (Audit Infrastructure) OR EPIC-002 Phase 1 (build audit system)

## Overview

Comprehensive audit log viewing and monitoring system for the VTT Tools Admin Application. Enables administrators to review historical audit events, monitor live system activity, and investigate security incidents through advanced filtering, search, and real-time monitoring capabilities.

## Business Context

### Problem Statement

System administrators need:
- Complete visibility into all user actions for compliance and security auditing
- Ability to investigate security incidents by reviewing past actions
- Real-time monitoring of production system activity for anomaly detection
- Efficient search and filtering across millions of audit records
- Export capabilities for compliance reporting and external analysis

### Target Users

- **System Administrators**: Full access to all audit logs
- **Security Analysts**: Read-only access for incident investigation (future)
- **Compliance Officers**: Read-only access for regulatory audits (future)

### Success Metrics

- Admin can locate specific audit event within 60 seconds using filters
- Live monitoring detects suspicious patterns within 30 seconds of occurrence
- Zero performance degradation with 10 million+ audit records
- 100% of auditable actions captured (no gaps in audit trail)

## Functional Requirements

### FR-001: Audit Log Table View
**Priority**: Critical

Display searchable, filterable, paginated table of historical audit log entries.

**Acceptance Criteria**:
- MUI DataGrid displays audit logs with columns:
  - Timestamp (sortable, default descending)
  - User (email, clickable to filter by user)
  - Action (e.g., Login, CreateEncounter, UpdateUser, DeleteAsset)
  - Entity Type (e.g., User, Encounter, Asset, Campaign)
  - Entity ID (GUID)
  - IP Address
  - Result (Success, Failed, PartialSuccess)
  - Duration (ms, for performance analysis)
- **Infinite scroll pagination**: Load 100 logs per block as user scrolls (not page-based)
- Expandable rows: Click row to expand inline detail panel showing:
  - Request JSON (formatted, syntax-highlighted)
  - Response JSON (formatted, syntax-highlighted)
  - Error details (if failed)
  - User agent string
- Search bar (debounced 300ms): Search by user email, action, entity type, entity ID
- Date range picker: Filter by start/end timestamp (default: last 7 days)
- Sort by any column (Timestamp default descending)
- Column visibility toggle (show/hide columns)

### FR-002: Advanced Filtering
**Priority**: Critical

Multi-dimensional filtering to narrow audit log results.

**Acceptance Criteria**:
- Filter panel (collapsible sidebar):
  - **User Filter**: Autocomplete dropdown (search users by email)
  - **Action Filter**: Multi-select dropdown (Login, Logout, Create*, Update*, Delete*, etc.)
  - **Entity Type Filter**: Multi-select dropdown (User, Encounter, Asset, Campaign, etc.)
  - **Result Filter**: Checkboxes (Success, Failed, PartialSuccess)
  - **IP Address Filter**: Text input with regex support
  - **Duration Range**: Min/Max duration (ms) for performance investigation
- Filters combine with AND logic (all filters must match)
- "Clear All Filters" button resets to defaults
- Filter state persisted in URL query params (shareable links)
- Active filter chips displayed above table (click chip to remove filter)

### FR-003: Live Monitoring View
**Priority**: High

Real-time tail tracking of audit events as they occur (separate grid from historical view).

**Acceptance Criteria**:
- Toggle button: "Switch to Live Monitoring" (from historical view)
- **Separate DataGrid** (not same grid as historical view)
- **Tail tracking**: Newest entries appear at top, auto-scroll to show latest
- **Real-time updates**: WebSocket or SignalR push OR polling every 2-3 seconds
- **Single-dimension filtering requirement**: User must select ONE filter dimension:
  - Filter by User (show all actions for specific user email)
  - Filter by Action (show specific action type for all users)
  - Filter by Entity Type (show all actions on specific entity type)
  - Filter by Result (show all success/failed actions)
- **Performance limit**: Display last 500 entries only (older entries scroll out)
- **Use case**: Production monitoring when thousands of records/second occur
  - Example: "Show me all Login actions in real-time"
  - Example: "Show me all actions for user@example.com live"
- Pause/Resume button (pause auto-scroll and updates)
- "Switch to Historical View" button returns to standard table

### FR-004: Audit Log Detail View
**Priority**: Medium

Detailed view of single audit log entry (modal dialog).

**Acceptance Criteria**:
- Click row to open detail dialog (alternative to inline expand)
- Dialog sections:
  - **Header**: Action, Timestamp, Result badge
  - **User Information**: Email, User ID, IP Address, User Agent
  - **Entity Information**: Entity Type, Entity ID, Entity Name (if available)
  - **Request Details**: JSON viewer with syntax highlighting, collapsible sections
  - **Response Details**: JSON viewer with syntax highlighting
  - **Error Details**: Stack trace (if failed), error message
  - **Performance**: Duration (ms), request size, response size
- Copy buttons for: Request JSON, Response JSON, Entity ID, User ID
- "View User Activity" button (opens historical view filtered by this user)
- "View Entity History" button (opens historical view filtered by this entity)

### FR-005: Export Audit Logs
**Priority**: Medium

Export filtered audit logs for compliance reporting or external analysis.

**Acceptance Criteria**:
- "Export" button in toolbar (enabled only when filters applied)
- Export dialog:
  - Format selection: CSV, JSON, Excel (XLSX)
  - Row limit: 1000 / 5000 / 10000 / All (with warning for large exports)
  - Column selection: Choose which columns to include
- Export respects current filters and sort order
- Progress indicator for large exports
- Download as file (browser download)
- Export filename includes timestamp: `audit_logs_2025-10-31_14-30-00.csv`
- CSV format:
  - Header row with column names
  - Timestamp in ISO 8601 format
  - JSON fields escaped/quoted
- Excel format:
  - Auto-sized columns
  - Timestamp formatted as datetime
  - Conditional formatting for Result (green=success, red=failed)

### FR-006: Saved Filters
**Priority**: Low

Save frequently used filter combinations for quick access.

**Acceptance Criteria**:
- "Save Current Filters" button in filter panel
- Save dialog: Name for filter preset (e.g., "Failed Logins Last 24h")
- Saved filters stored per admin user (not global)
- Dropdown: "Load Saved Filter" with list of presets
- Delete saved filter option
- Maximum 10 saved filters per user

## Non-Functional Requirements

### NFR-001: Performance
- Audit log table loads within 2 seconds for 10 million+ records (server-side pagination)
- Infinite scroll loads next 100 rows within 500ms
- Live monitoring updates appear within 3 seconds of event occurrence
- Search results appear within 1 second (debounced)
- Export of 10,000 rows completes within 30 seconds

### NFR-002: Scalability
- Support 10+ million audit records without degradation
- Database indexes on: Timestamp (descending), UserId, Action, EntityType, Result
- Partitioning strategy for audit table (monthly partitions, retention policy)
- Archive old audit logs (>365 days) to cold storage

### NFR-003: Security
- All operations require Administrator role
- No deletion or modification of audit logs (append-only)
- Viewing audit logs is itself audited (meta-audit)
- Sensitive data redaction in request/response JSON (passwords, tokens)
- Export audit logs audit entry created

### NFR-004: Usability
- Keyboard navigation support (arrow keys to navigate rows)
- Mobile-responsive layout (horizontal scroll on small screens)
- Dark/light theme support
- Error messages user-friendly
- Loading skeletons while fetching data

### NFR-005: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatible (announce row count, filters applied)
- Sufficient color contrast for result indicators

## Technical Design

### Frontend Components

**Component Structure**:
```
WebAdminApp/src/features/auditLogs/
├── AuditLogView.tsx              # Main view with table/live toggle
├── AuditLogTable.tsx             # Historical view with infinite scroll
├── LiveMonitoringView.tsx        # Real-time tail tracking grid
├── AuditLogDetailDialog.tsx      # Detail modal
├── AuditLogFilterPanel.tsx       # Filter sidebar
├── ExportAuditLogsDialog.tsx     # Export configuration
└── components/
    ├── AuditLogRow.tsx           # Row with expand capability
    ├── ResultBadge.tsx           # Success/Failed indicator
    ├── JsonViewer.tsx            # Syntax-highlighted JSON
    └── SavedFiltersDropdown.tsx  # Load saved filters
```

**State Management**:
- RTK Query for audit log fetching (infinite scroll cache)
- WebSocket/SignalR for live monitoring push events
- Local state for filters, pagination offset, expanded rows
- URL query params for shareable filter state

**Infinite Scroll Implementation**:
- Use `react-window` or `MUI DataGrid` virtualization
- Fetch next 100 rows when scrolled to 80% of current data
- Maintain offset in state (not page number)
- Backend API: `GET /api/admin/audit-logs?offset=0&limit=100&...filters`

### Backend Endpoints

**REST API** (`/api/admin/audit-logs`):

1. `GET /api/admin/audit-logs?offset={offset}&limit={limit}&startDate={date}&endDate={date}&userId={guid}&action={string}&entityType={string}&result={string}&search={string}&sortBy={column}&sortOrder={asc|desc}`
   - Returns: `{ logs: AuditLogDto[], totalCount: int, hasMore: bool }`
   - Authorization: [Authorize(Roles = "Administrator")]
   - Default: Last 7 days, sorted by Timestamp descending, limit 100

2. `GET /api/admin/audit-logs/{logId}`
   - Returns: `AuditLogDetailDto` (includes full request/response JSON)
   - Authorization: [Authorize(Roles = "Administrator")]

3. `GET /api/admin/audit-logs/export?format={csv|json|xlsx}&offset={offset}&limit={limit}&...filters`
   - Returns: File download (Content-Disposition: attachment)
   - Authorization: [Authorize(Roles = "Administrator")]
   - Limit: Max 10,000 rows per export

4. `GET /api/admin/audit-logs/live?filterType={user|action|entityType|result}&filterValue={value}`
   - Returns: WebSocket/SignalR connection for live updates
   - Pushes new audit log entries matching filter
   - Authorization: [Authorize(Roles = "Administrator")]

**DTOs**:
```csharp
public record AuditLogDto {
    public Guid Id { get; init; }
    public DateTime Timestamp { get; init; }
    public Guid? UserId { get; init; }
    public string UserEmail { get; init; }
    public string Action { get; init; }
    public string EntityType { get; init; }
    public string EntityId { get; init; }
    public string IpAddress { get; init; }
    public string Result { get; init; } // "Success", "Failed", "PartialSuccess"
    public int DurationMs { get; init; }
}

public record AuditLogDetailDto : AuditLogDto {
    public string RequestJson { get; init; }
    public string ResponseJson { get; init; }
    public string ErrorDetails { get; init; }
    public string UserAgent { get; init; }
    public int RequestSizeBytes { get; init; }
    public int ResponseSizeBytes { get; init; }
}
```

### Service Layer

**Interface**: `IAuditLogService`

**Implementation**: `AuditLogService`
- Uses Entity Framework Core for querying AuditLog table
- Implements pagination with offset/limit (not skip/take for performance)
- Uses `IQueryable<T>` for dynamic filtering
- Caches user email lookups (userId → email) with IMemoryCache
- Export uses streaming (yield return) to avoid memory spikes

**Database Schema**:
```sql
CREATE TABLE AuditLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Timestamp DATETIME2 NOT NULL,
    UserId UNIQUEIDENTIFIER NULL,
    UserEmail NVARCHAR(256) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    IpAddress NVARCHAR(45) NULL,
    Result NVARCHAR(50) NOT NULL,
    DurationMs INT NOT NULL,
    RequestJson NVARCHAR(MAX) NULL,
    ResponseJson NVARCHAR(MAX) NULL,
    ErrorDetails NVARCHAR(MAX) NULL,
    UserAgent NVARCHAR(500) NULL,
    RequestSizeBytes INT NULL,
    ResponseSizeBytes INT NULL
);

CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp DESC);
CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_Action ON AuditLogs(Action);
CREATE INDEX IX_AuditLogs_EntityType ON AuditLogs(EntityType);
CREATE INDEX IX_AuditLogs_Result ON AuditLogs(Result);
```

**Live Monitoring with SignalR**:
```csharp
public class AuditLogHub : Hub {
    public async Task SubscribeToLiveAudit(string filterType, string filterValue) {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"{filterType}:{filterValue}");
    }

    public async Task UnsubscribeFromLiveAudit(string filterType, string filterValue) {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{filterType}:{filterValue}");
    }
}

// In AuditLogService.LogAsync():
await _hubContext.Clients.Group($"action:{log.Action}").SendAsync("NewAuditLog", log);
await _hubContext.Clients.Group($"user:{log.UserId}").SendAsync("NewAuditLog", log);
// ... other filter groups
```

## Testing Strategy

### Unit Tests (Backend)
**Target**: 80% coverage

**Test Suites**:
- `AuditLogServiceTests.cs`:
  - GetAuditLogsAsync_NoFilters_ReturnsLast7Days
  - GetAuditLogsAsync_WithFilters_ReturnsFiltered
  - GetAuditLogsAsync_WithPagination_ReturnsCorrectOffset
  - GetAuditLogByIdAsync_ValidId_ReturnsDetail
  - GetAuditLogByIdAsync_InvalidId_ReturnsNull
  - ExportAuditLogsAsync_CSV_ReturnsValidCsv
  - ExportAuditLogsAsync_Excel_ReturnsValidXlsx
  - SearchAuditLogsAsync_ByEmail_ReturnsMatches
  - SearchAuditLogsAsync_ByAction_ReturnsMatches
  - GetAuditLogsAsync_PerformanceWith10Million_CompletesUnder2Seconds

### Unit Tests (Frontend)
**Target**: 70% coverage

**Test Suites**:
- `AuditLogTable.test.tsx`:
  - Renders audit log table with data
  - Infinite scroll loads next page
  - Expands row to show detail
  - Filters by date range
  - Searches by email
- `LiveMonitoringView.test.tsx`:
  - Receives WebSocket updates
  - Displays newest entries at top
  - Limits to 500 entries
  - Pauses/resumes updates
  - Requires single-dimension filter
- `AuditLogFilterPanel.test.tsx`:
  - Applies filters
  - Clears all filters
  - Saves filter preset
  - Loads saved filter

### BDD E2E Tests
**Framework**: Cucumber + Playwright

**Feature File**: `AdminAuditLogViewing.feature`

**Critical Scenarios**:
1. Admin views audit log table with infinite scroll
2. Admin filters by date range and action type
3. Admin expands row to view request/response JSON
4. Admin opens live monitoring view (WebSocket connection)
5. Admin filters live monitoring by user email (tail tracking)
6. Live monitoring receives new audit entry within 3 seconds
7. Admin exports 1000 audit logs to CSV
8. Admin searches for specific entity ID
9. Admin views audit log detail dialog
10. Admin saves filter preset and loads it later

**Smoke Scenario**: Admin login → Audit Log page loads → Table displays 100 entries

## UI/UX Design

### Audit Log Table View
**Layout**: Full-page DataGrid with filter panel sidebar
**Toolbar**: Search bar, Date range picker, Export button, "Switch to Live Monitoring" toggle
**Filters**: Left collapsible sidebar (280px width)
**Table**: MUI DataGrid with sticky header, infinite scroll
**Row Expansion**: Click row → inline detail panel slides down (request/response JSON)

### Live Monitoring View
**Layout**: Separate full-page view (not same grid)
**Top Banner**: "Live Monitoring Active" with pause/resume controls
**Filter Requirement**: Dropdown to select dimension (User / Action / Entity Type / Result), then select value
**Table**: Tail tracking list (newest at top, auto-scroll)
**Entry Count**: Display "Showing last 500 entries (older entries hidden)"

### Dark/Light Theme
- Light theme: White background, dark text, subtle borders
- Dark theme: Dark gray (#1e1e1e), light text (#e0e0e0)
- Result badges:
  - Success: Green background (#4caf50)
  - Failed: Red background (#f44336)
  - PartialSuccess: Orange background (#ff9800)
- Syntax highlighting for JSON (VSCode-like colors)

## Dependencies

### EPIC-001 Dependencies
- **Phase 12 (Audit Infrastructure)**: AuditLog table, IAuditLogService, audit middleware
- **Alternative**: Build audit infrastructure in EPIC-002 Phase 1 (adds 40-60 hours)

### EPIC-002 Dependencies
- **Phase 1 (Admin Infrastructure)**: Admin app routing, layout, authentication

### External Dependencies
- MUI DataGrid (frontend table)
- SignalR (real-time updates)
- `react-window` (virtualization for infinite scroll)
- `react-json-view` (JSON syntax highlighting)
- `xlsx` library (Excel export)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degradation with 10M+ records | Medium | High | Database indexes, partitioning, server-side pagination, offset-based queries |
| WebSocket connection drops | Medium | Low | Auto-reconnect logic, fallback to polling |
| Export crashes with large datasets | Medium | Medium | Streaming export, row limits, progress indicators |
| Audit log table fill disk space | High | Critical | Retention policy (365 days), archive to cold storage, partitioning |
| Sensitive data leakage in logs | Medium | Critical | Redact passwords/tokens before logging, audit log access audited |

## Out of Scope (Future Enhancements)

- Audit log deletion (append-only for compliance)
- Anomaly detection alerts (ML-based suspicious pattern detection)
- Audit log retention policy configuration (UI for setting retention days)
- Multi-tenant audit log isolation (for SaaS future)
- Audit log correlation (link related actions, e.g., Login → CreateEncounter → UpdateEncounter)
- Audit log replay (re-execute past actions for debugging)
- Advanced analytics dashboard (charts, trends, top users/actions)

## Acceptance Checklist

- [ ] All 6 functional requirements implemented
- [ ] Backend unit tests ≥80% coverage
- [ ] Frontend unit tests ≥70% coverage
- [ ] 10 BDD scenarios pass
- [ ] Infinite scroll loads 100 rows per block
- [ ] Live monitoring tail tracking works with WebSocket
- [ ] Single-dimension filter enforced in live monitoring
- [ ] Export to CSV/Excel tested with 10,000 rows
- [ ] Performance test: Query 10M records completes <2 seconds
- [ ] Database indexes created on Timestamp, UserId, Action, EntityType, Result
- [ ] Dark/light theme working
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA compliance verified
- [ ] Code review passed (security, OWASP checks)
- [ ] Audit log access itself audited (meta-audit)
