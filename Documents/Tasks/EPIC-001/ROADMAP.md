# EPIC-001: UI Migration - Implementation Roadmap

**Target Type**: Task (Epic)
**Target Item**: EPIC-001
**Item Specification**: Documents/Tasks/EPIC-001/TASK.md
**Created**: 2025-10-03
**Last Updated**: 2025-10-19
**Version**: 1.6.0

---

## Roadmap Overview

**Objective**: Complete migration from Blazor WebAssembly to React 19 + TypeScript SPA with enhanced scene editor, asset library, and real-time collaboration features

**Scope**: Remaining 35% of UI migration (Phases 7-11) covering Scene/Adventure/Content Management, Game Sessions with SignalR, and Account Management

**Total Phases**: 11 (Phases 1-6 ✅ Complete, Phases 7-11 🔜 Remaining)
**Estimated Complexity**: Very High (243 hours total, 85 hours remaining)
**Current Status**: Phase 6 complete (65.0%), Phase 7-8-10-11 READY, Phase 9 BLOCKED by backend

**Deliverables**:

- ✅ Complete Konva-based scene editor with grid, tokens, layers, undo/redo, offline mode
- ✅ Asset library UI with browsing, filtering, creation, Material-UI components
- 🔜 Scene CRUD UI (create, edit, list, delete scenes) - READY
- 🔜 Adventure management UI (organize scenes into adventures) - READY
- ⚠️ Epic/Campaign hierarchy UI (optional advanced organization) - BLOCKED by backend
- 🔜 Real-time game session collaboration with SignalR (chat, events, participants)
- 🔜 Account management pages (profile, security, 2FA, password change)
- 🚧 BDD step definitions for feature files (integrated per-phase)
- 🔜 Legacy Blazor projects deprecated

---

## Error Handling Strategy

### Validation Errors
- **Form Validation**: Material-UI TextField error props with real-time validation
- **API Validation**: Display validation errors from backend using RTK Query error responses
- **Pattern**: Show inline field errors + summary message at form level

### Connection Errors
- **Offline Mode** (Phase 6): localStorage persistence + auto-sync on reconnect
- **Connection Lost UI**: ConnectionStatusBanner component blocks editing during outage
- **SignalR Resilience** (Phase 9): Auto-reconnect + message queuing + replay

### Component Error Boundaries
- **ErrorBoundary**: Catch React component errors, display fallback UI
- **Error Pages**: ServiceUnavailablePage for backend unavailability
- **Pattern**: Wrap route components in ErrorBoundary for graceful degradation

### References
- See Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md § Error Handling

---

## Testing Strategy

### Unit Testing
- **Framework**: Vitest 2.1+ with React Testing Library
- **Scope**: Component rendering, user interactions, custom hooks, utility functions
- **Coverage Target**: ≥70% for components, ≥80% for utilities
- **Pattern**: AAA (Arrange, Act, Assert), user-centric queries (getByRole, getByLabelText)

### Integration Testing
- **RTK Query Integration**: Test API slice endpoints with MSW (Mock Service Worker)
- **Component Integration**: Test multi-component interactions (LoginPage + SimpleLoginForm)
- **Redux Integration**: Test component + Redux store interactions with mock store

### E2E Testing
- **Framework**: Playwright 1.55
- **Scope**: Critical paths (auth, scene editor, game sessions)
- **Execution**: npm run test:e2e
- **Coverage**: All Phase 11 success criteria paths

### BDD Testing
- **Framework**: Cucumber/Gherkin
- **Scope**: 101 feature files (UI scenarios focus)
- **Phase**: Phase 11 (12 hours for step definitions)
- **Coverage Target**: 100% feature file coverage

### References
- See Documents/Guides/TESTING_GUIDE.md for detailed standards

---

## Code Quality Standards

### TypeScript/React Standards
- **Style Guide**: Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md
  - 4-space indentation, single quotes, semicolons required
  - Function components only (no class components)
  - Hooks follow `use` prefix convention
  - Props interfaces have `Props` suffix
- **Enforcement**: tsconfig.json strict mode, ESLint

### General Coding Standards
- **Standards Document**: Documents/Guides/CODING_STANDARDS.md
  - Component-based architecture with clear separation of concerns
  - Async all the way (no blocking operations)
  - Dependency injection via hooks/context
- **Enforcement**: Code review, automated linting

### Testing Standards
- **Testing Guide**: Documents/Guides/TESTING_GUIDE.md
  - Vitest + Testing Library for component tests
  - AAA pattern (Arrange, Act, Assert)
  - User-centric queries (getByRole, getByLabelText)
- **Enforcement**: Code review, coverage reports (≥70%)

### File Naming Conventions
- **Components**: PascalCase.tsx (LoginForm.tsx, ErrorBoundary.tsx)
- **Hooks**: camelCase.ts (useAuth.ts, useGameSession.ts)
- **Utilities**: camelCase.ts (validation.ts, errorHandling.ts)
- **Tests**: {Name}.test.tsx (LoginForm.test.tsx)

---

## Task Context

**Task ID**: EPIC-001
**Task Type**: Epic
**Priority**: Critical

**Cross-References**:

- Features: UserAuthentication ✅, AccountManagement, LandingPage ✅, AssetManagement 🚧, SceneManagement 🚧, SessionManagement
- Components: WebClientApp (React SPA), VttTools.WebApp.WebAssembly (legacy), VttTools.WebApp.Common (legacy)
- Domain Areas: None (UI-only migration)

**Scope**: Migrate all Blazor UI to React with feature parity + UX enhancements (Konva scene editor, Material-UI design system, Redux state management)

---

## Implementation Phases

### Phase 1: Foundation Setup ✅ COMPLETE

**Objective**: Bootstrap React 19 project with TypeScript, Vite, Redux Toolkit, routing infrastructure

**Deliverables**:

- Component: WebClientApp
  - Description: React 19.1 + Vite 7.1.5 + TypeScript 5.9 project structure
  - Complexity: Medium
  - Dependencies: None
- Store: Redux Toolkit configuration
  - Description: Store setup with auth slice, RTK Query API configuration
  - Complexity: Medium
  - Dependencies: None
- Router: React Router 7.9
  - Description: Routing setup with protected routes, auth guards
  - Complexity: Low
  - Dependencies: Redux store

**Implementation Sequence**:

1. **Project Bootstrap** (UI)
   - Command: npm create vite@latest
   - Estimated Effort: 2 hours
   - Dependencies: None
2. **Redux Store Setup** (UI)
   - Command: Configure store, create auth slice
   - Estimated Effort: 4 hours
   - Dependencies: Project bootstrap
3. **Routing Configuration** (UI)
   - Command: Setup React Router with route definitions
   - Estimated Effort: 2 hours
   - Dependencies: Redux store

**Success Criteria**:

- ✅ Project builds without errors
- ✅ Redux DevTools working
- ✅ Routing functional with protected routes

**Dependencies**:

- **Prerequisites**: None
- **Blocks**: Phase 2 (all features need foundation)

**Validation**:

- Validate after phase: npm run build && npm run test
- Quality gate: Zero TypeScript errors, all tests passing

**Status**: ✅ Complete (8 hours)

---

### Phase 2: Authentication & Landing Page ✅ COMPLETE

**Objective**: Migrate login, registration, 2FA, password reset pages + landing page with hero section

**Deliverables**:

- Page: LoginPage
  - Description: Multi-mode auth page (login, register, password reset) - 2FA modes exist but untestable until Phase 11
  - Complexity: High
  - Dependencies: Redux auth slice
- Component: SimpleLoginForm
  - Description: Email/password login form with Material-UI, Remember Me, Forgot Password link, password visibility toggle
  - Complexity: Medium
  - Dependencies: RTK Query auth API
- Component: SimpleRegistrationForm
  - Description: Registration form with validation, password visibility toggle (no confirm password field)
  - Complexity: Medium
  - Dependencies: RTK Query auth API
- Component: PasswordResetRequestForm
  - Description: Request password reset email with professional styling
  - Complexity: Low
  - Dependencies: RTK Query auth API
- Page: LandingPage
  - Description: Conditional rendering (Hero vs Dashboard Preview with action cards)
  - Complexity: Low
  - Dependencies: Auth context

**Implementation Sequence**:

1. **Auth API Slice** (UI)
   - Command: Create RTK Query API for /api/auth endpoints
   - Estimated Effort: 4 hours
   - Dependencies: Phase 1 complete
2. **LoginPage Component** (UI)
   - Command: Implement multi-mode authentication page
   - Estimated Effort: 6 hours
   - Dependencies: Auth API slice
3. **Registration Flow** (UI)
   - Command: Build registration form with validation
   - Estimated Effort: 4 hours
   - Dependencies: Auth API slice
4. **Landing Page** (UI)
   - Command: Hero section + Dashboard preview conditional rendering
   - Estimated Effort: 2 hours
   - Dependencies: Auth context

**Success Criteria**:

- ✅ Login, registration, logout flows functional
- ✅ Password reset integrated (request + confirm flows)
- ⚠️ 2FA verification components exist (setup UI in Phase 10)
- ✅ Landing page renders correctly for auth states

**Note**: 2FA can only be fully tested after Phase 10 (SecuritySettingsPage enables 2FA setup)

**Dependencies**:

- **Prerequisites**: Phase 1 (foundation)
- **Blocks**: Phase 11 (account settings need auth working)

**Validation**:

- Validate after phase: E2E auth tests with Playwright
- Quality gate: All auth flows working, BDD scenarios passing

**Status**: ✅ Complete (16 hours)

---

### Phase 3: Scene Editor - Panning & Zoom ✅ COMPLETE

**Objective**: Implement Konva Stage with smooth panning and zoom controls + authentication improvements

**Deliverables**:

- Component: SceneCanvas
  - Description: Konva Stage and Layer setup with React-Konva
  - Complexity: High
  - Dependencies: None
  - Status: ✅ Complete
- Feature: Pan Controls
  - Description: Mouse drag panning with smooth interactions
  - Complexity: Medium
  - Dependencies: SceneCanvas
  - Status: ✅ Complete
- Feature: Zoom Controls
  - Description: Mouse wheel zoom with min/max limits
  - Complexity: Medium
  - Dependencies: SceneCanvas
  - Status: ✅ Complete
- Component: ProtectedRoute
  - Description: Route protection with anonymous/authorized levels
  - Complexity: Medium
  - Dependencies: useAuth hook
  - Status: ✅ Complete
- Component: LoadingOverlay
  - Description: Reusable full-screen loading indicator
  - Complexity: Low
  - Dependencies: Material-UI
  - Status: ✅ Complete
- Documentation: Authorization Requirements
  - Description: Comprehensive authorization analysis for all pages, features, and use cases
  - Complexity: High
  - Dependencies: Roadmap, feature specifications
  - Status: ✅ Complete

**Implementation Sequence**:

1. **Konva Stage Setup** (UI)
   - Command: Create SceneCanvas component with Stage/Layer
   - Estimated Effort: 6 hours
   - Dependencies: Phase 1 complete
   - Status: ✅ Complete
2. **Panning Implementation** (UI)
   - Command: Add mouse drag handlers for canvas pan
   - Estimated Effort: 4 hours
   - Dependencies: Konva Stage
   - Status: ✅ Complete
3. **Zoom Implementation** (UI)
   - Command: Add wheel zoom with limits (0.1x - 10x)
   - Estimated Effort: 6 hours
   - Dependencies: Konva Stage
   - Status: ✅ Complete
4. **Authentication State Management** (UI)
   - Command: Fix logout state issues, implement loading overlay, add route protection
   - Estimated Effort: 8 hours
   - Dependencies: Phase 2 auth system
   - Status: ✅ Complete
5. **Authorization Documentation** (Docs)
   - Command: Analyze and document authorization requirements for all phases
   - Estimated Effort: 4 hours
   - Dependencies: Roadmap, feature specs
   - Status: ✅ Complete

**Success Criteria**:

- ✅ Smooth panning with mouse drag
- ✅ Zoom with wheel (min 0.1x, max 10x)
- ✅ 60 FPS canvas performance
- ✅ Authentication state properly managed (cookie-based, no flashing)
- ✅ Logout immediately shows correct menu state
- ✅ Protected routes enforce authentication
- ✅ Authorization requirements documented for all future phases

**Key Improvements in Phase 3**:
- **Authentication Fixes**:
  - Fixed logout menu flashing issue (cookie cleared before state reset)
  - Added app-level LoadingOverlay during auth initialization
  - Restructured App.tsx to ensure Router context available for useAuth
  - Theme persistence via localStorage
- **Route Protection**:
  - Created ProtectedRoute component with anonymous/authorized levels
  - Applied protection to all current routes (scene-editor = authorized, landing/login = anonymous)
  - Documented authorization requirements for Phases 4-11
- **Authorization Analysis**:
  - Created AUTHORIZATION_REQUIREMENTS.md with comprehensive analysis
  - Identified authorization levels for all future pages (Phases 4-11)
  - Documented authorization decision matrix for Create/Read/Update/Delete operations
  - Planned future RBAC enhancements (Game Master, Player, Admin roles)

**Dependencies**:

- **Prerequisites**: Phase 1 (React foundation)
- **Blocks**: Phases 4-6 (scene editor components)

**Validation**:

- Validate after phase: Performance profiling (FPS monitoring), auth flow testing
- Quality gate: 60 FPS maintained during pan/zoom, auth state correct on all operations

**Status**: ✅ Complete (28 hours - 16h original + 8h auth + 4h docs)
**Completion Date**: 2025-10-04

---

### Phase 4: Scene Editor - Grid & Layers ✅ COMPLETE

**Objective**: Complete grid rendering system with 5 grid types and layer management

**Completion Date**: 2025-10-05

**Deliverables**:

- Component: GridRenderer
  - Description: Render 5 grid types (square, hex-v, hex-h, isometric, none) with configurable size/color
  - Complexity: High
  - Dependencies: SceneCanvas from Phase 3
- Component: GridConfigPanel
  - Description: Material-UI form for grid configuration (type, size, offset, color)
  - Complexity: Medium
  - Dependencies: None
- Service: LayerManager
  - Description: Konva layer orchestration (background → grid → tokens → foreground)
  - Complexity: Medium
  - Dependencies: GridRenderer
- Utility: GridCalculator
  - Description: Coordinate translation, snap-to-grid algorithms for all grid types
  - Complexity: High
  - Dependencies: None

**Implementation Sequence**:

1. **GridCalculator Utility** (UI)
   - Command: Implement coordinate/snap calculations for 5 grid types
   - Estimated Effort: 4 hours
   - Dependencies: Phase 3 complete
2. **GridRenderer Component** (UI)
   - Command: Canvas rendering for all grid types using Konva shapes
   - Estimated Effort: 5 hours
   - Dependencies: GridCalculator
3. **LayerManager Service** (UI)
   - Command: Konva layer orchestration with z-index management
   - Estimated Effort: 2 hours
   - Dependencies: GridRenderer
4. **GridConfigPanel UI** (UI)
   - Command: Material-UI form for grid settings with live preview
   - Estimated Effort: 1 hour
   - Dependencies: GridRenderer

**Success Criteria**:

- All 5 grid types render correctly
- Grid configuration changes update in real-time
- Layers maintain proper z-order (background, grid, tokens, foreground)
- Performance: 60 FPS with any grid type active

**Dependencies**:

- **Prerequisites**: Phase 3 (SceneCanvas ready)
- **Blocks**: Phase 6 (token placement needs grid snap)

**Validation**:

- Validate after phase: Visual testing for all grid types, performance profiling
- Quality gate: Grid renders at 60 FPS, all 5 types functional, snap calculations accurate

**Estimated Effort**: 12 hours

**Status**: ✅ Complete (12 hours)

---

### Phase 5: Asset Library UI ✅ COMPLETE

**Objective**: Build comprehensive asset browsing, filtering, and management UI

**Prerequisites**:
- Backend asset API operational (CRUD + filters)
- Test data: ≥100 assets seeded in database (all 15 asset types represented)

**Deliverables**:

- Page: AssetLibraryPage
  - Description: Main asset library with Material-UI Card grid layout
  - Complexity: Medium
  - Dependencies: RTK Query assetApi
- Component: AssetFilterPanel
  - Description: Filter by 15 asset types, owner, published status
  - Complexity: Medium
  - Dependencies: None
- Component: AssetSearchBar
  - Description: Search by name/tags with debounced input
  - Complexity: Low
  - Dependencies: None
- Component: AssetPreviewDialog
  - Description: Material-UI modal for asset details and editing
  - Complexity: Medium
  - Dependencies: None
- API: assetApi RTK Query slice
  - Description: API integration for all asset endpoints (CRUD, filters)
  - Complexity: Medium
  - Dependencies: Phase 1 (Redux foundation)

**Implementation Sequence**:

1. **Asset API Slice** (UI)
   - Command: Create RTK Query endpoints for /api/assets
   - Estimated Effort: 3 hours
   - Dependencies: Phase 1 complete
2. **AssetLibraryPage** (UI)
   - Command: Page layout with responsive Card grid
   - Estimated Effort: 4 hours
   - Dependencies: Asset API
3. **AssetFilterPanel** (UI)
   - Command: Filter UI with 15 asset types, owner, status
   - Estimated Effort: 3 hours
   - Dependencies: Asset API
4. **AssetSearchBar** (UI)
   - Command: Search input with debounce (300ms)
   - Estimated Effort: 2 hours
   - Dependencies: Asset API
5. **AssetPreviewDialog** (UI)
   - Command: Modal for view/edit asset with Material-UI Dialog
   - Estimated Effort: 4 hours
   - Dependencies: Asset API

**Success Criteria**:

- Browse 100+ assets with pagination
- Filter by all 15 asset types
- Search results appear within 500ms
- Asset CRUD operations functional

**Dependencies**:

- **Prerequisites**: Phase 1 (Redux foundation)
- **Blocks**: Phase 6 (token placement needs asset selection)

**Validation**:

- Validate after phase: Load 100 assets, filter performance, CRUD operations
- Quality gate: <500ms load time, all filters work, responsive design

**Estimated Effort**: 16 hours

**Status**: ✅ Complete (70 hours actual, 16 hours estimated)
**Completion Date**: 2025-10-11
**Scope Expansion**: Phase 5 expanded to include:
- **Phase 5.5** (14h): Multi-resource system, NamedSize, IsVisible refactoring, Accordion UI
- **Phase 5.6** (16h): Resource redesign (Portrait→Display, removed IsDefault), SVG→PNG conversion, keyboard shortcuts
- **Phase 5.7** (4h): Blob storage architecture, GUID v7 consistency, metadata system

**Actual Deliverables**:
- AssetLibraryPage with virtual "Add" card and accordion dialogs
- Multi-resource system: Assets can have multiple images with Token/Display roles
- NamedSize system: Named presets (Tiny, Medium, Large) with fractional support (⅛, ¼, ½)
- PNG conversion: All image formats → PNG (SVG via Svg.Skia, others via ImageSharp)
- Optimized blob storage: {resourceType}/{guid-suffix}/{guid} with metadata
- GUID v7: All resources use timestamp-based IDs for better load balancing
- Complete CRUD: Create, Read, Update, Delete with validation
- Frontend linting: 0 errors, 0 warnings (React Compiler compliant)

**Quality Gates Passed**:
- All tests passing (110+ backend, frontend clean)
- Build: 0 errors, 0 warnings
- Migrations: 5 created and applied
- Linting: Clean (0 errors)

---

### Phase 6: Scene Editor - Tokens, Undo/Redo, Offline ✅ COMPLETE

**Objective**: Complete scene editor with token placement, undo/redo system (100 levels), and offline mode with localStorage persistence

**Completion Date**: 2025-10-19

**Deliverables**:

- Component: TokenPlacement
  - Description: Drag asset from library onto canvas with Konva Image
  - Complexity: High
  - Dependencies: Phase 5 (asset library), Phase 4 (grid snap)
- Component: TokenDragHandle
  - Description: Select, drag, delete tokens with Konva events
  - Complexity: High
  - Dependencies: TokenPlacement
- Service: UndoRedoManager
  - Description: Command pattern with 100-level history stack (configurable)
  - Complexity: High
  - Dependencies: All scene operations
- Service: OfflineSyncManager
  - Description: localStorage persistence + connection monitoring + auto-submit on reconnect
  - Complexity: Very High
  - Dependencies: All scene operations
  - API Integration: PUT /api/scenes/{sceneId}
- Component: ConnectionStatusBanner
  - Description: "Connection Lost" UI overlay with reconnection status
  - Complexity: Low
  - Dependencies: OfflineSyncManager

**Implementation Sequence**:

1. **GridSnapBehavior Utility** (UI)
   - Command: Implement snap-to-grid for token placement
   - Estimated Effort: 3 hours
   - Dependencies: Phase 4 GridCalculator
2. **TokenPlacement Component** (UI)
   - Command: Drag asset from library, render on canvas as Konva Image
   - Estimated Effort: 5 hours
   - Dependencies: Phase 5 complete, GridSnapBehavior
3. **TokenDragHandle Component** (UI)
   - Command: Select, drag, delete with Konva Transformer
   - Estimated Effort: 4 hours
   - Dependencies: TokenPlacement
4. **UndoRedoManager Service** (UI)
   - Command: Command pattern with configurable history (default: 100)
   - Estimated Effort: 5 hours
   - Dependencies: All scene operations
5. **OfflineSyncManager Service** (UI)
   - Command: localStorage save on connection loss, auto-submit on reconnect
   - Estimated Effort: 6 hours
   - Dependencies: All scene operations
6. **ConnectionStatusBanner Component** (UI)
   - Command: UI overlay for connection status and pending changes
   - Estimated Effort: 2 hours
   - Dependencies: OfflineSyncManager

**Success Criteria**:

- Token placement from asset library functional
- Drag-and-drop with snap-to-grid working
- Undo/redo works for all scene operations (100-level default)
- Offline mode saves changes to localStorage
- Connection lost UI blocks editing
- Pending changes auto-submit on reconnect
- Performance: 100 tokens at 60 FPS ⚡

**Dependencies**:

- **Prerequisites**: Phase 4 (grid), Phase 5 (asset library)
- **Blocks**: Phase 7 (scenes need editor), Phase 10 (sessions use scenes)

**Validation**:

- Validate after phase: Performance test with 100 tokens, offline mode simulation, undo/redo stress test
- Quality gate: 60 FPS with 100 tokens, offline sync reliable, undo history accurate

**Estimated Effort**: 25 hours

**Status**: ✅ Complete (24 hours actual, 86% efficiency)

**Actual Deliverables**:
- React Context pattern (replaced singleton UndoRedoManager with UndoRedoContext)
- Command pattern with immutable state updates (100-level history)
- Heartbeat polling for connection detection (replaced unreliable navigator.onLine)
- RTK Query cache persistence with 24h expiration
- localStorage wrapper with 5MB quota management
- TokenPlacement component with snap-to-grid (fixes double-snap bug)
- TokenDragHandle component with Konva Transformer integration
- ConnectionStatusBanner with 2-second debounce
- EditingBlocker positioned below AppBar
- UndoRedoToolbar with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- SceneEditorPage integration (removed manual token rendering, integrated all Phase 6 components)

**Quality Gates Passed**:
- All 255+ tests passing (100%)
- 85% test coverage (exceeds 70% target)
- 0 TypeScript errors in Phase 6 files
- Full theme support (no hardcoded colors)
- OWASP Top 10 compliant
- GO FOR PRODUCTION approval from code-reviewer (⭐⭐⭐⭐⭐ 5/5 rating)
- 89.4% fix rate (42 of 47 original audit issues resolved)
- Semantic IDs for all interactive elements
- Proper event cleanup (no memory leaks)

**Implementation Notes**:
- Original Phase 6 (2025-10-11) had 47 critical issues requiring complete reimplementation
- solution-engineer recommended REIMPLEMENT (28h) vs FIX (40-50h)
- task-organizer created 8-step plan executed by frontend-developer
- Step 3 timing issues fixed (fake timers → real timers with short intervals)
- Removed 35+ unnecessary comments per CLAUDE.md policy
- Performance priority deferred per user request (focus: correctness and maintainability)

---

### Phase 7: Scene Management 🔜 READY

**Objective**: Implement Scene CRUD UI with standalone and adventure-linked support

**Backend Status**: ✅ Scene API fully implemented (`/api/library/scenes`)

**Deliverables**:

- Page: SceneListPage
  - Description: Browse user's scenes with Material-UI cards
  - Complexity: Medium
  - Dependencies: RTK Query scenesApi
- Component: SceneCRUDDialog
  - Description: Create/Edit scene with grid/stage configuration
  - Complexity: Medium
  - Dependencies: scenesApi
- Component: ScenePreviewCard
  - Description: Scene card with grid type, asset count, thumbnail
  - Complexity: Low
  - Dependencies: None
- API: scenesApi RTK Query slice
  - Description: Integration with `/api/library/scenes` endpoints
  - Complexity: Medium
  - Dependencies: None (backend exists)
- Integration: Scene Editor Launch
  - Description: Open Scene Editor with selected scene data
  - Complexity: Low
  - Dependencies: Phase 6 (Scene Editor)

**Implementation Sequence**:

1. **Scenes API Integration** (UI)
   - Command: Create RTK Query endpoints for scenes
   - Estimated Effort: 3 hours
   - Dependencies: None
2. **SceneCRUDDialog** (UI)
   - Command: Create/Edit form (name, description, grid type, stage size, optional adventureId)
   - Estimated Effort: 4 hours
   - Dependencies: Scenes API
3. **SceneListPage** (UI)
   - Command: Card grid with filter/search
   - Estimated Effort: 4 hours
   - Dependencies: Scenes API
4. **Scene Editor Integration** (UI)
   - Command: Load scene by ID, save scene changes to backend
   - Estimated Effort: 3 hours
   - Dependencies: SceneListPage

**Success Criteria**:

- Create scenes (standalone or linked to adventure)
- Edit scene metadata and configuration
- Delete scenes with confirmation
- Launch Scene Editor from scene list
- Save placed assets to backend (via scene API)

**Dependencies**:

- **Prerequisites**: Phase 6 (Scene Editor complete)
- **Blocks**: Phase 10 (game sessions reference scenes)

**Validation**:

- Validate after phase: Scene CRUD operations, editor integration, backend persistence
- Quality gate: All operations work, assets save to backend

**Estimated Effort**: 14 hours

**Status**: 🔜 READY (can start immediately)

---

### Phase 8: Adventure Management 🔜 READY

**Objective**: Implement Adventure CRUD UI to organize scenes

**Backend Status**: ✅ Adventure API fully implemented (`/api/library/adventures`)

**Deliverables**:

- Page: AdventureListPage
  - Description: Browse adventures with Material-UI cards
  - Complexity: Medium
  - Dependencies: RTK Query adventuresApi
- Component: AdventureCRUDDialog
  - Description: Create/Edit adventure (optional campaign parent)
  - Complexity: Medium
  - Dependencies: adventuresApi
- Component: AdventureSceneList
  - Description: List scenes within adventure context
  - Complexity: Medium
  - Dependencies: Phase 7 (scenes)
- API: adventuresApi RTK Query slice
  - Description: Integration with `/api/library/adventures` endpoints
  - Complexity: Medium
  - Dependencies: None (backend exists)

**Implementation Sequence**:

1. **Adventures API Integration** (UI)
   - Command: Create RTK Query endpoints
   - Estimated Effort: 3 hours
   - Dependencies: None
2. **AdventureCRUDDialog** (UI)
   - Command: Create/Edit form
   - Estimated Effort: 3 hours
   - Dependencies: Adventures API
3. **AdventureListPage** (UI)
   - Command: Card grid with scene preview integration
   - Estimated Effort: 4 hours
   - Dependencies: Adventures API, Phase 7
4. **Scene-Adventure Linking** (UI)
   - Command: Update SceneCRUDDialog to select parent adventure
   - Estimated Effort: 2 hours
   - Dependencies: Phase 7

**Success Criteria**:

- Create/Edit/Delete adventures
- Link scenes to adventures (optional)
- Browse scenes within adventure context
- Adventures can exist without campaigns

**Dependencies**:

- **Prerequisites**: Phase 7 (scenes)
- **Blocks**: None (Epic/Campaign optional)

**Validation**:

- Validate after phase: Adventure CRUD, scene linking
- Quality gate: All operations work, scenes can be organized

**Estimated Effort**: 12 hours

**Status**: 🔜 READY (can start after Phase 7)

---

### Phase 9: Epic/Campaign Hierarchy ⚠️ BLOCKED

**Objective**: Implement Epic→Campaign hierarchy for advanced content organization

**Backend Status**: ⚠️ Epic/Campaign services NOT IMPLEMENTED

**CRITICAL BLOCKER**:

- Backend Epic/Campaign services missing from VttTools.Library microservice
- Backend development required: ~3 weeks
- Recommendation: Defer until backend ready

**Deliverables**:

- Page: ContentHierarchyPage
  - Description: Tree view for Epic→Campaign→Adventure
  - Complexity: High
  - Dependencies: RTK Query epicApi, campaignApi
- Component: EpicCRUDDialog, CampaignCRUDDialog
  - Description: Create/Edit forms
  - Complexity: Medium each
  - Dependencies: Backend APIs
- API: epicApi, campaignApi RTK Query slices
  - Description: Integration with `/api/library/epics`, `/api/library/campaigns`
  - Complexity: High
  - Dependencies: Backend services (missing)

**Success Criteria**:

- Create/Edit/Delete Epics and Campaigns
- Hierarchy relationships maintained
- Adventures can link to campaigns
- Campaigns can link to epics

**Dependencies**:

- **Prerequisites**: Backend Epic/Campaign services (NOT READY)
- **Blocks**: None (optional feature)

**Estimated Effort**: 18 hours (BLOCKED - cannot start)

**Status**: ⚠️ BLOCKED by backend development

---

### Phase 10: Game Sessions - Real-Time Collaboration 🔜 READY

**Objective**: Implement real-time game session UI with SignalR for chat, events, and participant management

**Backend Status**: ✅ SignalR hubs implemented (ChatHub, GameSessionHub available)

**Deliverables**:

- Service: SignalRProvider
  - Description: SignalR connection lifecycle management (connect, disconnect, reconnect)
  - Complexity: Very High
  - Dependencies: Backend SignalR hubs (ChatHub, GameSessionHub)
- Component: ChatPanel
  - Description: Real-time chat UI with message history and input
  - Complexity: High
  - Dependencies: SignalRProvider
- Component: ParticipantList
  - Description: Live participant roster with roles and status indicators
  - Complexity: Medium
  - Dependencies: SignalRProvider
- Component: GameEventLog
  - Description: Event stream (dice rolls, asset movements, status changes)
  - Complexity: Medium
  - Dependencies: SignalRProvider
- Service: ConnectionResilienceManager
  - Description: Auto-reconnect, message queuing, replay on reconnect
  - Complexity: Very High
  - Dependencies: SignalRProvider
- API: gameSessionApi RTK Query slice
  - Description: API integration for /api/game-sessions endpoints
  - Complexity: Medium
  - Dependencies: None

**Implementation Sequence**:

1. **Game Session API Slice** (UI)
   - Command: Create RTK Query endpoints for /api/game-sessions
   - Estimated Effort: 3 hours
   - Dependencies: Phase 1 complete
2. **SignalRProvider Setup** (UI)
   - Command: SignalR Client connection with hub lifecycle
   - Estimated Effort: 6 hours
   - Dependencies: Backend hubs ready
3. **ChatPanel Component** (UI)
   - Command: Real-time chat with SignalR message handling
   - Estimated Effort: 5 hours
   - Dependencies: SignalRProvider
4. **ParticipantList Component** (UI)
   - Command: Live participant updates via SignalR
   - Estimated Effort: 3 hours
   - Dependencies: SignalRProvider
5. **GameEventLog Component** (UI)
   - Command: Event stream rendering with types (dice, movement, status)
   - Estimated Effort: 3 hours
   - Dependencies: SignalRProvider
6. **ConnectionResilienceManager** (UI)
   - Command: Auto-reconnect, message queue, replay logic
   - Estimated Effort: 2 hours
   - Dependencies: SignalRProvider

**Success Criteria**:

- SignalR connection stable with auto-reconnect
- Chat messages appear within 100ms
- Participant list updates in real-time
- Events broadcast to all participants
- Connection resilience handles drops gracefully

**Dependencies**:

- **Prerequisites**: Phase 7 (scenes - sessions reference scenes)
- **Optional**: Phase 8 (adventures - sessions MAY reference adventures)
- **Backend Dependency**: SignalR hubs (ChatHub, GameSessionHub) implemented
- **Blocks**: None

**Note**: Phase 10 can proceed after Phase 7, even if Phase 9 is blocked. Sessions reference scenes directly.

**Validation**:

- Validate after phase: Multi-user testing, SignalR stress test, connection drop simulation
- Quality gate: <100ms message latency, auto-reconnect working, no message loss

**Estimated Effort**: 22 hours

---

### Phase 11: Account Management 🔜 PARALLEL TRACK

**Objective**: Implement profile settings, security settings, 2FA setup, password change pages

**Deliverables**:

- Page: ProfileSettingsPage
  - Description: User profile editing (name, email, preferences)
  - Complexity: Medium
  - Dependencies: Auth context from Phase 2
- Page: SecuritySettingsPage
  - Description: Security overview with 2FA status, recent activity
  - Complexity: Medium
  - Dependencies: Auth context
- Component: TwoFactorSetupDialog
  - Description: QR code display, verification, recovery codes generation (COMPLETES Phase 2's 2FA integration)
  - Complexity: High
  - Dependencies: Backend 2FA TOTP service, TwoFactorVerificationForm from Phase 2
- Component: TwoFactorVerificationForm
  - Description: Verify 2FA code during login (component exists in Phase 2, flow testable after this phase)
  - Complexity: Medium
  - Dependencies: Backend 2FA verification API
- Component: RecoveryCodeForm
  - Description: Login with recovery code as 2FA alternative (component exists in Phase 2, flow testable after this phase)
  - Complexity: Low
  - Dependencies: Backend recovery code verification API
- Component: PasswordChangeDialog
  - Description: Current/new password form with validation and password visibility toggle
  - Complexity: Low
  - Dependencies: Auth API
- Component: RecoveryCodesDisplay
  - Description: Secure display and download of recovery codes
  - Complexity: Low
  - Dependencies: Backend recovery codes API

**Implementation Sequence**:

1. **Account API Extensions** (UI)
   - Command: Add profile, security, 2FA endpoints to auth API slice
   - Estimated Effort: 2 hours
   - Dependencies: Phase 2 (auth foundation)
2. **ProfileSettingsPage** (UI)
   - Command: Material-UI form for profile editing
   - Estimated Effort: 4 hours
   - Dependencies: Account API
3. **SecuritySettingsPage** (UI)
   - Command: Security overview page with 2FA section
   - Estimated Effort: 3 hours
   - Dependencies: Account API
4. **TwoFactorSetupDialog** (UI)
   - Command: QR code + verification + recovery codes flow
   - Estimated Effort: 5 hours
   - Dependencies: Backend TOTP service
5. **PasswordChangeDialog** (UI)
   - Command: Password change form with validation
   - Estimated Effort: 2 hours
   - Dependencies: Account API

**Success Criteria**:

- Profile updates persist correctly
- 2FA setup generates QR code and verifies
- Recovery codes display and download
- Password change enforces validation rules

**Dependencies**:

- **Prerequisites**: Phase 2 (auth working)
- **Blocks**: None (independent from other phases)

**Validation**:

- Validate after phase: Profile update, 2FA setup, password change flows
- Quality gate: All account operations functional, security validated

**Estimated Effort**: 16 hours

**NOTE**: Can run in PARALLEL with Phases 4-9 (scene editor/asset/content track) BUT COMPLETES Phase 2 auth features (2FA setup enables full 2FA testing). Not fully independent - it's auth feature completion.

---

### Phase 11: Performance Optimization & Production Prep 🔜 FINAL

**Objective**: Optimize performance, reduce bundle size, deprecate legacy Blazor, prepare for production

**Note**: BDD testing integrated into Phases 2-6 implementation (not batched at end)

**Deliverables**:

- Optimization: Scene Editor Performance
  - Description: Scene editor optimization for 100-token @ 60fps target (Quality Gate 6)
  - Complexity: High
  - Dependencies: Phase 6 complete
  - **Critical**: Konva caching, virtualization, progressive rendering
- Optimization: Bundle Size Reduction
  - Description: Analyze and reduce bundle size, code splitting, lazy loading
  - Complexity: Medium
  - Dependencies: All UI features complete
  - **Target**: Bundle < 500KB gzipped
- Documentation: Migration Guide
  - Description: React architecture guide, component catalog, deployment guide
  - Complexity: Medium
  - Dependencies: All patterns established
- Deprecation: Legacy Blazor Cleanup
  - Description: Mark Blazor projects as legacy, update README, remove unused references
  - Complexity: Low
  - Dependencies: React 100% complete
- Deployment: Production Readiness
  - Description: Build configuration, environment variables, deployment scripts
  - Complexity: Medium
  - Dependencies: All validation complete

**Implementation Sequence**:

1. **Scene Editor Performance** (UI) - **CRITICAL**
   - Command: Profiling, Konva caching, virtualization for 100-token @ 60fps target
   - Estimated Effort: 6 hours
   - Dependencies: Phase 6 complete
2. **Bundle Size Reduction** (UI)
   - Command: Bundle analysis with Vite, code splitting, lazy loading optimization
   - Estimated Effort: 3 hours
   - Dependencies: All features complete
3. **Migration Documentation** (Docs)
   - Command: Architecture guide, deployment guide, component catalog
   - Estimated Effort: 2 hours
   - Dependencies: Implementation complete
4. **Legacy Blazor Deprecation** (Cleanup)
   - Command: Update README, mark projects as legacy, remove unused references
   - Estimated Effort: 1 hour
   - Dependencies: React 100% complete
5. **Production Deployment Prep** (DevOps)
   - Command: Build configuration, environment setup, deployment verification
   - Estimated Effort: 2 hours
   - Dependencies: All validation complete

**Success Criteria**:

- Scene editor achieves 100 tokens @ 60fps ⚡ (Quality Gate 6)
- Bundle size < 500KB (gzipped)
- All BDD scenarios documented (implemented per-phase)
- Migration documentation complete
- Blazor projects marked legacy
- Production build verified and deployable

**Dependencies**:

- **Prerequisites**: Phases 4-10 (all implementation)
- **Blocks**: None (final phase)

**Validation**:

- Validate after phase: Performance benchmarking (100 tokens @ 60fps), bundle size < 500KB
- Quality gate: Performance targets met, bundle optimized, documentation complete

**Estimated Effort**: 14 hours (reduced from 32 hours - BDD moved to per-phase implementation)

---

## Dependency Graph

```
Phase 1 (Foundation) ✅
    ↓
    ├─→ Phase 2 (Auth & Landing) ✅
    │       ↓
    │       └─→ Phase 11 (Account Management) 🔜 [PARALLEL - 16h]
    │
    ├─→ Phase 3 (Scene: Pan/Zoom) ✅
    │       ↓
    │       └─→ Phase 4 (Scene: Grid/Layers) ✅
    │               ↓
    │               ├─→ Phase 5 (Asset Library) ✅ [70h]
    │               │       ↓
    │               │       └─→ Phase 6 (Scene: Tokens/Undo/Offline) ✅ [24h]
    │               │               ↓
    │               │               ├─→ Phase 7 (Scene Management) 🔜 READY [14h]
    │               │               │       ↓
    │               │               │       ├─→ Phase 8 (Adventure Management) 🔜 [12h]
    │               │               │       │       ↓
    │               │               │       │       └─→ Phase 9 (Epic/Campaign) ⚠️ BLOCKED [18h]
    │               │               │       └─→ Phase 10 (Game Sessions/SignalR) 🔜 [22h]
    │               │               │                   ↓
    │               │               │                   └─→ Phase 12 (Production Prep) 🔜 [14h]
    │               │               └─→ Phase 11 (Account Management) 🔜 [PARALLEL - 16h]
    │               │
    │               └─→ Phase 9 (Epic/Campaign) ⚠️ BLOCKED [18h]
    │
    └─→ Phase 12 (Performance/Production Prep) 🔜 FINAL [14h]
            ↑
            └─ (Depends on Phases 1-8, 10-11 complete)
```

**Critical Path** (Sequential - 89 hours):

- Phase 7: Scene Management (scenes for sessions) - 14 hours
- Phase 8: Adventure Management (organize scenes) - 12 hours
- Phase 10: Game Sessions/SignalR (final feature) - 22 hours
- Phase 12: Performance/Production - 14 hours

**Parallel Track** (Independent - 16 hours):

- Phase 11: Account Management (can start after Phase 2)

**Deferred Work** (Optional Feature):

- Phase 9: Epic/Campaign - 18 hours ⚠️ BLOCKED by backend (~3 weeks backend work needed)

---

## Cross-Reference Traceability

**Task → Features → Components**:

Affected Features (6):

1. UserAuthentication → WebClientApp (auth pages) ✅
2. LandingPage → WebClientApp (landing page) ✅
3. SceneManagement → WebClientApp (Konva scene editor) ✅
4. AssetManagement → WebClientApp (asset library UI) ✅
5. SessionManagement → WebClientApp (SignalR game sessions) 🚧
6. AccountManagement → WebClientApp (account settings) 🔜

Affected Components (3):

1. WebClientApp (React SPA) → Primary implementation target (100% new code)
2. VttTools.WebApp.WebAssembly (Blazor WASM) → Deprecate (mark legacy)
3. VttTools.WebApp.Common (Blazor components) → Deprecate (mark legacy)

Implementation Order:

- ✅ Phases 4-6: SceneManagement feature complete (2025-10-19)
- ✅ Phase 5: AssetManagement feature complete (2025-10-11)
- 🔜 Phase 7: SceneManagement feature (ready to start)
- 🔜 Phase 8: AdventureManagement feature (ready after Phase 7)
- ⚠️ Phase 9: Epic/Campaign hierarchy (BLOCKED by backend - optional)
- 🔜 Phase 10: SessionManagement feature (ready after Phase 7)
- 🔜 Phase 11: AccountManagement feature (ready to start)
- 🔜 Phase 12: Legacy cleanup + performance optimization

---

## Risk Assessment

### Risk: Phase 9 Backend Blocker

- **Phase**: 9
- **Probability**: High (Epic/Campaign services confirmed missing)
- **Impact**: Low (optional feature - doesn't block other work)
- **Mitigation**: Defer as optional enhancement, proceed with Phases 7-8-10-11
- **Contingency**: Skip Phase 9 entirely - users can organize via Adventures without Epic/Campaign

### Risk: 100-Token Performance Target

- **Phase**: 6
- **Probability**: Medium
- **Impact**: High (core requirement for scene editor)
- **Mitigation**: Konva caching, canvas virtualization, progressive rendering, early performance testing
- **Contingency**: Reduce target to 50 tokens if optimization insufficient, implement pagination for large scenes

### Risk: SignalR Real-Time Edge Cases

- **Phase**: 9
- **Probability**: Medium
- **Impact**: High (affects game session reliability)
- **Mitigation**: Connection resilience manager, message queuing, comprehensive reconnection testing
- **Contingency**: Implement polling fallback for unreliable connections

### Risk: Undo/Redo Complexity

- **Phase**: 6
- **Probability**: Low
- **Impact**: Medium (scene editor UX degradation)
- **Mitigation**: Command pattern with well-defined interfaces, extensive testing with 100-level history
- **Contingency**: Reduce default history to 50 levels if memory issues arise

### Risk: Offline Mode Sync Conflicts

- **Phase**: 6
- **Probability**: Medium
- **Impact**: Medium (data consistency issues)
- **Mitigation**: Last-write-wins strategy, conflict detection UI, localStorage versioning
- **Contingency**: Disable offline editing for multi-user scenes, show read-only mode when offline

---

## Quality Gates

### Gate 1: Foundation Complete ✅ PASSED

- **Trigger**: After Phase 1
- **Criteria**:
  - Project builds without TypeScript errors (threshold: 0 errors) ✅
  - Redux DevTools functional (threshold: working) ✅
  - Routing renders protected routes (threshold: 100%) ✅
- **Validation Command**: npm run build && npm run test
- **Action if Failed**: Fix build/test errors before proceeding
- **Status**: ✅ Passed

### Gate 2: Authentication Complete ✅ PASSED

- **Trigger**: After Phase 2
- **Criteria**:
  - Login, registration, logout flows functional ✅
  - Password reset flows functional (request + confirm) ✅
  - 2FA verification components exist (full 2FA test deferred to Phase 10) ⚠️
  - BDD scenarios passing (threshold: 100% UI scenarios) 🚧 (step definitions pending)
  - E2E tests passing (threshold: auth critical path) ✅
- **Validation Command**: npm run test:e2e -- --grep "@auth"
- **Action if Failed**: Fix auth flows before feature development
- **Status**: ✅ Passed (2FA setup testing deferred to Gate 9, step definitions deferred to Phase 11)

### Gate 3: Scene Editor Foundation ✅ PASSED

- **Trigger**: After Phase 3
- **Criteria**:
  - Pan/zoom smooth at 60 FPS (threshold: 60 FPS) ✅
  - Canvas responsive (threshold: renders on all viewports) ✅
  - No performance degradation (threshold: <16.67ms frame time) ✅
- **Validation Command**: Performance profiling in Chrome DevTools
- **Action if Failed**: Optimize Konva rendering before grid implementation
- **Status**: ✅ Passed

### Gate 4: Scene Editor Grid Complete 🔜 PENDING

- **Trigger**: After Phase 4
- **Criteria**:
  - All 5 grid types render correctly (threshold: visual validation for each type)
  - Grid config updates in real-time (threshold: <100ms update)
  - Performance maintained (threshold: 60 FPS with grid active)
- **Validation Command**: Visual grid type testing + performance profiling
- **Action if Failed**: Optimize grid rendering before token implementation

### Gate 5: Asset Library Functional ✅ PASSED

- **Trigger**: After Phase 5
- **Criteria**:
  - Load 100 assets in <500ms (threshold: 500ms) ✅
  - All filters work correctly (threshold: 100% filter accuracy) ✅
  - CRUD operations successful (threshold: all operations work) ✅
  - Multi-resource system functional (Token/Display roles) ✅
  - PNG conversion operational (SVG, JPEG, WebP → PNG) ✅
  - NamedSize system with fractional support ✅
  - Blob storage optimized with metadata ✅
- **Validation Command**: Asset loading performance test, filter validation
- **Action if Failed**: Optimize pagination, lazy loading before scene editor integration
- **Status**: ✅ Passed (2025-10-11)

### Gate 6: Scene Editor Complete ✅ PASSED

- **Trigger**: After Phase 6
- **Criteria**:
  - ✅ Token placement, drag-and-drop, snap-to-grid functional
  - ✅ Undo/redo reliable (100-level history with command pattern)
  - ✅ Offline mode functional (localStorage persistence + auto-sync)
  - ✅ Connection monitoring (heartbeat polling, not navigator.onLine)
  - ⚠️ Performance target deferred per user request (focus: correctness/maintainability)
- **Validation Command**: 255+ tests passing (100%), 85% coverage, code-reviewer validation
- **Status**: ✅ Passed (2025-10-19)
- **Notes**: Performance optimization (100 tokens @ 60 FPS) deferred to Phase 11 per user directive

### Gate 7: Content Management Functional ⚠️ BLOCKED

- **Trigger**: After Phase 8
- **Criteria**:
  - Epic/Campaign/Adventure/Scene CRUD working (threshold: all operations)
  - Hierarchy relationships maintained (threshold: 100% integrity)
  - Integration with Scene Editor (threshold: launch editor from scene list)
- **Validation Command**: Hierarchy CRUD testing, integration testing
- **Action if Failed**: Fix hierarchy logic before game sessions
- **Status**: ⚠️ BLOCKED by backend

### Gate 8: Game Sessions Functional 🔜 PENDING

- **Trigger**: After Phase 9
- **Criteria**:
  - SignalR connection stable (threshold: auto-reconnect working)
  - Message latency <100ms (threshold: 100ms)
  - No message loss (threshold: 100% delivery with queuing)
- **Validation Command**: Multi-user testing, connection drop simulation
- **Action if Failed**: Fix SignalR resilience before final release

### Gate 9: Account Management Complete 🔜 PENDING

- **Trigger**: After Phase 10
- **Criteria**:
  - All account operations functional (threshold: profile, security, password)
  - **2FA setup generates QR code and verifies** (threshold: TOTP working) ✅
  - **Complete 2FA flow works** (setup in Phase 10 → verification in login) ✅
  - Security settings validated (threshold: all security features work)
  - Recovery codes generation works
- **Validation Command**: npm run test:e2e -- --grep "@account|@2fa"
- **Action if Failed**: Fix account features before final release

**Note**: This gate completes Phase 2's 2FA integration by validating the full setup + login flow

### Gate 10: Migration Complete 🔜 FINAL

- **Trigger**: After Phase 11
- **Criteria**:
  - All BDD step definitions implemented (threshold: 100% coverage)
  - E2E tests passing (threshold: 100% critical paths)
  - Performance targets met (threshold: scene editor, asset library)
  - Documentation complete (threshold: architecture guide done)
- **Validation Command**: npm run test:all && npm run test:e2e
- **Action if Failed**: Address failures before deprecating Blazor

---

## Progress Tracking

**Current Phase**: Phase 6 complete (65.0%), Phases 7-8-10-11 READY, Phase 9 BLOCKED
**Overall Progress**: 158 hours / 243 hours (65.0%)

**Phase 1**: ✅ Complete (8/8 hours, 100%) - Completed 2025-09-28
**Phase 2**: ✅ Complete (16/16 hours, 100%) - Completed 2025-10-01
**Phase 3**: ✅ Complete (28/28 hours, 100%) - Completed 2025-10-04
**Phase 4**: ✅ Complete (12/12 hours, 100%) - Completed 2025-10-05
**Phase 5**: ✅ Complete (70/16 hours, 437%) - Completed 2025-10-11
**Phase 6**: ✅ Complete (24/25 hours, 96%) - Completed 2025-10-19
**Phase 7**: 🔜 **NEXT** (0/14 hours, 0%) - Scene Management - READY
**Phase 8**: 🔜 (0/12 hours, 0%) - Adventure Management - READY after Phase 7
**Phase 9**: ⚠️ BLOCKED (0/18 hours, 0%) - Epic/Campaign (optional - backend missing)
**Phase 10**: 🔜 (0/22 hours, 0%) - Game Sessions - READY after Phase 7
**Phase 11**: 🔜 PARALLEL (0/16 hours, 0%) - Account Management - READY
**Phase 12**: 🔜 Final (0/14 hours, 0%) - Performance/Production

**Remaining Effort**: 96 hours total (18 hours blocked, 78 hours available)

**Calculation Breakdown**:

- Total Effort: 243 hours
- Completed (Phases 1-6): 158 hours
- Remaining (Phases 7-12): 96 hours (includes new Phase 12)
- Available Now: 78 hours (Phases 7-8-10-11-12)
- Blocked: 18 hours (Phase 9 Epic/Campaign - optional)
- Progress: 65.0% (158/243)
- Note: Phase 10 can proceed after Phase 7 (sessions reference scenes, not Epic/Campaign)

**Phase Expansion Notes**:
- Phase 3 expanded from 16h to 28h to include critical authentication improvements (8h) and authorization documentation (4h). These were essential for production-ready auth state management and future phase planning.
- Phase 5 expanded from 16h to 70h to include multi-resource system (Phase 5.5), resource redesign and SVG conversion (Phase 5.6), and blob storage architecture (Phase 5.7). These expansions added critical asset management features required for scene editor integration.
- Phase 6 completed with 24h actual vs 25h estimated (96% efficiency). Original implementation (2025-10-11) required complete reimplementation due to 47 critical issues. New implementation used agent delegation strategy with 8-step plan, achieving GO FOR PRODUCTION approval with 255+ tests (85% coverage).

---

## Change Log

- **2025-10-23** (v1.7.0): Phase reorganization - Moved Scene Management to Phase 7 (unblocked by using nullable adventureId), created Phase 8 for Adventure Management, moved Epic/Campaign to Phase 9 as optional feature (BLOCKED). Renumbered Game Sessions→Phase 10, Account→Phase 11, added Phase 12 for Production. Scene CRUD now unblocked. Available work: 78 hours (was 52). Critical path: 62 hours (was 89).
- **2025-10-19** (v1.6.0): Phase 6 completed - Complete reimplementation of scene editor (24h actual vs 25h estimated). Achieved GO FOR PRODUCTION approval with 255+ tests (85% coverage), 89.4% issue fix rate. Updated progress to 65.0% (158/243 hours). Marked Phase 9-10 as available (Phase 7-8 remain BLOCKED by backend). Quality Gate 6 passed.
- **2025-10-12** (v1.5.0): Phase 11 repurposed - Removed BDD step definitions (integrated into per-phase implementation). Reduced Phase 11 from 32h → 14h (performance optimization, bundle reduction, legacy cleanup, production prep). Updated total effort to 243 hours. BDD testing now continuous throughout Phases 2-6.
- **2025-10-11** (v1.4.0): Phase 5 completed - Major scope expansion (16h → 70h) including multi-resource system (Phase 5.5, 14h), resource redesign and SVG conversion (Phase 5.6, 16h), blob storage architecture (Phase 5.7, 4h). Updated total effort to 261 hours, marked Phase 6 as NEXT, updated progress to 67.4%. Quality Gate 5 passed.
- **2025-10-05** (v1.3.0): Phase 4 completed - Grid and layer system (12h), marked Phase 5 as NEXT, updated progress
- **2025-10-04** (v1.2.0): Phase 3 completed - Added authentication improvements (8h), authorization documentation (4h), updated total effort to 207 hours, marked Phase 4 as NEXT, updated progress to 25.1%
- **2025-10-03** (v1.1.0): Fixed 6 dependency errors - corrected 2FA dependency (Phase 2→10), clarified Phase 9 dependencies (optional Phase 7-8), added SignalR blocker check, added Phase 5 test data prerequisite, updated Phase 10 parallel track note, updated Quality Gates
- **2025-10-03** (v1.0.0): Roadmap generated for EPIC-001 with 11 phases, critical path identified, Phase 7-8 blocker documented

---

<!--
═══════════════════════════════════════════════════════════════
ROADMAP QUALITY CHECKLIST - Score: 95/100
═══════════════════════════════════════════════════════════════

## Scope & Objectives (15 points)
✅ 5pts: Clear roadmap objective (complete React migration)
✅ 5pts: Scope well-defined (Phases 4-11 detailed)
✅ 5pts: Deliverables list complete (all components listed)

## Phase Organization (25 points)
✅ 10pts: Logical phase breakdown (11 phases total, 8 remaining)
✅ 10pts: Items properly sequenced by dependencies
✅ 5pts: Each phase has clear objective

## Dependency Management (20 points)
✅ 10pts: All dependencies identified (Phase 7-8 blocker, parallel Phase 10)
✅ 5pts: Critical path documented (Phases 4-6-9)
✅ 5pts: Blocking relationships clear (dependency graph)

## Quality Gates (15 points)
✅ 10pts: Quality gate after each phase (9 gates defined)
✅ 5pts: Validation commands specified

## Implementation Details (15 points)
✅ 5pts: Implementation sequences with effort estimates
✅ 5pts: Success criteria per phase
✅ 5pts: Complexity estimates provided

## Risk Assessment (10 points)
✅ 5pts: 5 risks identified with mitigation
✅ 5pts: Contingency plans documented

## Score: 95/100 (Excellent)
-->