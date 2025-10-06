# Authorization Requirements - VTTTools

**Document Version**: 1.0
**Last Updated**: 2025-10-04
**Status**: Active

---

## Executive Summary

This document defines authorization requirements for all pages, features, and use cases in VTTTools. Currently, the system supports **two authorization levels**:

- **Anonymous**: Public access, no authentication required
- **Authorized**: Requires user to be logged in

**Future**: Role-based access control (RBAC) will add granular permissions (Admin, Game Master, Player, Guest).

---

## Current Pages (Implemented)

### Anonymous (Public) Pages

| Page | Route | Component | Description |
|------|-------|-----------|-------------|
| Landing Page | `/` | `LandingPage.tsx` | Public marketing page with hero section and feature preview |
| Login Page | `/login` | `LoginPage.tsx` | User authentication page |
| Registration Page | `/register` | `LoginPage.tsx` | New user registration |
| Password Reset | `/reset-password` | `LoginPage.tsx` | Password recovery flow |
| Service Unavailable | `/error/service-unavailable` | `ServiceUnavailablePage.tsx` | Error page for service outages |

**Reasoning**: These pages must be accessible to unauthenticated users to enable account creation, login, and error recovery.

### Authorized (Protected) Pages

| Page | Route | Component | Description | Authorization Level |
|------|-------|-----------|-------------|-------------------|
| Scene Editor | `/scene-editor` | `SceneEditorPage.tsx` | Canvas-based scene creation tool | **Authorized** |
| Dashboard | `/dashboard` | Redirects to `/` | User dashboard (currently landing page) | **Authorized** |

**Reasoning**: These pages contain user-specific content and require authentication to access and modify user data.

---

## Future Pages (From Roadmap Analysis)

### Phase 4: Scene Editor Foundation (12 hours)
**Status**: All components within Scene Editor page (already authorized)

No new pages. All components render within existing `/scene-editor` protected route:
- GridConfigPanel (component)
- LayerManager (component)
- Grid rendering (canvas layer)

**Authorization**: **Authorized** (inherits from parent page)

---

### Phase 5: Asset Library (16 hours)
**New Pages Required**:

| Page | Route | Authorization Level | Description |
|------|-------|-------------------|-------------|
| Asset Library | `/assets` | **Authorized** | Browse, filter, and manage game assets (creatures, tokens, etc.) |
| Asset Detail | `/assets/:assetId` | **Authorized** | View and edit single asset details |

**Reasoning**:
- Asset browsing may include private user assets
- Asset editing requires ownership validation
- Public assets can be browsed by authenticated users
- Future: May add public asset preview for anonymous users

**Future Enhancement**: Public asset gallery at `/assets/public` (anonymous) for marketing purposes.

---

### Phase 6: Scene Editor Advanced (20 hours)
**Status**: All components within Scene Editor page (already authorized)

No new pages. Advanced features (token placement, undo/redo, offline mode) enhance existing `/scene-editor`:
- TokenPlacement (component)
- UndoRedoManager (service)
- ConnectionStatusBanner (component)

**Authorization**: **Authorized** (inherits from parent page)

---

### Phase 7: Content Management Part 1 - Epic/Campaign/Adventure (18 hours)
**New Pages Required**:

| Page | Route | Authorization Level | Description |
|------|-------|-------------------|-------------|
| Epic List | `/library/epics` | **Authorized** | List all epics owned by or shared with user |
| Epic Detail | `/library/epics/:epicId` | **Authorized** | View/edit epic details and campaign list |
| Campaign List | `/library/epics/:epicId/campaigns` | **Authorized** | List campaigns within epic |
| Campaign Detail | `/library/campaigns/:campaignId` | **Authorized** | View/edit campaign details and adventure list |
| Adventure List | `/library/campaigns/:campaignId/adventures` | **Authorized** | List adventures within campaign |
| Adventure Detail | `/library/adventures/:adventureId` | **Authorized** | View/edit adventure details and scene list |

**Reasoning**: Content management is user-specific and requires authentication for CRUD operations and ownership validation.

**Future Enhancement**:
- Public adventure sharing at `/public/adventures/:adventureId` (anonymous)
- Published epic browsing at `/public/epics` (anonymous)

---

### Phase 8: Content Management Part 2 - Scene Management (14 hours)
**New Pages Required**:

| Page | Route | Authorization Level | Description |
|------|-------|-------------------|-------------|
| Scene List | `/library/adventures/:adventureId/scenes` | **Authorized** | List scenes within adventure |
| Scene Detail | `/scenes/:sceneId` | **Authorized** | Navigate to Scene Editor for specific scene |

**Reasoning**: Scenes are user-created content requiring authentication. Scene Editor already protected.

**Future Enhancement**: Shared scene preview at `/shared/scenes/:sceneId` (authorized, different user's content).

---

### Phase 9: Game Sessions - Real-Time Collaboration (22 hours)
**New Pages Required**:

| Page | Route | Authorization Level | Description |
|------|-------|-------------------|-------------|
| Session List | `/sessions` | **Authorized** | List game sessions (owned, participating, invitations) |
| Session Detail/Active | `/sessions/:sessionId` | **Authorized** | Active game session with chat, participants, scene viewer |
| Session Create | `/sessions/new` | **Authorized** | Create new game session wizard |

**Reasoning**: Game sessions require authentication for:
- Participant management
- Real-time chat and events
- Session ownership validation
- Participant role enforcement (Game Master, Player, Guest, Assistant)

**Future Enhancement**:
- Guest participant access via invite link (authorized, limited role)
- Spectator mode for published sessions (authorized, read-only)

---

### Phase 10: Account Management (16 hours)
**New Pages Required**:

| Page | Route | Authorization Level | Description |
|------|-------|-------------------|-------------|
| Profile Settings | `/settings/profile` | **Authorized** | View/edit user profile (name, email, avatar) |
| Security Settings | `/settings/security` | **Authorized** | Password, 2FA, recovery codes, security status |
| Account Settings | `/settings/account` | **Authorized** | Account preferences, notifications, privacy |

**Reasoning**: Account management pages are inherently user-specific and require authentication to view and modify personal settings.

---

## Features and Use Cases Authorization

### Identity Area

#### Authentication Feature
**All Use Cases**: **Anonymous** (pre-authentication)
- User Login
- User Registration
- Password Reset Request
- Password Reset Confirmation
- Two-Factor Verification
- Recovery Code Verification

#### Account Management Feature
**All Use Cases**: **Authorized** (post-authentication)
- View Profile Settings
- Update Profile
- View Security Settings
- Setup Two-Factor Authentication
- Manage Recovery Codes
- Change Password

---

### Assets Area

#### Asset Management Feature
**All Use Cases**: **Authorized**
- Create Asset (owner)
- Update Asset (owner only)
- Delete Asset (owner only)
- Get Asset (owner + users with access to published assets)
- List Assets (all user's assets)
- List Assets By Owner (public + user's own)
- List Assets By Type (filtered view)
- List Public Assets (all users can browse published assets)

**Future Enhancement**:
- `List Public Assets` may become **Anonymous** for public asset gallery
- Asset preview API endpoint for public marketing

#### Asset Publishing Feature
**All Use Cases**: **Authorized**
- Publish Asset (owner only)
- Unpublish Asset (owner only)

**Authorization Notes**:
- Ownership validation required for CUD operations
- Published assets visible to all authenticated users
- Asset.OwnerId must match current user for edit/delete

---

### Library Area

#### Epic Management Feature
**All Use Cases**: **Authorized**
- Create Epic (any authenticated user)
- Update Epic (owner only)
- Delete Epic (owner only)
- List Epics (user's own + shared epics)
- Get Epic Details (owner + users with access)

#### Campaign Management Feature
**All Use Cases**: **Authorized**
- Create Campaign (any authenticated user)
- Update Campaign (owner only)
- Delete Campaign (owner only)
- List Campaigns (within owned/shared epics)
- Get Campaign Details (owner + users with access)

#### Adventure Management Feature
**All Use Cases**: **Authorized**
- Create Adventure (any authenticated user)
- Update Adventure (owner only)
- Delete Adventure (owner only)
- Publish Adventure (owner only)
- List Adventures (within owned/shared campaigns)
- Get Adventure Details (owner + users with shared access)

#### Scene Management Feature
**All Use Cases**: **Authorized**
- Create Scene (owner of parent adventure)
- Update Scene (owner only)
- Delete Scene (owner only)
- List Scenes (within owned/shared adventures)
- Get Scene Details (owner + session participants)
- Clone Scene (any authenticated user)

---

### Game Area

#### Session Management Feature
**All Use Cases**: **Authorized**
- Create Session (any authenticated user, becomes Game Master)
- Update Session (Game Master only)
- Delete Session (Game Master only)
- Start/Pause/Resume/Finish Session (Game Master only)
- List Sessions (owned + participating)
- Join Session (invited participants only)

**Role-Based Authorization** (Future Enhancement):
- Game Master: Full control (create, update, delete, session controls)
- Assistant: Scene management, participant chat
- Player: View scene, chat, dice rolls, own character tokens
- Guest: View scene, limited chat

#### Participant Management Feature
**All Use Cases**: **Authorized**
- Add Participant (Game Master only)
- Remove Participant (Game Master only)
- Update Participant Role (Game Master only)
- List Participants (all session participants)

#### Chat Management Feature
**All Use Cases**: **Authorized** (Session participants only)
- Send Chat Message (all participants based on role)
- View Chat History (all participants)

#### Event Management Feature
**All Use Cases**: **Authorized** (Session participants only)
- Record Game Event (participants based on role)
- View Event Log (all participants)

---

## Authorization Implementation Pattern

### Current Implementation

```typescript
<Route path="/scene-editor" element={
  <ProtectedRoute authLevel="authorized">
    <SceneEditorPage />
  </ProtectedRoute>
} />

<Route path="/" element={
  <ProtectedRoute authLevel="anonymous">
    <LandingPage />
  </ProtectedRoute>
} />
```

### Future Role-Based Enhancement

```typescript
<Route path="/sessions/:sessionId" element={
  <ProtectedRoute authLevel="authorized" requiredRole="participant">
    <SessionPage />
  </ProtectedRoute>
} />

<Route path="/admin/users" element={
  <ProtectedRoute authLevel="authorized" requiredRole="admin">
    <UserManagementPage />
  </ProtectedRoute>
} />
```

---

## Authorization Decision Matrix

| Content Type | Create | Read | Update | Delete | Publish |
|--------------|--------|------|--------|--------|---------|
| Asset | Owner | Owner + Published viewers | Owner | Owner | Owner |
| Epic | Any user | Owner + Shared | Owner | Owner | N/A |
| Campaign | Any user | Owner + Shared | Owner | Owner | N/A |
| Adventure | Any user | Owner + Shared | Owner | Owner | Owner |
| Scene | Owner (adventure) | Owner + Session participants | Owner | Owner | N/A |
| Session | Any user | Owner + Participants | Game Master | Game Master | N/A |
| Participant | Game Master | All participants | Game Master | Game Master | N/A |
| Chat Message | Participants | All participants | N/A | N/A | N/A |
| Game Event | Participants | All participants | N/A | N/A | N/A |

**Legend**:
- **Owner**: User who created the entity (matches OwnerId)
- **Shared**: Users explicitly granted access
- **Participants**: Session participants with appropriate role
- **Game Master**: Session owner (highest authority in session)
- **Published viewers**: Any authenticated user (for published assets/adventures)

---

## Future Authorization Enhancements

### Phase 1: Role-Based Access Control (RBAC)
**Timeline**: After Phase 10 complete
**Roles**:
- Admin: Platform administration
- Game Master: Full session control
- Assistant: Limited session management
- Player: Participant with character control
- Guest: Read-only participant

### Phase 2: Sharing and Permissions
**Timeline**: After RBAC implementation
**Features**:
- Share epics/campaigns/adventures with specific users
- Grant read/write permissions
- Public/private content visibility toggles
- Shared asset libraries (team libraries)

### Phase 3: Public Content Gallery
**Timeline**: Marketing phase
**Features**:
- Public asset browsing (anonymous)
- Published adventure showcase (anonymous)
- Community content discovery (anonymous read, authorized contribute)

---

## Security Considerations

### Current Security Measures
1. **Cookie-Based Authentication**: Secure HttpOnly cookies with user claims
2. **Route Protection**: ProtectedRoute component enforces authentication
3. **Backend Validation**: All API endpoints validate authentication
4. **HTTPS Only**: Secure cookie transmission
5. **XSS Protection**: Content Security Policy headers

### Required Backend Authorization Checks
1. **Ownership Validation**: Verify userId matches entity.OwnerId for CUD operations
2. **Participation Validation**: Verify user is session participant for session access
3. **Role Validation**: Verify user role allows requested operation (future)
4. **Published Status**: Verify asset/adventure is published for non-owner access
5. **Sharing Validation**: Verify user has shared access (future)

### Frontend Authorization Checks (UX Enhancement)
1. **Conditional Rendering**: Hide edit/delete buttons if not owner
2. **Disabled States**: Disable actions based on authorization
3. **Route Guards**: Redirect unauthorized users before rendering page
4. **Optimistic UI**: Show actions immediately, rollback on auth failure

**IMPORTANT**: Frontend checks are UX enhancements only. Backend must enforce all authorization rules.

---

## Next Steps

1. ✅ **Implement ProtectedRoute component** (Complete)
2. ✅ **Apply route protection to current pages** (Complete)
3. ⏳ **Add route protection as future pages are implemented** (Phases 5-10)
4. ⏳ **Implement ownership validation in backend** (Ongoing)
5. ⏳ **Add role-based authorization** (Future: After Phase 10)
6. ⏳ **Implement sharing and permissions** (Future: Post-RBAC)

---

**Document Owner**: Development Team
**Review Cycle**: Updated with each new phase implementation
**Related Documents**:
- UI_MIGRATION_ROADMAP.md (Phase planning)
- CODING_STANDARDS.md (Implementation patterns)
- Area feature specifications (Detailed use case requirements)
