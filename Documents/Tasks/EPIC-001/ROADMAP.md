# EPIC-001: UI Migration - Implementation Roadmap

**Target Type**: Task (Epic)
**Target Item**: EPIC-001
**Item Specification**: Documents/Tasks/EPIC-001/TASK.md
**Created**: 2025-10-03
**Last Updated**: 2025-10-28
**Version**: 1.11.0

---

## Roadmap Overview

**Objective**: Complete migration from Blazor WebAssembly to React 19 + TypeScript SPA with enhanced scene editor, asset library, and real-time collaboration features

**Scope**: Remaining 15% of UI migration (Phases 8.5-12) covering final polish, Game Sessions with SignalR, and Account Management

**Total Phases**: 12 + 8.5 (Phases 1-8 ✅ Complete, Phase 8.5 🚧 Partial, Phases 9-12 🔜 Remaining)
**Estimated Complexity**: Very High (282 hours total, 43 hours remaining)
**Current Status**: Phase 8.5 partial (84.8%), Phase 9 ⚠️ BLOCKED by backend, Phases 10-11-12 🔜 READY

**Deliverables**:

- ✅ Complete Konva-based scene editor with grid, tokens, layers, undo/redo, offline mode
- ✅ Asset library UI with browsing, filtering, creation, Material-UI components
- ✅ Scene CRUD UI with backend persistence and properties panel
- ✅ Adventure management UI with smart duplication and inline editing
- ✅ Scene/Adventure duplication with smart naming pattern
- ✅ Bulk asset operations (clone/delete) with collection-level endpoints
- 🚧 Auto-naming assets during placement (completed per user)
- ⚠️ Structure placement type-specific logic (pending clarification)
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

**Completion Date**: 2025-10-23

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

**Status**: ✅ Complete (30+ hours actual, 120% effort due to major enhancements beyond spec)

**Actual Deliverables (Planned)**:
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

**Major Enhancements Added (Beyond Original Spec)**:
1. **Multi-Asset Selection System**
   - Click/Ctrl+click selection for multiple assets
   - Marquee selection with drag on empty space
   - Ctrl+marquee for additive selection
   - Blue borders on selected assets
   - Selection persistence across refresh

2. **Advanced Snap Modes**
   - Alt = free movement (no snapping)
   - Ctrl = force grid snap
   - Ctrl+Alt = half-step snapping (0.5 cell precision)
   - Size-aware snapping (≤0.5 cells → 0.5 snap, >0.5 → 1 cell snap)
   - Independent per-dimension snapping

3. **Collision Detection System**
   - Real-time overlap detection during drag
   - Red X markers at collision points
   - Multiple markers for multi-collision scenarios
   - 1px tolerance for edge-touching (adjacent OK)
   - Prevents invalid placement with validation

4. **Multi-Asset Group Dragging**
   - Drag multiple selected assets together
   - Maintains relative positions during group drag
   - Group snapping and collision validation
   - Batch undo/redo for group operations

5. **Enhanced Undo/Redo Architecture**
   - Batch commands for multi-asset operations
   - Snapshot-based commands (Memento pattern) for compound operations
   - Fixed consecutive move tracking with proper oldPosition capture
   - PlacedAssetSnapshot interface for future features
   - createUpdateAssetCommand and createTransformAssetCommand utilities

6. **Layout Architecture Separation**
   - Created EditorLayout (compact, no footer, 100vh)
   - Separated from AppLayout (standard pages)
   - NetworkStatus query-conditional (?checkNetwork parameter)
   - Scene Editor menu bar reorganized (undo/redo/zoom on right)

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

### Phase 7: Adventure Management ✅ COMPLETE

**Objective**: Implement Library (Content Library) with Adventure management as foundation for content hierarchy

**Approach**: Adventures as DDD aggregate roots with scenes as child entities

**Backend Status**: ✅ Adventure API fully implemented (`/api/library`)

**Completion Date**: 2025-10-25

**Architecture Documents**:
- `Documents/Architecture/CONTENT-LIBRARY.md` - Hierarchy model, patterns
- `phases/PHASE-7-DESIGN.md` - Original design (revised during implementation)

**Key Architectural Change**:
- **Discovered**: Backend implements DDD aggregate pattern (Adventures→Scenes)
- **Decision**: Swapped Phase 7 and 8 to respect backend architecture
- **Impact**: Adventures implemented first, Scenes deferred to Phase 8

**Deliverables**:

**Infrastructure** (Built for Phase 7, Reusable in Phase 8-9):
- Feature module: `src/features/content-library/`
- Library page (renamed from "Content Library")
- Shared components: EditableTitle, ContentCard
- Generic hooks: useDebounce, useInfiniteScroll, useAutoSave
- Type system: ContentListItem matching backend ContentListItem.cs
- contentApi: Unified content query with pagination

**Adventure Management** (Phase 7 Core):
- AdventureListView with search and 4 filters (Type, Style, Status, Ownership)
- AdventureCard showing style badges, scene count, published status
- AdventureDetailPage with inline editing and auto-save
- adventuresApi RTK Query slice (full CRUD)
- Background image upload
- Scene list display within adventure
- Add scene to adventure functionality
- Navigate to Scene Editor integration
- Delete/Duplicate adventure operations
- Infinite scroll pagination with cursor

**Type System**:
- AdventureStyle enum (0-6): Generic, OpenWorld, DungeonCrawl, HackNSlash, Survival, GoalDriven, RandomlyGenerated
- ContentType enum (0-2): Adventure, Campaign, Epic
- domain.ts as single source of truth
- GridConfig updated: nested cellSize/offset structure

**Implementation Sequence** (As Executed):

**Phase 7A: Foundation** (4h) ✅ COMPLETE
- Created `features/content-library/` folder structure
- Defined TypeScript interfaces matching backend ContentListItem.cs
- Library page (simplified, no tabs)
- Routing: `/content-library/adventures`
- Shared components: EditableTitle, ContentCard
- Updated GridConfig structure (nested cellSize/offset)

**Phase 7B: Adventure List** (4h) ✅ COMPLETE
- AdventureListView with unified contentApi integration
- AdventureCard with style/scene count/published badges
- 4 comprehensive filters (Type, Style, Status, Ownership)
- Debounced search (useDebounce hook - 500ms)
- Infinite scroll (useInfiniteScroll hook with IntersectionObserver)
- Create/Delete/Duplicate adventure operations

**Phase 7C: API Integration** (3h) ✅ COMPLETE
- contentApi RTK Query slice for /api/library
- adventuresApi for adventure CRUD operations
- Cursor-based pagination with cache merging
- Filter parameter mapping to backend
- Vite proxy configured for /api/library

**Phase 7D: Adventure Detail Page** (6h) ✅ COMPLETE
- AdventureDetailPage with full metadata editing
- Auto-save on blur (name, description) and change (toggles)
- Background image upload integration
- Scene list display within adventure context
- Add scene button (POST /api/adventures/{id}/scenes)
- Navigation to Scene Editor
- Save status indicators and unsaved changes warning

**Phase 7E: Type System Alignment** (2h) ✅ COMPLETE
- Consolidated Adventure types (domain.ts as source of truth)
- Fixed nullable property handling
- Removed duplicate type definitions
- Updated all components to use unified types

**Success Criteria**:

- ✅ Library page with unified content view (no tabs)
- ✅ Browse adventures with search (debounced 500ms)
- ✅ Filter by Type (6 options), Style (8 options), Status, Ownership
- ✅ Infinite scroll pagination with cursor
- ✅ Click adventure → Opens Adventure Detail page
- ✅ Edit adventure metadata (name, description, style, isOneShot, isPublished)
- ✅ Auto-save on changes (blur for text, immediate for toggles)
- ✅ Upload background images
- ✅ View scenes within adventure
- ✅ Add scene to adventure → Navigate to Scene Editor
- ✅ Delete/Duplicate adventures with confirmation
- ✅ All changes persist to backend
- ✅ Proper DDD pattern (Adventure = aggregate root, Scene = child entity)
- ✅ Infrastructure ready for Phase 8 (70% reusable)

**Dependencies**:

- **Prerequisites**: Phase 6 (Scene Editor complete) ✅
- **Blocks**: Phase 8 (Scene management within adventures)

**Validation**:

- ✅ Adventure CRUD operations functional
- ✅ contentApi pagination working
- ✅ Auto-save reliable with status indicators
- ✅ Backend persistence verified
- ⚠️ Test coverage: Backend ≥80%, Frontend ~10% (deferred to Phase 8)
- ✅ WCAG AA accessible
- ✅ Material-UI theme compliant
- ✅ No console errors
- ✅ DDD architecture compliance

**Actual Effort**: 19 hours (15h implementation + 4h architecture pivot)

**Breakdown**:
- Foundation: 4h ✅
- Adventure List: 4h ✅
- API Integration: 3h ✅
- Adventure Detail: 6h ✅
- Type Alignment: 2h ✅

**Status**: ✅ COMPLETE (2025-10-25)

---

### Phase 8: Scene Management ✅ COMPLETE (with known regressions)

**Objective**: Implement Scene CRUD UI within Adventure context and Scene Editor backend integration

**Backend Status**: ✅ Scene API fully implemented (`/api/scenes`, `/api/adventures/{id}/scenes`)

**Completion Date**: 2025-10-26

**Note**: Originally Phase 7, swapped with Adventure Management to respect DDD aggregate pattern

**Delivered Features**:

**Scene Operations** (Within Adventure Context):
- ✅ Scene duplicate/delete from Adventure Detail page
- ✅ ConfirmDialog component (reusable for destructive actions)
- ✅ Scene list auto-refreshes after operations

**Scene Editor Backend Integration**:
- ✅ Load scene from GET /api/scenes/{id}
- ✅ Save changes via PATCH /api/scenes/{id}
- ✅ All fields persist: Name, Description, IsPublished, Grid configuration
- ✅ Background image upload and persistence
- ✅ Asset hydration (SceneAsset[] ↔ PlacedAsset[])
- ✅ Cache strategy: keepUnusedDataFor: 0 for getScene (always fresh data)

**Scene Properties Panel** (Collapsible):
- ✅ Properties button (⚙️ Tune icon) in header
- ✅ Responsive 3-column layout (wide) → 2-column (medium) → 1-column (mobile)
- ✅ Background image with default tavern fallback + "Default" badge
- ✅ Adventure link to parent adventure
- ✅ Editable description (saves on blur)
- ✅ Published toggle (saves immediately)
- ✅ Grid configuration: Type dropdown, Cell Size (W/H), Offset (X/Y), Snap toggle
- ✅ All form fields have proper IDs and labels (WCAG AA accessible)

**Navigation & UX**:
- ✅ Editable scene name in header (saves on blur, consistent 1.25rem font)
- ✅ Back button → Adventure Detail (if scene has adventure) or Library
- ✅ Save status indicators (Saving/Saved/Error)
- ✅ Panning display with centered origin: (0, 0) when centered
- ✅ Reset View button (RestartAlt icon) - resets zoom and panning
- ✅ Zoom percentage display (non-clickable)

**Menu Simplification**:
- ✅ Header navigation: Library, Assets only (Scene Editor removed)
- ✅ Removed Scene menu (moved to Properties panel)
- ✅ Removed Stage menu (moved to Properties panel)
- ✅ Menu bar: Structures, Objects, Creatures, Undo/Redo, Zoom controls, Panning, Reset

**Critical Bug Fixes**:
- ✅ RTK Query cache conflicts (disabled offlineSync middleware)
- ✅ Grid rendering on load (string → numeric enum conversion)
- ✅ IsPublished persistence (added to backend contracts, mapper, and service)
- ✅ Scene name persistence (fixed stale closure with value-passing onBlur)
- ✅ Stale cache data (keepUnusedDataFor: 0 + refetch on mount)
- ✅ Infinite loading on refresh (removed problematic Backdrop)
- ✅ Double header (removed duplicate EditorLayout wrapper from App.tsx)
- ✅ Grid Type MUI warning (string enum values in Select MenuItem)
- ✅ Grid color visibility (darker default: rgba(0,0,0,0.4))
- ✅ Zoom reset function (resetZoom → resetView)
- ✅ Canvas dimension calculation (uses TOTAL_TOP_HEIGHT)
- ✅ Asset placement cursor (added invisible Rect to TokenPlacement Layer)
- ✅ aria-hidden blocking (polling check waits for MUI cleanup)
- ✅ Stage consuming mouse events (conditional onMouseMove when isPanning)

**Backend Changes**:
- ✅ Added IsPublished to UpdateSceneRequest contract
- ✅ Added IsPublished to UpdateSceneData service contract
- ✅ Added IsPublished to SceneService.UpdateSceneAsync logic
- ✅ Added IsPublished to Mapper.ToModel (SceneEntity → Scene)
- ✅ Fixed Scene.ToModel() Adventure mapping (avoided circular reference)
- ✅ Changed UpdateSceneHandler to return Ok(updatedScene) instead of NoContent()

**Regressions Fixed** (2025-10-26):

✅ **Asset Selection Fixed**
- **Root Cause**: `stageRef.current` never set due to empty dependency array `[]`
- **Fix**: Changed dependencies to `[canvasRef.current, isSceneReady]`
- **Impact**: TokenDragHandle now successfully attaches event handlers

✅ **Marquee Selection Fixed**
- **Root Cause**: Same as asset selection - stageRef timing issue
- **Fix**: Same stageRef dependency fix resolves marquee selection

✅ **Grid Aspect Ratio Fixed**
- **Fix**: Canvas height calculation using TOTAL_TOP_HEIGHT verified working
- **Status**: No longer an issue

✅ **Asset Drag Movement NaN Error Fixed**
- **Root Cause**: TokenDragHandle `snapToGridCenter` using old flat GridConfig structure
- **Symptom**: Konva warning "NaN is not valid value for x attribute" when dragging assets
- **Fix**: Updated to use nested GridConfig structure (`cellSize.width`, `offset.left`)
- **File**: `TokenDragHandle.tsx:55-58`
- **Impact**: Asset dragging now works correctly with proper grid snapping

✅ **Multi-Asset Drag Fixed**
- **Root Cause**: Stale closure issue - drag handlers using `placedAssets` prop instead of `placedAssetsRef`
- **Symptom**: When dragging multiple selected assets, only some moved (those placed before the dragged one)
- **Fix**: Changed all drag handlers to use `placedAssetsRef.current` for consistent asset lookup
- **Files Changed**: `TokenDragHandle.tsx:261, 292, 311, 314, 405, 418, 436`
- **Impact**: All selected assets now move together when any one is dragged

✅ **Stuck Modifier Key Fixed**
- **Root Cause**: Window blur while holding modifier key (Ctrl/Alt/Shift) leaves state stuck
- **Symptom**: Clicking assets adds to selection (as if Ctrl held) even without pressing Ctrl
- **Scenario**: User holds Ctrl → switches window → releases Ctrl outside → returns → keyup never fires
- **Fix**: Added window blur handler to reset all modifier key states
- **File**: `SceneEditorPage.tsx:337-341`
- **Impact**: Modifier keys reset when window loses focus, preventing stuck state

✅ **Asset Persistence Fixed**
- **Root Cause**: Frontend sceneApi.ts didn't match actual backend API structure
- **Initial Issue**: HTTP 405 Method Not Allowed when trying to persist assets
- **Symptom**: All placed assets lost on page refresh, no persistence to database
- **API Mismatch Discovery**: Frontend assumed RESTful endpoints but backend uses index-based operations
- **Actual Backend API**:
  - Add: `POST /api/scenes/{sceneId}/assets/{assetId}` (assetId = library asset)
  - Update: `PATCH /api/scenes/{sceneId}/assets/{number}` (number = 0-based index)
  - Remove: `DELETE /api/scenes/{sceneId}/assets/{number}` (number = 0-based index)
- **Files Changed**:
  - `sceneApi.ts:109-148` - Rewrote mutations to match actual backend
  - `SceneEditorPage.tsx:29-37` - Added correct mutation hooks
  - `SceneEditorPage.tsx:449-643` - Updated all handlers (place/move/delete) with persistence
- **Implementation Details**:
  - Place: Calls `addSceneAsset` with libraryAssetId, position, size, rotation + refetch
  - Move: Finds asset index, calls `updateSceneAsset` with position update
  - Delete: Finds asset index, calls `removeSceneAsset` + refetch
  - Undo: Properly reverses operations (refetches scene after add/remove)
- **Second Issue (HTTP 500 - Frame null)**: EF Core required `Frame` but frontend sent null
  - **Backend Fix**: Changed backend to initialize Frame with default "None" values instead of nullable
- **Third Issue (HTTP 500 - Concurrency)**: DbUpdateConcurrencyException in SceneStorage.UpdateAsync
  - **Root Cause**: `ToEntity()` creates detached entity, `Update()` without original values fails concurrency check
  - **Backend Fix**: User modified `SceneStorage.UpdateAsync` to load entity first (temporary fix)
  - **Architectural Note**: Intended design is update without requery (performance optimization)
  - **Proper Solution**: EF Core approach needed:
    - Option 1: Use `Attach()` + set `EntityEntry.State = Modified` + manually set original values
    - Option 2: Use `ExecuteUpdate()` for bulk updates without loading (EF Core 7+)
    - Option 3: Accept the requery overhead but optimize with proper includes/projections
  - **Current Status**: Working with requery approach, performance optimization deferred as tech debt
- **Fourth Issue - Scene Header Missing**: Scene header (name, back button, properties panel) not showing
  - **Root Cause #1**: `refetch()` updates RTK Query cache but doesn't update local `scene` state
  - **Root Cause #2**: Asset hydration failure prevented scene initialization, leaving `scene` as `null`
  - **Symptom**: Header shows generic "VTT Tools" logo instead of scene-specific header with name/buttons
  - **Fix #1**: Changed all `await refetch()` calls to capture returned data and update scene state:
    ```typescript
    const { data: updatedScene } = await refetch();
    if (updatedScene) {
        setScene(updatedScene);
    }
    ```
  - **Fix #2**: Added fallback initialization in catch block - scene initializes even if asset loading fails:
    ```typescript
    } catch (error) {
        console.error('Failed to hydrate scene assets:', error);
        // Still initialize the scene even if assets fail to load
        setScene(sceneData);
        setGridConfig({...});
        setPlacedAssets([]); // Empty assets if hydration fails
        setIsInitialized(true);
    }
    ```
  - **Files Changed**: `SceneEditorPage.tsx` - 6 locations (refetch updates + error handling)
- **Fifth Issue - Assets Not Loading (401 Unauthorized)**: Placed assets fail to hydrate on scene load
  - **Root Cause**: Asset hydration using plain `fetch()` without authentication credentials
  - **Symptom**: `Failed to fetch asset {id}` with 401 Unauthorized, assets don't appear on scene after refresh
  - **Fix**: Changed asset fetching to use RTK Query with authentication:
    ```typescript
    const result = await dispatch(
        assetsApi.endpoints.getAsset.initiate(assetId)
    ).unwrap();
    ```
  - **Files Changed**: `SceneEditorPage.tsx:40-41, 59, 122-130` (imports + dispatch + authenticated fetch)
- **Sixth Issue - Assets Not Rendering After Load**: Assets fetch successfully with authentication but don't render on canvas
  - **Root Cause #1**: Backend `SceneAsset` has no `id` property (uses `index` instead), causing `id: undefined` in PlacedAsset
  - **Root Cause #2**: Backend uses nested objects (`position: { x, y }`, `size: { width, height }`), hydration assumed flat properties
  - **Root Cause #3**: Layer computed from asset kind/properties, not stored in SceneAsset
  - **Symptom**: Assets load from DB but canvas shows empty, PlacedAsset has `id: undefined`
  - **Fix Applied**:
    ```typescript
    // Generate ID from index since backend doesn't provide it
    id: sceneAssetAny.id || `scene-asset-${sceneAssetAny.index || index}`

    // Handle nested position/size objects
    const position = 'position' in sa
        ? { x: sa.position.x, y: sa.position.y }
        : { x: sa.x, y: sa.y };

    // Compute layer from asset kind
    layer: getAssetLayer(asset)
    ```
  - **Files Changed**:
    - `sceneMappers.ts:1-2, 14-25, 57-67` (imports, getAssetLayer helper, fixed hydration)
  - **Impact**: Assets now render correctly on canvas after page refresh
- **Seventh Issue - Asset Movement Not Persisting**: Movement API calls succeed but position not saved in database
  - **Root Cause**: Backend `SceneEntity.UpdateFrom()` joined on `AssetId` instead of `Index` when updating existing assets
  - **Problem**: Multiple SceneAssets can share the same `AssetId` (same asset placed multiple times), causing wrong asset to be updated
  - **Symptom**: API returns success, but database shows old position after refetch
  - **Investigation**:
    - Frontend sends: `position: {x: 1625, y: 875}`
    - Backend receives successfully but returns old value: `position: {x: 1375, y: 775}`
    - Mapper.cs:172 used `AssetId` as join key instead of unique `Index`
  - **Fix Applied** (Mapper.cs:172-174):
    ```csharp
    // OLD (WRONG)
    var existingAssets = entity.SceneAssets.Join(model.Assets,
        esa => esa.AssetId, msa => msa.AssetId, ...);
    var newAssets = model.Assets.Where(sa =>
        entity.SceneAssets.All(ea => ea.AssetId != sa.AssetId))...;

    // NEW (CORRECT)
    var existingAssets = entity.SceneAssets.Join(model.Assets,
        esa => esa.Index, msa => msa.Index, ...);
    var newAssets = model.Assets.Where(sa =>
        entity.SceneAssets.All(ea => ea.Index != sa.Index))...;
    ```
  - **Files Changed**:
    - `Mapper.cs:172-174` (changed join key from AssetId to Index)
  - **Impact**: Asset movement now persists correctly to database
- **False Start - Coordinate Conversion**: Initially misunderstood backend `Position` model docs ("cell-based") and added pixel↔grid conversion, but backend actually uses pixel coordinates. Reverted all conversion code.
- **Index Tracking**: Uses `placedAssets.findIndex()` INSIDE setState callback to find current 0-based position for update/delete
- **Data Sync**: Calls `refetch()` after add/remove to sync RTK Query cache AND local state with backend
- **Impact**: Assets persist across page refreshes, scene header displays correctly, assets load with authentication, movement updates saved

**Conservative Hardening Applied** (2025-10-26):

✅ **Stage Reference Validation**
- Added null check: `if (stage && stage !== stageRef.current)`
- Added error logging when scene ready but Stage not set
- Added detailed comments explaining TokenDragHandle dependency

✅ **Documentation Improvements**
- Documented Rect's purpose in TokenPlacement Layer
- Added architectural context for hit area pattern
- Cross-referenced technical debt items

**Implementation Sequence** (As Executed):

**Phase 8B: Backend Integration** (4h) ✅ COMPLETE
- Created scenesApi RTK Query slice with PATCH endpoint
- Implemented asset hydration/dehydration mappers
- Integrated backend loading/saving in SceneEditorPage
- Replaced localStorage with backend persistence

**Phase 8C: Scene Menu → Properties Panel** (3h) ✅ COMPLETE
- Created ScenePropertiesPanel component with collapsible Collapse
- Moved Scene menu to header as collapsible panel
- Added adventure link, description, published toggle
- Implemented responsive 3-column layout

**Phase 8D: Header & Navigation** (2h) ✅ COMPLETE
- Created EditableSceneName and SaveStatusIndicator components
- Enhanced EditorLayout header with scene-specific elements
- Implemented back button navigation logic
- Added panning display and reset view button

**Phase 8A: Scene Operations** (3h) ✅ COMPLETE
- Created ConfirmDialog reusable component
- Implemented scene duplicate handler (no confirmation)
- Implemented scene delete handler (with confirmation)

**Bug Fixes & Enhancements**: (~8h additional effort)
- RTK Query caching strategy overhaul
- Backend contract and mapper fixes for IsPublished
- Asset placement cursor fix (invisible Rect)
- Grid rendering and persistence fixes
- Form accessibility (IDs and labels)
- aria-hidden blocking resolution
- Multiple console error fixes

**Success Criteria**:

- ✅ Scene operations (duplicate/delete) functional in Adventure Detail
- ✅ Scene Editor loads scene from backend
- ✅ Scene metadata editable in Properties panel
- ✅ Scene name editable in header
- ✅ Grid configuration saved to backend
- ⚠️ Asset placements persist (placement works, selection broken)
- ✅ Save on blur/change (no timer-based auto-save)
- ✅ Navigation: Adventure Detail ↔ Scene Editor
- ✅ All scene properties persist after refresh
- ⚠️ Phase 6 features partially working (see Known Regressions)

**Dependencies**:

- **Prerequisites**: Phase 7 (Adventure management) ✅
- **Blocks**: Phase 10 (game sessions need scene persistence)

**Validation**:

- ✅ Scene CRUD within adventure context functional
- ✅ Scene Editor backend persistence verified
- ✅ Save working without data loss (explicit save on blur/change)
- ⚠️ Test coverage ≥70% (deferred - frontend tests not added)
- ✅ Grid configuration persists correctly
- ✅ Build succeeds with no TypeScript errors
- ✅ WCAG AA accessible (all form fields have IDs and labels)

**Actual Effort**: ~23 hours (12h estimated + ~11h bug fixes and enhancements)

**Breakdown**:
- Phase 8B (Backend Integration): 4h ✅
- Phase 8C (Properties Panel): 3h ✅
- Phase 8D (Header & Navigation): 2h ✅
- Phase 8A (Scene Operations): 3h ✅
- Bug Fixes & Enhancements: ~8h
- Known Regressions: 3h remaining (asset selection, marquee)

**Status**: ✅ FEATURE COMPLETE (2025-10-26), all regressions fixed

**Technical Debt - Scene Editor Architecture** 📋

The following improvements were identified but deferred to maintain stability and avoid regression risk during Phase 8 completion. These are **nice-to-have architectural improvements**, not critical issues. Current implementation works correctly.

**Priority: MEDIUM** | **Risk if deferred: LOW** | **Estimated effort: 4.5-6.5 hours**

**TD-1: Stage Availability Callback Pattern** 🔧
- **Current Issue**: Stage reference timing relies on useEffect dependency array
- **Current Fix**: Conservative validation with `[canvasRef.current, isSceneReady]` dependencies
- **Improvement**: Add explicit `onStageReady` callback to SceneCanvas for explicit notification
- **Benefits**: Eliminates dependency guessing, makes Stage lifecycle explicit
- **Risk**: Medium - changes from ref to state-based approach
- **Effort**: 30 minutes
- **Priority**: Consider when adding comprehensive tests

**TD-2: Separate Placement Overlay Layer** 🔧
- **Current Issue**: TokenPlacement mixes rendering + placement concerns
- **Current Implementation**: Conditional handlers + Rect for hit detection (works correctly)
- **Improvement**: Extract placement logic to dedicated PlacementOverlay component
- **Benefits**: Clearer separation of concerns, more maintainable
- **Risk**: Medium - requires moving logic between components
- **Effort**: 1-2 hours
- **Priority**: Consider during next major Scene Editor refactor

**TD-3: Declarative Handler Attachment** 🔧
- **Current Issue**: TokenDragHandle imperatively attaches handlers via `node.on()`
- **Current Implementation**: Manual tracking with refs + requestAnimationFrame (works correctly)
- **Improvement**: Move to declarative React props on Image nodes
- **Benefits**: Leverages React lifecycle, no manual cleanup, more robust
- **Risk**: High - major change to interaction pattern
- **Effort**: 2-3 hours
- **Priority**: Defer until comprehensive BDD tests exist for Scene Editor

**TD-4: Centralized Stage Events** 🔧
- **Current Issue**: Event handlers distributed across components
- **Current Implementation**: Layer-level + Stage-level handlers (works correctly)
- **Improvement**: Event delegation pattern with single Stage handler
- **Benefits**: Simpler event flow
- **Risk**: Low - optional optimization
- **Effort**: 1 hour
- **Priority**: Low - optional enhancement

**Recommendation**: Address TD-1 when adding BDD tests for Scene Editor. Address TD-2 and TD-3 together during next major refactor when comprehensive test coverage exists. TD-4 is optional.

**Decision Rationale** (2025-10-26):
- Current code works correctly after stageRef fix
- Risk of breaking functionality (70%) outweighs benefits during active feature development
- Conservative validation approach provides adequate robustness
- Technical debt can be addressed later when test coverage is comprehensive

---

### Phase 8.5: Incomplete Items from Phases 6-8 🚧 PARTIAL COMPLETE

**Objective**: Address 5 incomplete/missing items discovered during Phases 6-8 implementation

**Completion Date**: 2025-10-28 (partial)

**Background**: During Phase 6-8 implementation, several features were identified as incomplete or missing. Phase 8.5 addresses these gaps to ensure feature parity and polish.

**Items**:

**Item 1: Structures (Barriers, Regions, Sources)** 🚧 IN PROGRESS
- **Status**: Implementation started - split into Phase 8.6 (Backend) and Phase 8.7 (Frontend)
- **Estimated**: 88-118 hours total (Phase 8.6: 32-42h, Phase 8.7: 56-76h)
- **Description**: Implement three structure categories for map elements (NOT assets):
  - **Barriers**: Physical obstacles (walls, doors, cliffs) - open paths with vertices
  - **Regions**: Environmental zones (illumination, elevation, fog, weather) - closed polygons
  - **Sources**: Point-based effects (light, sound) - single vertex with range and line-of-sight
- **Note**: Structures clarified as distinct from assets. See Phase 8.6 and 8.7 for detailed breakdown.

**Item 2: Scene Duplication** ✅ COMPLETE
- **Status**: Complete (3 hours)
- **Deliverables**:
  - Smart naming pattern with auto-increment (e.g., "Scene (1)", "Scene (2)")
  - Clone/Delete buttons in scene cards (replaced 3-dot menu)
  - Default tavern.png background for scenes
  - Backend NamingHelper.cs utility
  - REST-compliant route: `POST /api/adventures/{id}/scenes/{sceneId}/clone`

**Item 3: Adventure Duplication** ✅ COMPLETE
- **Status**: Complete (2 hours)
- **Deliverables**:
  - Same smart naming pattern as scenes
  - Clone/Delete buttons in adventure cards
  - Default adventure.png background
  - REST-compliant route: `POST /api/adventures/{id}/clone`
  - Fixed all clone endpoints to follow REST conventions

**Item 4: Auto-Naming Assets During Placement** ✅ COMPLETE
- **Status**: Complete
- **Deliverables**:
  - Objects: `{AssetName}` (no numbering)
  - Creatures: `{AssetName} #{number}` (auto-increment)
  - Structures: `{AssetName}` (no numbering, pending structure placement clarification)
  - Display name on hover/selection
  - Persistence to SceneAsset.Name field

**Item 5: Selection in Undo/Redo Queue** ✅ VERIFIED CORRECT
- **Status**: Complete (0 hours - already working correctly)
- **Analysis**: Selection changes (SelectAssetsCommand, DeselectAllCommand) correctly do NOT create undo commands. Only transformations create undo entries.

**Bulk Asset Operations** ✅ COMPLETE (Bonus Work)
- **Status**: Complete (4 hours)
- **Deliverables**:
  - `POST /api/scenes/{id}/assets/clone` - Bulk clone assets
  - `DELETE /api/scenes/{id}/assets` - Bulk delete assets
  - Uses `AssetIndices` (List<uint>) for index-based operations
- **Completed**:
  - ✅ BulkCloneSceneAssetsRequest.cs created
  - ✅ BulkDeleteSceneAssetsRequest.cs created
  - ✅ Endpoints added to SceneEndpointsMapper.cs
  - ✅ Handlers and service methods implemented

**Success Criteria**:

- ✅ Scene duplication with smart naming
- ✅ Adventure duplication with smart naming
- ✅ Auto-naming assets during placement
- ✅ Selection correctly excluded from undo/redo
- ⚠️ Structure placement (pending clarification)
- ✅ Bulk asset operations complete

**Dependencies**:

- **Prerequisites**: Phase 8 (Scene Management) ✅
- **Blocks**: None (enhancements, not blocking features)

**Validation**:

- ✅ Scene/Adventure duplication tested
- ✅ Smart naming verified with multiple clones
- ✅ Auto-naming tested with objects and creatures
- ✅ Selection undo/redo behavior verified
- ⚠️ Structure placement deferred pending clarification

**Actual Effort**: 9 hours completed (Items 2, 3, 5, Bulk Ops), 4-6 hours pending (Item 1), 0 hours (Item 4 - per user confirmation)

**Breakdown**:
- Item 1 (Structure Placement): ⚠️ Pending clarification (4-6h estimated)
- Item 2 (Scene Duplication): ✅ Complete (3h actual)
- Item 3 (Adventure Duplication): ✅ Complete (2h actual)
- Item 4 (Auto-Naming Assets): ✅ Complete (0h - per user)
- Item 5 (Selection Undo/Redo): ✅ Complete (0h - verified correct)
- Bonus (Bulk Operations): ✅ Complete (4h actual)

**Status**: 🚧 PARTIAL COMPLETE (2025-10-28) - 5 of 6 items complete (including bonus), Item 1 → Phase 8.6 & 8.7

---

### Phase 8.6: Structures Backend API & Domain Model ✅ COMPLETE

**Objective**: Implement backend foundation for Structures (Barriers, Regions, Sources) - three distinct domain models with complete API layer

**Approach**: Incremental implementation with review checkpoints after each category

**Completion Date**: 2025-10-28

**Architecture**: Three Distinct Models

Structures are NOT assets. Three fundamentally different categories:

| Category | Geometry | Properties | Use Cases |
|----------|----------|------------|-----------|
| **Barrier** | Open path (connected vertices) | isOpaque, isSolid, isSecret, isOpenable, isLocked | Walls, doors, windows, cliffs, portals |
| **Region** | Closed polygon | RegionType (extensible string), LabelMap (Dict<int,string>), Value (int) | Illumination, elevation, fog of war, weather |
| **Source** | Single point | SourceType (extensible string), Range (decimal cells), Intensity (0.0-1.0), IsGradient (bool) | Light sources, sound sources |

**Key Design Decisions**:
- RegionType and SourceType are strings (NOT enums) for extensibility
- Range in fractional grid cells (e.g., 2.5 cells)
- Sources interact with barriers (line-of-sight blocking in frontend)
- Barriers can cross but not overlap
- Regions can overlap if different types

**Sub-Phases**:

#### Phase 8.6A: Domain Models + Migration (10-13h)

**Deliverables**:
- Domain models (6 records):
  - `Barrier.cs`, `SceneBarrier.cs`
  - `Region.cs`, `SceneRegion.cs`
  - `Source.cs`, `SceneSource.cs`
- EF Core entities (6 classes) matching domain models
- Schema builders (3 files):
  - `BarrierSchemaBuilder.cs`
  - `RegionSchemaBuilder.cs`
  - `SourceSchemaBuilder.cs`
- Database migration:
  - Create 6 tables (Barriers, SceneBarriers, Regions, SceneRegions, Sources, SceneSources)
  - Drop 2 old tables (Structures, SceneStructures)
  - JSON columns for Vertices (Point arrays) and LabelMap (Dictionary)

**Success Criteria**:
- Domain models follow DDD patterns
- EF entities correctly configured
- Migration applies without errors
- Old Structure tables removed

**Review Checkpoint**: Code review after 8.6A complete

---

#### Phase 8.6B: Barriers API (7-9h)

**Deliverables**:
- API contracts (6 files):
  - `CreateBarrierRequest.cs`, `UpdateBarrierRequest.cs`, `BarrierResponse.cs`
  - `PlaceSceneBarrierRequest.cs`, `UpdateSceneBarrierRequest.cs`, `SceneBarrierResponse.cs`
- `BarrierService.cs` (CRUD for templates)
- `SceneService.cs` extensions:
  - `PlaceBarrierAsync(sceneId, barrierId, vertices)`
  - `UpdateSceneBarrierAsync(sceneBarrierId, vertices, isOpen, isLocked)`
  - `RemoveSceneBarrierAsync(sceneBarrierId)`
- `BarrierStorage.cs` (complete CRUD with EF Core)
- `Mapper.cs` extensions (Barrier ↔ API contracts)
- `BarrierEndpointsMapper.cs` (6 endpoints):
  - `POST /api/library/barriers`
  - `GET /api/library/barriers` (pagination)
  - `GET /api/library/barriers/{id}`
  - `PUT /api/library/barriers/{id}`
  - `DELETE /api/library/barriers/{id}`
  - Scene endpoints: `POST/PATCH/DELETE /api/scenes/{sceneId}/barriers`
- Unit tests (BarrierServiceTests, BarrierStorageTests)

**Success Criteria**:
- 6 API endpoints functional
- CRUD operations work end-to-end
- Unit tests ≥80% coverage

**Review Checkpoint**: Code review after 8.6B complete

---

#### Phase 8.6C: Regions API (7-9h)

**Deliverables**:
- API contracts (6 files for Region + SceneRegion)
- `RegionService.cs`
- `SceneService.cs` extensions (PlaceRegionAsync, UpdateSceneRegionAsync, RemoveSceneRegionAsync)
- `RegionStorage.cs`
- Mapper extensions
- `RegionEndpointsMapper.cs` (6 endpoints)
- Unit tests (RegionServiceTests, RegionStorageTests)

**Success Criteria**:
- 6 API endpoints functional
- LabelMap JSON serialization working
- RegionType extensibility verified (string, not enum)
- Unit tests ≥80% coverage

**Review Checkpoint**: Code review after 8.6C complete

---

#### Phase 8.6D: Sources API (8-11h)

**Deliverables**:
- API contracts (6 files for Source + SceneSource)
- `SourceService.cs`
- `SceneService.cs` extensions (PlaceSourceAsync, UpdateSceneSourceAsync, RemoveSceneSourceAsync)
- `SourceStorage.cs`
- Mapper extensions
- `SourceEndpointsMapper.cs` (6 endpoints)
- Unit tests (SourceServiceTests, SourceStorageTests)

**Success Criteria**:
- 6 API endpoints functional
- Decimal Range (fractional grid cells) working
- Intensity validation (0.0-1.0)
- IsGradient flag functional
- Unit tests ≥80% coverage

**Review Checkpoint**: Code review after 8.6D complete

---

**Final Review Checkpoint 8.6** (End-to-End):
- Integration testing (all 18 endpoints)
- Overall architecture (DDD compliance)
- Security (OWASP Top 10)
- Test coverage (≥80% aggregate)
- Build success (dotnet build VttTools.slnx)

**Implementation Sequence**:

1. Domain models + migration (8.6A)
2. Code review checkpoint
3. Barriers API (8.6B)
4. Code review checkpoint
5. Regions API (8.6C)
6. Code review checkpoint
7. Sources API (8.6D)
8. Code review checkpoint
9. Final end-to-end review

**Success Criteria**:

- ✅ 3 domain models (Barrier, Region, Source)
- ✅ 3 scene placement models (SceneBarrier, SceneRegion, SceneSource)
- ✅ 6 database tables created, 2 dropped
- ✅ 18 API endpoints functional (6 per category)
- ✅ 3 service classes + SceneService extensions
- ✅ 3 storage classes (complete CRUD)
- ✅ Unit tests ≥80% coverage
- ✅ Grade B+ or higher (aggregate)

**Dependencies**:

- **Prerequisites**: Phase 8 (Scene Management) ✅
- **Blocks**: Phase 8.7 (Frontend requires backend API)

**Validation**:

- Validate after sub-phase: Code review with grade
- Quality gate: B+ minimum grade to proceed to next sub-phase
- Final validation: End-to-end integration tests

**Estimated Effort**: 32-42 hours

**Actual Effort**: ~37 hours (midpoint estimate)

**Final Grade**: A- (93/100)

**Sub-Phase Grades**:
- Phase 8.6A (Domain Models): A- (87/100)
- Phase 8.6B (Barriers API): A- (92/100)
- Phase 8.6C (Regions API): A (95/100)
- Phase 8.6D (Sources API): A+ (98/100)

**Status**: ✅ COMPLETE (2025-10-28)

**Deliverables Achieved**:
- ✅ 6 domain models (Barrier, Region, Source + Scene variants)
- ✅ 6 database tables created (migration 20251028194937)
- ✅ 18 API endpoints functional (6 per category)
- ✅ 3 service classes + SceneService extensions
- ✅ 3 storage classes with complete CRUD
- ✅ 45 unit tests passing (≥85% coverage)
- ✅ Pattern consistency: 50/50 (perfect alignment across categories)
- ✅ Security: OWASP Top 10 compliant
- ✅ Zero critical or major issues

---

### Phase 8.7: Structures Frontend Drawing Tools 🔜 READY

**Objective**: Implement frontend drawing tools, Konva rendering, and Scene Editor integration for Structures

**Approach**: Incremental implementation with review checkpoints after each tool

**Prerequisites**: Phase 8.6 complete (backend API functional)

**Sub-Phases**:

#### Phase 8.7A: TypeScript Types + RTK Query (9-11h)

**Deliverables**:
- `src/types/domain.ts` (add 6 interfaces):
  - `Barrier`, `SceneBarrier`
  - `Region`, `SceneRegion`
  - `Source`, `SceneSource`
- RTK Query API slices (3 files):
  - `src/services/barrierApi.ts` (6 endpoints)
  - `src/services/regionApi.ts` (6 endpoints)
  - `src/services/sourceApi.ts` (6 endpoints)
- Cache invalidation tags configured
- Optimistic updates configured
- Type tests

**Success Criteria**:
- TypeScript interfaces match backend models
- All 18 endpoints callable from frontend
- Cache invalidation working
- No TypeScript errors

**Review Checkpoint**: Code review after 8.7A complete

---

#### Phase 8.7B: Structure Library UI (6-8h)

**Deliverables**:
- `src/components/structures/StructureLibraryPanel.tsx` (3 tabs)
- `src/components/structures/BarrierList.tsx` (searchable)
- `src/components/structures/RegionList.tsx` (searchable)
- `src/components/structures/SourceList.tsx` (searchable)
- `src/components/structures/CreateBarrierDialog.tsx`
- `src/components/structures/CreateRegionDialog.tsx`
- `src/components/structures/CreateSourceDialog.tsx`
- Component tests (*.test.tsx)

**Success Criteria**:
- 3 tabs render correctly
- Search works (debounced 300ms)
- Click selects template for placement
- Create dialogs submit to backend
- WCAG AA accessible

**Review Checkpoint**: Code review after 8.7B complete

---

#### Phase 8.7C: Barrier Drawing Tool + Rendering (13-18h)

**Deliverables**:
- Drawing tool:
  - `src/components/scene/structures/BarrierDrawingTool.tsx` (click-to-place vertices)
- Rendering:
  - `src/components/scene/rendering/BarrierRenderer.tsx` (Konva Lines)
- Utilities:
  - `src/utils/structureSnapping.ts` (half-snap, quarter-snap, free)
  - `src/utils/barrierValidation.ts` (min 2 vertices, no self-overlap)
- Undo/redo commands:
  - `PlaceBarrierCommand`, `RemoveBarrierCommand`, `UpdateBarrierCommand`
- Tests (component, validation, snapping)

**Snapping Behavior**:
- Default: Half-snap (cell vertices, edge midpoints, cell centers)
- Alt: Free placement (no snap)
- Ctrl+Alt: Quarter-snap (0.25 cell precision)
- Snap threshold: 10px

**Visual Feedback**:
- Snap indicator (small circle)
- Preview line (dashed) from last vertex to cursor
- Vertex markers at placed vertices
- Validation errors (red X)

**Success Criteria**:
- Click-to-place vertices working
- Double-click or Esc finishes barrier
- Snapping working (3 modes)
- Barriers render as Konva Lines
- Colors: red=wall, blue=door, green=window, brown=cliff
- Secret barriers use dash pattern
- Undo/redo working
- Tests ≥70% coverage

**Review Checkpoint**: Code review after 8.7C complete

---

#### Phase 8.7D: Region Drawing Tool + Rendering (11-16h)

**Deliverables**:
- Drawing tool:
  - `src/components/scene/structures/RegionDrawingTool.tsx` (click-to-place polygon)
- Rendering:
  - `src/components/scene/rendering/RegionRenderer.tsx` (Konva Polygons)
- Utilities:
  - `src/utils/regionValidation.ts` (min 3 vertices, closed polygon, no self-intersection)
- Undo/redo commands:
  - `PlaceRegionCommand`, `RemoveRegionCommand`, `UpdateRegionCommand`
- Tests

**Interaction**:
- Same click-to-place as Barriers
- Auto-close polygon: Click first vertex to close
- Preview filled polygon during drawing
- Minimum 3 vertices required

**Rendering**:
- Fill colors by type:
  - Illumination: Yellow (alpha 0.3)
  - Elevation: Brown (alpha 0.3)
  - FogOfWar: Gray (alpha 0.5)
  - Weather: Cyan (alpha 0.3)
- Dashed outline (2px)
- Value label at centroid (e.g., "Dim Light", "+10ft")

**Success Criteria**:
- Click-to-place polygon working
- Auto-close on first vertex click
- Regions render with color-coded fills
- Value labels at centroid
- Overlap validation (different types OK)
- Undo/redo working
- Tests ≥70% coverage

**Review Checkpoint**: Code review after 8.7D complete

---

#### Phase 8.7E: Source Placement + Line-of-Sight Rendering (14-20h) ⚡ COMPLEX

**Deliverables**:
- Placement tool:
  - `src/components/scene/structures/SourcePlacementTool.tsx` (click-drag range)
- Rendering:
  - `src/components/scene/rendering/SourceRenderer.tsx` (Konva with LOS blocking)
- Utilities:
  - `src/utils/lineOfSight.ts` (ray-casting, barrier intersection)
  - `src/utils/rangeCalculator.ts` (fractional grid cells)
  - `src/utils/sourceValidation.ts` (range > 0, intensity 0.0-1.0)
- Undo/redo commands:
  - `PlaceSourceCommand`, `RemoveSourceCommand`, `UpdateSourceCommand`
- Tests (including LOS calculation accuracy)

**Interaction**:
- Click to place center point (with snap)
- Hold and drag to set range radius
- Release to confirm
- Range displayed in fractional grid cells (e.g., "2.5 cells")
- Range rounded to 0.5 precision

**Line-of-Sight Calculation** (COMPLEX):
1. Filter barriers by `isOpaque=true`
2. Cast 72 rays (5° increments) from source position to range boundary
3. For each ray, find closest intersection with opaque barrier segments
4. If intersection found, truncate ray at intersection point
5. Return polygon vertices from ray endpoints
6. Render as Konva Polygon with fill

**Rendering**:
- Basic circle (if no opaque barriers nearby)
- Visible region polygon (with LOS blocking)
- Gradient fill if `isGradient=true`
- Solid fill if `isGradient=false`
- Opacity = intensity
- Source icon at center (10px circle, yellow)

**Performance**:
- Cache visible region calculations
- Only recalculate on source/barrier change
- Use Konva layer caching
- LOD: Reduce ray count for distant sources

**Success Criteria**:
- Click-drag sets range working
- Range in fractional grid cells
- Line-of-sight blocking operational
- Ray-casting accurate (72 rays)
- Performance acceptable (<100ms for 1 source + 10 barriers)
- Cached calculations working
- Gradient rendering if isGradient
- Undo/redo working
- Tests ≥70% coverage

**Contingency**: If LOS performance poor, simplify to basic circles (defer blocking to future)

**Review Checkpoint**: Code review after 8.7E complete

---

#### Phase 8.7F: Scene Editor Integration + Testing (7-10h)

**Deliverables**:
- `src/pages/SceneEditorPage.tsx` (integrate 3 drawing tools)
- Menu bar updates:
  - "Structures" menu
  - Shortcuts: W=wall, D=door, R=region, L=light, Esc=cancel
- Konva layer management:
  - `regionLayer` (z=1, below grid)
  - `sourceLayer` (z=3, between grid and barriers)
  - `barrierLayer` (z=4, above grid, below assets)
- Tool state management (active tool, selected template)
- Integration tests (E2E placement workflows)
- BDD scenarios (Gherkin feature files)

**Success Criteria**:
- All 3 drawing tools accessible from menu
- Keyboard shortcuts working
- Correct layer z-ordering
- Tool switching works (deactivate previous)
- Structures persist to backend on placement
- Structures load from backend on scene load
- Integration tests passing
- BDD scenarios passing

**Review Checkpoint**: Code review after 8.7F complete

---

**Final Review Checkpoint 8.7** (End-to-End):
- End-to-end workflows (create → place → render → persist)
- Cross-browser testing (Chrome, Firefox, Safari)
- Performance (100+ structures on canvas)
- Accessibility (WCAG AA compliance)
- Test coverage (≥70% aggregate)
- Build success (npm run build)
- Linting (npm run lint)

**Implementation Sequence**:

1. Types + RTK Query (8.7A)
2. Code review checkpoint
3. Library UI (8.7B)
4. Code review checkpoint
5. Barrier tool (8.7C)
6. Code review checkpoint
7. Region tool (8.7D)
8. Code review checkpoint
9. Source tool + LOS (8.7E)
10. Code review checkpoint
11. Scene Editor integration (8.7F)
12. Code review checkpoint
13. Final end-to-end review

**Success Criteria**:

- ✅ 3 drawing tools functional (Barrier, Region, Source)
- ✅ Snapping working (half-snap, quarter-snap, free)
- ✅ 3 Konva renderers (Lines, Polygons, Circles with LOS)
- ✅ Line-of-sight blocking operational
- ✅ Validation prevents invalid placements
- ✅ Undo/redo integrated
- ✅ Structures persist and load
- ✅ Tests ≥70% coverage
- ✅ Grade B+ or higher (aggregate)

**Dependencies**:

- **Prerequisites**: Phase 8.6 (Backend API functional) ✅
- **Blocks**: None (completes Phase 8.5 Item 1)

**Validation**:

- Validate after sub-phase: Code review with grade
- Quality gate: B+ minimum grade to proceed
- Final validation: End-to-end integration + BDD tests

**Estimated Effort**: 56-76 hours

**Status**: 🔜 READY (Blocked by Phase 8.6)

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
  - Description: Integration with `/api/library`
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

```text
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

**Current Phase**: Phase 8.7 NEXT (Structures Frontend), Phase 9 blocked, Phase 10-11-12 ready
**Overall Progress**: 276 hours / 370 hours (74.6%)

**Phase 1**: ✅ Complete (8/8 hours, 100%) - Completed 2025-09-28
**Phase 2**: ✅ Complete (16/16 hours, 100%) - Completed 2025-10-01
**Phase 3**: ✅ Complete (28/28 hours, 100%) - Completed 2025-10-04
**Phase 4**: ✅ Complete (12/12 hours, 100%) - Completed 2025-10-05
**Phase 5**: ✅ Complete (70/16 hours, 437%) - Completed 2025-10-11
**Phase 6**: ✅ Complete (30/25 hours, 120%) - Completed 2025-10-23
**Phase 7**: ✅ Complete (19/21 hours, 90%) - Adventure Management - Completed 2025-10-25
**Phase 8**: ✅ Complete (23/12 hours, 192%) - Scene Management - Completed 2025-10-26
**Phase 8.5**: 🚧 PARTIAL (9/13 hours, 69%) - Incomplete Items - 5 of 6 complete, Item 1 → Phase 8.6 & 8.7
**Phase 8.6**: ✅ Complete (37/32-42 hours, 97%) - Structures Backend - Completed 2025-10-28
**Phase 8.7**: 🔜 NEXT (0/56-76 hours, 0%) - Structures Frontend (Drawing Tools, Rendering, LOS) - READY
**Phase 9**: ⚠️ BLOCKED (0/18 hours, 0%) - Epic/Campaign (optional - backend missing)
**Phase 10**: 🔜 (0/22 hours, 0%) - Game Sessions - READY
**Phase 11**: 🔜 PARALLEL (0/16 hours, 0%) - Account Management - READY
**Phase 12**: 🔜 Final (0/14 hours, 0%) - Performance/Production

**Remaining Effort**: 94-119 hours total (18 hours blocked, 76-101 hours available)

**Calculation Breakdown**:

- Total Effort: 370 hours (282 original + 88-118 hours Phase 8.6+8.7 estimated)
- Completed (Phases 1-8.6): 276 hours (8+16+28+12+70+30+19+23+9+37)
- Remaining (Phases 8.7-12): 94-119 hours
- Phase 8.6 (Backend): ✅ 37 hours COMPLETE
- Phase 8.7 (Frontend): 56-76 hours (NEXT)
- Available Now: 76-101 hours (Phase 8.7 + 10-11-12)
- Blocked: 18 hours (Phase 9 Epic/Campaign - optional)
- Progress: 74.6% (276/370 using actual + midpoint estimates)
- Note: Phase 10 can proceed after Phase 8.7 (sessions reference scenes from Phase 8)

**Phase Expansion Notes**:
- Phase 3 expanded from 16h to 28h to include critical authentication improvements (8h) and authorization documentation (4h). These were essential for production-ready auth state management and future phase planning.
- Phase 5 expanded from 16h to 70h to include multi-resource system (Phase 5.5), resource redesign and SVG conversion (Phase 5.6), and blob storage architecture (Phase 5.7). These expansions added critical asset management features required for scene editor integration.
- Phase 6 expanded from 25h to 30h+ due to major enhancements beyond original specification. Added multi-asset selection, advanced snap modes, collision detection, group dragging, enhanced undo/redo architecture, and layout separation. Achieved GO FOR PRODUCTION approval with 5/5 stars from code-reviewer.
- Phase 7 (19h actual vs 21h estimated): Architectural pivot during implementation - discovered backend DDD pattern requiring Adventure-first approach. Swapped Phase 7 (was Scenes) with Phase 8 (was Adventures). Delivered Library page, Adventure management with contentApi integration, Adventure Detail page with auto-save, infinite scroll, 4-filter system. Grade: B+ (88/100).
- Phase 8 expanded from 12h to 23h due to extensive bug fixes and backend integration challenges (asset persistence, concurrency, hydration). Delivered Scene Editor backend integration, Properties panel, navigation, scene operations, and fixed 7 critical regressions from Phase 6.
- Phase 8.5 (NEW - 9h completed of 13h estimated): Added mid-phase to address 5 incomplete items from Phases 6-8. Completed: Scene/Adventure duplication with smart naming (5h), Auto-naming assets (0h - user confirmed), Selection undo/redo verification (0h - already correct), Bulk asset operations (4h - collection-level clone/delete endpoints). Pending: Structure placement (4-6h - needs clarification on collision rules, snap behavior, constraints).
- Phase 8.6 (37h actual vs 32-42h estimated, 97%): Structures Backend delivered with exceptional quality. Implemented three distinct structure categories (Barriers, Regions, Sources) with complete API coverage. Delivered: 6 domain models, 6 database tables (migration 20251028194937), 18 API endpoints, 3 service classes, 3 storage classes, 45 unit tests (≥85% coverage). Average sub-phase grade: 93/100 (8.6A: A-/87, 8.6B: A-/92, 8.6C: A/95, 8.6D: A+/98). Final end-to-end review: A- (93/100). Pattern consistency: 50/50 (perfect alignment). Security: OWASP Top 10 compliant. Zero critical or major issues. Autonomous agent workflow executed successfully: backend-developer → code-reviewer checkpoints (4 reviews) → final comprehensive review. Key achievements: RegionType and SourceType as extensible strings (NOT enums), decimal Range (5,2) and Intensity (3,2) precision, single Point position for Sources (NOT vertices), JSON columns for Vertices and LabelMap. Updated progress to 74.6% (276/370h). Phase 8.7 marked as NEXT.

---

## Change Log

- **2025-10-28** (v1.11.0): Phase 8.6 COMPLETION - Structures Backend delivered with A- grade (93/100). Implemented three distinct structure categories (Barriers, Regions, Sources) with complete API layer in 37 hours (97% of estimate). Delivered: 6 domain models (Barrier, Region, Source + Scene variants), database migration creating 6 tables, 18 functional API endpoints, 3 service classes with SceneService extensions, 3 storage classes with complete CRUD, 45 unit tests passing with ≥85% coverage. Sub-phase grades: 8.6A (A-/87), 8.6B (A-/92), 8.6C (A/95), 8.6D (A+/98). Final end-to-end review: A- (93/100) with pattern consistency 50/50 (perfect alignment across categories). Zero critical or major issues. Security: OWASP Top 10 compliant. Key technical achievements: RegionType/SourceType as extensible strings (NOT enums), decimal precision for Range (5,2) and Intensity (3,2), single Point position for Sources, JSON columns for complex types. Autonomous workflow executed with 4 review checkpoints. Updated overall progress to 74.6% (276/370h). Phase 8.7 (Structures Frontend) marked as NEXT.
- **2025-10-28** (v1.10.0): ROADMAP EXPANSION - Added Phase 8.6 (Structures Backend, 32-42h) and Phase 8.7 (Structures Frontend, 56-76h) with detailed sub-phases and review checkpoints. Phase 8.5 Item 1 clarified: Structures are NOT assets, but three distinct categories (Barriers, Regions, Sources) with fundamentally different behaviors. Total effort increased from 282h to 370h (88-118h added). Overall progress recalculated to 64.6% (239/370h using midpoint). Phase 8.6 marked as IN PROGRESS, Phase 8.7 blocked by 8.6. Implementation approach: Incremental with 11 review checkpoints (4 for Phase 8.6, 6 for Phase 8.7, 1 final comprehensive). Key design decisions documented: extensible types (strings not enums), fractional grid cells for Source range, line-of-sight blocking for Sources with opaque Barriers. Autonomous agent workflow: backend-developer → code-reviewer → frontend-developer → code-reviewer → final report, with Claude orchestrating corrections without user approval.
- **2025-10-28** (v1.9.0): Phase 8.5 PARTIAL COMPLETION - Addressed 5 incomplete items from Phases 6-8 plus bonus bulk operations. Completed 5 of 6 items (9h actual): Item 2 (Scene Duplication with smart naming, 3h), Item 3 (Adventure Duplication with smart naming, 2h), Item 4 (Auto-naming assets, 0h - user confirmed complete), Item 5 (Selection undo/redo, 0h - verified correct), Bonus (Bulk asset operations, 4h - collection-level clone/delete endpoints with handlers and service methods). Pending: Item 1 (Structure placement, 4-6h - needs clarification on collision rules, snap behavior, size constraints). Created NamingHelper.cs for smart naming with auto-increment pattern. Fixed all clone endpoints to follow REST conventions. Bulk operations use AssetIndices (List<uint>) for index-based operations. Updated progress to 84.8% (239/282 hours). Phases 10-11-12 marked as READY.
- **2025-10-26** (v1.8.1): Phase 8 COMPLETION - Scene Management delivered with extensive backend integration (23h actual vs 12h estimated, 192%). Delivered: Scene Editor backend persistence, Properties panel (collapsible, responsive 3-column layout), scene operations (duplicate/delete), navigation (back button, editable name), save status indicators, grid configuration persistence. Fixed 7 critical regressions: asset selection, marquee selection, grid aspect ratio, asset drag movement (NaN error), multi-asset drag (stale closure), stuck modifier key (window blur), asset persistence (HTTP 405→500→concurrency→header missing→401→rendering). Backend changes: IsPublished field added, Scene.ToModel() circular reference fixed, SceneStorage.UpdateAsync concurrency workaround. Updated progress to 83.9% (230/274 hours, excluding Phase 8.5).
- **2025-10-25** (v1.8.0): Phase 7 COMPLETION - Adventure Management delivered with architectural pivot. Discovered backend DDD aggregate pattern (Adventures→Scenes), swapped Phase 7/8 to align. Delivered: Library page (unified content view), Adventure List with contentApi integration (infinite scroll, 4 filters, debounced search), Adventure Detail page (inline editing, auto-save, background upload, scene management). Type system consolidated (domain.ts source of truth). GridConfig structure updated (nested cellSize/offset). Actual effort: 19h (vs 21h estimated, 90%). Updated progress to 75.8% (207/273 hours). Phase 8 (Scene Management) marked as NEXT. Code review: B+ (88/100) → A- (92/100) after critical fixes.
- **2025-10-23** (v1.7.0): Phase 6 COMPLETION - Delivered major enhancements beyond spec: multi-asset selection, marquee selection, advanced snap modes (Alt/Ctrl/Ctrl+Alt), collision detection system, group dragging, enhanced undo/redo with Memento pattern, layout architecture separation (EditorLayout vs AppLayout). Expanded from 25h estimated to 30h+ actual due to enhancements. Updated progress to 68.9% (188/273 hours). Phase 7 marked as READY TO START. Code review: 5/5 stars, GO FOR PRODUCTION.
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