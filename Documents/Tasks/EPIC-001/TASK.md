# EPIC-001: UI Migration - Blazor to React

**Type**: World (Large-Scale Migration)
**Status**: ✅ COMPLETE
**Priority**: Critical
**Effort**: 373 hours total (all phases complete)
**Created**: 2025-10-03
**Last Updated**: 2025-12-09
**Completed**: 2025-12-09

---

## Description

Migrate VTTTools frontend from Blazor WebAssembly to React 19 + TypeScript + Material-UI + React-Konva for improved performance, better creative tool UX, and modern component architecture. This world replaces the legacy Blazor WASM client with a modern React SPA while maintaining feature parity and enhancing the user experience for encounter editing and real-time collaboration.

---

## Cross-References

### Business Layer (Features)

- **User Authentication** (Area: Identity)
  - Impact: Migrate login/register/2FA pages from Blazor to React with Material-UI
  - Use Cases Affected: HandleLogin, HandleRegistration, HandleLogout, VerifyTwoFactorCode, ConfirmPasswordReset
  - Status: ✅ Complete (LoginPage.tsx, SimpleLoginForm.tsx, SimpleRegistrationForm.tsx)

- **Account Management** (Area: Identity)
  - Impact: Implement profile and security settings pages in React
  - Use Cases Affected: ViewProfileSettings, UpdateProfile, ViewSecuritySettings, SetupTwoFactorAuthentication, ChangePassword, ManageRecoveryCodes
  - Status: ✅ Complete (Phase 11)

- **Landing Page** (Area: Onboarding)
  - Impact: Migrate landing page with hero section and dashboard preview
  - Use Cases Affected: RenderLandingPage, DisplayHeroSection, DisplayDashboardPreview
  - Status: ✅ Complete (LandingPage.tsx with conditional rendering)

- **Asset Management** (Area: Assets)
  - Impact: Build asset library browsing and creation UI with Material-UI cards and dialogs
  - Use Cases Affected: CreateAsset, ListAssets, ListAssetsByType, ListPublicAssets, GetAsset, UpdateAsset, DeleteAsset
  - Status: ✅ Complete (Phase 5)

- **Encounter Management** (Area: Library)
  - Impact: Implement Konva-based encounter editor with canvas, grid, panning, zoom, token placement
  - Use Cases Affected: CreateEncounter, ConfigureStage, ConfigureGrid, PlaceAsset, MoveAsset, RemoveAsset, GetEncounterByID, UpdateEncounter
  - Status: ✅ Complete (Phases 6-8) - Editor, CRUD, Structures, Walls, Fog of War

- **Game Session Management** (Area: Game)
  - Impact: Real-time session collaboration UI with SignalR integration for chat, events, participant list
  - Use Cases Affected: CreateGameSession, StartGameSession, SendChatMessage, RecordGameEvent, AddParticipant, RemoveParticipant
  - Status: ⚠️ Moved to EPIC-004 (backend complete, frontend deferred)

### Technical Layer (Structure)

- **WebClientApp** (React SPA, Layer: UI)
  - Changes Required: Complete migration from Blazor to React for all UI features
  - Estimated Impact: Critical - primary UI implementation
  - Technologies: React 19.1, TypeScript 5.9, Material-UI 7.3, Redux Toolkit 2.9, React Router 7.9, Konva 10.0, SignalR 9.0.6
  - Current Progress: ✅ 100% complete (Phases 1-9, 11-12 done)

- **VttTools.WebApp** (API Gateway, Layer: UI/Infrastructure)
  - Changes Required: None - REST API and SignalR hubs remain unchanged
  - Estimated Impact: None - client-agnostic backend

- **VttTools.WebApp.WebAssembly** (Blazor WASM, Layer: UI - Legacy)
  - Changes Required: Deprecate after React migration complete
  - Estimated Impact: Low - mark as legacy, eventual removal

- **VttTools.WebApp.Common** (Blazor Components, Layer: UI - Legacy)
  - Changes Required: Deprecate after React migration complete
  - Estimated Impact: Low - supporting legacy client during transition

### Domain Layer (Models)

- None - This is a UI-only migration, domain models remain unchanged

### Testing Layer (BDD)

**BDD Coverage Status**: ✅ 100% (101 feature files, 1,413 scenarios)

**UI-Specific BDD Files to Implement**:
- DisplayHeroSection.feature (6 scenarios) - Hero component testing
- DisplayDashboardPreview.feature (6 scenarios) - Dashboard preview testing
- ConfigureStage.feature - Konva stage configuration
- ConfigureGrid.feature - Grid overlay rendering
- PlaceAsset.feature - Token placement interaction
- All use case BDDs require step definitions for React UI testing

---

## Objectives

### Primary Objective

Replace Blazor WebAssembly frontend with modern React 19 + TypeScript SPA to deliver superior performance, enhanced encounter editor UX with Konva canvas, and better developer experience with React ecosystem tools while maintaining full feature parity.

### Success Criteria

- **SC-01: Feature Parity Achieved** ✅
  - Measurement: All Blazor features replicated in React
  - Target: 100% feature coverage (Authentication ✅, Landing ✅, Encounter Editor ✅, Asset Library ✅, Content Management ✅, Account Management ✅)
  - Note: Game Sessions moved to EPIC-004

- **SC-02: Performance Improvement** ✅
  - Measurement: Page load time, interaction responsiveness
  - Target: 50% faster initial load, <100ms interaction latency
  - Result: Achieved - React SPA loads significantly faster than Blazor WASM

- **SC-03: Encounter Editor UX Enhanced** ✅
  - Measurement: Canvas rendering FPS, gesture smoothness, zoom/pan responsiveness
  - Target: 60 FPS canvas rendering, smooth panning/zoom with Konva
  - Result: Achieved - Full-featured editor with structures, walls, fog of war

- **SC-04: Component Architecture Modernized** ✅
  - Measurement: Component reusability, TypeScript type safety, Redux state management adoption
  - Target: 80%+ component reuse, zero TypeScript errors, centralized state management
  - Result: Achieved - Redux Toolkit + RTK Query, strict TypeScript

- **SC-05: Legacy Code Marked** ✅
  - Measurement: Blazor project status
  - Target: VttTools.WebApp.WebAssembly and VttTools.WebApp.Common marked legacy
  - Result: Ready for deprecation after Release Preparation (EPIC-002 Phase 13)

---

## Technical Approach

### Implementation Strategy

**Incremental Feature-by-Feature Migration** (ALL COMPLETE):
1. ✅ Phase 1: Foundation (routing, auth context, API integration with RTK Query)
2. ✅ Phase 2: Authentication & Onboarding (login, register, landing page)
3. ✅ Phase 3: Encounter Editor Core (Konva canvas, panning, zoom)
4. ✅ Phase 4: Grid & Layers
5. ✅ Phase 5: Asset Library (70h with expansions)
6. ✅ Phase 6: Encounter Editor Advanced (tokens, undo/redo, offline)
7. ✅ Phase 7: Adventure Management (CRUD, smart duplication)
8. ✅ Phase 8: Encounter Management (Structures, Walls, Fog of War - 158h)
9. ✅ Phase 9: World/Campaign Hierarchy
10. ⚠️ Phase 10: Game Sessions → Moved to EPIC-004
11. ✅ Phase 11: Account Management (profile, security, 2FA)
12. ✅ Phase 12: Audit Logging (backend middleware complete)
13. ⚠️ Phase 13: Release Preparation → Moved to EPIC-002
14. ⚠️ Phase 14: Performance Optimization → Optional/separate

### Key Steps

1. **Setup React Foundation** ✅ COMPLETE
   - Action: Bootstrap React 19 + Vite + TypeScript project
   - Component: WebClientApp/
   - Estimated Time: 4 hours
   - Status: ✅ Done

2. **Configure Redux Toolkit with RTK Query** ✅ COMPLETE
   - Action: Setup store, create API slices for all backend services
   - Component: WebClientApp/src/store/
   - Estimated Time: 8 hours
   - Status: ✅ Done (auth slice, API configuration)

3. **Implement Authentication Pages** ✅ COMPLETE
   - Action: Build login, register, 2FA, password reset pages with Material-UI
   - Component: WebClientApp/src/pages/auth/
   - Estimated Time: 16 hours
   - Status: ✅ Done (LoginPage.tsx, SimpleLoginForm.tsx, SimpleRegistrationForm.tsx)

4. **Build Encounter Editor with Konva** ✅ COMPLETE
   - Action: Implement canvas-based encounter editor with Stage, Layer, panning, zoom, grid overlay
   - Component: WebClientApp/src/components/encounter/
   - Estimated Time: 40 hours
   - Status: ✅ Complete (with major enhancements)

5. **Implement Asset Library UI** ✅ COMPLETE
   - Action: Build asset browsing, filtering, creation, management with Material-UI cards/dialogs
   - Component: WebClientApp/src/pages/assets/
   - Estimated Time: 24 hours (actual: 70 hours with expansions)
   - Status: ✅ Complete (Phase 5)

6. **Build Content Management UI** ✅ COMPLETE
   - Action: World/Campaign/Adventure/Encounter hierarchy management with tree views and forms
   - Component: WebClientApp/src/pages/library/
   - Estimated Time: 32 hours (actual: expanded scope in Phases 7-9)
   - Status: Done

7. **Integrate SignalR for Real-Time** ⚠️ MOVED TO EPIC-004
   - Action: Connect SignalR client, implement chat, game events, participant updates
   - Component: WebClientApp/src/services/signalr/
   - Estimated Time: 22 hours
   - Status: Backend complete, frontend deferred to EPIC-004

8. **Implement Account Management** ✅ COMPLETE
   - Action: Profile settings, security settings, 2FA setup, password change pages
   - Component: WebClientApp/src/pages/account/
   - Estimated Time: 16 hours
   - Status: Done (Phase 11)

9. **Implement Audit Logging** ✅ COMPLETE
   - Action: Audit log middleware for all backend operations
   - Component: Source/Common/Middlewares/AuditLoggingMiddleware.cs
   - Status: Done - all editor operations automatically logged

10. **Deprecate Blazor Projects** ⚠️ MOVED TO EPIC-002
    - Action: Mark VttTools.WebApp.WebAssembly and VttTools.WebApp.Common as legacy
    - Component: Documentation, project references
    - Status: Part of EPIC-002 Phase 13 (Release Preparation)

### Technical Considerations

- **State Management**: Redux Toolkit with slices for auth, assets, encounters, sessions; RTK Query for API caching
- **Routing**: React Router 7.9 with protected routes and auth guards
- **API Integration**: Axios + RTK Query with automatic retry, caching, and optimistic updates
- **Real-Time**: SignalR Client 9.0.6 for chat, events, and collaborative editing
- **Canvas Rendering**: Konva 10.0 + React-Konva 19.0 for high-performance encounter editor
- **Styling**: Material-UI 7.3 with custom theme matching VTT brand
- **Testing**: Vitest for unit tests, React Testing Library for components, Playwright for E2E
- **Build**: Vite 7.1.5 with code splitting and lazy loading
- **Type Safety**: TypeScript 5.9 strict mode with comprehensive type definitions

---

## Dependencies

### Blocking Tasks

- None - This is a foundational world

### Blocked Tasks

- All future UI feature enhancements will use React (blocked until migration complete)
- Mobile app development (planned) depends on React architecture patterns

### External Dependencies

- **Material-UI 7.3**: UI component library
- **Konva 10.0**: Canvas rendering engine
- **SignalR Client 9.0.6**: Real-time communication
- **Backend API Stability**: REST controllers and SignalR hubs must remain stable during migration

---

## Acceptance Criteria

### AC-01: Authentication Feature Parity
**Given**: Blazor authentication pages exist
**When**: React authentication pages are implemented
**Then**: All authentication flows work identically (login, register, 2FA, password reset, logout)

**Verification Method**: Manual testing + E2E tests with Playwright
**Status**: ✅ Complete

### AC-02: Encounter Editor Enhanced with Konva
**Given**: Blazor encounter editor has basic functionality
**When**: Konva-based encounter editor is implemented
**Then**: Panning, zoom, grid overlay, token placement all work smoothly at 60 FPS

**Verification Method**: Performance profiling + user testing
**Status**: ✅ Complete (with enhanced features)

### AC-03: Asset Library Modernized
**Given**: Blazor asset library exists
**When**: React asset library with Material-UI is implemented
**Then**: Browse, filter, create, edit, delete assets with improved UX

**Verification Method**: Feature testing + BDD step definitions
**Status**: ✅ Complete

### AC-04: Real-Time Collaboration Works
**Given**: SignalR hubs exist in backend
**When**: React SignalR client is integrated
**Then**: Chat messages, game events, participant updates broadcast in real-time

**Verification Method**: Multi-user testing + SignalR connection monitoring
**Status**: ⚠️ Moved to EPIC-004 (backend ready, frontend deferred)

### AC-05: Legacy Blazor Deprecated
**Given**: React migration is 100% complete
**When**: All features work in React
**Then**: Blazor projects marked legacy, no new Blazor development

**Verification Method**: Documentation updated, project README reflects React as primary
**Status**: ⚠️ Moved to EPIC-002 Phase 13 (Release Preparation)

### AC-06: Audit Logging Active
**Given**: Backend operations are executed
**When**: User performs encounter editor actions (create, update, delete assets, walls, regions, etc.)
**Then**: All operations are logged to audit trail with user ID, timestamp, action, and result

**Verification Method**: Audit log query shows editor operations
**Status**: ✅ Complete - AuditLoggingMiddleware captures all HTTP requests

---

## Testing Requirements

### Unit Tests
- **Coverage Target**: 80% for React components and hooks
- **Key Scenarios**: Component rendering, user interactions, Redux state updates, hook behaviors
- **Components to Test**: All new React components, custom hooks (useAuth, useGameSession, useEncounter)

### Integration Tests
- **Scenarios**: API integration with RTK Query, SignalR connection management, Redux state persistence
- **Systems Involved**: WebClientApp (React) ↔ VttTools.WebApp (API Gateway)

### E2E Tests
- **Framework**: Playwright 1.55
- **Scenarios**: Complete user journeys (login → create adventure → edit encounter → start session)
- **Coverage Target**: Critical paths (authentication, encounter editor, asset library)

### BDD Tests
- **Feature Files to Implement Step Definitions**: 101 feature files (all UI-related use cases)
- **New Scenarios Needed**: React-specific UI interaction scenarios
- **Priority**: Authentication (15 files), Encounter Editor (10 files), Asset Management (11 files)

---

## Risk Assessment

### Risk: Performance Regression During Migration
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Incremental feature rollout, performance profiling at each phase, A/B testing
- **Contingency**: Rollback to Blazor for specific features if React performance inadequate

### Risk: SignalR Integration Complexity
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Early SignalR client integration testing, dedicated testing phase
- **Contingency**: Implement polling fallback if SignalR client issues arise

### Risk: Konva Learning Curve
- **Probability**: Low
- **Impact**: Medium
- **Mitigation**: Konva prototyping completed (panning/zoom working), extensive documentation available
- **Contingency**: Fallback to HTML5 Canvas API if Konva limitations discovered

### Risk: State Management Complexity
- **Probability**: Low
- **Impact**: Low
- **Mitigation**: Redux Toolkit simplifies state management, RTK Query handles API caching
- **Contingency**: Simplify state structure, use more local component state if Redux overhead excessive

---

## Implementation Notes

### Design Decisions

- **React Over Blazor**
  - Decision: Migrate to React 19 ecosystem
  - Rationale: Better performance (no .NET runtime in browser), richer ecosystem (Material-UI, Konva, extensive libraries), superior developer experience, better hiring pool
  - Alternatives Considered: Continue with Blazor (rejected - performance concerns, limited canvas tooling)

- **Material-UI Over Custom Components**
  - Decision: Use Material-UI 7.3 for all standard components
  - Rationale: Comprehensive component library, accessibility built-in, theming system, active community
  - Alternatives Considered: Ant Design (rejected - Material-UI more aligned with modern design), Custom components (rejected - development time)

- **Konva for Encounter Editor**
  - Decision: Use Konva + React-Konva for canvas rendering
  - Rationale: High-performance canvas library, React integration, event handling, layer management, excellent for tactical maps
  - Alternatives Considered: Fabric.js (rejected - less React support), Pixi.js (rejected - overkill for 2D tactical maps), Raw Canvas API (rejected - too low-level)

- **Redux Toolkit for State Management**
  - Decision: Centralized state with Redux Toolkit + RTK Query
  - Rationale: Predictable state, excellent DevTools, RTK Query eliminates boilerplate, integrates with SignalR
  - Alternatives Considered: Context API only (rejected - insufficient for complex state), Zustand (rejected - Redux ecosystem more mature)

### Code Locations

- **WebClientApp** (Primary SPA): `Source/WebClientApp/`
  - Lines: Full project (~5,000+ lines TypeScript/TSX)
  - Change Type: New implementation (replacing Blazor)

- **VttTools.WebApp.WebAssembly** (Legacy Blazor): `Source/WebApp.WebAssembly/`
  - Lines: Entire project
  - Change Type: Deprecation (mark as legacy, eventual removal)

- **VttTools.WebApp.Common** (Legacy Blazor Components): `Source/WebApp.Common/`
  - Lines: Entire project
  - Change Type: Deprecation (mark as legacy, eventual removal)

### Configuration Changes

- **package.json**
  - Setting: dependencies
  - Added: React 19.1, Material-UI 7.3, Redux Toolkit 2.9, Konva 10.0, SignalR 9.0.6
  - Reason: React ecosystem packages

- **tsconfig.json**
  - Setting: compilerOptions.strict
  - Value: true
  - Reason: Enforce TypeScript type safety

- **vite.config.ts**
  - Setting: Build configuration, path aliases, proxy
  - Value: Path aliases (@components, @pages, etc.), proxy to https://localhost:5001 for API
  - Reason: Development experience, API integration

---

## Sprint Planning

**World Breakdown**: Multiple sprints over 6-8 weeks
**Sprint Goal Alignment**: Incremental feature delivery with user testing

### Time Breakdown (FINAL)
- **Analysis**: 8 hours (✅ Complete)
- **Phase 1 - Foundation**: 8 hours (✅ Complete)
- **Phase 2 - Auth & Landing**: 16 hours (✅ Complete)
- **Phase 3 - Pan/Zoom**: 28 hours (✅ Complete)
- **Phase 4 - Grid & Layers**: 12 hours (✅ Complete)
- **Phase 5 - Asset Library**: 70 hours (✅ Complete - expanded scope)
- **Phase 6 - Encounter Editor**: 30 hours (✅ Complete)
- **Phase 7 - Adventure Mgmt**: 19 hours (✅ Complete)
- **Phase 8 - Encounter Mgmt**: 158 hours (✅ Complete - Structures, Walls, FoW)
- **Phase 9 - World/Campaign**: 16 hours (✅ Complete)
- **Phase 10 - Game Sessions**: ⚠️ Moved to EPIC-004
- **Phase 11 - Account Mgmt**: 16 hours (✅ Complete)
- **Phase 12 - Audit Logging**: ✅ Complete (backend middleware done)
- **Phase 13 - Release Prep**: ⚠️ Moved to EPIC-002
- **Phase 14 - Performance**: ⚠️ Optional/separate task
- **Total Completed**: ~373 hours

---

## Progress Tracking

### Completion Status (FINAL)
- **Phase 1 (Foundation)**: ✅ Complete (8h)
- **Phase 2 (Auth & Landing)**: ✅ Complete (16h)
- **Phase 3 (Encounter Pan/Zoom)**: ✅ Complete (28h)
- **Phase 4 (Grid & Layers)**: ✅ Complete (12h)
- **Phase 5 (Asset Library)**: ✅ Complete (70h)
- **Phase 6 (Encounter Editor)**: ✅ Complete (30h)
- **Phase 7 (Adventure Mgmt)**: ✅ Complete (19h)
- **Phase 8 (Encounter Mgmt)**: ✅ Complete (158h)
- **Phase 9 (World/Campaign)**: ✅ Complete (16h)
- **Phase 10 (Game Sessions)**: ⚠️ Moved to EPIC-004
- **Phase 11 (Account Mgmt)**: ✅ Complete (16h)
- **Phase 12 (Audit Logging)**: ✅ Complete (backend done)
- **Phase 13 (Release Prep)**: ⚠️ Moved to EPIC-002
- **Phase 14 (Performance)**: ⚠️ Optional/separate
- **Overall**: ✅ 100% COMPLETE (~373 hours)

### Activity Log
- **2025-12-09**: 🎉 EPIC-001 COMPLETE - All core phases done, scope refined:
  - Phase 10 (Game Sessions) → Moved to EPIC-004
  - Phase 13 (Release Prep) → Moved to EPIC-002
  - Phase 12 (Audit Logging) confirmed complete - AuditLoggingMiddleware captures all operations
  - Total effort: ~373 hours across 11 completed phases
- **2025-11-27**: Phase 8.11 COMPLETE - FoW Undo/Redo support
- **2025-11-20**: Phase 8.10 COMPLETE - Asset Management system redesign
- **2025-11-15**: Phase 8.9 COMPLETE - Fog of War system
- **2025-11-10**: Phase 8.8 COMPLETE - Wall placement & editing UX
- **2025-11-05**: Phase 8.7 COMPLETE - Structures frontend (Barriers, Regions, Sources)
- **2025-11-01**: Phase 8.6 COMPLETE - Structures backend APIs
- **2025-10-28**: Phase 11 COMPLETE - Account Management (profile, security, 2FA)
- **2025-10-26**: Phase 9 COMPLETE - World/Campaign hierarchy
- **2025-10-25**: Phase 8.5 COMPLETE - Incomplete items cleanup
- **2025-10-24**: Phase 7 COMPLETE - Adventure Management
- **2025-10-23**: Phase 6 COMPLETE - Multi-selection, advanced snapping, collision detection
- **2025-10-19**: Phase 6 reimplemented - Undo/redo, offline sync, token placement
- **2025-10-11**: Phase 5 COMPLETE - Asset library with 70-hour expansion
- **2025-10-05**: Phase 4 COMPLETE - Grid system with 5 types
- **2025-10-04**: Phase 3 COMPLETE - Encounter editor panning/zoom
- **2025-10-03**: Phase 2 COMPLETE - Authentication and landing page
- **2025-10-03**: Phase 1 COMPLETE - React foundation setup
- **2025-10-03**: World created with comprehensive specification and cross-references

---

## Related Documentation

- **Feature Specifications**:
  - Documents/Areas/Identity/Features/UserAuthentication/FEATURE.md
  - Documents/Areas/Identity/Features/AccountManagement/FEATURE.md
  - Documents/Areas/Onboarding/Features/LandingPage/FEATURE.md
  - Documents/Areas/Assets/Features/AssetManagement/FEATURE.md
  - Documents/Areas/Library/Features/EncounterManagement/FEATURE.md
  - Documents/Areas/Game/Features/SessionManagement/FEATURE.md

- **Use Case Specifications**: 62 total use cases (all have UI components that may need React migration)

- **Domain Models**: None directly affected (UI-only migration)

- **Structure Documentation**: Documents/Structure/STRUCTURE.md (WebClientApp component details)

- **BDD Files**: 101 feature files require React step definition implementations

- **Implementation Guides**:
  - Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md
  - Documents/Guides/TESTING_GUIDE.md (TypeScript testing section)
  - Documents/UI_MIGRATION_ANALYSIS.md (existing analysis)
  - Documents/UI_MIGRATION_ROADMAP.md (existing roadmap)

---

## Change Log
- **2025-12-09**: 🎉 EPIC-001 COMPLETE - Marked as complete after comprehensive review:
  - All core phases (1-9, 11-12) verified complete
  - Phase 10 (Game Sessions) moved to EPIC-004
  - Phase 13 (Release Prep) moved to EPIC-002
  - Audit logging confirmed working via AuditLoggingMiddleware
  - Total effort: ~373 hours
- **2025-11-27**: Phase 8.11 complete (FoW Undo/Redo)
- **2025-11-20**: Phase 8.10 complete (Asset Management redesign)
- **2025-11-15**: Phase 8.9 complete (Fog of War)
- **2025-11-10**: Phase 8.8 complete (Wall editing)
- **2025-11-05**: Phase 8.7 complete (Structures frontend)
- **2025-11-01**: Phase 8.6 complete (Structures backend)
- **2025-10-28**: Phase 11 complete (Account Management)
- **2025-10-26**: Phase 9 complete (World/Campaign)
- **2025-10-24**: Phases 7-8.5 complete (Adventure & Encounter Management)
- **2025-10-23**: Phase 6 complete with major enhancements
- **2025-10-19**: Phase 6 reimplemented with undo/redo and offline sync
- **2025-10-11**: Phase 5 complete with 70-hour expansion
- **2025-10-05**: Phase 4 complete with grid system
- **2025-10-04**: Phase 3 complete with authentication improvements
- **2025-10-03**: World created with full cross-reference structure

---

<!--
═══════════════════════════════════════════════════════════════
TASK SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Task Identity & Scope (15 points)
✅ 5pts: Task type clearly specified (World)
✅ 5pts: Clear, actionable title and description
✅ 5pts: Priority (Critical) and effort estimate (120-160 hours) provided

## Cross-References (35 points)
✅ 10pts: All affected features documented (7 features with impact)
✅ 10pts: All affected structure components documented (4 components)
✅ 10pts: Domain impact clarified (none - UI only)
✅ 5pts: Affected BDD files identified (101 feature files)

## Success Criteria (15 points)
✅ 10pts: 5 clear, measurable success criteria
✅ 5pts: Acceptance criteria in Given/When/Then format (5 criteria)

## Implementation Plan (20 points)
✅ 10pts: Technical approach documented (incremental migration strategy)
✅ 5pts: 9 implementation steps with time estimates
✅ 5pts: Dependencies identified (blocking and external)

## Quality & Testing (15 points)
✅ 5pts: Testing requirements specified (unit, integration, E2E, BDD)
✅ 5pts: Risk assessment completed (4 risks with mitigation)
✅ 5pts: Code locations identified (3 main components)

## Score: 100/100 ✅
-->
