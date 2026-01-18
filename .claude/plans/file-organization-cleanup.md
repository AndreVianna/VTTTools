# Comprehensive File Organization & Size Cleanup Plan

## Overview

This plan applies the two critical rules from `TYPESCRIPT_STYLE_GUIDE.md` to ALL frontend TypeScript/React files:

1. **File Size Limits** - Enforce maximum line counts per file type
2. **Component File Organization** - Enforce correct section ordering

## File Size Limits Reference

| File Type | Target | Max | Action if Exceeded |
|-----------|--------|-----|-------------------|
| Component (.tsx) | ≤300 | 500 | Extract handlers/hooks/sub-components |
| Hook (use*.ts) | ≤200 | 400 | Split by concern |
| Utility (utils/*.ts) | ≤150 | 300 | Split by domain |
| Handler file | ≤200 | 300 | Group by entity |
| Service (services/*.ts) | ≤200 | 300 | Split by domain |
| Slice (slices/*.ts) | ≤200 | 300 | Extract async thunks |
| Types (types/*.ts) | ≤300 | 500 | Split by domain |

---

## Codebase Statistics

| App | Total Files | Total Lines | Files >500 | Files >300 |
|-----|-------------|-------------|------------|------------|
| WebClientApp | 280 | 66,114 | 32 | 72 |
| WebAdminApp | 65 | 12,287 | 4 | 14 |
| WebComponents | 57 | 7,307 | 5 | 9 |
| **Total** | **402** | **85,708** | **41** | **95** |

---

## Priority Tiers

### Tier 1: CRITICAL (>2x Max Limit) - 8 Files
Files causing severe agentic context consumption issues.

| # | File | Lines | Type | Max | Violation | App |
|---|------|-------|------|-----|-----------|-----|
| 1 | EncounterEditorPage.tsx | 2,529 | Component | 500 | **5.1x** | Client |
| 2 | WallTransformer.tsx | 1,105 | Component | 500 | **2.2x** | Client |
| 3 | useRegionHandlers.ts | 1,000 | Hook | 400 | **2.5x** | Client |
| 4 | PublicLibraryPage.tsx | 1,044 | Component | 500 | **2.1x** | Admin |
| 5 | TokenDragHandle.tsx | 865 | Component | 500 | **1.7x** | Client |
| 6 | RegionTransformer.tsx | 837 | Component | 500 | **1.7x** | Client |
| 7 | useAssetManagement.ts | 813 | Hook | 400 | **2.0x** | Client |
| 8 | AuditLogsPage.tsx | 762 | Component | 500 | **1.5x** | Admin |

### Tier 2: HIGH (1.5x-2x Max Limit) - 12 Files
Files significantly over limits.

| # | File | Lines | Type | Max | Violation | App |
|---|------|-------|------|-----|-----------|-----|
| 9 | useAuth.ts | 660 | Hook | 400 | **1.65x** | Client |
| 10 | AdventureDetailPage.tsx | 652 | Component | 500 | 1.30x | Client |
| 11 | RegionsPanel.tsx | 636 | Component | 500 | 1.27x | Client |
| 12 | EncounterPropertiesDrawer.tsx | 636 | Component | 500 | 1.27x | Client |
| 13 | LightsPanel.tsx | 595 | Component | 500 | 1.19x | Client |
| 14 | encounterEndpoints.ts | 577 | API | 300 | **1.92x** | Components |
| 15 | WallsPanel.tsx | 561 | Component | 500 | 1.12x | Client |
| 16 | SoundPickerDialog.tsx | 557 | Component | 500 | 1.11x | Client |
| 17 | regionBoundaryUtils.ts | 549 | Utility | 300 | **1.83x** | Client |
| 18 | CampaignDetailPage.tsx | 551 | Component | 500 | 1.10x | Client |
| 19 | WorldDetailPage.tsx | 549 | Component | 500 | 1.10x | Client |
| 20 | SoundsPanel.tsx | 542 | Component | 500 | 1.08x | Client |

### Tier 3: MEDIUM (1.0x-1.5x Max Limit) - 45 Files
Files moderately over limits.

| # | File | Lines | Type | Max | Violation | App |
|---|------|-------|------|-----|-----------|-----|
| 21 | SoundContextMenu.tsx | 539 | Component | 500 | 1.08x | Client |
| 22 | ResourcePickerPreview.tsx | 530 | Component | 500 | 1.06x | Client |
| 23 | EncounterPropertiesPanel.tsx | 515 | Component | 500 | 1.03x | Client |
| 24 | useRegionTransaction.ts | 510 | Hook | 400 | 1.28x | Client |
| 25 | BulkAssetGenerationForm.tsx | 512 | Component | 500 | 1.02x | Admin |
| 26 | errorHandling.ts | 506 | Utility | 300 | **1.69x** | Client |
| 27 | useWallHandlers.ts | 503 | Hook | 400 | 1.26x | Client |
| 28 | regionMergeUtils.ts | 494 | Utility | 300 | **1.65x** | Client |
| 29 | EncounterRecovery.tsx | 493 | Component | 500 | 0.99x | Client |
| 30 | LeftToolBar.tsx | 490 | Component | 500 | 0.98x | Client |
| 31 | ResourcesPage.tsx | 483 | Component | 500 | 0.97x | Admin |
| 32 | wallPlanarUtils.ts | 482 | Utility | 300 | **1.61x** | Client |
| 33 | LightContextMenu.tsx | 473 | Component | 500 | 0.95x | Client |
| 34 | TwoFactorSetupForm.tsx | 459 | Component | 500 | 0.92x | Client |
| 35 | SourceDrawingTool.tsx | 454 | Component | 500 | 0.91x | Client |
| 36 | UserListPage.tsx | 452 | Component | 500 | 0.90x | Admin |
| 37 | mockApi.ts | 452 | Service | 300 | **1.51x** | Client |
| 38 | AssetSelectionDialog.tsx | 447 | Component | 500 | 0.89x | Client |
| 39 | AssetLoadingError.tsx | 446 | Component | 500 | 0.89x | Client |
| 40 | ResourceThumbnail.tsx | 419 | Component | 500 | 0.84x | Admin |
| 41 | SourceRenderer.tsx | 416 | Component | 500 | 0.83x | Client |
| 42 | useEncounterEditor.ts | 415 | Hook | 400 | 1.04x | Client |
| 43 | TopToolBar.tsx | 414 | Component | 500 | 0.83x | Client |
| 44 | libraryService.ts | 414 | Service | 300 | **1.38x** | Admin |
| 45 | SimpleRegistrationForm.tsx | 409 | Component | 500 | 0.82x | Client |
| 46 | encounterMappers.ts | 403 | Utility | 300 | **1.34x** | Client |
| 47 | PasswordResetConfirmForm.tsx | 401 | Component | 500 | 0.80x | Client |
| 48 | jobsSlice.ts | 400 | Slice | 300 | **1.33x** | Admin |
| 49 | AdventureListView.tsx | 397 | Component | 500 | 0.79x | Client |
| 50 | SimpleLoginForm.tsx | 397 | Component | 500 | 0.79x | Client |
| 51 | AssetLibraryPage.tsx | 392 | Component | 500 | 0.78x | Client |
| 52 | ProfileSettings.tsx | 392 | Component | 500 | 0.78x | Client |
| 53 | snapping.ts | 387 | Utility | 300 | **1.29x** | Client |
| 54 | EncounterMenu.tsx | 387 | Component | 500 | 0.77x | Client |
| 55 | BulkAssetGenerationPage.tsx | 377 | Component | 500 | 0.75x | Admin |
| 56 | GlobalErrorDisplay.tsx | 376 | Component | 500 | 0.75x | Client |
| 57 | undoRedoManager.ts | 372 | Service | 300 | **1.24x** | Client |
| 58 | MediaLibraryPage.tsx | 365 | Component | 500 | 0.73x | Client |
| 59 | offlineSyncManager.ts | 359 | Service | 300 | **1.20x** | Client |
| 60 | EncounterCanvas.tsx | 358 | Component | 500 | 0.72x | Client |
| 61 | FormValidation.tsx | 356 | Component | 500 | 0.71x | Client |
| 62 | wallCommands.ts | 348 | Utility | 300 | **1.16x** | Client |
| 63 | wallCollisionUtils.ts | 346 | Utility | 300 | **1.15x** | Client |
| 64 | useWallTransaction.ts | 343 | Hook | 400 | 0.86x | Client |
| 65 | UserDetailModal.tsx | 342 | Component | 500 | 0.68x | Admin |

### Tier 4: LOW (Over Target but Under Max) - 30 Files
Files over target limits but under maximum - fix organization only.

| # | File | Lines | Type | Target | App |
|---|------|-------|------|--------|-----|
| 66 | BackgroundPanel.tsx | 341 | Component | 300 | Client |
| 67 | MaintenanceModePage.tsx | 336 | Component | 300 | Admin |
| 68 | WallRenderer.tsx | 336 | Component | 300 | Client |
| 69 | ResourcePreviewModal.tsx | 334 | Component | 300 | Admin |
| 70 | NetworkStatus.tsx | 332 | Component | 300 | Client |
| 71 | useSignalRHub.ts | 329 | Hook | 200 | Components |
| 72 | gridCalculator.ts | 325 | Utility | 150 | Client |
| 73 | encounterApi.ts | 320 | Service | 200 | Client |
| 74 | ResourcePickerFilters.tsx | 320 | Component | 300 | Client |
| 75 | ConfigurationPage.tsx | 319 | Component | 300 | Admin |
| 76 | commands.ts | 317 | Utility | 150 | Client |
| 77 | WallDrawingTool.tsx | 313 | Component | 300 | Client |
| 78 | stageApi.ts | 307 | Service | 200 | Client |
| 79 | AudioPreviewPlayer.tsx | 305 | Component | 300 | Client |
| 80 | MonstersPanel.tsx | 304 | Component | 300 | Client |
| 81 | CharactersPanel.tsx | 304 | Component | 300 | Client |
| 82 | ObjectsPanel.tsx | 302 | Component | 300 | Client |
| 83 | AssetPicker.tsx | 299 | Component | 300 | Client |
| 84 | EditorLayout.tsx | 292 | Component | 300 | Client |
| 85 | LandingPage.tsx | 290 | Component | 300 | Client |
| 86 | App.tsx | 289 | Component | 300 | Client |
| 87 | useClipRegions.ts | 288 | Hook | 200 | Client |
| 88 | UserActivity.tsx | 287 | Component | 300 | Admin |
| 89 | useAssetSelection.ts | 286 | Hook | 200 | Client |
| 90 | sourceCommands.ts | 285 | Utility | 150 | Client |
| 91 | TaxonomyTree.tsx | 278 | Component | 300 | Client |
| 92 | WorldListView.tsx | 276 | Component | 300 | Client |
| 93 | CampaignListView.tsx | 276 | Component | 300 | Client |
| 94 | RecoveryCodesManager.tsx | 276 | Component | 300 | Client |
| 95 | EntityPlacement.tsx | 275 | Component | 300 | Client |

---

## Cleanup Tasks - Files to Delete

| File | Reason |
|------|--------|
| SoundPickerDialog.original.tsx (564 lines) | Backup file with .original suffix |

---

## Phase Implementation Plan

### Phase 0: Setup (COMPLETE)
- [x] Create worktree `../VTTTools-file-cleanup`
- [x] Create branch `refactor/file-organization-cleanup`
- [x] Gather file statistics

### Phase 1: Delete Obsolete Files
**Estimated: 1 file, ~564 lines removed**

- [ ] 1.1 Delete `SoundPickerDialog.original.tsx`
- [ ] 1.2 Run TypeScript compilation to verify no breaks
- [ ] 1.3 Commit: "chore: Remove obsolete backup file"

### Phase 2: CRITICAL Tier - EncounterEditorPage (2,529 → ~800 lines)
**Estimated: 7 new hooks, ~1,700 lines extracted**

The largest file, requiring systematic extraction of 9 hidden cohesive classes.

- [ ] 2.1 Extract `useFogOfWarManagement` hook (~160 lines)
  - State: fogMode, fogDrawingTool, fogDrawingVertices
  - Handlers: handleFogModeChange, handleFogDrawPolygon, handleFogBucketFill, handleFogHideAll, handleFogRevealAll
  - Includes: fowRegions computed, useFogOfWarPlacement integration

- [ ] 2.2 Extract `useSourceManagement` hook (~130 lines)
  - State: selectedLightSourceIndex, selectedSoundSourceIndex, sourcePlacementProperties
  - Handlers: handleSourcePlacementFinish, handleDeleteLight, handleDeleteSound

- [ ] 2.3 Extract `useMediaManagement` hook (~180 lines)
  - State: isUploadingBackground, isUploadingAlternateBackground, isUploadingAmbientSound
  - Handlers: handleBackgroundUpload, handleAlternateBackgroundUpload, handleAmbientSoundUpload
  - Includes: media hub subscription logic

- [ ] 2.4 Extract `useEncounterState` hook (~200 lines)
  - State: encounter, placedWalls, placedRegions, placedLightSources, placedSoundSources
  - Handlers: hydration logic, refetch integration

- [ ] 2.5 Extract `useVideoControls` hook (~50 lines)
  - State: isVideoAudioMuted, isVideoPlaying
  - Handlers: handleAudioMuteToggle, handleVideoPlayPauseToggle

- [ ] 2.6 Extract `useSaveChanges` hook (~120 lines)
  - State: saveStatus
  - Handlers: saveChanges, patchEncounter integration

- [ ] 2.7 Refactor main component to use extracted hooks
- [ ] 2.8 Run tests, fix any regressions
- [ ] 2.9 Commit: "refactor: Extract hooks from EncounterEditorPage (Phase 2)"

### Phase 3: CRITICAL Tier - Konva Transformers (2,807 → ~1,200 lines)
**Estimated: 6 new hooks, ~1,600 lines extracted**

WallTransformer.tsx (1,105), TokenDragHandle.tsx (865), RegionTransformer.tsx (837)

- [ ] 3.1 Extract `useWallSelection` hook from WallTransformer (~150 lines)
  - State: selectedPoles, selectedLines, selectionMode, marqueeStart/End
  - Handlers: handleLineClick, handlePoleClick, handleMarqueeStart/End

- [ ] 3.2 Extract `useWallDrag` hook from WallTransformer (~300 lines)
  - Refs: dragStartPositionRef, lineDragStartRef
  - Handlers: handlePoleDragStart/Move/End, handleLineDragStart/Move/End

- [ ] 3.3 Extract `useRegionSelection` hook from RegionTransformer (~100 lines)
  - State: selectedVertices, selectionMode
  - Handlers: handleVertexClick, handleMarqueeSelection

- [ ] 3.4 Extract `useRegionDrag` hook from RegionTransformer (~200 lines)
  - Handlers: handleVertexDragStart/Move/End

- [ ] 3.5 Extract `useAssetDrag` hook from TokenDragHandle (~250 lines)
  - Handlers: handleDragStart/Move/End, validatePlacement, calculateMultiSelectDelta

- [ ] 3.6 Extract `useAssetRotation` hook from TokenDragHandle (~50 lines)
  - Handlers: handleRotationMouseDown, calculateAngleFromCenter

- [ ] 3.7 Refactor transformer components to use extracted hooks
- [ ] 3.8 Run tests, fix any regressions
- [ ] 3.9 Commit: "refactor: Extract hooks from Konva transformers (Phase 3)"

### Phase 4: CRITICAL Tier - Large Hooks (2,813 → ~1,200 lines)
**Estimated: 8 new files, ~1,600 lines split**

useRegionHandlers.ts (1,000), useAssetManagement.ts (813), useAuth.ts (660)

- [ ] 4.1 Split `useRegionHandlers` by concern:
  - `useRegionCreation.ts` (~200 lines) - creation handlers
  - `useRegionEditing.ts` (~250 lines) - vertex editing handlers
  - `useRegionSelection.ts` (~150 lines) - selection handlers
  - `useRegionDeletion.ts` (~100 lines) - deletion handlers
  - Keep `useRegionHandlers.ts` as facade (~100 lines)

- [ ] 4.2 Split `useAssetManagement` by concern:
  - `useAssetPlacement.ts` (~200 lines) - placement logic
  - `useAssetSelection.ts` (~200 lines) - selection logic
  - `useAssetOperations.ts` (~200 lines) - CRUD operations
  - Keep `useAssetManagement.ts` as facade (~100 lines)

- [ ] 4.3 Split `useAuth` by concern:
  - `useAuthCore.ts` (~200 lines) - login, logout, register
  - `useAuthPassword.ts` (~150 lines) - password reset, change
  - `useTwoFactorAuth.ts` (~200 lines) - 2FA setup, verify
  - Keep `useAuth.ts` as facade (~50 lines)

- [ ] 4.4 Update all imports across codebase
- [ ] 4.5 Run tests, fix any regressions
- [ ] 4.6 Commit: "refactor: Split large hooks by concern (Phase 4)"

### Phase 5: CRITICAL Tier - Admin Pages (1,806 → ~800 lines)
**Estimated: 4 new hooks/utils, ~1,000 lines extracted**

PublicLibraryPage.tsx (1,044), AuditLogsPage.tsx (762)

- [ ] 5.1 Extract `useLibraryFilters` hook from PublicLibraryPage (~150 lines)
- [ ] 5.2 Extract `LibraryDataGrid` component from PublicLibraryPage (~200 lines)
- [ ] 5.3 Extract `useLibraryActions` hook from PublicLibraryPage (~150 lines)
- [ ] 5.4 Extract `useAuditLogPolling` hook from AuditLogsPage (~100 lines)
- [ ] 5.5 Extract `auditLogHelpers.ts` utility from AuditLogsPage (~100 lines)
- [ ] 5.6 Extract `AuditDetailRow` component from AuditLogsPage (~80 lines)
- [ ] 5.7 Refactor pages to use extracted code
- [ ] 5.8 Run tests, fix any regressions
- [ ] 5.9 Commit: "refactor: Extract from admin pages (Phase 5)"

### Phase 6: HIGH Tier - Utilities (2,031 → ~900 lines)
**Estimated: 8 new files, ~1,100 lines split**

regionBoundaryUtils.ts (549), errorHandling.ts (506), regionMergeUtils.ts (494), wallPlanarUtils.ts (482)

- [ ] 6.1 Split `regionBoundaryUtils.ts`:
  - `regionBoundaryTracing.ts` (~200 lines) - traceBoundary algorithm
  - `regionBoundaryHelpers.ts` (~150 lines) - helper functions

- [ ] 6.2 Split `errorHandling.ts`:
  - `errorTypes.ts` (~100 lines) - error classes
  - `errorProcessing.ts` (~150 lines) - processing utilities
  - `errorRetry.ts` (~100 lines) - retry logic

- [ ] 6.3 Split `regionMergeUtils.ts`:
  - `regionMergeCore.ts` (~200 lines) - merge algorithm
  - `regionMergeHelpers.ts` (~100 lines) - helpers

- [ ] 6.4 Split `wallPlanarUtils.ts`:
  - `wallPlanarGeometry.ts` (~200 lines) - geometry calculations
  - `wallPlanarHelpers.ts` (~100 lines) - helpers

- [ ] 6.5 Update all imports
- [ ] 6.6 Run tests, fix any regressions
- [ ] 6.7 Commit: "refactor: Split large utility files (Phase 6)"

### Phase 7: HIGH Tier - Panels & Dialogs (3,467 → ~2,400 lines)
**Estimated: 6 new handler files, ~1,000 lines extracted**

RegionsPanel.tsx (636), EncounterPropertiesDrawer.tsx (636), LightsPanel.tsx (595), WallsPanel.tsx (561), SoundPickerDialog.tsx (557), SoundsPanel.tsx (542)

- [ ] 7.1 Extract handlers from `RegionsPanel`:
  - `regionsPanelHandlers.ts` (~150 lines)

- [ ] 7.2 Extract handlers from `EncounterPropertiesDrawer`:
  - `encounterPropertiesHandlers.ts` (~150 lines)

- [ ] 7.3 Extract handlers from `LightsPanel`:
  - `lightsPanelHandlers.ts` (~100 lines)

- [ ] 7.4 Extract handlers from `WallsPanel`:
  - `wallsPanelHandlers.ts` (~100 lines)

- [ ] 7.5 Extract handlers from `SoundPickerDialog`:
  - `soundPickerHandlers.ts` (~100 lines)

- [ ] 7.6 Extract handlers from `SoundsPanel`:
  - `soundsPanelHandlers.ts` (~100 lines)

- [ ] 7.7 Refactor panels to use extracted handlers
- [ ] 7.8 Run tests, fix any regressions
- [ ] 7.9 Commit: "refactor: Extract handlers from panels (Phase 7)"

### Phase 8: HIGH Tier - Content Library Pages (1,752 → ~1,200 lines)
**Estimated: 3 new shared hooks, ~550 lines extracted**

AdventureDetailPage.tsx (652), CampaignDetailPage.tsx (551), WorldDetailPage.tsx (549)

- [ ] 8.1 Extract shared `useContentDetailPage` hook (~200 lines)
  - Common state: isEditing, hasChanges, saveStatus
  - Common handlers: handleSave, handleCancel, handleDelete

- [ ] 8.2 Extract shared `ContentDetailHeader` component (~100 lines)
- [ ] 8.3 Extract shared `ContentDetailActions` component (~100 lines)
- [ ] 8.4 Refactor all three pages to use shared code
- [ ] 8.5 Run tests, fix any regressions
- [ ] 8.6 Commit: "refactor: Extract shared content library code (Phase 8)"

### Phase 9: MEDIUM Tier - Context Menus (1,012 → ~600 lines)
**Estimated: 2 new handler files, ~400 lines extracted**

SoundContextMenu.tsx (539), LightContextMenu.tsx (473)

- [ ] 9.1 Extract `soundContextMenuHandlers.ts` (~150 lines)
- [ ] 9.2 Extract `lightContextMenuHandlers.ts` (~150 lines)
- [ ] 9.3 Refactor context menus to use handlers
- [ ] 9.4 Commit: "refactor: Extract context menu handlers (Phase 9)"

### Phase 10: MEDIUM Tier - Services (1,597 → ~900 lines)
**Estimated: 4 new files, ~700 lines split**

mockApi.ts (452), libraryService.ts (414), undoRedoManager.ts (372), offlineSyncManager.ts (359)

- [ ] 10.1 Split `mockApi.ts` by domain (~150 lines each)
- [ ] 10.2 Split `libraryService.ts` by entity type
- [ ] 10.3 Split `undoRedoManager.ts` - extract stack management
- [ ] 10.4 Split `offlineSyncManager.ts` - extract queue management
- [ ] 10.5 Update imports
- [ ] 10.6 Commit: "refactor: Split large services (Phase 10)"

### Phase 11: MEDIUM Tier - Remaining Utilities (1,406 → ~700 lines)
**Estimated: 4 new files, ~700 lines split**

encounterMappers.ts (403), snapping.ts (387), wallCommands.ts (348), wallCollisionUtils.ts (346)

- [ ] 11.1 Split `encounterMappers.ts` by entity type
- [ ] 11.2 Split `snapping.ts` - extract snap strategies
- [ ] 11.3 Split `wallCommands.ts` - extract by command type
- [ ] 11.4 Split `wallCollisionUtils.ts` - extract algorithms
- [ ] 11.5 Update imports
- [ ] 11.6 Commit: "refactor: Split remaining utilities (Phase 11)"

### Phase 12: LOW Tier - Auth Components (1,609 → ~1,200 lines)
**Estimated: 4 new handler files, ~400 lines extracted**

TwoFactorSetupForm.tsx (459), SimpleRegistrationForm.tsx (409), PasswordResetConfirmForm.tsx (401), SimpleLoginForm.tsx (397)

- [ ] 12.1 Extract `twoFactorFormHandlers.ts`
- [ ] 12.2 Extract `registrationFormHandlers.ts`
- [ ] 12.3 Extract `passwordResetFormHandlers.ts`
- [ ] 12.4 Extract `loginFormHandlers.ts`
- [ ] 12.5 Refactor forms
- [ ] 12.6 Commit: "refactor: Extract auth form handlers (Phase 12)"

### Phase 13: LOW Tier - Remaining Components (2,000+ lines across 30+ files)
**Organization fixes only - no extraction needed**

Files between 300-500 lines that need section ordering verification.

- [ ] 13.1 Audit and fix organization in BackgroundPanel.tsx
- [ ] 13.2 Audit and fix organization in WallRenderer.tsx
- [ ] 13.3 Audit and fix organization in NetworkStatus.tsx
- [ ] 13.4 Audit and fix organization in ResourcePickerFilters.tsx
- [ ] 13.5 Audit and fix organization in WallDrawingTool.tsx
- [ ] 13.6 Audit and fix organization in AudioPreviewPlayer.tsx
- [ ] 13.7 Audit and fix organization in MonstersPanel.tsx
- [ ] 13.8 Audit and fix organization in CharactersPanel.tsx
- [ ] 13.9 Audit and fix organization in ObjectsPanel.tsx
- [ ] 13.10 Audit and fix organization in remaining files (20+)
- [ ] 13.11 Commit: "refactor: Fix component organization (Phase 13)"

### Phase 14: WebComponents Library (1,492 → ~900 lines)
**Estimated: 3 new files, ~600 lines split**

encounterEndpoints.ts (577), useSignalRHub.ts (329), AdventureDetailPage.tsx (642 - shared code)

- [ ] 14.1 Split `encounterEndpoints.ts` by operation type
- [ ] 14.2 Split `useSignalRHub.ts` - extract connection management
- [ ] 14.3 Deduplicate AdventureDetailPage with WebClientApp version
- [ ] 14.4 Update exports
- [ ] 14.5 Commit: "refactor: Split WebComponents large files (Phase 14)"

### Phase 15: Final Verification & Cleanup

- [ ] 15.1 Run full TypeScript compilation across all apps
- [ ] 15.2 Run full test suite: `npm test`
- [ ] 15.3 Run BDD tests: `npm run test:bdd`
- [ ] 15.4 Generate final file statistics report
- [ ] 15.5 Verify all files under limits
- [ ] 15.6 Remove any unused imports/exports
- [ ] 15.7 Final commit: "refactor: Final cleanup and verification"
- [ ] 15.8 Create PR from worktree branch to main

### Phase 16: Cleanup Worktree

- [ ] 16.1 Merge PR after review
- [ ] 16.2 Remove worktree: `git worktree remove ../VTTTools-file-cleanup`
- [ ] 16.3 Delete branch if merged: `git branch -d refactor/file-organization-cleanup`

---

## Expected Outcomes

### Line Count Reduction

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| Tier 1 (Critical) | 10,955 | ~4,400 | **60%** |
| Tier 2 (High) | 6,408 | ~4,200 | **34%** |
| Tier 3 (Medium) | 15,000 | ~11,000 | **27%** |
| Tier 4 (Low) | 9,000 | 9,000 | 0% (org only) |
| **Total** | **41,363** | **~28,600** | **31%** |

### New Files Created

| Phase | New Files | Type |
|-------|-----------|------|
| Phase 2 | 7 | Hooks |
| Phase 3 | 6 | Hooks |
| Phase 4 | 8 | Hooks |
| Phase 5 | 4 | Hooks/Utils |
| Phase 6 | 8 | Utils |
| Phase 7 | 6 | Handlers |
| Phase 8 | 3 | Hooks/Components |
| Phase 9 | 2 | Handlers |
| Phase 10 | 4 | Services |
| Phase 11 | 4 | Utils |
| Phase 12 | 4 | Handlers |
| Phase 14 | 3 | Mixed |
| **Total** | **~59** | |

### Benefits

1. **Agentic Context Efficiency**: No file >500 lines for components, >400 for hooks
2. **Maintainability**: Single responsibility per file
3. **Discoverability**: Clear file naming by concern
4. **Testability**: Isolated units easier to test
5. **Code Review**: Smaller, focused PRs
6. **Reusability**: Extracted handlers/hooks can be reused

---

## Verification Checklist Per Phase

- [ ] TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] No circular dependencies introduced
- [ ] Imports updated correctly
- [ ] Barrel exports (index.ts) updated
- [ ] File follows organization pattern
- [ ] File under size limit

---

## Risk Mitigation

1. **Worktree Isolation**: All changes in separate directory
2. **Incremental Commits**: Each phase committed separately
3. **Test Verification**: Run tests after each phase
4. **Rollback Ready**: Can abandon worktree at any point
5. **No Logic Changes**: Extract only, don't rewrite

---

## Stop Points

Safe stopping points if time/resources limited:

1. **After Phase 2**: EncounterEditorPage fixed (biggest impact)
2. **After Phase 5**: All critical files addressed
3. **After Phase 8**: All high-priority files addressed
4. **After Phase 11**: All medium-priority files addressed

Each stop point leaves codebase in consistent, working state.
