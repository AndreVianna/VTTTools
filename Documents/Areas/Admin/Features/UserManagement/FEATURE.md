# Feature: User Management

**Area**: Admin
**Status**: Planned
**Priority**: Critical
**Effort Estimate**: 60 hours (28h backend + 22h frontend + 10h testing)
**Dependencies**: EPIC-001 Phase 1 (Auth infrastructure)

## Overview

Comprehensive user account administration for the VTT Tools Admin Application. Provides administrators with centralized control over user accounts, including viewing, editing, role assignment, account status management, and security operations.

## Business Context

### Problem Statement

System administrators need:
- Centralized visibility into all user accounts
- Ability to manage user roles and permissions without direct database access
- Tools to respond to security incidents (lock accounts, force password resets)
- Audit trail of administrative actions on user accounts
- Bulk operations for efficiency when managing multiple users

### Target Users

- **System Administrators**: Full access to all user management features
- **Support Staff**: View-only access (future role, not in initial release)

### Success Metrics

- Admin can find and modify any user account within 30 seconds
- Account lockout response time < 2 minutes from incident detection
- Zero accidental user data modifications (confirmation dialogs)
- 100% of user management actions captured in audit log

## Functional Requirements

### FR-001: User List View
**Priority**: Critical

Display searchable, filterable, paginated list of all user accounts.

**Acceptance Criteria**:
- MUI DataGrid displays users with columns: Email, Display Name, Name, Email Confirmed, 2FA Enabled, Admin Role, Locked Status, Created Date
- Server-side pagination (50 users per page)
- Real-time search by email (debounced, 300ms)
- Filters:
  - Email confirmation status (All / Confirmed / Unconfirmed)
  - Admin role (All / Admins / Non-Admins)
  - Account status (All / Active / Locked)
  - 2FA status (All / Enabled / Disabled)
- Sort by any column (Email, Display Name, Created Date)
- Click row to open user detail dialog
- Bulk selection with checkboxes

### FR-002: User Detail View
**Priority**: Critical

Display and edit comprehensive user account information.

**Acceptance Criteria**:
- Dialog displays:
  - User ID (read-only GUID)
  - Email (read-only, with verified/unverified icon)
  - Full Name (editable)
  - Display Name (editable)
  - Phone Number (editable, optional)
  - Avatar (display only, link to view)
  - Created Date (read-only)
  - Email Confirmed status (read-only boolean, with manual confirm action)
  - 2FA Enabled status (read-only boolean, with disable action)
  - Admin Role (toggle switch, cannot demote self)
  - Locked Status (toggle switch)
- Save changes updates user profile
- Changes validated (name 3-100 chars, display name 3-50 chars, phone number regex)
- Confirmation dialog before role changes or account locking
- Success/error toast notifications

### FR-003: Role Assignment
**Priority**: Critical

Promote or demote users to/from Administrator role.

**Acceptance Criteria**:
- Toggle switch in user detail dialog
- Confirmation dialog: "Are you sure you want to promote {email} to Administrator? This grants full system access."
- Current admin cannot demote themselves (toggle disabled)
- Role change reflected immediately in user list
- Audit log entry created with admin who made change

### FR-004: Account Locking/Unlocking
**Priority**: Critical

Lock user accounts to prevent login (security response).

**Acceptance Criteria**:
- Toggle switch or Lock/Unlock buttons in user detail
- Confirmation dialog: "Lock account for {email}? User will be logged out and cannot sign in until unlocked."
- Locked accounts:
  - Cannot log in (login returns "Account locked" error)
  - Existing sessions terminated (if session management supports it)
  - Clearly indicated in user list (red lock icon)
- Unlock reverses lock, allows login
- Audit log entry with reason (future: optional reason field)

### FR-005: Force Password Reset
**Priority**: High

Require user to reset password on next login.

**Acceptance Criteria**:
- Button in user detail: "Force Password Reset"
- Confirmation dialog: "This will log out {email} and require password reset on next login."
- User's password marked as expired (ASP.NET Identity mechanism or custom flag)
- User receives password reset email
- Audit log entry created

### FR-006: Manual Email Confirmation
**Priority**: Medium

Manually mark email as confirmed (for support escalations).

**Acceptance Criteria**:
- Button visible only if email not confirmed
- Confirmation dialog: "Manually confirm email for {email}? Bypass verification process."
- Updates EmailConfirmed flag
- Audit log entry with admin who confirmed

### FR-007: Disable Two-Factor Authentication
**Priority**: Medium

Disable 2FA for user who lost access to authenticator.

**Acceptance Criteria**:
- Button visible only if 2FA enabled
- Confirmation dialog: "Disable 2FA for {email}? User can re-enable later."
- Removes 2FA configuration from user account
- User can log in without 2FA code
- Audit log entry created

### FR-008: Create Fake User Accounts
**Priority**: Medium

Create test accounts for demos, QA, or user impersonation (support).

**Acceptance Criteria**:
- "Create User" button in user list view
- Dialog fields:
  - Email (required, unique validation)
  - Full Name (required, 3-100 chars)
  - Display Name (required, 3-50 chars)
  - Phone Number (optional)
  - Initial Password (required, meets password policy)
  - Email Confirmed (checkbox, default unchecked)
  - Admin Role (checkbox, default unchecked)
- Validation matches registration validation
- User created with EmailConfirmed=true if checked
- Success toast: "User {email} created successfully"
- Audit log entry
- New user appears in user list

### FR-009: Bulk Operations
**Priority**: Low

Perform actions on multiple users at once.

**Acceptance Criteria**:
- Select multiple users with checkboxes
- Bulk action dropdown appears when 2+ users selected:
  - Lock Selected Accounts
  - Unlock Selected Accounts
  - Force Password Reset for Selected
- Confirmation dialog lists affected users
- Operations execute sequentially with progress indicator
- Success/error summary: "3 accounts locked, 1 failed: {email} - {reason}"
- Audit log entry per user

## Non-Functional Requirements

### NFR-001: Performance
- User list loads within 2 seconds for 10,000 users
- Search results appear within 500ms (debounced)
- User detail dialog opens within 300ms

### NFR-002: Security
- All operations require Administrator role
- Audit log captures: Admin ID, User ID, Action, Timestamp, IP Address, Result
- Cannot delete self-account
- Cannot demote self from admin
- Sensitive operations (lock, role change) require confirmation

### NFR-003: Usability
- Keyboard navigation support (tab order, enter to save)
- Mobile-responsive layout (dialog scrolls on small screens)
- Dark/light theme support
- Error messages user-friendly (not stack traces)

### NFR-004: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatible
- Sufficient color contrast (4.5:1 text, 3:1 UI components)

## Technical Design

### Frontend Components

**Component Structure**:
```
WebAdminApp/src/features/users/
├── UserListView.tsx          # Main view with DataGrid
├── UserDetailDialog.tsx      # Edit user dialog
├── CreateUserDialog.tsx      # Create user dialog
├── BulkActionsToolbar.tsx    # Bulk operations UI
└── components/
    ├── UserStatusChip.tsx    # Status indicators (locked, confirmed, etc.)
    ├── RoleToggle.tsx        # Admin role toggle
    └── ConfirmationDialog.tsx # Reusable confirmation
```

**State Management**:
- RTK Query for user data fetching/caching
- Local state for dialog open/close
- Form state with React Hook Form + Yup validation

### Backend Endpoints

**REST API** (`/api/admin/users`):

1. `GET /api/admin/users?page={page}&pageSize={pageSize}&search={email}&emailConfirmed={bool}&isAdmin={bool}&isLocked={bool}`
   - Returns: `{ users: UserAdminDto[], totalCount: int, page: int, pageSize: int }`
   - Authorization: [Authorize(Roles = "Administrator")]

2. `GET /api/admin/users/{userId}`
   - Returns: `UserAdminDto`
   - Authorization: [Authorize(Roles = "Administrator")]

3. `PUT /api/admin/users/{userId}`
   - Request body: `UpdateUserRequest { Name, DisplayName, PhoneNumber }`
   - Returns: `UserAdminDto`
   - Validation: FluentValidation rules

4. `POST /api/admin/users/{userId}/promote`
   - Returns: `{ success: bool, message: string }`
   - Business rule: Cannot promote self (validated by comparing ClaimsPrincipal user ID)

5. `POST /api/admin/users/{userId}/demote`
   - Returns: `{ success: bool, message: string }`
   - Business rule: Cannot demote self

6. `POST /api/admin/users/{userId}/lock`
   - Returns: `{ success: bool, message: string }`
   - Side effect: Terminate active sessions (if supported)

7. `POST /api/admin/users/{userId}/unlock`
   - Returns: `{ success: bool, message: string }`

8. `POST /api/admin/users/{userId}/force-password-reset`
   - Returns: `{ success: bool, message: string }`
   - Side effect: Send password reset email

9. `POST /api/admin/users/{userId}/confirm-email`
   - Returns: `{ success: bool, message: string }`

10. `POST /api/admin/users/{userId}/disable-2fa`
    - Returns: `{ success: bool, message: string }`

11. `POST /api/admin/users`
    - Request body: `CreateUserRequest { Email, Name, DisplayName, PhoneNumber, Password, EmailConfirmed, IsAdmin }`
    - Returns: `UserAdminDto`
    - Validation: Email unique, password policy compliance

**DTOs**:
```csharp
public record UserAdminDto {
    public Guid Id { get; init; }
    public string Email { get; init; }
    public bool EmailConfirmed { get; init; }
    public string Name { get; init; }
    public string DisplayName { get; init; }
    public string? PhoneNumber { get; init; }
    public bool IsAdministrator { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public bool IsLockedOut { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public DateTime CreatedDate { get; init; }
    public string? AvatarId { get; init; }
}
```

### Service Layer

**Interface**: `IUserAdminService`

**Implementation**: `UserAdminService`
- Uses `UserManager<User>` for ASP.NET Identity operations
- Uses `IAuditLogService` to record all admin actions
- Uses `IEmailService` for password reset/confirmation emails
- Transaction support for multi-step operations (create user + assign role)

**Audit Log Integration**:
```csharp
await _auditLog.LogAsync(new AuditLogEntry {
    UserId = adminUserId, // From ClaimsPrincipal
    Action = "PromoteToAdmin",
    EntityType = "User",
    EntityId = targetUserId.ToString(),
    IpAddress = httpContext.Connection.RemoteIpAddress?.ToString(),
    Timestamp = DateTime.UtcNow,
    Result = "Success",
    Details = $"Promoted user {targetEmail} to Administrator"
});
```

## Testing Strategy

### Unit Tests (Backend)
**Target**: 80% coverage

**Test Suites**:
- `UserAdminServiceTests.cs`:
  - GetUsersAsync_WithFilters_ReturnsFilteredUsers
  - GetUserByIdAsync_ValidId_ReturnsUser
  - GetUserByIdAsync_InvalidId_ReturnsNull
  - UpdateUserAsync_ValidData_UpdatesUser
  - UpdateUserAsync_InvalidName_ThrowsValidationException
  - PromoteToAdminAsync_ValidUser_AddsAdminRole
  - PromoteToAdminAsync_SelfPromotion_ThrowsInvalidOperationException
  - DemoteFromAdminAsync_SelfDemotion_ThrowsInvalidOperationException
  - LockUserAsync_ValidUser_LocksAccount
  - UnlockUserAsync_LockedUser_UnlocksAccount
  - ForcePasswordResetAsync_ValidUser_SendsEmail
  - ConfirmEmailAsync_UnconfirmedUser_ConfirmsEmail
  - Disable2FAAsync_2FAEnabled_DisablesTwoFactor
  - CreateUserAsync_ValidData_CreatesUser
  - CreateUserAsync_DuplicateEmail_ThrowsDuplicateException

### Unit Tests (Frontend)
**Target**: 70% coverage

**Test Suites**:
- `UserListView.test.tsx`:
  - Renders user list with data
  - Filters by email confirmation status
  - Searches by email (debounced)
  - Opens user detail on row click
  - Displays locked/admin indicators
- `UserDetailDialog.test.tsx`:
  - Displays user data correctly
  - Validates form fields
  - Saves changes on submit
  - Prevents self-demotion
  - Shows confirmation for role changes
- `CreateUserDialog.test.tsx`:
  - Validates required fields
  - Enforces password policy
  - Creates user on submit

### BDD E2E Tests
**Framework**: Cucumber + Playwright

**Feature File**: `AdminUserManagement.feature`

**Critical Scenarios**:
1. Admin views user list and filters by admin role
2. Admin promotes user to administrator (confirmation dialog)
3. Admin locks user account (user cannot log in)
4. Admin unlocks user account (user can log in)
5. Admin force password reset (user receives email)
6. Admin manually confirms user email
7. Admin disables user 2FA
8. Admin creates new user account
9. Admin attempts self-demotion (blocked)
10. Admin performs bulk lock operation

**Smoke Scenario**: Admin login → User list loads → Open user detail → Close dialog

## UI/UX Design

### User List View
**Layout**: Full-page DataGrid with filters panel
**Filters**: Left sidebar (collapsible on mobile)
**Actions**: Top toolbar (Search, Create User, Bulk Actions)
**Indicators**:
- Green checkmark icon: Email confirmed
- Blue shield icon: Admin role
- Red lock icon: Account locked
- Gold key icon: 2FA enabled

### User Detail Dialog
**Layout**: Modal dialog, responsive (fullscreen on mobile)
**Sections**:
1. Header: User email + avatar
2. Profile Fields: Name, Display Name, Phone (editable)
3. Security Section: Email Confirmed, 2FA Enabled, Locked Status (actions)
4. Role Section: Admin toggle
5. Footer: Save/Cancel buttons

**Confirmation Dialogs**: Material-UI Alert Dialog with clear action buttons

### Dark/Light Theme
- Light theme: White background, dark text
- Dark theme: Dark gray background (#1e1e1e), light text (#e0e0e0)
- Accent color: Primary blue (#1976d2)
- Error indicators: Red (#d32f2f)
- Success indicators: Green (#388e3c)

## Dependencies

### EPIC-001 Dependencies
- **Phase 1 (Auth Infrastructure)**: User model, UserManager, ASP.NET Identity
- **Phase 12 (Audit Logging)**: IAuditLogService for tracking admin actions

### EPIC-002 Dependencies
- **Phase 1 (Admin Infrastructure)**: Admin app routing, layout, authentication

### External Dependencies
- ASP.NET Core Identity (UserManager, RoleManager)
- MUI DataGrid (frontend)
- React Hook Form + Yup (frontend validation)
- RTK Query (data fetching)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Admin accidentally locks all accounts | Low | Critical | Confirmation dialogs, cannot lock self, audit trail |
| Self-demotion bug | Medium | High | Server-side validation, unit tests, BDD coverage |
| Performance with 10k+ users | Medium | Medium | Server-side pagination, indexed email column |
| Audit log failure blocks operations | Low | Medium | Graceful degradation (log error, allow operation) |

## Out of Scope (Future Enhancements)

- User deletion (soft delete deferred due to audit constraints)
- Export users to CSV/Excel
- User activity metrics (last login, action count)
- Custom user metadata fields
- User impersonation (login as user for support)
- Multi-step user creation wizard
- Email templates customization from UI

## Acceptance Checklist

- [ ] All 9 functional requirements implemented
- [ ] Backend unit tests ≥80% coverage
- [ ] Frontend unit tests ≥70% coverage
- [ ] 10 BDD scenarios pass
- [ ] Audit log integration verified (all actions logged)
- [ ] Cannot demote self (tested in E2E)
- [ ] Cannot delete self (validated in unit tests)
- [ ] Dark/light theme working
- [ ] Mobile responsive (tested on 360px width)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Code review passed (security, OWASP checks)
- [ ] Documentation updated (API docs, user guide)
