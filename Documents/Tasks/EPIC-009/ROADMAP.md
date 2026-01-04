# EPIC-009: Frontend Behavior Test Expansion - Roadmap

## Overview

| Phase | Description | Tasks | Est. Tests | Status |
|-------|-------------|-------|------------|--------|
| 1 | WebAdminApp Critical | 8 | 70-89 | 🟢 Complete (181 tests) |
| 2 | WebAdminApp High | 6 | 46-61 | 🟢 Complete (224 tests) |
| 3 | WebClientApp Critical | 14 | 66-86 | 🟢 Complete (315 tests) |
| 4 | WebClientApp High | 13 | 47-62 | 🟢 Complete (204 tests) |
| 5 | WebClientApp Medium | 11 | 64-86 | 🔴 Not Started |

**Total Estimated Tests**: 293-384
**Actual Tests Created**: 924
**Status**: 🟢 PHASES 1-4 COMPLETE

---

## Phase 1: WebAdminApp Critical (Production Risk)

### Objective
Test critical admin functions that currently have 0% coverage.

### Tasks

#### 1.1 LoginPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/LoginPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/LoginPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 10-12 |

**Tests**:
- [ ] Should render email and password fields
- [ ] Should render login button
- [ ] Should show validation errors for empty fields
- [ ] Should show validation error for invalid email format
- [ ] Should call login API on form submit
- [ ] Should display API error messages
- [ ] Should redirect to dashboard on successful login
- [ ] Should show 2FA field when required
- [ ] Should handle 2FA submission
- [ ] Should disable form during submission

#### 1.2 AuthService Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/services/authService.test.ts` |
| Source | `Source/WebAdminApp/src/services/authService.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 8-10 |

**Tests**:
- [ ] Should call login endpoint with credentials
- [ ] Should store auth token on successful login
- [ ] Should detect 2FA requirement from response
- [ ] Should call logout endpoint
- [ ] Should clear stored token on logout
- [ ] Should handle login failure
- [ ] Should handle network errors
- [ ] Should check authentication status

#### 1.3 JobsSlice Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/store/slices/jobsSlice.test.ts` |
| Source | `Source/WebAdminApp/src/store/slices/jobsSlice.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 15-20 |

**Tests**:
- [ ] Should have correct initial state
- [ ] Should handle fetchJobs.pending
- [ ] Should handle fetchJobs.fulfilled with jobs list
- [ ] Should handle fetchJobs.rejected
- [ ] Should handle createJob.pending/fulfilled/rejected
- [ ] Should handle cancelJob action
- [ ] Should handle retryJob action
- [ ] Should update job progress
- [ ] Should handle job completion/failure
- [ ] Should handle bulk job operations
- [ ] Should select jobs by status
- [ ] Should select job by id

#### 1.4 UserListPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/Users/UserListPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/Users/UserListPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 10-12 |

**Tests**:
- [ ] Should render user data grid
- [ ] Should display loading/error states
- [ ] Should render user rows with correct data
- [ ] Should handle row selection
- [ ] Should open user detail modal on row click
- [ ] Should handle sorting/filtering/pagination
- [ ] Should handle user actions (edit, delete, disable)

#### 1.5 AdminLayout Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/components/layout/AdminLayout.test.tsx` |
| Source | `Source/WebAdminApp/src/components/layout/AdminLayout.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render navigation sidebar
- [ ] Should render main content area
- [ ] Should highlight active navigation item
- [ ] Should handle navigation clicks
- [ ] Should render user profile in header
- [ ] Should handle logout click
- [ ] Should collapse/expand sidebar

#### 1.6 DashboardPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/DashboardPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/DashboardPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should render dashboard cards
- [ ] Should display loading state
- [ ] Should display statistics data
- [ ] Should handle refresh action
- [ ] Should display recent activity
- [ ] Should handle card click navigation

#### 1.7 UserDetailModal Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/components/users/UserDetailModal.test.tsx` |
| Source | `Source/WebAdminApp/src/components/users/UserDetailModal.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 8-10 |

**Tests**:
- [ ] Should render user details
- [ ] Should render in view mode by default
- [ ] Should switch to edit mode
- [ ] Should validate form fields
- [ ] Should handle save/cancel/close actions
- [ ] Should display role management section

#### 1.8 ConfigurationPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/ConfigurationPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/ConfigurationPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should render configuration sections
- [ ] Should display current configuration values
- [ ] Should handle configuration updates
- [ ] Should validate configuration values
- [ ] Should show success/error messages

### Verification
```bash
npm test --prefix Source/WebAdminApp -- --run
```

---

## Phase 2: WebAdminApp High Priority

### Objective
Test important admin functionality.

### Tasks

#### 2.1 BulkAssetGenerationPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/BulkAssetGenerationPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/BulkAssetGenerationPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render generation form
- [ ] Should validate input parameters
- [ ] Should submit generation job
- [ ] Should display job progress
- [ ] Should handle job completion
- [ ] Should handle job failure
- [ ] Should allow job cancellation

#### 2.2 AuditLogPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/pages/AuditLogPage.test.tsx` |
| Source | `Source/WebAdminApp/src/pages/AuditLogPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render audit log table
- [ ] Should display log entries
- [ ] Should handle date range filtering
- [ ] Should handle action type filtering
- [ ] Should handle user filtering
- [ ] Should handle pagination
- [ ] Should export logs

#### 2.3 HealthStatusCard Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/components/dashboard/HealthStatusCard.test.tsx` |
| Source | `Source/WebAdminApp/src/components/dashboard/HealthStatusCard.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should render health status indicator
- [ ] Should display healthy state
- [ ] Should display unhealthy state
- [ ] Should display degraded state
- [ ] Should show last check time
- [ ] Should handle refresh click

#### 2.4 RoleManagement Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/components/users/RoleManagement.test.tsx` |
| Source | `Source/WebAdminApp/src/components/users/RoleManagement.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 5-7 |

**Tests**:
- [ ] Should render role checkboxes
- [ ] Should display current roles
- [ ] Should handle role toggle
- [ ] Should validate role combinations
- [ ] Should call update API on change

#### 2.5 useAdminAuth Hook Tests
| Property | Value |
|----------|-------|
| File | `Source/WebAdminApp/src/hooks/useAdminAuth.test.ts` |
| Source | `Source/WebAdminApp/src/hooks/useAdminAuth.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should return authentication state
- [ ] Should return user info when authenticated
- [ ] Should return null when not authenticated
- [ ] Should handle login action
- [ ] Should handle logout action
- [ ] Should handle token refresh

#### 2.6 Remaining Admin Components
| Property | Value |
|----------|-------|
| Files | StatCard, ActivityFeed, JobProgressCard, ResourceReviewCard |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 15-20 |

**Components**:
- [ ] StatCard.test.tsx
- [ ] ActivityFeed.test.tsx
- [ ] JobProgressCard.test.tsx
- [ ] ResourceReviewCard.test.tsx (extend existing)

### Verification
```bash
npm test --prefix Source/WebAdminApp -- --run
```

---

## Phase 3: WebClientApp Critical (Data Loss Risk)

### Objective
Test Content Library feature (currently 0% coverage, 23 files).

### Tasks

#### 3.1 useContentLibrary Hook Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/hooks/useContentLibrary.test.ts` |
| Source | `Source/WebClientApp/src/features/content-library/hooks/useContentLibrary.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 8-10 |

**Tests**:
- [ ] Should return initial state
- [ ] Should fetch content list
- [ ] Should handle loading state
- [ ] Should handle error state
- [ ] Should handle pagination
- [ ] Should handle filtering
- [ ] Should handle sorting
- [ ] Should handle search

#### 3.2 useAutoSave Hook Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/hooks/useAutoSave.test.ts` |
| Source | `Source/WebClientApp/src/features/content-library/hooks/useAutoSave.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 8-10 |

**Tests**:
- [ ] Should not save on initial render
- [ ] Should save after debounce period
- [ ] Should cancel pending save on unmount
- [ ] Should handle save success
- [ ] Should handle save failure
- [ ] Should retry on failure
- [ ] Should indicate saving state
- [ ] Should indicate save error state

#### 3.3 useInfiniteScroll Hook Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/hooks/useInfiniteScroll.test.ts` |
| Source | `Source/WebClientApp/src/features/content-library/hooks/useInfiniteScroll.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should detect scroll to bottom
- [ ] Should call loadMore when scrolled
- [ ] Should not call loadMore when loading
- [ ] Should not call loadMore when no more items
- [ ] Should handle intersection observer
- [ ] Should cleanup on unmount

#### 3.4 AdventureList Component Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/components/AdventureList.test.tsx` |
| Source | `Source/WebClientApp/src/features/content-library/components/AdventureList.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render adventure cards
- [ ] Should display loading skeleton
- [ ] Should display empty state
- [ ] Should handle adventure click
- [ ] Should handle create new click
- [ ] Should handle delete action
- [ ] Should handle duplicate action

#### 3.5 CampaignList Component Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/components/CampaignList.test.tsx` |
| Source | `Source/WebClientApp/src/features/content-library/components/CampaignList.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render campaign cards
- [ ] Should display loading skeleton
- [ ] Should display empty state
- [ ] Should handle campaign click
- [ ] Should handle create new click
- [ ] Should handle delete action
- [ ] Should display campaign stats

#### 3.6 WorldList Component Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/components/WorldList.test.tsx` |
| Source | `Source/WebClientApp/src/features/content-library/components/WorldList.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

**Tests**:
- [ ] Should render world cards
- [ ] Should display loading skeleton
- [ ] Should display empty state
- [ ] Should handle world click
- [ ] Should handle create new click
- [ ] Should handle delete action

#### 3.7 EncounterList Component Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/components/EncounterList.test.tsx` |
| Source | `Source/WebClientApp/src/features/content-library/components/EncounterList.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render encounter cards
- [ ] Should display loading skeleton
- [ ] Should display empty state
- [ ] Should handle encounter click
- [ ] Should handle create new click
- [ ] Should handle delete action
- [ ] Should handle duplicate action

#### 3.8 ContentLibraryPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/features/content-library/ContentLibraryPage.test.tsx` |
| Source | `Source/WebClientApp/src/features/content-library/ContentLibraryPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

**Tests**:
- [ ] Should render tab navigation
- [ ] Should switch between content types
- [ ] Should render search bar
- [ ] Should handle search input
- [ ] Should render filter options
- [ ] Should handle filter changes
- [ ] Should persist selected tab

#### 3.9 securityApi Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/api/securityApi.test.ts` |
| Source | `Source/WebClientApp/src/api/securityApi.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 5-7 |

**Tests**:
- [ ] Should call change password endpoint
- [ ] Should call enable 2FA endpoint
- [ ] Should call disable 2FA endpoint
- [ ] Should call get security settings endpoint
- [ ] Should handle API errors

#### 3.10 profileApi Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/api/profileApi.test.ts` |
| Source | `Source/WebClientApp/src/api/profileApi.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 5-7 |

**Tests**:
- [ ] Should call get profile endpoint
- [ ] Should call update profile endpoint
- [ ] Should call upload avatar endpoint
- [ ] Should call delete avatar endpoint
- [ ] Should handle API errors

### Verification
```bash
npm test --prefix Source/WebClientApp -- --run
```

---

## Phase 4: WebClientApp High Priority

### Objective
Test core pages and auth components.

### Tasks

#### 4.1 AssetLibraryPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/pages/AssetLibraryPage.test.tsx` |
| Source | `Source/WebClientApp/src/pages/AssetLibraryPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

#### 4.2 MediaLibraryPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/pages/MediaLibraryPage.test.tsx` |
| Source | `Source/WebClientApp/src/pages/MediaLibraryPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

#### 4.3 AssetStudioPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/pages/AssetStudioPage.test.tsx` |
| Source | `Source/WebClientApp/src/pages/AssetStudioPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

#### 4.4 LoginPage Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/pages/LoginPage.test.tsx` |
| Source | `Source/WebClientApp/src/pages/LoginPage.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

#### 4.5 SimpleLoginForm Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/components/auth/SimpleLoginForm.test.tsx` |
| Source | `Source/WebClientApp/src/components/auth/SimpleLoginForm.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 7-9 |

#### 4.6 PasswordResetConfirmForm Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/components/auth/PasswordResetConfirmForm.test.tsx` |
| Source | `Source/WebClientApp/src/components/auth/PasswordResetConfirmForm.tsx` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 6-8 |

#### 4.7 twoFactorApi Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/api/twoFactorApi.test.ts` |
| Source | `Source/WebClientApp/src/api/twoFactorApi.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 4-6 |

#### 4.8 recoveryCodesApi Tests
| Property | Value |
|----------|-------|
| File | `Source/WebClientApp/src/api/recoveryCodesApi.test.ts` |
| Source | `Source/WebClientApp/src/api/recoveryCodesApi.ts` |
| Agent | test-automation-developer |
| Reviewer | code-reviewer |
| Status | 🔴 Not Started |
| Est. Tests | 3-5 |

### Verification
```bash
npm test --prefix Source/WebClientApp -- --run
```

---

## Phase 5: WebClientApp Medium Priority

### Objective
Test Encounter Editor UI components.

### Tasks

#### 5.1 EncounterCanvas Tests
- File: `Source/WebClientApp/src/components/encounter/EncounterCanvas.test.tsx`
- Est. Tests: 6-8

#### 5.2 GridRenderer Tests
- File: `Source/WebClientApp/src/components/encounter/GridRenderer.test.tsx`
- Est. Tests: 4-6

#### 5.3 EditorDialogs Tests
- File: `Source/WebClientApp/src/components/encounter/EditorDialogs.test.tsx`
- Est. Tests: 6-8

#### 5.4 ToolPanel Tests
- File: `Source/WebClientApp/src/components/encounter/ToolPanel.test.tsx`
- Est. Tests: 4-6

#### 5.5 LayerPanel Tests
- File: `Source/WebClientApp/src/components/encounter/LayerPanel.test.tsx`
- Est. Tests: 4-6

#### 5.6 PropertiesPanel Tests
- File: `Source/WebClientApp/src/components/encounter/PropertiesPanel.test.tsx`
- Est. Tests: 6-8

#### 5.7 AssetMenu Tests
- File: `Source/WebClientApp/src/components/encounter/AssetMenu.test.tsx`
- Est. Tests: 6-8

#### 5.8 WallMenu Tests
- File: `Source/WebClientApp/src/components/encounter/WallMenu.test.tsx`
- Est. Tests: 4-6

#### 5.9 RegionMenu Tests
- File: `Source/WebClientApp/src/components/encounter/RegionMenu.test.tsx`
- Est. Tests: 4-6

#### 5.10 ZoomControls Tests
- File: `Source/WebClientApp/src/components/encounter/ZoomControls.test.tsx`
- Est. Tests: 7-9


#### 5.12 encounterSlice Tests
- File: `Source/WebClientApp/src/store/slices/encounterSlice.test.ts`
- Est. Tests: 13-15

### Verification
```bash
npm test --prefix Source/WebClientApp -- --run
```

---

## Progress Tracking

### Phase 1: WebAdminApp Critical
| Task | Status | Tests | Notes |
|------|--------|-------|-------|
| 1.1 LoginPage | 🟢 | 27/10 | Grade A, complete |
| 1.2 AuthService | 🟢 | 18/8 | Grade A, complete |
| 1.3 JobsSlice | 🟢 | 43/15 | Grade A, complete |
| 1.4 UserListPage | 🟢 | 25/10 | Grade A (after fixes) |
| 1.5 AdminLayout | 🟢 | 27/7 | Grade A, complete |
| 1.6 DashboardPage | 🟢 | 7/6 | Grade B, complete |
| 1.7 UserDetailModal | 🟢 | 26/8 | Grade B+, complete |
| 1.8 ConfigurationPage | 🟢 | 8/6 | Grade B+, complete |

### Phase 2: WebAdminApp High Priority
| Task | Status | Tests | Notes |
|------|--------|-------|-------|
| 2.1 BulkAssetGenerationPage | 🟢 | 25/7 | Grade A |
| 2.2 AuditLogsPage | 🟢 | 36/7 | Grade B (fixed) |
| 2.3 HealthStatusCard | 🟢 | 22/6 | Grade B |
| 2.4 RoleManagement | 🟢 | 30/5 | Grade B+ |
| 2.5 useAdminAuth | ⏭️ | 0/6 | Skipped - hook doesn't exist |
| 2.6 Remaining Components | 🟢 | 111/15 | RecentActivityFeed(41)+JobStatusCard(70) |

### Phase 3: WebClientApp Critical
| Task | Status | Tests | Notes |
|------|--------|-------|-------|
| 3.1 useContentLibrary | ⏭️ | 0/8 | Skipped - hook doesn't exist |
| 3.2 useAutoSave | 🟢 | 20/8 | Complete |
| 3.3 useInfiniteScroll | 🟢 | 27/6 | Complete |
| 3.4 AdventureListView | 🟢 | 0/7 | Complete |
| 3.5 CampaignListView | 🟢 | 0/7 | Complete |
| 3.6 WorldListView | 🟢 | 0/6 | Complete |
| 3.7 EncounterListView | 🟢 | 0/7 | Complete |
| 3.8 ContentLibraryPage | 🟢 | 0/7 | Complete |
| 3.9 securityApi | 🟢 | 16/5 | Complete |
| 3.10 profileApi | 🟢 | 34/5 | Complete |
| 3.11 ContentCard (shared) | 🟢 | - | Complete |
| 3.12 EditableTitle (shared) | 🟢 | - | Complete |
| 3.13 Card components (4) | 🟢 | - | Complete - Adventure/Campaign/World/EncounterCard |
| 3.14 DetailPages (3) | 🟢 | - | Complete - Adventure/Campaign/WorldDetailPage |

### Phase 4: WebClientApp High Priority
| Task | Status | Tests | Notes |
|------|--------|-------|-------|
| 4.1 AssetLibraryPage | 🟢 | 0/7 | Complete |
| 4.2 MediaLibraryPage | 🟢 | 0/7 | Complete |
| 4.3 AssetStudioPage | 🟢 | 0/7 | Complete |
| 4.4 LoginPage | 🟢 | 0/6 | Complete |
| 4.5 SimpleLoginForm | 🟢 | 0/7 | Complete |
| 4.6 PasswordResetConfirmForm | 🟢 | 0/6 | Complete |
| 4.7 twoFactorApi | 🟢 | 44/4 | Complete |
| 4.8 recoveryCodesApi | 🟢 | 32/3 | Complete |
| 4.9 ProtectedRoute | 🟢 | - | Complete (security critical) |
| 4.10 SimpleRegistrationForm | 🟢 | - | Complete (security critical) |
| 4.11 PasswordResetRequestForm | 🟢 | - | Complete (security critical) |
| 4.12 SecuritySettings | 🟢 | - | Complete |
| 4.13 ProfileSettings | 🟢 | - | Complete |

### Phase 5: WebClientApp Medium Priority
| Task | Status | Tests | Notes |
|------|--------|-------|-------|
| 5.1 EncounterCanvas | 🔴 | 0/6 | |
| 5.2 GridRenderer | 🔴 | 0/4 | |
| 5.3 EditorDialogs | 🔴 | 0/6 | |
| 5.4 ToolPanel | 🔴 | 0/4 | |
| 5.5 LayerPanel | 🔴 | 0/4 | |
| 5.6 PropertiesPanel | 🔴 | 0/6 | |
| 5.7 AssetMenu | 🔴 | 0/6 | |
| 5.8 WallMenu | 🔴 | 0/4 | |
| 5.9 RegionMenu | 🔴 | 0/4 | |
| 5.10 ZoomControls | 🔴 | 0/7 | |
| 5.12 encounterSlice | 🔴 | 0/13 | |

---

## Resuming Instructions

1. Read this ROADMAP.md to find current progress
2. Look for tasks with 🟡 In Progress status
3. Continue from the last incomplete task
4. Update progress as you complete tasks
5. Run tests to verify: `npm test -- {TestFile}.test.ts --run`

---

**Version**: 1.0
**Last Updated**: 2026-01-03
