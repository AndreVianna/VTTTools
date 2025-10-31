# Feature: Admin Dashboard (Main Page)

**Area**: Admin
**Status**: Planned
**Priority**: Critical
**Effort Estimate**: 28 hours (10h backend + 12h frontend + 6h testing)
**Dependencies**: EPIC-001 Phase 12 (Audit Infrastructure for activity feed)

## Overview

Main monitoring dashboard and landing page for the VTT Tools Admin Application. Provides real-time visibility into system health, user activity, performance metrics, and critical alerts. Serves as the entry point for administrators after login, offering quick access to common administrative tasks and immediate awareness of system status.

## Business Context

### Problem Statement

System administrators need:
- Immediate visibility into system health upon login (database, storage, email, main app)
- Real-time awareness of user activity and administrative actions
- Early warning system for critical issues (service failures, quota limits)
- Performance monitoring to detect degradation before users complain
- Quick navigation to common administrative tasks
- Single pane of glass for overall system status

### Target Users

- **System Administrators**: Primary users, full dashboard access
- **Operations Team**: Monitor-only access (future)

### Success Metrics

- Admin identifies critical issues within 10 seconds of login
- Dashboard loads within 2 seconds (all widgets)
- Performance metrics refresh every 30 seconds
- Zero missed critical alerts (100% visibility)
- Quick actions reduce navigation time by 50%

## Functional Requirements

### FR-001: System Health Status (Top Section)
**Priority**: Critical

Display real-time health indicators for all critical system components.

**Acceptance Criteria**:
- **Health Indicators** (card-based layout, 4 cards in row):

  1. **Database Card**:
     - Status: Green (Healthy) / Yellow (Slow) / Red (Down)
     - Response time: Display average query time (ms)
     - Connection pool: "15 / 20 connections in use"
     - Last checked: Timestamp (auto-refresh every 30s)
     - Click card to view database configuration

  2. **Blob Storage Card**:
     - Status: Green (Healthy) / Yellow (Low Space) / Red (Down)
     - Available space: "350 GB / 500 GB (70%)" with progress bar
     - Upload test: Green check if last upload successful
     - Last checked: Timestamp
     - Click card to view storage configuration

  3. **Email Service Card**:
     - Status: Green (Healthy) / Yellow (Slow) / Red (Down)
     - Last successful send: Timestamp
     - Failed sends (last 24h): Count with warning if >0
     - SMTP connection: Online/Offline
     - Click card to view email configuration

  4. **Main App Card**:
     - Status: Green (Online) / Yellow (Slow) / Red (Offline)
     - Response time: Average HTTP response time (ms)
     - Active users: Count of users with sessions
     - Uptime: "99.8% (last 30 days)"
     - Click card to view main app in new tab

- **Health Status Logic**:
  - Green: Response time <500ms, no errors
  - Yellow: Response time 500-2000ms OR minor errors
  - Red: Response time >2000ms OR service unreachable OR critical errors

- Auto-refresh every 30 seconds (WebSocket or polling)
- Manual refresh button (force immediate health check)

### FR-002: Quick Stats Cards (Below Health Indicators)
**Priority**: High

Display key system statistics at a glance.

**Acceptance Criteria**:
- **Stats Cards** (4 cards in row):

  1. **Total Users**:
     - Large number: Total registered users
     - Trend indicator: "+5 this week" (green up arrow)
     - Icon: User icon

  2. **Active Users (Last 24h)**:
     - Large number: Users with activity in last 24 hours
     - Percentage of total: "(25% of total users)"
     - Icon: Activity icon

  3. **Total Public Library Items**:
     - Large number: Count of published content (Public + Premium)
     - Breakdown: "12 Adventures, 45 Assets, 8 Scenes"
     - Icon: Library icon

  4. **System Uptime**:
     - Large number: Uptime percentage (last 30 days)
     - Last restart: Timestamp
     - Icon: Server icon

- Stats update every 60 seconds (less frequent than health checks)
- Click stat card to navigate to relevant admin section

### FR-003: Recent Activity Feed (Left Column)
**Priority**: High

Display recent audit log entries for situational awareness.

**Acceptance Criteria**:
- **Activity Feed** (left 1/3 of page, scrollable list):
  - Title: "Recent Activity"
  - Display last 10 audit log entries
  - Entry format:
    - Icon based on action type (login, create, update, delete)
    - User email (linked to user management)
    - Action description: "Created scene 'Forest Clearing'"
    - Timestamp: Relative time ("2 minutes ago")
    - Result indicator: Green checkmark (success) / Red X (failed)
  - Real-time updates: Auto-refresh every 30 seconds OR WebSocket push
  - Click entry to view full audit log detail
  - **Filter dropdown**:
    - All actions (default)
    - Admin actions only (actions by admins)
    - Failed actions (errors, failures)
  - "View All Logs" button (navigates to Audit Log Viewer)

- Activity feed scrolls independently of rest of page
- Empty state: "No recent activity" (when no logs)

### FR-004: System Alerts & Warnings (Center Column)
**Priority**: Critical

Display critical alerts and warnings requiring immediate attention.

**Acceptance Criteria**:
- **Alerts Section** (center column, prominent if issues exist):

  - **Critical Alerts** (red banner, urgent):
    - Database Down: "Database is unreachable. Users cannot access the application."
    - Storage Quota Exceeded: "Blob storage quota exceeded (102%). Users cannot upload files."
    - Email Service Down: "Email service unreachable. Password resets unavailable."
    - Main App Offline: "Main application is offline. Users cannot access VTT Tools."
    - Action button: "View Details" / "Resolve Now"

  - **Warnings** (yellow banner, attention needed):
    - High Error Rate: "Error rate increased 300% in last hour. Investigate logs."
    - Slow Response Times: "Average response time >1s. Performance degraded."
    - Low Storage Space: "Blob storage 90% full. Consider expanding quota."
    - Failed Login Spike: "50+ failed logins in last 10 minutes. Possible attack."
    - Action button: "Investigate" / "Dismiss"

  - **Info** (blue banner, informational):
    - Scheduled Maintenance: "Scheduled maintenance: Oct 31 2025 10:00 PM - 11:00 PM UTC"
    - Feature Flag Changed: "Scene collaboration feature disabled by admin@example.com"
    - Action button: "View Configuration" / "Dismiss"

- Alerts sorted by severity: Critical → Warnings → Info
- Dismiss button (hides alert for current session, not permanent)
- Alert count badge in admin app header (if any critical alerts exist)
- No alerts: Display "All systems operational" with green checkmark

### FR-005: Performance Metrics (Right Column)
**Priority**: High

Display performance charts for trend analysis.

**Acceptance Criteria**:
- **Performance Charts** (right 1/3 of page, stacked vertically):

  1. **API Performance Chart** (line graph):
     - Title: "API Performance (Last 24 Hours)"
     - X-axis: Time (hourly intervals)
     - Y-axis (left): Average response time (ms)
     - Y-axis (right): Request rate (requests/min)
     - Two lines: Response time (blue), Request rate (green)
     - Hover tooltip: Show exact values at point

  2. **Error Rate Chart** (line graph):
     - Title: "Error Rate (Last 24 Hours)"
     - X-axis: Time (hourly intervals)
     - Y-axis: Errors per hour
     - Single line: Error count (red)
     - Threshold line: Normal error threshold (yellow dashed)
     - Hover tooltip: Show error count and percentage

  3. **Resource Usage** (progress bars):
     - **Database Connections**:
       - Progress bar: Current / Max connections (e.g., "15 / 20 connections")
       - Color: Green (<75%), Yellow (75-90%), Red (>90%)
     - **Blob Storage**:
       - Progress bar: Used / Total GB (e.g., "350 GB / 500 GB")
       - Color: Green (<75%), Yellow (75-90%), Red (>90%)
     - **Memory Usage** (if available):
       - Progress bar: Used / Total MB
       - Color: Green (<75%), Yellow (75-90%), Red (>90%)

- Charts update every 60 seconds
- Click chart to expand full-screen view (future enhancement)

### FR-006: Quick Actions Panel (Bottom Section)
**Priority**: Medium

Provide quick navigation to common administrative tasks.

**Acceptance Criteria**:
- **Quick Actions** (large button grid, 4 buttons in row):

  1. **User Management**:
     - Icon: Users icon
     - Label: "User Management"
     - Description: "Manage user accounts, roles, permissions"
     - Click: Navigate to User Management page

  2. **Public Library**:
     - Icon: Library icon
     - Label: "Public Library"
     - Description: "Manage public content, assets, adventures"
     - Click: Navigate to Public Library Management page

  3. **System Configuration**:
     - Icon: Settings icon
     - Label: "System Configuration"
     - Description: "Configure security, storage, email, features"
     - Click: Navigate to System Configuration page

  4. **View Audit Logs**:
     - Icon: History icon
     - Label: "Audit Logs"
     - Description: "View system activity and user actions"
     - Click: Navigate to Audit Log Viewer page

- Buttons display as cards with hover effect
- Keyboard accessible (tab navigation, enter to activate)

### FR-007: Error Log Summary (Expandable Section)
**Priority**: Low

Display recent errors for quick troubleshooting.

**Acceptance Criteria**:
- **Error Log Section** (collapsible accordion at bottom):
  - Title: "Error Log Summary (Last 10 Errors)"
  - Collapsed by default (expand on click)
  - When expanded:
    - Table with columns: Timestamp, Error Type, Message, Severity
    - Severity indicators: Critical (red), Warning (yellow), Info (blue)
    - Click row to view full error details (stack trace, context)
    - "View All Errors" button (navigates to Audit Log Viewer filtered by errors)
  - Error count badge: Shows count when collapsed (e.g., "10 errors")
  - Auto-expand if critical error occurs

## Non-Functional Requirements

### NFR-001: Performance
- Dashboard loads within 2 seconds (all widgets)
- Health checks complete within 1 second
- Auto-refresh (30s for health, 60s for stats/charts) without UI flicker
- Charts render smoothly (60 FPS)

### NFR-002: Real-Time Updates
- Health indicators update every 30 seconds
- Activity feed updates every 30 seconds OR WebSocket push
- Alerts appear immediately when condition triggers (<10s latency)

### NFR-003: Usability
- Mobile-responsive layout (cards stack vertically on small screens)
- Dark/light theme support
- Loading skeletons while fetching data
- Error states displayed gracefully (retry button)

### NFR-004: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader announces critical alerts
- Keyboard navigation (tab order, enter to activate)
- Sufficient color contrast for status indicators

## Technical Design

### Frontend Components

**Component Structure**:
```
WebAdminApp/src/features/dashboard/
├── DashboardView.tsx              # Main dashboard layout
├── SystemHealthSection.tsx        # Health indicator cards
├── QuickStatsSection.tsx          # Stats cards
├── RecentActivityFeed.tsx         # Activity feed (left column)
├── SystemAlertsSection.tsx        # Alerts/warnings (center)
├── PerformanceMetricsSection.tsx  # Charts (right column)
├── QuickActionsPanel.tsx          # Quick action buttons
├── ErrorLogSummary.tsx            # Collapsible error log
└── components/
    ├── HealthIndicatorCard.tsx    # Single health card
    ├── StatCard.tsx               # Single stat card
    ├── ActivityFeedItem.tsx       # Single activity entry
    ├── AlertBanner.tsx            # Alert/warning banner
    ├── PerformanceChart.tsx       # Line chart component
    └── ResourceUsageBar.tsx       # Progress bar component
```

**State Management**:
- RTK Query for dashboard data fetching (health, stats, activity, errors)
- WebSocket/SignalR for real-time updates (alerts, activity feed)
- Local state for filter selections, expanded sections
- Polling fallback if WebSocket unavailable

### Backend Endpoints

**REST API** (`/api/admin/dashboard`):

1. `GET /api/admin/dashboard/health`
   - Returns: `SystemHealthDto { Database, BlobStorage, EmailService, MainApp }`
   - Authorization: [Authorize(Roles = "Administrator")]
   - Performs health checks on each service

2. `GET /api/admin/dashboard/stats`
   - Returns: `DashboardStatsDto { TotalUsers, ActiveUsers24h, PublicLibraryItems, SystemUptimePercent }`

3. `GET /api/admin/dashboard/activity?limit={limit}&filter={all|admin|failed}`
   - Returns: `AuditLogDto[]` (last N entries)
   - Filters: All actions, Admin actions only, Failed actions only

4. `GET /api/admin/dashboard/alerts`
   - Returns: `SystemAlertDto[] { Severity, Message, Timestamp, Acknowledged }`
   - Severity: "Critical", "Warning", "Info"

5. `GET /api/admin/dashboard/performance?hours={hours}`
   - Returns: `PerformanceMetricsDto { ApiPerformance[], ErrorRate[], ResourceUsage }`
   - Hours: Default 24 (last 24 hours of data)

6. `GET /api/admin/dashboard/errors?limit={limit}`
   - Returns: `ErrorLogDto[] { Timestamp, Type, Message, Severity, StackTrace }`

7. `POST /api/admin/dashboard/alerts/{alertId}/dismiss`
   - Returns: `{ success: bool }`
   - Dismisses alert for current session (not permanent)

**DTOs**:
```csharp
public record SystemHealthDto {
    public HealthIndicatorDto Database { get; init; }
    public HealthIndicatorDto BlobStorage { get; init; }
    public HealthIndicatorDto EmailService { get; init; }
    public HealthIndicatorDto MainApp { get; init; }
}

public record HealthIndicatorDto {
    public string Status { get; init; } // "Healthy", "Degraded", "Down"
    public int ResponseTimeMs { get; init; }
    public string StatusMessage { get; init; }
    public DateTime LastChecked { get; init; }
    public Dictionary<string, string> Metrics { get; init; } // Additional metrics (connections, space, etc.)
}

public record DashboardStatsDto {
    public int TotalUsers { get; init; }
    public int ActiveUsers24h { get; init; }
    public int PublicLibraryItemsCount { get; init; }
    public decimal SystemUptimePercent { get; init; }
    public DateTime LastRestart { get; init; }
}

public record SystemAlertDto {
    public Guid Id { get; init; }
    public string Severity { get; init; } // "Critical", "Warning", "Info"
    public string Message { get; init; }
    public DateTime Timestamp { get; init; }
    public bool Acknowledged { get; init; }
    public string ActionUrl { get; init; } // Link to resolve/investigate
}

public record PerformanceMetricsDto {
    public PerformanceDataPoint[] ApiPerformance { get; init; }
    public PerformanceDataPoint[] ErrorRate { get; init; }
    public ResourceUsageDto ResourceUsage { get; init; }
}

public record PerformanceDataPoint {
    public DateTime Timestamp { get; init; }
    public decimal Value { get; init; }
}

public record ResourceUsageDto {
    public int DatabaseConnectionsUsed { get; init; }
    public int DatabaseConnectionsMax { get; init; }
    public decimal BlobStorageUsedGB { get; init; }
    public decimal BlobStorageTotalGB { get; init; }
    public int MemoryUsedMB { get; init; }
    public int MemoryTotalMB { get; init; }
}
```

### Service Layer

**Interface**: `IDashboardService`

**Implementation**: `DashboardService`
- Uses ASP.NET Core Health Checks for health indicators
- Queries audit log for activity feed
- Queries performance metrics table for charts
- Detects alerts based on thresholds (configurable)
- Caches dashboard data with short TTL (30-60 seconds)

**Health Checks Implementation**:
```csharp
// Startup.cs
services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddAzureBlobStorage(connectionString, "blobstorage")
    .AddSmtpHealthCheck(smtpOptions, "email");

// DashboardService.cs
public async Task<SystemHealthDto> GetSystemHealthAsync() {
    var healthReport = await _healthCheckService.CheckHealthAsync();

    return new SystemHealthDto {
        Database = MapHealthEntry(healthReport.Entries["database"]),
        BlobStorage = MapHealthEntry(healthReport.Entries["blobstorage"]),
        EmailService = MapHealthEntry(healthReport.Entries["email"]),
        MainApp = await CheckMainAppHealthAsync()
    };
}
```

**Alert Detection Logic**:
```csharp
private async Task<List<SystemAlertDto>> DetectAlertsAsync() {
    var alerts = new List<SystemAlertDto>();

    // Check health status
    var health = await GetSystemHealthAsync();
    if (health.Database.Status == "Down") {
        alerts.Add(new SystemAlertDto {
            Severity = "Critical",
            Message = "Database is unreachable. Users cannot access the application.",
            Timestamp = DateTime.UtcNow
        });
    }

    // Check storage quota
    var storage = health.BlobStorage.Metrics["UsagePercent"];
    if (decimal.Parse(storage) > 90) {
        alerts.Add(new SystemAlertDto {
            Severity = "Warning",
            Message = $"Blob storage {storage}% full. Consider expanding quota.",
            Timestamp = DateTime.UtcNow
        });
    }

    // Check error rate spike
    var errorRate = await GetRecentErrorRateAsync();
    if (errorRate > _threshold) {
        alerts.Add(new SystemAlertDto {
            Severity = "Warning",
            Message = $"Error rate increased {errorRate}% in last hour. Investigate logs.",
            Timestamp = DateTime.UtcNow
        });
    }

    return alerts;
}
```

## Testing Strategy

### Unit Tests (Backend)
**Target**: 80% coverage

**Test Suites**:
- `DashboardServiceTests.cs`:
  - GetSystemHealthAsync_AllHealthy_ReturnsGreen
  - GetSystemHealthAsync_DatabaseDown_ReturnsRed
  - GetDashboardStatsAsync_ReturnsCorrectCounts
  - GetRecentActivityAsync_ReturnsLast10Entries
  - GetRecentActivityAsync_FilterAdmin_ReturnsOnlyAdminActions
  - GetAlertsAsync_DatabaseDown_ReturnsCriticalAlert
  - GetAlertsAsync_StorageNearFull_ReturnsWarningAlert
  - GetPerformanceMetricsAsync_Last24Hours_ReturnsDataPoints
  - DismissAlertAsync_ValidAlertId_MarksAcknowledged

### Unit Tests (Frontend)
**Target**: 70% coverage

**Test Suites**:
- `DashboardView.test.tsx`:
  - Renders all dashboard sections
  - Displays loading skeletons while fetching
  - Auto-refreshes every 30 seconds
- `SystemHealthSection.test.tsx`:
  - Displays health indicators with correct status
  - Shows green for healthy services
  - Shows red for down services
  - Updates on refresh
- `SystemAlertsSection.test.tsx`:
  - Displays critical alerts prominently
  - Allows dismissing alerts
  - Shows "All systems operational" when no alerts
- `PerformanceMetricsSection.test.tsx`:
  - Renders performance charts
  - Updates chart data on refresh

### BDD E2E Tests
**Framework**: Cucumber + Playwright

**Feature File**: `AdminDashboard.feature`

**Critical Scenarios**:
1. Admin logs in and dashboard loads within 2 seconds
2. Dashboard displays system health (all green)
3. Dashboard shows critical alert (database down)
4. Admin dismisses warning alert
5. Activity feed displays last 10 actions
6. Activity feed filters by failed actions only
7. Performance charts render with 24-hour data
8. Quick actions navigate to User Management
9. Error log summary expands to show errors
10. Dashboard auto-refreshes health indicators

**Smoke Scenario**: Admin login → Dashboard loads → All sections visible

## UI/UX Design

### Dashboard Layout
**Grid Layout** (3 columns on desktop):
- Top: System Health (4 cards, full width)
- Second row: Quick Stats (4 cards, full width)
- Main row:
  - Left column (33%): Recent Activity Feed
  - Center column (34%): System Alerts
  - Right column (33%): Performance Metrics
- Bottom: Quick Actions Panel (4 buttons, full width)
- Bottom (collapsible): Error Log Summary

**Mobile Layout**:
- Stack all sections vertically
- Cards stack in single column
- Charts scale to full width

### Color Scheme
**Health Status**:
- Green (#4caf50): Healthy
- Yellow (#ff9800): Degraded
- Red (#f44336): Down

**Severity**:
- Critical: Red background (#f44336), white text
- Warning: Yellow background (#ff9800), dark text
- Info: Blue background (#2196f3), white text

**Dark/Light Theme**:
- Light: White cards, dark text, subtle borders
- Dark: Dark gray cards (#2c2c2c), light text

## Dependencies

### EPIC-001 Dependencies
- **Phase 12 (Audit Infrastructure)**: Activity feed data source

### EPIC-002 Dependencies
- **Phase 1 (Admin Infrastructure)**: Admin app routing, layout, authentication

### External Dependencies
- ASP.NET Core Health Checks
- Chart.js or Recharts (performance charts)
- SignalR (real-time updates)
- MUI Grid, Card, Progress components

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dashboard performance degrades with scale | Medium | Medium | Caching, efficient queries, chart data aggregation |
| Health checks timeout | Medium | Medium | Timeout limits (5s), fallback to cached status |
| Auto-refresh overloads backend | Low | Medium | Configurable refresh intervals, throttling |
| WebSocket connection drops | Medium | Low | Fallback to polling, auto-reconnect |

## Out of Scope (Future Enhancements)

- Custom dashboard widgets (admin can add/remove sections)
- Dashboard layout customization (drag-and-drop widgets)
- Historical health trends (longer than 24 hours)
- Advanced alerting (email/SMS notifications)
- Multi-tenant dashboard (tenant-specific metrics)
- Exportable reports (dashboard snapshot as PDF)

## Acceptance Checklist

- [ ] All 7 functional requirements implemented
- [ ] Backend unit tests ≥80% coverage
- [ ] Frontend unit tests ≥70% coverage
- [ ] 10 BDD scenarios pass
- [ ] Dashboard loads within 2 seconds
- [ ] Health indicators auto-refresh every 30 seconds
- [ ] Critical alerts display prominently
- [ ] Activity feed updates in real-time
- [ ] Performance charts render correctly
- [ ] Quick actions navigate to correct pages
- [ ] Dark/light theme working
- [ ] Mobile responsive (cards stack vertically)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Code review passed (security, performance checks)
