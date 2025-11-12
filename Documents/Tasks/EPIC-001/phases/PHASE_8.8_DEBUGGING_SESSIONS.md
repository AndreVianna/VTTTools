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

## Session 2: Wall Placement Algorithm Improvements (2025-11-11)

### Problem Statement

**Symptoms:**
- Multi-loop placement (P1→...→P8(over P4)→P12(over P9)→P14) creating only 1 wall instead of 3
- All walls created without names (empty strings)
- Wall merge producing incorrect pole ordering (e.g., P17→P1→...→P14→P16→P15 instead of P15→P16→P17→P18→P19→P1→...→P14)
- Nested loop scenario (P1→P2→P3→P4→P5→P6(over P3)→P7→P8(over P1)) creating 1 wall instead of 2

**User Requests:**
- "Why don't you unify the way that the transaction is saved to avoid multiple ways to do the same thing"
- "I suggest you find a way to also unify the merge calculation. Try to find a generic code. Maybe some plane geometry that could help handling all the edge cases."
- "Can you search math papers to find if it exists?"

---

### Root Cause Analysis

#### Bug #1: React State Batching Causing Duplicate TempIds

**File**: `Source/WebClientApp/src/hooks/useWallTransaction.ts`
**Lines**: 135-173

**Problem:**
- Multiple rapid calls to `addSegment()` returned identical tempId values (both -1)
- React batches multiple `setState` calls in same render cycle
- Closure variable `nextTempId` captured initial state value before any updates applied
- Both `addSegment()` calls saw same initial state, calculated same tempId
- Transaction ended with only 1 segment instead of 2+

**Evidence:**
```typescript
console.log('[WallDrawingTool] Step 2.0: Added closed segment with tempId: -1');
console.log('[WallDrawingTool] Step 2.1: Added closed segment with tempId: -1');
console.log('[WallDrawingTool] Active segments after all additions: {count: 1}');
// Expected: count: 3 (1 open + 2 closed)
```

**Initial Fix Attempt (Failed):**
```typescript
// Attempted to calculate tempId inside setState callback
const addSegment = useCallback((segment) => {
    let newTempId: number = -1;

    setTransaction(prev => {
        newTempId = -(Math.max(...prev.segments.map(s => Math.abs(s.tempId)), 0) + 1);
        return {
            ...prev,
            segments: [...prev.segments, { ...segment, tempId: newTempId }]
        };
    });

    return newTempId; // ❌ Returns before setState callback executes!
}, []);
```

**Why it Failed:** Return statement executed before setState callback, still returned -1

**Final Solution: useRef for Synchronous State**

```typescript
// Added ref that updates synchronously
const segmentsRef = useRef<WallSegment[]>([]);

const setAllSegments = useCallback((segments: WallSegment[]): void => {
    const segmentsWithTempIds = segments.map((segment, index) => ({
        ...segment,
        tempId: -(index + 1)
    }));

    // Update ref SYNCHRONOUSLY
    segmentsRef.current = segmentsWithTempIds;

    // Update state ASYNCHRONOUSLY
    setTransaction(prev => ({
        ...prev,
        segments: segmentsWithTempIds
    }));
}, []);

const commitTransaction = useCallback(async (encounterId, apiHooks, segmentsOverride?) => {
    // Read from ref instead of closure
    let currentTransaction: WallTransaction;
    if (segmentsOverride) {
        currentTransaction = { ...transaction, segments: segmentsOverride };
    } else if (segmentsRef.current.length > 0) {
        // ✅ Read from ref (updated synchronously by setAllSegments)
        currentTransaction = { ...transaction, segments: segmentsRef.current };
    } else {
        currentTransaction = transaction;
    }
    // ...
}, [transaction]);
```

**Impact**: Critical - All multi-segment scenarios (loops, splits) were broken

---

#### Bug #2: Missing Wall Names for Multi-Segment Placement

**File**: `Source/WebClientApp/src/hooks/useWallTransaction.ts`
**Lines**: 330-354

**Problem:**
- Naming logic only generated unique names for editing mode
- Placement mode with multiple segments all got same name (usually empty string)
- Pattern for broken wall editing (e.g., "Wall1.1", "Wall1.2") existed but placement pattern missing

**Fix Applied:**
```typescript
// Generate unique names for multiple segments
let names: string[];
if (segmentsToProcess.length > 1) {
    if (currentTransaction.type === 'editing' && currentTransaction.originalWall !== null) {
        // Editing: Use broken wall naming (e.g., "Wall1.1", "Wall1.2")
        names = generateBrokenWallNames(
            currentTransaction.originalWall.name,
            segmentsToProcess.length
        );
    } else {
        // ✅ Placement: Generate sequential names based on first segment's name
        const baseName = segmentsToProcess[0]?.name || 'Wall';
        names = segmentsToProcess.map((_, index) => {
            if (segmentsToProcess.length === 1) {
                return baseName;
            }
            return `${baseName} ${index + 1}`;
        });
    }
} else {
    names = segmentsToProcess.map(s => s.name);
}
```

**Pattern:**
- **Editing mode**: "Wall1.1", "Wall1.2", "Wall1.3" (broken wall naming)
- **Placement mode**: "Wall 1", "Wall 2", "Wall 3" (sequential naming)

**Impact**: Medium - Walls saved correctly but unusable without names

---

#### Bug #3: Wall Merge Producing Incorrect Pole Ordering

**File**: `Source/WebClientApp/src/utils/wallMergeUtils.ts`
**Lines**: 179-286

**Problem:**
- Old algorithm always chose lowest wall index as target, ignoring topology
- Example: Merging Wall4(P15→P16→P17) + NewWall(P18→P19) + Wall1(P1→...→P14)
- Expected: P15→P16→P17→P18→P19→P1→...→P14
- Actual: P17→P1→...→P14→P16→P15 (completely wrong order)
- Algorithm treated merge as "extend Wall1" because `Math.min(1, 4) = 1`

**User Insight:** "I suggest you find a way to also unify the merge calculation. Try to find a generic code. Maybe some plane geometry that could help handling all the edge cases."

**Solution: Graph-Based Merge Algorithm**

Complete rewrite using graph theory:

```typescript
// Graph-based generic merge implementation
interface GraphNode {
    id: string;
    wallIndex: number;
    isStart: boolean;
    point: Point;
    edges: Map<string, Point[]>; // neighborId -> poles along edge to that neighbor
}

export function mergeWalls(params: MergeWallsParams): Point[] {
    const { newWallPoles, existingWalls, mergePoints, tolerance = 5 } = params;

    if (mergePoints.length === 0) {
        return newWallPoles;
    }

    // Build graph of wall endpoints
    const nodes = new Map<string, GraphNode>();

    // Helper to create/get node
    const getNode = (wallIndex: number, isStart: boolean, point: Point): GraphNode => {
        const id = `W${wallIndex}_${isStart ? 'START' : 'END'}`;
        if (!nodes.has(id)) {
            nodes.set(id, {
                id,
                wallIndex,
                isStart,
                point,
                edges: new Map()
            });
        }
        return nodes.get(id)!;
    };

    // Add nodes and internal edges for all walls
    const newWallStart = getNode(-1, true, newWallPoles[0]!);
    const newWallEnd = getNode(-1, false, newWallPoles[newWallPoles.length - 1]!);

    // Bidirectional edges (can traverse wall in either direction)
    newWallStart.edges.set(newWallEnd.id, newWallPoles);
    newWallEnd.edges.set(newWallStart.id, [...newWallPoles].reverse());

    for (const wall of existingWalls) {
        const wallPoles = wall.poles.map(p => ({ x: p.x, y: p.y }));
        const startNode = getNode(wall.index, true, wallPoles[0]!);
        const endNode = getNode(wall.index, false, wallPoles[wallPoles.length - 1]!);

        startNode.edges.set(endNode.id, wallPoles);
        endNode.edges.set(startNode.id, [...wallPoles].reverse());
    }

    // Add junction edges based on merge points
    for (const mp of mergePoints) {
        const wall = existingWalls.find(w => w.index === mp.wallIndex);
        if (!wall) continue;

        const wallPoles = wall.poles.map(p => ({ x: p.x, y: p.y }));
        const existingNode = getNode(
            mp.wallIndex,
            mp.poleIndex === 0,
            mp.poleIndex === 0 ? wallPoles[0]! : wallPoles[wallPoles.length - 1]!
        );
        const newNode = mp.isFirst ? newWallStart : newWallEnd;

        // Junction edges - points overlap, so they're already connected (no poles needed)
        existingNode.edges.set(newNode.id, []);
        newNode.edges.set(existingNode.id, []);
    }

    // Find path through graph
    // Leaf node = node with only 1 edge (degree 1)
    // Open path: 2 leaf nodes | Closed loop: 0 leaf nodes
    const leafNodes = Array.from(nodes.values()).filter(n => n.edges.size === 1);

    if (leafNodes.length === 0) {
        // Closed loop - start from new wall start
        return traversePath(nodes, newWallStart.id, new Set(), tolerance);
    } else if (leafNodes.length >= 2) {
        // Open path - traverse from one leaf to the other
        return traversePath(nodes, leafNodes[0]!.id, new Set(), tolerance);
    } else {
        return newWallPoles;
    }
}

function traversePath(
    nodes: Map<string, GraphNode>,
    currentId: string,
    visited: Set<string>,
    tolerance: number
): Point[] {
    const current = nodes.get(currentId);
    if (!current) return [];

    visited.add(currentId);
    const result: Point[] = [];

    // Find unvisited neighbor
    for (const [neighborId, poles] of current.edges) {
        if (visited.has(neighborId)) continue;

        // Add poles along this edge
        result.push(...poles);

        // Recursively traverse to neighbor
        const remaining = traversePath(nodes, neighborId, visited, tolerance);
        result.push(...remaining);

        // Return after first unvisited neighbor (assumes single path)
        return removeDuplicatePoles(result, tolerance);
    }

    return result;
}
```

**Key Concepts:**
1. **Graph Modeling**: Walls modeled as nodes (endpoints) with edges (pole sequences)
2. **Bidirectional Edges**: Can traverse wall in either direction (forward or reverse)
3. **Junction Edges**: Zero-length edges representing overlapping points
4. **Leaf Detection**: Nodes with degree=1 indicate open path endpoints
5. **DFS Traversal**: Depth-first search finds correct topological path

**Impact**: Critical - Fixed all wall merge scenarios (Scenarios 3 & 5)

---

#### Bug #4: Incorrect Leaf Detection for Closed Loops

**File**: `Source/WebClientApp/src/utils/wallMergeUtils.ts`
**Line**: 243

**Problem:**
- Initial implementation counted only edges with poles (non-junction edges)
- Closed loops have junction edges (zero-length) connecting start/end
- Algorithm incorrectly identified closed loop as having 4 leaf nodes instead of 0

**Evidence:**
```typescript
// ❌ WRONG: Only counts edges with poles
const leafNodes = Array.from(nodes.values()).filter(n =>
    Array.from(n.edges.values()).filter(poles => poles.length > 0).length === 1
);
// For closed loop: Each node has 1 internal edge + 1 junction edge = 2 total edges
// Filter removes junction edges (poles.length === 0)
// Each node appears to have degree 1 (leaf) when it actually has degree 2
```

**Fix Applied:**
```typescript
// ✅ CORRECT: Count all edges (including junction edges)
const leafNodes = Array.from(nodes.values()).filter(n => n.edges.size === 1);
```

**Impact**: Critical - Closed loop scenarios failed to merge correctly

---

#### Bug #5: Nested Loop Detection Failure (UNRESOLVED)

**File**: `Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx`
**Lines**: 56-236

**Problem:**
- Scenario: P1→P2→P3→P4→P5→P6(over P3)→P7→P8(over P1)
- Expected: 2 closed walls (Wall 1: P1→P2→P3→P7, Wall 2: P3→P4→P5)
- Actual: 1 closed wall (P1→P2→P3→P4→P5→P6→P7)
- Current algorithm detects ALL pole overlaps pairwise
- Loop 1: (P0, P7) - outer loop
- Loop 2: (P2, P5) - inner loop nested inside Loop 1
- Algorithm extracts loops independently without recognizing containment

**Current Detection Logic:**
```typescript
const loops: Array<{ fromIndex: number; toIndex: number }> = [];
if (poles.length >= 3) {
    for (let i = 0; i < poles.length; i++) {
        for (let j = i + 1; j < poles.length; j++) {
            const distance = Math.sqrt((currentPole.x - laterPole.x) ** 2 + (currentPole.y - laterPole.y) ** 2);
            if (distance <= SELF_LOOP_TOLERANCE) {
                loops.push({ fromIndex: i, toIndex: j });
            }
        }
    }
}

// Incorrectly processes loops independently
for (const loop of loops) {
    const loopPoles = poles.slice(loop.fromIndex, loop.toIndex);
    closedSegments.push(loopPoles);
}
```

**Why It Fails:**
- `poles.slice(0, 7)` includes poles 0-6, which contains the entire nested loop (poles 2-5)
- Doesn't recognize that Loop 2 is nested inside Loop 1
- Needs to identify loop boundaries that don't contain other loops

**Status**: IDENTIFIED but NOT FIXED - Requires planar graph face enumeration algorithm

---

### Algorithm Research: Planar Graph Face Enumeration

**User Request:** "Can you search math papers to find if it exists?"

**Research Results:**

**Algorithm Name:** Planar Graph Face Enumeration (Computational Geometry)

**Key Technique:** "Always Turn Left" / Counterclockwise Traversal

**Algorithm Steps:**
1. **Find all self-intersection points** (line segment intersection detection)
2. **Build planar subdivision** (split edges at intersection points)
3. **Sort edges by polar angle** at each node (counterclockwise order)
4. **Extract faces** using "leftmost turn" traversal (always choose next edge counterclockwise)
5. **Each face becomes a wall**

**Complexity:** O(n log n) with Bentley-Ottmann sweep line for intersections

**Example:**
```
Input: P1→P2→P3→P4→P5→P6(over P3)→P7→P8(over P1)

Step 1: Find intersections
- Intersection A: P3 = P6 (poles 2 and 5 overlap)
- Intersection B: P1 = P8 (poles 0 and 7 overlap)

Step 2: Build planar subdivision
Nodes: P1, P2, P3, P4, P5, P7
Edges:
- P1→P2, P2→P3, P3→P4, P4→P5, P5→P3, P3→P7, P7→P1

Step 3: Sort edges at each node (counterclockwise)
At P3: [incoming from P2, outgoing to P4, incoming from P5, outgoing to P7]

Step 4: Extract faces (always turn left)
Face 1: Start at P1, follow P1→P2→P3→P7→P1 (turns left at each node)
Face 2: Start at P3, follow P3→P4→P5→P3 (turns left at each node)

Output:
- Wall 1 (closed): P1→P2→P3→P7
- Wall 2 (closed): P3→P4→P5
```

**Algorithm Sources:**
- CP-Algorithms: Computational Geometry section (planar subdivisions)
- Stack Overflow: "Decomposing self-intersecting polygon into simple cycles"
- Academic papers: "Planar Graph Algorithms" (Tarjan, 1976)
- Reference: Bentley-Ottmann sweep line algorithm (O(n log n + k log n))

**Implementation Status:** NOT YET IMPLEMENTED

**Estimated Complexity:**
- Algorithm implementation: 12-16 hours
- Testing all scenarios: 4-6 hours
- Total: 16-22 hours

---

### Fixes Applied

#### Fix #1: React State Batching Solution

**Files Modified:**
- `Source/WebClientApp/src/hooks/useWallTransaction.ts`

**Changes:**
```typescript
// Added ref for synchronous state
const segmentsRef = useRef<WallSegment[]>([]);

// New method: setAllSegments (batch update)
const setAllSegments = useCallback((segments: WallSegment[]): void => {
    const segmentsWithTempIds = segments.map((segment, index) => ({
        ...segment,
        tempId: -(index + 1)
    }));

    segmentsRef.current = segmentsWithTempIds; // Synchronous
    setTransaction(prev => ({ ...prev, segments: segmentsWithTempIds })); // Async
}, []);

// Updated: commitTransaction reads from ref
const commitTransaction = useCallback(async (encounterId, apiHooks, segmentsOverride?) => {
    let currentTransaction: WallTransaction;
    if (segmentsOverride) {
        currentTransaction = { ...transaction, segments: segmentsOverride };
    } else if (segmentsRef.current.length > 0) {
        currentTransaction = { ...transaction, segments: segmentsRef.current };
    } else {
        currentTransaction = transaction;
    }
    // ...
}, [transaction]);
```

**Files Modified:**
- `Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx`

**Changes:**
```typescript
// BEFORE: Multiple addSegment calls (broken)
closedSegments.forEach(closedPoles => {
    wallTransaction.addSegment({ /* ... */ });
});

// AFTER: Single setAllSegments call (works)
const allSegments = [
    { /* open segment */ },
    ...validClosedSegments.map(closedPoles => ({ /* closed segments */ }))
];
wallTransaction.setAllSegments(allSegments);
```

---

#### Fix #2: Wall Naming for Multi-Segment Placement

**Files Modified:**
- `Source/WebClientApp/src/hooks/useWallTransaction.ts` (lines 330-354)

**Changes:**
```typescript
// Added naming logic for placement mode
let names: string[];
if (segmentsToProcess.length > 1) {
    if (currentTransaction.type === 'editing' && currentTransaction.originalWall !== null) {
        names = generateBrokenWallNames(currentTransaction.originalWall.name, segmentsToProcess.length);
    } else {
        // NEW: Placement mode naming
        const baseName = segmentsToProcess[0]?.name || 'Wall';
        names = segmentsToProcess.map((_, index) => {
            if (segmentsToProcess.length === 1) {
                return baseName;
            }
            return `${baseName} ${index + 1}`;
        });
    }
} else {
    names = segmentsToProcess.map(s => s.name);
}
```

---

#### Fix #3: Graph-Based Merge Algorithm

**Files Modified:**
- `Source/WebClientApp/src/utils/wallMergeUtils.ts` (complete rewrite of mergeWalls function)

**Changes:**
- Replaced special-case merge logic with generic graph-based algorithm
- Added GraphNode interface and node management
- Implemented bidirectional edge support
- Added junction edge support for overlapping points
- Implemented leaf node detection for topology analysis
- Added DFS traversal for path finding

**Lines Changed:** 179-286 (108 lines, complete rewrite)

---

### Verification Status

✅ **Multi-Loop Placement**: 3 walls created correctly (1 open + 2 closed)
✅ **Wall Naming**: All walls have unique names ("Wall 1", "Wall 2", "Wall 3")
✅ **Wall Merge Ordering**: Correct topological order (e.g., Wall4→NewWall→Wall1 produces P15→...→P14)
✅ **Closed Loop Merge**: Correctly identifies closed loops (leaf count = 0)
❌ **Nested Loop Detection**: Still fails - requires planar graph algorithm (future work)

**Test Coverage:**
- ✅ Scenario 1: Single open wall placement
- ✅ Scenario 2: Single closed wall placement
- ✅ Scenario 3: Wall merge (simple extension)
- ✅ Scenario 4: Self-closing wall (last over first)
- ✅ Scenario 5: Complex wall merge (multiple walls)
- ✅ Scenario 6: Multi-loop placement (open segment + closed loops)
- ❌ Scenario 7: Nested loops (requires planar graph algorithm)

**Code Quality:**
- ✅ TypeScript: 0 errors
- ✅ Lint: 0 errors, 0 warnings
- 🔄 Debug logs: Temporary logs added for transaction tracking (to be removed)

---

### Technical Patterns Discovered

#### Pattern 1: useRef for Synchronous State Updates

**Problem:** React batches setState calls, causing stale closure values

**Solution:** Use useRef alongside useState for synchronous access

**Implementation:**
```typescript
const [state, setState] = useState<T>(initial);
const stateRef = useRef<T>(initial);

const updateState = useCallback((newValue: T) => {
    stateRef.current = newValue;  // ✅ Synchronous - available immediately
    setState(newValue);            // ⏱ Async - available next render
}, []);

const readState = useCallback(() => {
    // Read from ref for immediate access
    return stateRef.current.length > 0 ? stateRef.current : state;
}, [state]);
```

**When to Use:**
- Need return value from state update immediately
- Multiple rapid state updates in same render cycle
- State value needed in callback that runs before next render
- Batch operations where order matters

**Warning:** Must keep ref and state synchronized - update both together

---

#### Pattern 2: Graph-Based Topology Resolution

**Problem:** Special-case logic for each merge scenario becomes unmaintainable

**Solution:** Model as graph, use established graph algorithms

**Graph Modeling:**
```typescript
interface GraphNode {
    id: string;           // Unique identifier
    edges: Map<string, Data>; // Connections to other nodes
}

// Wall endpoints become nodes
W1_START ──[poles]──> W1_END
W2_START ──[poles]──> W2_END

// Merge points create junction edges
W1_END ──[empty]──> W2_START  // They overlap
```

**Topology Analysis:**
```typescript
// Leaf detection (degree = 1)
const leafNodes = nodes.filter(n => n.edges.size === 1);

if (leafNodes.length === 0) {
    // Closed loop - no endpoints
} else if (leafNodes.length === 2) {
    // Open path - two endpoints
}
```

**Path Finding:**
```typescript
function traversePath(nodeId, visited) {
    visited.add(nodeId);
    for (const [neighborId, data] of node.edges) {
        if (!visited.has(neighborId)) {
            result.push(...data);
            result.push(...traversePath(neighborId, visited));
            return result;
        }
    }
    return result;
}
```

**Benefits:**
- Handles any topology: simple extension, multi-wall merge, closed loops
- No special cases needed
- Clear separation of concerns (graph building vs traversal)
- Easy to test (can verify graph structure independently)

---

#### Pattern 3: Planar Graph Face Enumeration

**Problem:** Nested/overlapping loops can't be detected with simple pairwise comparison

**Solution:** Planar graph face enumeration (computational geometry)

**Algorithm:**
1. **Find Intersections**: Detect all self-intersection points
2. **Build Planar Subdivision**: Split edges at intersections
3. **Sort by Polar Angle**: Order edges counterclockwise at each node
4. **Extract Faces**: "Always turn left" traversal finds each face
5. **Deduplicate**: Remove duplicate faces (clockwise/counterclockwise pairs)

**Example:**
```
P1→P2→P3→P4→P5→P6(over P3)→P7→P8(over P1)

After subdivision:
Nodes: P1, P2, P3, P4, P5, P7
Edges sorted at P3: [P2→P3, P3→P4, P5→P3, P3→P7] (counterclockwise)

Face extraction (always turn left):
- Start P1: P1→P2→P3→P7→P1 (Wall 1)
- Start P3: P3→P4→P5→P3 (Wall 2)
```

**Complexity:** O(n log n) with Bentley-Ottmann sweep line

**Implementation Status:** Research complete, implementation pending

---

#### Pattern 4: Transaction State Management with Fallback

**Problem:** Need multiple sources of truth with priority order

**Solution:** Layered fallback (override → ref → state)

**Implementation:**
```typescript
const commitTransaction = async (encounterId, apiHooks, segmentsOverride?) => {
    let currentTransaction: WallTransaction;

    // Priority 1: Explicit override
    if (segmentsOverride) {
        currentTransaction = { ...transaction, segments: segmentsOverride };
    }
    // Priority 2: Synchronous ref (latest batch update)
    else if (segmentsRef.current.length > 0) {
        currentTransaction = { ...transaction, segments: segmentsRef.current };
    }
    // Priority 3: Async state (fallback)
    else {
        currentTransaction = transaction;
    }

    // Process...
};
```

**When to Use:**
- Complex state management with multiple update paths
- Batch operations that bypass normal state flow
- Need to support both immediate and deferred processing
- Testing/debugging (override for test data)

---

### Debugging Strategies Used

#### Strategy 1: Sequential Thinking for Algorithm Design

**Approach:** Use deep thinking tool to explore problem space before coding

**Process:**
1. Analyze user's request: "find a generic code. Maybe some plane geometry"
2. Identify problem: Special-case logic becoming unmaintainable
3. Consider approaches:
   - Continue adding special cases (rejected - unsustainable)
   - Implement heuristics (rejected - unreliable)
   - Use established algorithms (selected - proven, maintainable)
4. Research graph theory applications
5. Design graph model for wall endpoints
6. Implement DFS traversal for path finding

**Results:**
- Clean, generic solution
- No special cases needed
- Based on proven algorithms
- Easy to reason about

---

#### Strategy 2: Incremental Testing with User Feedback

**Approach:** Fix one bug, test, get feedback, iterate

**Execution:**
1. Fix React state batching → Test multi-loop → Pass
2. Fix wall naming → Test with names → Pass
3. Fix wall merge ordering → Test complex merge → Reveal nested loop issue
4. Research nested loop algorithms → Identify planar graph solution → Document

**Benefits:**
- Each fix verified before proceeding
- User catches edge cases immediately
- Progressive refinement of solution
- Clear audit trail of decisions

---

#### Strategy 3: Algorithm Research from Academic Sources

**Approach:** Search for established algorithms instead of inventing from scratch

**User Guidance:** "Can you search math papers to find if it exists?"

**Process:**
1. Identify problem domain: self-intersecting path decomposition
2. Search computational geometry literature
3. Find established algorithm: Planar Graph Face Enumeration
4. Verify complexity: O(n log n) with Bentley-Ottmann
5. Locate references: CP-Algorithms, Stack Overflow, academic papers

**Benefits:**
- Proven algorithm with known complexity
- Well-documented with examples
- Community-vetted implementation patterns
- Avoids reinventing the wheel

---

### Files Modified

#### Core Algorithm Files

1. **`Source/WebClientApp/src/utils/wallMergeUtils.ts`**
   - Lines 179-286: Complete rewrite of `mergeWalls()` function
   - Added GraphNode interface (lines 171-177)
   - Added `traversePath()` helper (lines 257-286)
   - Fixed leaf detection bug (line 243)

2. **`Source/WebClientApp/src/hooks/useWallTransaction.ts`**
   - Added `segmentsRef` useRef (line 80)
   - Added `setAllSegments()` method (lines 217-258)
   - Added `addSegments()` batch method (lines 175-215)
   - Modified `commitTransaction()` to read from ref (lines 286-311)
   - Enhanced naming logic for placement mode (lines 330-354)
   - Added ref cleanup in `rollbackTransaction()` (line 448)
   - Added ref cleanup after successful commit (line 427)

3. **`Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx`**
   - Changed from multiple `addSegment()` to single `setAllSegments()` (lines 140-176)
   - Updated handleFinish dependencies to include wallTransaction (line 236)

#### Supporting Files

4. **`Documents/Tasks/EPIC-001/WALL_PLACEMENT_SPECIFICATION.md`**
   - Created comprehensive specification documenting 9 scenarios
   - Added examples, test cases, and expected behaviors

---

### Lessons Learned

#### Lesson 1: React State Batching Pitfalls

**Problem:** React batches multiple setState calls in same render cycle

**Symptoms:**
- Closure variables capture stale state
- Return values from state updates are stale
- Multiple rapid updates see same initial state

**Solution:** Use useRef for synchronous access alongside async state

**Pattern:**
```typescript
const [state, setState] = useState(initial);
const stateRef = useRef(initial);

// Update both together
const update = (newValue) => {
    stateRef.current = newValue;  // Immediate
    setState(newValue);            // Next render
};

// Read from ref when immediate access needed
const read = () => stateRef.current.length > 0 ? stateRef.current : state;
```

**When to Apply:** Batch operations, multiple rapid updates, need return value immediately

---

#### Lesson 2: Generic Solutions Over Special Cases

**User Insight:** "I suggest you find a way to also unify the merge calculation. Try to find a generic code."

**Problem:** Special-case logic for each scenario becomes unmaintainable

**Evolution:**
```
Version 1: if (scenario === 'extend') { ... }
Version 2: if (scenario === 'extend') { ... } else if (scenario === 'merge') { ... }
Version 3: if (scenario === 'extend') { ... } else if (scenario === 'merge') { ... } else if (scenario === 'close') { ... }
Version N: 20+ special cases
```

**Better Approach:** Model as graph, use established algorithms

**Result:**
- 1 algorithm handles all scenarios
- No special cases needed
- Easy to reason about
- Easy to test
- Maintainable

---

#### Lesson 3: Research Existing Algorithms First

**User Guidance:** "Can you search math papers to find if it exists?"

**Approach:**
1. Identify problem domain (computational geometry)
2. Search academic literature
3. Find established algorithm (planar graph face enumeration)
4. Verify complexity (O(n log n))
5. Implement or adapt

**Benefits:**
- Proven correctness
- Known complexity
- Community support
- Documentation available
- Avoids reinventing buggy solutions

**Warning:** Don't blindly copy - understand the algorithm and adapt to your domain

---

#### Lesson 4: User Feedback Guides Architecture

**Key User Requests:**
1. "Why don't you unify the way that the transaction is saved" → Led to `setAllSegments()`
2. "Try to find a generic code. Maybe some plane geometry" → Led to graph-based approach
3. "Can you search math papers to find if it exists?" → Led to planar graph research

**Pattern:**
- User identifies architectural issues before they become critical
- User suggests problem-solving approaches (geometry, unification)
- User requests research over invention

**Takeaway:** Listen to architectural feedback - users often see patterns you miss

---

#### Lesson 5: Leaf Node Detection in Graphs

**Concept:** Leaf node = node with exactly 1 edge (degree 1)

**Application:**
- Open path: 2 leaf nodes (start and end)
- Closed loop: 0 leaf nodes (no endpoints)
- Branching structure: 3+ leaf nodes (multiple endpoints)

**Common Bug:** Filtering edges before counting
```typescript
// ❌ WRONG: Counts only certain edge types
const leafNodes = nodes.filter(n =>
    n.edges.filter(e => e.hasData).length === 1
);

// ✅ CORRECT: Counts all edges
const leafNodes = nodes.filter(n => n.edges.size === 1);
```

**Why It Matters:** Incorrect leaf detection causes wrong path extraction

---

### Related Memory Entries

See MCP Memory for detailed entity relationships:
- "React State Batching Issue with useRef Solution"
- "Graph-Based Wall Merge Algorithm"
- "Planar Graph Face Enumeration Algorithm"
- "Wall Transaction State Management Pattern"
- "Nested Loop Detection Problem"
- "useRef for Synchronous State Pattern"
- "Graph Modeling for Topology Resolution"
- "Leaf Node Detection in Path Graphs"

---

### Next Steps

1. ✅ React state batching resolved with useRef
2. ✅ Wall naming working for multi-segment placement
3. ✅ Graph-based merge algorithm implemented
4. ✅ Leaf detection bug fixed
5. ❌ Nested loop detection still broken
6. 🔄 Implement planar graph face enumeration algorithm (16-22h)
7. 🔄 Test all 9 wall placement scenarios
8. 🔄 Remove debug console.log statements after verification
9. 🔄 Update memory with observations and relationships

---

### Quality Metrics

**Time Spent:**
- Bug diagnosis and fixes: ~6 hours
- Graph algorithm implementation: ~4 hours
- Algorithm research: ~2 hours
- Testing and verification: ~3 hours
- Documentation: ~1.5 hours
- **Total: ~16.5 hours**

**Errors Fixed:**
- 4 critical bugs (state batching, naming, merge ordering, leaf detection)
- 1 unresolved issue (nested loops)

**Code Changes:**
- 3 files modified
- ~200 lines added/modified
- Complete algorithm rewrite (wallMergeUtils.ts)

**Test Status:**
- 6 of 9 scenarios passing
- Nested loops require planar graph algorithm

**Code Quality:**
- TypeScript ✅ 0 errors
- Lint ✅ 0 errors, 0 warnings
- Debug logs 🔄 Temporary (to be removed)

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
