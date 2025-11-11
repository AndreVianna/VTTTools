# EPIC-001: Lessons Learned

Technical insights and architectural patterns discovered during UI migration implementation.

---

## React & State Management

### Lesson 13: Dual-Queue Undo Architecture Separates Concerns Cleanly

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Undo/Redo System

**Problem**: Needed both transaction-scoped undo (for active editing) and persistent undo (for committed operations)

**Solution**: Dual-queue architecture with local queue (cleared on commit/cancel) + global queue (persists across sessions)

**Implementation**:
- Local queue: Transaction scope, 7 action types (PlacePole, MovePole, InsertPole, DeletePole, Multi Move, MoveLine, BreakWall)
- Global queue: Encounter scope, 4 command classes (Create, Edit, Delete, Break)
- Zero coupling prevents state leakage
- Clear lifecycle boundaries

**Takeaway**: Separate queues for different scopes prevents complexity and maintains clean state management

---

### Lesson 14: Factory Pattern with Closures Enables Clean Action Serialization

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Undo Actions

**Problem**: Actions needed to capture callbacks without polluting interfaces

**Solution**: Factory functions (createPlacePoleAction, createMovePoleAction, etc.) use closures to capture callbacks

**Implementation**:
```typescript
function createMovePoleAction(index, oldPos, newPos, onUpdate) {
  return {
    type: 'MovePole',
    index,
    oldPos,
    newPos,
    undo: () => onUpdate(index, oldPos),  // Closure captures callback
    redo: () => onUpdate(index, newPos)
  };
}
```

**Takeaway**: Closures enable clean serializable action data with flexible composition without interface pollution

---

### Lesson 15: React State Batching Requires Callback-Based Sync for Immediate Access

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Break Undo Ghost Bug

**Problem**: Calling `getActiveSegments()` after `undoLocal()` returns stale data due to React batching updates

**Solution**: `onSyncEncounter` callback inside `setTransaction` has immediate access to new state

**Implementation**:
```typescript
undoLocal((updatedSegments) => {
  // Callback executes inside setTransaction - has fresh state
  removeOrphanedWalls(updatedSegments);
});
```

**Takeaway**: Callbacks prevent race conditions from React batching - execute inside state setter for immediate access

---

### Lesson 16: Segment Association Must Be Preserved During Undo

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Break Undo

**Problem**: Wall break undo lost segment association, creating orphaned state

**Solution**: Update existing segment instead of remove+add pattern

**Implementation**:
- **Wrong**: Remove both segments, create new merged segment (loses wallIndex)
- **Correct**: Update first segment to merged state, remove second segment (preserves wallIndex, reuses tempId)

**Takeaway**: Preserve identifiers and associations during state transformations to maintain data integrity

---

### Lesson 17: Stale Closures in useEffect Require Refs for Mutable Values

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Keyboard Handler

**Problem**: Encounter captured in keyboard handler closure becomes stale

**Solution**: Use ref for always-current value

**Implementation**:
```typescript
const encounterRef = useRef(encounter);
encounterRef.current = encounter;  // Update on every render

useEffect(() => {
  const handler = (e) => {
    const currentEncounter = encounterRef.current;  // Always fresh
    // ...
  };
  window.addEventListener('keydown', handler);
}, []);  // Empty deps OK - ref always current
```

**Takeaway**: Long-running event handlers need refs for mutable values to avoid stale closures

---

## Konva & Canvas Rendering

### Lesson 1: Hit Area Sizing Must Account for Snap Distance

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Editing

**Problem**: Mouse exited line hit area during snap jumps (grid snap caused sudden 25px movement)

**Solution**: Hit area must be ≥2x maximum snap distance

**Implementation**:
- Grid cell: 50px
- HalfSnap jumps: ±25px
- Line hit area: Increased from 15px to 100px strokeWidth

**Takeaway**: Interactive areas must accommodate movement from snapping behavior

---

### Lesson 2: Modifier Keys Must Be Checked in Mouse Events (NOT Keyboard)

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Snapping

**Problem**: Using keydown/keyup for modifier tracking caused toggle behavior

**Solution**: Check `e.evt.altKey` / `e.evt.ctrlKey` in mouse event handlers

**Implementation**:
```typescript
// WRONG - Toggle behavior
const [altPressed, setAltPressed] = useState(false);
onKeyDown={(e) => e.key === 'Alt' && setAltPressed(true)}

// CORRECT - Immediate state
onMouseMove={(e) => {
  const snapMode = e.evt.altKey ? 'Free' : 'Half';
  // ...
}}
```

**Takeaway**: Real-time modifier state needs mouse event inspection, not keyboard state tracking

---

### Lesson 10: Konva Z-Order Determines Event Capture

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Multi-Segment Wall Editing

**Problem**: First segment poles were visible but not clickable after wall break

**Solution**: Conditional rendering of background rect to prevent z-order blocking

**Implementation**:
- Issue: Second WallTransformer's 20,000×20,000px background Rect blocked first segment's poles
- Fix: `enableBackgroundRect` prop conditionally renders background
- Trade-off: Disables marquee selection during wall break (acceptable)

**Takeaway**: Later children render on top and capture events - manage z-order carefully in multi-instance scenarios

---

### Lesson 11: Conditional Component Listening Enables Mode-Specific Interactivity

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Pole Insertion Preview

**Problem**: Pole hit areas blocked line hover detection during Shift+hover preview

**Solution**: Toggle Konva `listening` property based on application state

**Implementation**:
```typescript
const [isShiftPressed, setIsShiftPressed] = useState(false);

<Group listening={!isShiftPressed}>
  {/* Poles: Interactive normally, transparent when Shift pressed */}
</Group>
```

**Takeaway**: Dynamic `listening` allows same component to be interactive/transparent based on mode

---

### Lesson 18: Debugging Complex Visual Artifacts Requires Isolation Techniques

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system) - Ghost Handle Bug

**Problem**: Rotation handle ghost artifact persisted after 11 failed fix attempts

**Solution**: Color-coding different instances (RED vs BLUE) revealed duplicate rendering

**Implementation**:
- Added `stroke="red"` to one handle, `stroke="blue"` to suspected duplicate
- Both appeared simultaneously - confirmed duplicate rendering
- Found duplicate RotationHandle in EncounterEditorPage Layer 9

**Takeaway**: Systematic isolation (color-coding, conditional rendering, layer inspection) reveals duplicates when multiple approaches fail

---

### Lesson 19: Konva Event System Requires Careful Layer Configuration

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system) - Rotation Handle Events

**Problem**: Marquee selection triggered when clicking rotation handle

**Solution**: `e.cancelBubble = true` + correct layer `listening` configuration

**Implementation**:
```typescript
// Layer must listen
<Layer listening={true}>
  {/* Interactive elements */}
  <Circle onMouseDown={(e) => {
    e.cancelBubble = true;  // Prevent event bubbling
    // Handle rotation
  }} />

  {/* Non-interactive elements */}
  <Line listening={false} />
</Layer>
```

**Takeaway**: `listening={true}` on layer for event capture, individual elements can disable to prevent conflicts, `cancelBubble` prevents bubbling to parent

---

### Lesson 20: Drag Events vs Mouse Events Have Different Behavior

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system) - Rotation Interaction

**Problem**: Circle handle disappeared during Konva drag events

**Solution**: Use native mouse events instead of Konva drag events

**Implementation**:
- **Konva drag**: Moves the node itself (onDragStart/onDragMove/onDragEnd)
- **Mouse events**: Custom behavior without node movement (onMouseDown + stage mousemove/mouseup)

**Takeaway**: Mouse events better for rotation where visual element stays fixed while calculating angle

---

## Backend Integration & EF Core

### Lesson 6: EF Core Navigation Properties Cause Unexpected Updates

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#asset-rotation-system) - Backend Data Integrity Fix

**Problem**: Resources being cleared when placing new assets

**Root Cause**:
```csharp
// WRONG - Sets navigation property with partial entity
Portrait = model.Portrait?.ToEntity(),  // Only ID set
Token = model.Token?.ToEntity()         // EF Core updates existing records!
```

**Solution**: Set foreign keys only, not navigation properties

```csharp
// CORRECT - Sets foreign keys only
PortraitId = model.Portrait?.Id,
TokenId = model.Token?.Id
// Navigation properties: null (don't set)
```

**Takeaway**: Always set foreign keys (IDs) when you have partial data - navigation properties only when creating/updating the full related entity

---

### Lesson 7: Backend Domain Pattern - Dual Access for IDs

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Asset/Encounter Contract Migration

**Problem**: Backend serialized navigation properties but no direct ID access

**Solution**: Dual access pattern with both navigation property and ID property

**Implementation**:
```csharp
public record AssetToken {
    public Guid TokenId { get; init; }      // Direct ID access for queries
    public Resource? Token { get; init; }    // Navigation property with full object
    public bool IsDefault { get; init; }
}
```

**Frontend Access**:
```typescript
// Both work:
const id = token.tokenId;      // Direct ID
const url = token.token.path;  // Full nested object
```

**Takeaway**: Provide both ID and navigation property for flexibility (queries vs rich client access)

---

## UX & Interaction Patterns

### Lesson 3: Coordinate System Transformation for World Coordinates

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Editing

**Problem**: Screen coordinates need transformation to canvas coordinates

**Solution**: Transform with stage scale and offset

**Implementation**:
```typescript
const pointer = stage.getPointerPosition();  // Screen coords
const worldPos = {
  x: (pointer.x - stage.x()) / scale,
  y: (pointer.y - stage.y()) / scale
};
```

**Takeaway**: Always transform screen coordinates to world coordinates for Konva operations

---

### Lesson 4: Pole Dragging Pattern - dragBoundFunc + handleDragMove

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Pole Dragging

**Problem**: How to implement snapping during drag

**Solution**: `dragBoundFunc` returns position unchanged, actual snapping in handleDragMove/handleDragEnd

**Implementation**:
```typescript
dragBoundFunc={(pos) => pos}  // Allow free drag

onDragMove={(e) => {
  const snappedPos = snapToGrid(e.target.position());
  updatePole(index, snappedPos);
}}
```

**Takeaway**: Store original position in ref, apply snapping logic in drag handlers, not in dragBoundFunc

---

### Lesson 5: Line Dragging - Snap Initial Mouse Position

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Line Dragging

**Problem**: Delta mismatch during line drag

**Solution**: Snap initial mouse position on mouseDown

**Implementation**:
```typescript
onMouseDown={(e) => {
  const mousePos = getMousePosition(e);
  const snappedMousePos = snapToGrid(mousePos);  // Snap initial position
  dragStartRef.current = {
    mousePos: snappedMousePos,  // Use snapped position
    pole1Pos: pole1.position,
    pole2Pos: pole2.position
  };
}}

onMouseMove={(e) => {
  const currentPos = snapToGrid(getMousePosition(e));
  const delta = {
    x: currentPos.x - dragStartRef.current.mousePos.x,
    y: currentPos.y - dragStartRef.current.mousePos.y
  };
  // Apply delta to both poles
}}
```

**Takeaway**: Snap initial mouse position to prevent delta mismatch during grid-snapped dragging

---

### Lesson 12: Snap Priority Over Projection for Grid Alignment

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Pole Insertion on Line

**Problem**: Should pole insertion snap to grid or exact line position?

**Solution**: Snap-to-grid takes precedence over exact line projection

**Implementation**:
```typescript
// Step 1: Project point to line
const projectedPos = projectPointToLineSegment(mousePos, pole1, pole2);

// Step 2: Snap to grid (may move off line slightly)
const snappedPos = snapToNearest(projectedPos, snapMode);

// Result: Pole at nearest grid point (e.g., 50,50) even if line was at (52.5,52.5)
```

**Takeaway**: Maintain grid consistency over exact projection - prevents accumulation of off-grid positions

---

## Architecture & Design Patterns

### Lesson 8: Complete Rollback Requires Restoring ALL Properties

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Break ESC Rollback

**Problem**: ESC after wall break kept `.1` suffix in wall name

**Solution**: Restore complete originalWall object (poles + isClosed + name), not just geometry

**Implementation**:
```typescript
// WRONG - Partial restoration
const originalPoles = wall.poles;
onCancel: () => updateWall({ poles: originalPoles });

// CORRECT - Complete restoration
const originalWall = { ...wall };
onCancel: () => updateWall(originalWall);  // All properties
```

**Takeaway**: Partial state restoration leaves inconsistent state - capture and restore complete objects

---

### Lesson 9: Segment Data is Source of Truth During Transactions

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Multi-Segment Wall Editing

**Problem**: Looking up wall from `encounter.walls` during multi-segment editing returned wrong data

**Solution**: Use transaction segment data directly, not encounter lookups

**Implementation**:
```typescript
// WRONG - Lookup from encounter
const wall = encounter.walls.find(w => w.index === segment.wallIndex);
<WallTransformer poles={wall.poles} />  // Wrong poles!

// CORRECT - Use segment data directly
<WallTransformer poles={segment.poles} />  // Correct!
```

**Takeaway**: During transactions, segment data is authoritative - encounter data may be stale

---

### Lesson 21: Deferred Validation Superior to Eager Validation

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Transactional Wall Editing

**Problem**: Eager validation (removing duplicate poles immediately) blocked creative workflows

**Solution**: Defer validation to commit boundary (Enter/Save)

**Implementation**:
- Allow intentional temporary duplicates (for later insertion points)
- Run `cleanWallPoles()` only on commit (Enter key)
- Better UX with same correctness guarantees

**Takeaway**: Interactive validation timing matters more than completeness - defer to commit for creative workflows

---

## Testing & Quality

### Lesson 22: Multi-Instance Rendering Requires Unique React Keys

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - Wall Break Multi-Segment

**Problem**: React reconciliation bugs when rendering multiple WallTransformer instances

**Solution**: Unique keys for each segment

**Implementation**:
```typescript
{segments.map((segment, index) => (
  <WallTransformer
    key={segment.tempId || `segment-${index}`}
    poles={segment.poles}
  />
))}
```

**Takeaway**: Multi-instance components need unique keys for proper React reconciliation

---

### Lesson 23: Defense-in-Depth for Keyboard Event Handling

**Source**: [Phase 8.8](./phases/PHASE_8_ENCOUNTER_MGMT.md#phase-8-8) - DELETE Key Handling

**Problem**: Parent and child both handling DELETE key caused conflicts

**Solution**: State guards + stopPropagation for defense-in-depth

**Implementation**:
```typescript
// Parent (EncounterEditorPage)
if (!isEditingVertices) {
  // Handle wall deletion
}

// Child (WallTransformer)
onKeyDown={(e) => {
  if (e.key === 'Delete') {
    e.stopPropagation();  // Prevent parent handler
    // Handle pole deletion
  }
}}
```

**Takeaway**: Both state guards and event control for robust keyboard handling

---

## Summary Statistics

**Total Lessons**: 23 lessons across 6 categories
- React & State Management: 5 lessons
- Konva & Canvas Rendering: 7 lessons
- Backend Integration & EF Core: 2 lessons
- UX & Interaction Patterns: 5 lessons
- Architecture & Design Patterns: 3 lessons
- Testing & Quality: 2 lessons

**Most Common Themes**:
1. State management complexity (batching, closures, refs)
2. Konva event system and z-order
3. Coordinate transformations and snapping
4. Transaction patterns and rollback
5. EF Core navigation properties

---

## Related Documentation

- [Phase Files](./phases/) - Detailed phase documentation with context
- [CHANGELOG.md](./CHANGELOG.md) - When lessons were discovered
- [Main Roadmap](./ROADMAP.md) - Project overview
