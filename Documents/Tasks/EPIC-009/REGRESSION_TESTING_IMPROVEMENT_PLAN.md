# Regression Testing Improvement Plan

## Executive Summary

This plan addresses the 40-50% regression testing gap identified in the EPIC-009 review. The goal is to increase regression detection capability to 80%+ by implementing three work streams.

**Current State**: 40-50% regression detection capability
**Target State**: 80%+ regression detection capability
**Estimated Effort**: 5-6 days total

---

## Work Stream 1: API Behavioral Tests (Priority 1)

### Objective
Add RTK Query API tests for untested API services to catch backend contract changes.

### Files to Create

| # | Test File | Source File | Endpoints | Est. Tests |
|---|-----------|-------------|-----------|------------|
| 1.1 | `services/authApi.test.ts` | `authApi.ts` | 24 endpoints | 45-50 |
| 1.2 | `services/adventuresApi.test.ts` | `adventuresApi.ts` | 9 endpoints | 25-30 |
| 1.3 | `services/campaignsApi.test.ts` | `campaignsApi.ts` | ~8 endpoints | 20-25 |
| 1.4 | `services/worldsApi.test.ts` | `worldsApi.ts` | ~8 endpoints | 20-25 |
| 1.5 | `services/contentApi.test.ts` | `contentApi.ts` | ~5 endpoints | 15-20 |

**Total: ~125-150 tests**

### Test Pattern (Based on encounterApi.test.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './authApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('authApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                [authApi.reducerPath]: authApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(authApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            expect(authApi.reducerPath).toBe('authApi');
        });
    });

    describe('endpoint definitions', () => {
        it('should define login endpoint', () => {
            expect(authApi.endpoints.login).toBeDefined();
            expect(authApi.endpoints.login.useMutation).toBeDefined();
        });
        // ... more endpoint tests
    });

    describe('hook exports', () => {
        it('should export useLoginMutation hook', async () => {
            const api = await import('./authApi');
            expect(typeof api.useLoginMutation).toBe('function');
        });
        // ... more hook tests
    });
});
```

### authApi.test.ts Endpoints (24 total)

**Authentication (6 endpoints)**
- `login` - POST /login
- `logout` - POST /logout
- `getCurrentUser` - GET /me
- `register` - POST /register
- `refreshAuth` - POST /refresh

**Password Management (3 endpoints)**
- `resetPassword` - POST /password/forgot
- `confirmResetPassword` - PUT /password/reset
- `changePassword` - POST /change-password

**Two-Factor Authentication (6 endpoints)**
- `setupTwoFactor` - POST /two-factor/setup
- `enableTwoFactor` - POST /two-factor/enable
- `disableTwoFactor` - POST /two-factor/disable
- `verifyTwoFactor` - POST /two-factor/verify
- `verifyRecoveryCode` - POST /two-factor/recovery
- `generateRecoveryCodes` - POST /two-factor/recovery-codes

**External Login (5 endpoints)**
- `externalLogin` - POST /external-login
- `getExternalProviders` - GET /external-providers
- `externalLoginCallback` - POST /external-login/callback
- `linkExternalLogin` - POST /external-login/link
- `unlinkExternalLogin` - POST /external-login/unlink

**Profile (3 endpoints)**
- `updateProfile` - PUT /profile
- `confirmEmail` - POST /confirm-email
- `resendEmailConfirmation` - POST /resend-confirmation-email

### adventuresApi.test.ts Endpoints (9 total)

- `getAdventures` - GET /
- `getAdventure` - GET /:id
- `createAdventure` - POST /
- `updateAdventure` - PATCH /:id
- `deleteAdventure` - DELETE /:id
- `cloneAdventure` - POST /:id/clone
- `getEncounters` - GET /:id/encounters
- `createEncounter` - POST /:id/encounters
- `searchAdventures` - GET /search

### Execution Order
1. `authApi.test.ts` first (critical for auth regression)
2. `adventuresApi.test.ts` and `campaignsApi.test.ts` in parallel
3. `worldsApi.test.ts` and `contentApi.test.ts` in parallel

---

## Work Stream 2: Common Components + Redux Slices (Priority 2)

### Objective
Add tests for shared UI components and Redux slices that are used across features.

### Files to Create

| # | Test File | Source File | Tests |
|---|-----------|-------------|-------|
| 2.1 | `components/common/ConfirmDialog.test.tsx` | `ConfirmDialog.tsx` | 15-18 |
| 2.2 | `components/common/LoadingOverlay.test.tsx` | `LoadingOverlay.tsx` | 8-10 |
| 2.3 | `components/common/PrecisionNumberInput.test.tsx` | `PrecisionNumberInput.tsx` | 15-18 |
| 2.4 | `components/common/SizeSelector.test.tsx` | `SizeSelector.tsx` | 12-15 |
| 2.5 | `store/slices/errorSlice.test.ts` | `errorSlice.ts` | 25-30 |
| 2.6 | `store/slices/uiSlice.test.ts` | `uiSlice.ts` | 20-25 |

**Total: ~95-116 tests**

### ConfirmDialog.test.tsx Test Cases

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('ConfirmDialog', () => {
    const defaultProps: ConfirmDialogProps = {
        open: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Confirm Action',
        message: 'Are you sure?',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render dialog when open', () => { });
        it('should not render dialog when closed', () => { });
        it('should display title', () => { });
        it('should display message', () => { });
        it('should display default button text', () => { });
        it('should display custom button text', () => { });
    });

    describe('severity variants', () => {
        it('should apply warning color by default', () => { });
        it('should apply error color for error severity', () => { });
        it('should apply info color for info severity', () => { });
    });

    describe('user interactions', () => {
        it('should call onConfirm when confirm button clicked', () => { });
        it('should call onClose when cancel button clicked', () => { });
        it('should not close on backdrop click', () => { });
        it('should close on escape key', () => { });
    });

    describe('loading state', () => {
        it('should show loading spinner when isLoading', () => { });
        it('should disable buttons when isLoading', () => { });
        it('should not close on escape when isLoading', () => { });
    });

    describe('accessibility', () => {
        it('should have proper aria-labelledby', () => { });
        it('should have proper aria-describedby', () => { });
    });
});
```

### errorSlice.test.ts Test Cases

```typescript
import { describe, expect, it, beforeEach, vi } from 'vitest';
import errorReducer, {
    addError,
    removeError,
    markErrorRecovered,
    clearAllErrors,
    clearErrorsByType,
    incrementRetryAttempt,
    clearRetryAttempts,
    markErrorReported,
    setUserErrorsVisible,
    setErrorReportingEnabled,
    setGlobalError,
    clearOldErrors,
    selectErrors,
    selectGlobalError,
    type ErrorState,
} from './errorSlice';

describe('errorSlice', () => {
    const initialState: ErrorState = {
        errors: [],
        globalError: null,
        networkErrors: [],
        validationErrors: [],
        systemErrors: [],
        retryAttempts: {},
        maxRetryAttempts: 3,
        reportedErrors: [],
        userErrorsVisible: false,
        errorReportingEnabled: true,
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-03T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('addError', () => {
        it('should add error with generated id and timestamp', () => { });
        it('should categorize network errors', () => { });
        it('should categorize validation errors', () => { });
        it('should categorize system errors', () => { });
        it('should set global error for system type', () => { });
        it('should set global error for authentication type', () => { });
    });

    describe('removeError', () => {
        it('should remove error by id', () => { });
        it('should remove from categorized arrays', () => { });
        it('should clear global error if matching', () => { });
        it('should clean up retry attempts', () => { });
    });

    describe('markErrorRecovered', () => {
        it('should mark error as recovered', () => { });
        it('should clear global error if recovered', () => { });
    });

    describe('clearAllErrors', () => {
        it('should clear all error arrays', () => { });
        it('should clear retry attempts', () => { });
    });

    describe('clearErrorsByType', () => {
        it('should clear only network errors', () => { });
        it('should clear only validation errors', () => { });
    });

    describe('retry management', () => {
        it('should increment retry attempts', () => { });
        it('should clear retry attempts', () => { });
    });

    describe('clearOldErrors', () => {
        it('should remove errors older than maxAge', () => { });
        it('should keep recent errors', () => { });
    });

    describe('selectors', () => {
        it('selectErrors should return all errors', () => { });
        it('selectGlobalError should return global error', () => { });
        it('selectCanRetry should check max attempts', () => { });
    });
});
```

### uiSlice.test.ts Test Cases

```typescript
import { describe, expect, it, beforeEach, vi } from 'vitest';
import uiReducer, {
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebar,
    setRightSidebar,
    setGlobalLoading,
    setFeatureLoading,
    openModal,
    closeModal,
    clearModal,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    toggleTheme,
    showHelp,
    hideHelp,
    toggleTooltips,
    type UIState,
} from './uiSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('uiSlice', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('sidebar controls', () => {
        it('should toggle left sidebar', () => { });
        it('should toggle right sidebar', () => { });
        it('should set left sidebar explicitly', () => { });
        it('should set right sidebar explicitly', () => { });
    });

    describe('loading states', () => {
        it('should set global loading', () => { });
        it('should set feature-specific loading', () => { });
    });

    describe('modal management', () => {
        it('should open modal with data', () => { });
        it('should close modal', () => { });
        it('should clear modal completely', () => { });
    });

    describe('notifications', () => {
        it('should add notification with generated id', () => { });
        it('should add notification with default duration', () => { });
        it('should remove notification by id', () => { });
        it('should clear all notifications', () => { });
    });

    describe('theme management', () => {
        it('should set theme and persist to localStorage', () => { });
        it('should toggle between light and dark', () => { });
        it('should load theme from localStorage on init', () => { });
    });

    describe('help system', () => {
        it('should show help with topic', () => { });
        it('should hide help and clear topic', () => { });
        it('should toggle tooltips', () => { });
    });
});
```

---

## Work Stream 3: Encounter Transformers & Remaining Panels (Priority 3)

### Objective
Add unit tests for Konva-based transformer components and remaining panel components.

### Files to Create

| # | Test File | Source File | Tests |
|---|-----------|-------------|-------|
| 3.1 | `encounter/editing/RegionTransformer.test.tsx` | `RegionTransformer.tsx` | 18-22 |
| 3.2 | `encounter/editing/RegionBucketFillTool.test.tsx` | `RegionBucketFillTool.tsx` | 12-15 |
| 3.3 | `encounter/panels/SourcesPanel.test.tsx` | `SourcesPanel.tsx` | 15-18 |
| 3.4 | `encounter/panels/AssetsPanel.test.tsx` | `AssetsPanel.tsx` | 18-22 |
| 3.5 | `encounter/panels/HistoryPanel.test.tsx` | `HistoryPanel.tsx` | 12-15 |

**Total: ~75-92 tests**

### Konva Component Testing Strategy

For Konva-based components, use a mocking strategy similar to existing integration tests:

```typescript
// Mock Konva primitives
vi.mock('react-konva', () => ({
    Stage: vi.fn(({ children }) => <div data-testid="stage">{children}</div>),
    Layer: vi.fn(({ children }) => <div>{children}</div>),
    Rect: vi.fn(() => null),
    Transformer: vi.fn(() => null),
}));

// Mock Konva core
vi.mock('konva', () => ({
    default: {
        Rect: vi.fn(),
        Transformer: vi.fn(),
    },
}));
```

### RegionTransformer.test.tsx Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RegionTransformer } from './RegionTransformer';

// Mock Konva
vi.mock('react-konva', () => ({
    Transformer: vi.fn(({ onTransformEnd }) => (
        <div
            data-testid="transformer"
            onClick={() => onTransformEnd?.({ target: mockNode })}
        />
    )),
}));

describe('RegionTransformer', () => {
    describe('rendering', () => {
        it('should render when region is selected', () => { });
        it('should not render when no region selected', () => { });
    });

    describe('transform handling', () => {
        it('should call onTransformEnd with new bounds', () => { });
        it('should maintain minimum size constraints', () => { });
    });

    describe('selection', () => {
        it('should attach to selected region shape', () => { });
        it('should detach when region deselected', () => { });
    });
});
```

---

## Execution Timeline

### Day 1: Foundation
- [x] Create plan document
- [ ] `authApi.test.ts` (45-50 tests)

### Day 2: API Tests
- [ ] `adventuresApi.test.ts` (25-30 tests)
- [ ] `campaignsApi.test.ts` (20-25 tests)

### Day 3: API Tests + Common Components
- [ ] `worldsApi.test.ts` (20-25 tests)
- [ ] `contentApi.test.ts` (15-20 tests)
- [ ] `ConfirmDialog.test.tsx` (15-18 tests)

### Day 4: Common Components + Slices
- [ ] `LoadingOverlay.test.tsx` (8-10 tests)
- [ ] `PrecisionNumberInput.test.tsx` (15-18 tests)
- [ ] `SizeSelector.test.tsx` (12-15 tests)
- [ ] `errorSlice.test.ts` (25-30 tests)

### Day 5: Slices + Encounter
- [ ] `uiSlice.test.ts` (20-25 tests)
- [ ] `RegionTransformer.test.tsx` (18-22 tests)
- [ ] `RegionBucketFillTool.test.tsx` (12-15 tests)

### Day 6: Remaining Panels
- [ ] `SourcesPanel.test.tsx` (15-18 tests)
- [ ] `AssetsPanel.test.tsx` (18-22 tests)
- [ ] `HistoryPanel.test.tsx` (12-15 tests)

---

## Quality Gates (Per File)

- [ ] AAA pattern (Arrange, Act, Assert)
- [ ] Semantic queries only (NO data-testid/getByTestId)
- [ ] Proper async handling (waitFor, userEvent.setup)
- [ ] Mock cleanup (vi.clearAllMocks in beforeEach)
- [ ] Theme compliance (use palette colors)
- [ ] Tests pass: `npm test -- {file}.test.tsx --run`

---

## Commands

```bash
# Run specific test file
npm test -- services/authApi.test.ts --run

# Run all API tests
npm test -- services/*.test.ts --run

# Run common component tests
npm test -- components/common/*.test.tsx --run

# Run slice tests
npm test -- store/slices/*.test.ts --run

# Run encounter tests
npm test -- components/encounter/**/*.test.tsx --run
```

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| API Layer Coverage | 36% (4/11) | 82% (9/11) |
| Common Components | 7% (2/27) | 22% (6/27) |
| Redux Slices | 50% (2/4) | 100% (4/4) |
| Encounter Editor | 40% | 60% |
| **Regression Capability** | **40-50%** | **80%+** |

---

## File Path Reference

### Work Stream 1: API Tests
```
Source/WebClientApp/src/services/
├── authApi.test.ts         (NEW)
├── adventuresApi.test.ts   (NEW)
├── campaignsApi.test.ts    (NEW)
├── worldsApi.test.ts       (NEW)
├── contentApi.test.ts      (NEW)
├── encounterApi.test.ts    (EXISTS)
├── assetsApi.test.ts       (EXISTS)
├── stageApi.test.ts        (EXISTS)
└── enhancedBaseQuery.test.ts (EXISTS)
```

### Work Stream 2: Common Components + Slices
```
Source/WebClientApp/src/components/common/
├── ConfirmDialog.test.tsx         (NEW)
├── LoadingOverlay.test.tsx        (NEW)
├── PrecisionNumberInput.test.tsx  (NEW)
├── SizeSelector.test.tsx          (NEW)
├── EditableEncounterName.test.tsx (EXISTS)
├── SaveStatusIndicator.test.tsx   (EXISTS)
├── ConnectionStatusBanner.test.tsx (EXISTS)
└── EditingBlocker.test.tsx        (EXISTS)

Source/WebClientApp/src/store/slices/
├── errorSlice.test.ts      (NEW)
├── uiSlice.test.ts         (NEW)
├── authSlice.test.ts       (EXISTS)
└── encounterSlice.test.ts  (EXISTS)
```

### Work Stream 3: Encounter Transformers
```
Source/WebClientApp/src/components/encounter/
├── editing/
│   ├── RegionTransformer.test.tsx     (NEW)
│   ├── RegionBucketFillTool.test.tsx  (NEW)
│   └── WallTransformer.integration.test.tsx (EXISTS)
└── panels/
    ├── SourcesPanel.test.tsx  (NEW)
    ├── AssetsPanel.test.tsx   (NEW)
    ├── HistoryPanel.test.tsx  (NEW)
    ├── WallsPanel.test.tsx    (EXISTS)
    ├── RegionsPanel.test.tsx  (EXISTS)
    └── FogOfWarPanel.test.tsx (EXISTS)
```

---

## Dependencies

### Work Stream 1 (API Tests)
- No dependencies - can start immediately
- Pattern established in `encounterApi.test.ts`

### Work Stream 2 (Common + Slices)
- No dependencies - can run parallel with WS1
- Pattern established in `authSlice.test.ts` and `encounterSlice.test.ts`

### Work Stream 3 (Encounter)
- Depends on stable Konva mock patterns
- Pattern established in `WallTransformer.integration.test.tsx`

---

**Created**: 2026-01-03
**Status**: Ready for Implementation
