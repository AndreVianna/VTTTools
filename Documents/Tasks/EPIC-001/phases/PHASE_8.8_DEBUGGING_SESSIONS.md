# Phase 8.8 - Debugging Sessions Log

**Phase**: 8.8 Manual Testing & UI Refinements
**Created**: 2025-11-11
**Status**: Active

---

## Session 1: Wall Merge Detection Bug (2025-11-11)

### Problem Statement

**Symptoms:**
- Wall extension not working - two walls created instead of merging
- Enter/Escape keys not ending wall placement during drawing
- No console logs, no API calls triggered
- Silent failure during merge detection

**User Report:** "When I extend a wall by placing the first new node on top of the last node of a wall, the walls are not being extended. 2 walls are being saved."

---

### Root Cause Analysis

#### Bug #1: Array Index vs wall.index Property Mismatch

**File**: `Source/WebClientApp/src/utils/wallMergeUtils.ts`
**Lines**: 111-148

**Problem:**
- `canMergeWalls` function used `collision.existingWallIndex` (array position) directly as wall identifier
- Wall entity has separate `index` property that doesn't match array position
- Example: Wall at array position 0 has `wall.index = 1`
- Merge detection returned `targetWallIndex: 0` but handler looked for wall with `index: 0`
- Wall lookup failed silently, merge never completed

**Evidence:**
```typescript
// Console logs showed:
existingWallsDetail: [{ index: 1, ... }]  // Wall has index: 1
targetWallIndex: 0                          // Returns array position 0
// Handler searches: encounter.walls?.find(w => w.index === 0)  // Not found!
```

**Fix Applied:**
```typescript
// BEFORE (bug):
for (const collision of firstPoleCollisions) {
    mergePoints.push({
        wallIndex: collision.existingWallIndex,  // Array position
        ...
    });
    involvedWallIndices.add(collision.existingWallIndex);
}

// AFTER (fixed):
for (const collision of firstPoleCollisions) {
    const wall = existingWalls[collision.existingWallIndex];
    if (!wall) continue;

    mergePoints.push({
        wallIndex: wall.index,  // Use wall.index property
        ...
    });
    involvedWallIndices.add(wall.index);
}
```

**Impact**: Critical - Blocked all wall merge scenarios (Scenario 3, 5)

---

#### Bug #2: Keyboard Event Propagation Blocked

**File**: `Source/WebClientApp/src/pages/EncounterEditorPage.tsx`
**Lines**: 333-348

**Problem:**
- `useKeyboardState` hook intercepted Enter/Escape keys at page level with `capture: true`
- Called `preventDefault()` and `stopPropagation()` for all modes
- Events never reached `WallDrawingTool` component's keyboard handler
- `WallDrawingTool.handleFinish` contains merge/split detection logic
- Without reaching this handler, merge detection never ran

**Three-Level Event Hierarchy:**
```
useKeyboardState (capture phase, preventDefault/stopPropagation)
    ↓ BLOCKED
EncounterEditorPage (handlers defined here)
    ↓ BLOCKED
WallDrawingTool (merge/split detection here)
```

**Fix Applied:**
```typescript
// BEFORE (bug):
const keyboardState = useKeyboardState({
    gridConfig,
    onEscapeKey: () => { /* always defined */ },
    onEnterKey: () => { /* always defined */ }
});

// AFTER (fixed):
const keyboardState = useKeyboardState({
    gridConfig,
    // When drawing, omit handlers so events propagate to WallDrawingTool
    ...(drawingMode !== 'wall' && drawingMode !== 'region' && {
        onEscapeKey: () => {
            if (isEditingVertices && wallTransaction.transaction.isActive) {
                wallHandlers.handleCancelEditing();
            } else if (assetManagement?.draggedAsset) {
                assetManagement.setDraggedAsset(null);
            }
        },
        onEnterKey: () => {
            if (isEditingVertices && wallTransaction.transaction.isActive) {
                wallHandlers.handleFinishEditing();
            }
        }
    })
});
```

**Impact**: Critical - Blocked all keyboard-triggered operations during placement

---

#### Bug #3: Current Wall Not Excluded from Merge Detection

**File**: `Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx`
**Line**: 57

**Problem:**
- During wall drawing, temporary wall (index: -1) was included in `existingWalls`
- Merge detection compared new wall against itself
- Caused false positive merges

**Fix Applied:**
```typescript
// BEFORE (bug):
const existingWalls = encounter.walls || [];

// AFTER (fixed):
const existingWalls = (encounter.walls || []).filter(w => w.index !== wallIndex);
```

**Impact**: Medium - Caused incorrect merge detections

---

### Bug Reintroduction Issue

**Problem:** Critical fix (array index → wall.index) was lost during TypeScript error cleanup

**Cause:**
- Launched 6 parallel frontend-developer agents to fix 127 TypeScript errors
- Agents successfully reduced errors from 127 to 0
- But array index fix in `wallMergeUtils.ts` was reverted during cleanup
- Manual re-verification needed after mass automated changes

**Lesson Learned:** After automated code cleanup, manually verify critical business logic fixes remain intact

---

### TypeScript Strict Mode Issue

**File**: `Source/WebClientApp/src/pages/EncounterEditorPage.tsx`
**Error**: `exactOptionalPropertyTypes: true` rejects explicit `undefined` values

**Problem:**
```typescript
// This fails with exactOptionalPropertyTypes: true
onEnterKey: drawingMode === 'wall' ? undefined : () => { ... }
```

**Solution:**
```typescript
// Use conditional spread to omit properties entirely
...(drawingMode !== 'wall' && drawingMode !== 'region' && {
    onEnterKey: () => { ... }
})
```

**Pattern:** When optional properties can't be set to `undefined`, omit them from object literal using conditional spread

---

### Code Cleanup

All debug console.log statements removed, unnecessary comments removed:
- `WallDrawingTool.tsx` - 13 console logs removed
- `useKeyboardState.ts` - Debug logs removed
- `EncounterEditorPage.tsx` - Comment blocks removed

---

### Verification Status

✅ **Lint**: 0 errors, 0 warnings
✅ **Type-check**: 0 errors
✅ **Enter/Escape Keys**: Working during placement and editing
✅ **Wall Merge**: Detection using correct wall.index properties
✅ **Critical Fixes**: All preserved after cleanup

---

## Technical Patterns Discovered

### Pattern 1: Conditional Event Handler Propagation

**Use Case:** Allow component hierarchy to selectively handle events based on application state

**Implementation:**
```typescript
const keyboardState = useKeyboardState({
    gridConfig,
    // Omit handlers conditionally to allow event propagation
    ...(condition && {
        onEventKey: () => { /* handler */ }
    })
});
```

**When to Use:**
- Multi-level keyboard handling (page → toolbar → drawing tool)
- Different handlers needed for different modes (editing vs drawing)
- Child components have mode-specific logic that shouldn't run for all modes

---

### Pattern 2: Entity Index vs Array Position

**Problem:** Arrays of entities where entity.index !== array position

**Rule:** Always use entity.index property, never array position

**Example:**
```typescript
// ❌ WRONG: Using array position
const targetWallIndex = collisions[0].arrayPosition;

// ✅ CORRECT: Using entity index
const wall = walls[collisions[0].arrayPosition];
const targetWallIndex = wall.index;
```

**Why:** Entities can be reordered, filtered, or have gaps in index sequences

---

### Pattern 3: TypeScript exactOptionalPropertyTypes Compliance

**Problem:** Can't pass `undefined` to optional properties with strict mode

**Solutions:**

1. **Conditional Spread (Preferred):**
```typescript
{
    ...obj,
    ...(condition && { optionalProp: value })
}
```

2. **Omit Property Entirely:**
```typescript
const props = { required: value };
if (condition) {
    props.optional = value;
}
```

3. **Update Type Definition (Last Resort):**
```typescript
interface Props {
    optional?: string | undefined;  // Explicitly allow undefined
}
```

---

### Pattern 4: React Event Capture Phase Interception

**Architecture:**
```
window.addEventListener('keydown', handler, { capture: true })  // Runs first
    ↓
Page-level handlers
    ↓
Component handlers (bubble phase)
```

**Rule:** Higher-level handlers should conditionally call `preventDefault()/stopPropagation()` based on application state

**Implementation:**
```typescript
// In capture phase handler
if (shouldHandle) {
    e.preventDefault();
    e.stopPropagation();
    handler();
}
// else: let event propagate to child components
```

---

## Debugging Strategies Used

### Strategy 1: Parallel Agent Deployment

**Approach:** Launch multiple specialized agents simultaneously for different error categories

**Execution:**
- 6 frontend-developer agents launched in single message
- Categories: unit tests, integration tests, handlers, pages, components, utilities
- Model selection: Used `haiku` for simple fixes to minimize cost

**Results:**
- Reduced errors from 127 to 0
- All agents completed successfully
- Total time: ~20 minutes (parallel execution)

**Caution:** Must manually re-verify critical business logic after mass cleanup

---

### Strategy 2: Targeted Debug Logging

**Approach:** Add logs at each layer of event/data flow to trace execution path

**Locations:**
1. Entry point (keyboard event capture)
2. Page-level routing decision
3. Component handler invocation
4. Business logic execution (merge detection)
5. API call/state update

**Execution:**
```typescript
console.log('[Component] Event received:', { key, mode, state });
console.log('[Component] Calling handler:', { handler: handler.name });
console.log('[Component] Handler result:', result);
```

**Pattern:** Use consistent prefix format `[Component] Action:` for easy log filtering

---

### Strategy 3: Evidence-Based Root Cause Analysis

**Approach:** Collect concrete evidence before jumping to solutions

**Evidence Collection:**
1. Console logs showing exact values at failure point
2. Array/object inspection showing structure mismatches
3. Event flow tracing showing where propagation stopped
4. Type error messages showing exact type conflicts

**Example from this session:**
```
Evidence: existingWallsDetail: [{ index: 1 }]
Evidence: targetWallIndex: 0
Evidence: Target wall found: false
Conclusion: Array position used instead of wall.index property
```

---

## Files Modified

### Critical Fixes
1. `Source/WebClientApp/src/utils/wallMergeUtils.ts` (lines 111-148)
   - Convert array indices to wall.index properties
   - Add null checks for wall lookups

2. `Source/WebClientApp/src/pages/EncounterEditorPage.tsx` (lines 333-348)
   - Conditional keyboard handler registration
   - Use spread operator for TypeScript strict mode compliance

3. `Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx` (line 57)
   - Filter current wall from existingWalls
   - Add wallIndex to handleFinish dependencies (line 90)

### Supporting Files
4. `Source/WebClientApp/src/pages/EncounterEditor/hooks/useKeyboardState.ts`
   - Maintains conditional preventDefault/stopPropagation logic

---

## Lessons Learned

### Lesson 1: Entity Index Management
Always distinguish between:
- **Array position**: Where entity is in the array (0, 1, 2...)
- **Entity index**: Entity's ID property (could be any number, may have gaps)

Use entity.index for all operations involving entity identity.

---

### Lesson 2: Event Propagation Architecture
Multi-level event handling requires careful coordination:
- Higher levels should conditionally handle based on state
- Lower levels need events to reach them for mode-specific logic
- Document the event hierarchy clearly

---

### Lesson 3: TypeScript Strict Mode Compliance
`exactOptionalPropertyTypes: true` requires:
- Never pass explicit `undefined` to optional properties
- Use conditional spread: `...(condition && { prop: value })`
- Or omit property entirely from object literal

---

### Lesson 4: Automated Cleanup Risks
Mass automated fixes (127 errors fixed by 6 agents):
- ✅ Extremely efficient for systematic errors
- ⚠️ Can revert critical business logic fixes
- 🔍 Always manually verify critical paths after cleanup
- 📝 Document critical fixes before running cleanup

---

### Lesson 5: Debug Logging Strategy
Effective debugging requires:
1. Consistent log format: `[Component] Action: data`
2. Log at every layer of execution flow
3. Remove all logs after debugging complete
4. Never commit debug logs to repository

---

## Related Memory Entries

See MCP Memory for detailed entity relationships:
- "Wall Merge Bug - Array Index vs Wall.index"
- "Keyboard Event Propagation Issue"
- "Wall Drawing Tool Architecture"
- "TypeScript exactOptionalPropertyTypes Pattern"
- "React Event Handler Cleanup Strategy"
- "Wall Merge Detection Flow"
- "Keyboard Event Hierarchy Pattern"

---

## Next Steps

1. ✅ Wall merge detection working with correct indices
2. ✅ Keyboard events working for placement and editing
3. ✅ Code cleaned (no debug logs, no unnecessary comments)
4. ✅ TypeScript errors resolved (0 errors)
5. ✅ Lint errors resolved (0 errors, 0 warnings)
6. 🔄 Continue manual testing of remaining wall placement scenarios
7. 🔄 Test wall split scenarios (Scenarios 6, 7, 8)
8. 🔄 Test closed wall scenarios (Scenarios 4, 5)

---

## Quality Metrics

**Time Spent:** ~4 hours debugging + 1 hour TypeScript cleanup + 0.5 hours documentation
**Errors Fixed:** 3 critical bugs + 127 TypeScript errors
**Test Status:** Manual testing in progress
**Code Quality:** Lint ✅ | Type-check ✅ | No debug logs ✅

---

<!--
Session Template for Future Debugging

## Session N: [Problem Title] (YYYY-MM-DD)

### Problem Statement
[Symptoms, user report, error messages]

### Root Cause Analysis
[What was wrong, why it happened, evidence]

### Fix Applied
[Code changes, before/after]

### Verification Status
[Test results, metrics]

### Lessons Learned
[Patterns, strategies, insights]
-->
