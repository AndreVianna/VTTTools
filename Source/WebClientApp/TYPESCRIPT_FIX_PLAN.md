# TypeScript Error Fix Plan

## Summary
- **Total Errors**: 1,511 across 104 files
- **Source Files**: 30 files with errors
- **Test Files**: 74 files with errors

---

## Error Categories

| Error Code | Count | Description | Fix Strategy |
|------------|-------|-------------|--------------|
| TS2322 | 971 | Type not assignable | Cast `vi.fn()` mocks properly |
| TS2345 | 176 | Argument type mismatch | Add proper type annotations |
| TS2379 | 107 | Getter return type | Fix property accessors |
| TS2739 | 84 | Missing properties | Add missing props to mock objects |
| TS2339 | 41 | Property doesn't exist | Fix type imports/definitions |
| Others | 132 | Various | Case-by-case fixes |

---

## Phase 1: Source Files (Priority - Production Code)

### 1.1 Encounter Components (5 files)
- `src/components/encounter/EncounterMenu.tsx`
- `src/components/encounter/EncounterPropertiesPanel.tsx`
- `src/components/encounter/index.ts`
- `src/components/encounter/panels/GridPanel.tsx`

### 1.2 Content Library Components (4 files)
- `src/features/content-library/components/adventures/AdventureListView.tsx`
- `src/features/content-library/components/campaigns/CampaignListView.tsx`
- `src/features/content-library/components/encounters/EncounterListView.tsx`
- `src/features/content-library/types/encounter.ts`

### 1.3 Encounter Hooks (4 files)
- `src/hooks/encounter/useAssetManagement.ts`
- `src/hooks/encounter/useFogOfWarManagement.ts`
- `src/hooks/encounter/useScopeChangeHandler.ts`
- `src/hooks/encounter/useSourceSelection.ts`

### 1.4 Pages (11 files)
- `src/pages/AssetLibrary/components/AssetLibraryContent.tsx`
- `src/pages/AssetLibraryPage.tsx`
- `src/pages/EncounterEditor/components/DrawingToolsLayer.tsx`
- `src/pages/EncounterEditor/components/GameWorldLayer.tsx`
- `src/pages/EncounterEditor/handlers/canvasHandlers.ts`
- `src/pages/EncounterEditor/handlers/structureHandlers.ts`
- `src/pages/EncounterEditorPage.tsx`
- `src/pages/EncounterPage.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/MediaLibrary/components/MediaLibraryContent.tsx`
- `src/pages/MediaLibraryPage.tsx`
- `src/pages/settings/SecuritySettingsPage.tsx`

### 1.5 Services & Test Utils (6 files)
- `src/services/mockApi.ts`
- `src/tests/msw/handlers/encounter.ts`
- `src/tests/msw/handlers/stage.ts`
- `src/tests/utils/createTestStore.ts`
- `src/tests/utils/mockFactories.ts`
- `src/test-utils/assetMocks.ts`

---

## Phase 2: Test Files (74 files)

### Common Fix Patterns

#### Pattern A: vi.fn() Mock Typing
```typescript
// BEFORE (error)
const mockFn = vi.fn();
<Component onSomething={mockFn} />

// AFTER (fixed)
const mockFn = vi.fn<[ParamType], ReturnType>();
// OR
const mockFn = vi.fn() as unknown as (param: ParamType) => ReturnType;
```

#### Pattern B: Missing MediaResource Properties
```typescript
// BEFORE (error)
const mockResource = {
  id: 'test',
  path: '/test',
  // missing name, description, tags
};

// AFTER (fixed)
const mockResource: MediaResource = {
  id: 'test',
  path: '/test',
  name: 'test',
  description: null,
  tags: [],
  // ... other required props
};
```

#### Pattern C: Missing StageSettings Properties
```typescript
// BEFORE (error)
settings: {
  zoomLevel: 1,
  // missing useAlternateBackground, ambientSoundSource
}

// AFTER (fixed)
settings: {
  zoomLevel: 1,
  useAlternateBackground: false,
  ambientSoundSource: AmbientSoundSource.NotSet,
  // ... other required props
}
```

### Test File Groups

1. **Asset Components** (10 files) - 353 errors
2. **Encounter Components** (15 files) - 115 errors
3. **Content Library** (10 files) - 63 errors
4. **Hooks** (15 files) - 462 errors
5. **Commands** (4 files) - 243 errors
6. **Pages** (3 files) - 8 errors
7. **Services/Store** (4 files) - 26 errors
8. **Types/Utils** (5 files) - 42 errors
9. **Other** (8 files) - Various

---

## Execution Strategy

1. **Fix source files first** (Phase 1) - These affect production
2. **Fix test infrastructure** (mockFactories, createTestStore, assetMocks)
3. **Fix test files** by category, starting with highest error counts
4. **Verify after each phase** with `npm run type-check`

---

## Verification Command

```bash
node -e "
const { spawnSync } = require('child_process');
const result = spawnSync('npx', ['tsc', '--noEmit'], {
  encoding: 'utf8', shell: true, cwd: process.cwd()
});
console.log('Errors:', (result.stdout.match(/error TS/g) || []).length);
console.log('Exit:', result.status);
"
```
