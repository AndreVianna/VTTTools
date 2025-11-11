# Wall Placement and Editing Specification

**World**: EPIC-001 - VTT Tools MVP
**Created**: 2025-11-11
**Status**: Active Implementation
**Last Updated**: 2025-11-11

---

## Overview

This specification defines the complete behavior for wall placement and editing in the Encounter Editor, including 9 core scenarios covering placement, merging, splitting, and pole manipulation operations.

---

## General Rules

### Keyboard Controls
- **Enter**: Confirms the placement or edit
- **Escape**: Cancels the placement or edit
- **Delete**: Removes a selected pole (edit mode only)
- **ALT+Delete**: Splits or opens wall at selected pole (edit mode only)

### Wall Structure Constraints
1. **Minimum Poles**: Walls must have at least 2 poles
   - Any wall with only 1 pole is automatically removed
2. **Open Walls**: Have distinct first and last poles
   - Minimum: 2 poles
3. **Closed Walls**: Last pole connects back to first pole
   - Minimum: 3 poles (automatically opens if reduced to 2)
4. **Pole Deduplication**: At the end of any operation, overlapping poles of the same wall are merged into a single pole

### Undo/Redo System
Two levels of undo/redo:

1. **Local Undo** (During Placement/Edit)
   - Scope: Within current placement/edit session
   - Granularity: One pole operation at a time
   - Limit: Back to start of placement/edit session

2. **Global Undo** (Scene Operations)
   - Scope: Entire scene history
   - Granularity: Complete placement/edit operations
   - Details: See individual scenarios below

---

## Scenario 1: Simple Wall Placement (No Overlap)

### Description
Placing a wall that does not overlap with any existing wall.

### Behavior
- Creates new wall with specified poles
- Saves wall to database
- Assigns new wall index

### Examples

**Example 1.1: Basic Open Wall**
```
Initial State: (empty)
New Poles: P1->P2->P3
Result: Wall 1 (Open): P1->P2->P3
After Global Undo: (empty)
```

**Example 1.2: Multiple Independent Walls**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4->P5->P6
Result:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
After Global Undo: Wall 1 (Open): P1->P2->P3
```

### Global Undo Behavior
- **Action**: Removes the added wall completely
- **Restoration**: Returns to pre-placement state

---

## Scenario 2: Wall Placement Over Edges or Middle Poles

### Description
Placing a wall that overlaps an edge or any pole OTHER than the first or last pole of existing walls.

### Behavior
- Creates new wall independently (no merge)
- Both walls coexist
- No structural modification to existing walls
- Saves new wall to database

### Examples

**Example 2.1: Overlap Middle Pole**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4->P5 (over P2)->P6
Result:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 2.2: Edge Crossing**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4->P5->P6 (edge P5->P6 crosses edge P2->P3)
Result:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 2.3: Multiple Edge Overlaps**
```
Initial State:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
New Poles: P7->P8 (over edge P2->P3)->P9 (over edge P5->P6)->P10
Result:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
  - Wall 3 (Open): P7->P8->P9->P10
After Global Undo:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
```

### Global Undo Behavior
- **Action**: Removes the added wall
- **Restoration**: Existing walls remain unchanged

---

## Scenario 3: Wall Extension/Merge (Endpoint to Endpoint)

### Description
Placing the first OR last pole of the new wall over the first OR last pole of another wall.

### Behavior
- Merges walls into single wall
- Target wall: Wall with lowest index
- Deleted walls: All other involved walls
- Pole order: Maintains directional flow
- Saves merged wall to database

### Examples

**Example 3.1: Simple Extension**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4 (over P3)->P5->P6
Result: Wall 1 (Open): P1->P2->P3->P5->P6
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 3.2: Extension from Start**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4->P5->P6 (over P1)
Result: Wall 1 (Open): P6->P5->P1->P2->P3
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 3.3: Merging Two Walls**
```
Initial State:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
New Poles: P7 (over P3)->P8->P9 (over P4)
Result: Wall 1 (Open): P1->P2->P3->P8->P4->P5->P6
After Global Undo:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
```

**Example 3.4: Merging Three Walls**
```
Initial State:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
  - Wall 3 (Open): P7->P8->P9
New Poles: P10 (over P3)->P11 (over P4)->P12 (over P7)
Result: Wall 1 (Open): P1->P2->P3->P11->P4->P5->P6 (Wall 2 deleted, P12->P7 becomes separate)
Note: Complex merge with multiple walls requires further analysis
After Global Undo:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
  - Wall 3 (Open): P7->P8->P9
```

### Global Undo Behavior
- **Action**: Removes added poles, restores deleted walls
- **Restoration**: All original walls returned to previous state

---

## Scenario 4: Self-Closing Wall During Placement

### Description
Placing the last pole of a new wall over its own first pole automatically closes the wall.

### Behavior
- Closes the wall
- Removes duplicate pole (first/last overlap)
- Takes precedence over wall extension (Scenario 3)
- Saves closed wall to database

### Examples

**Example 4.1: Simple Triangle**
```
Initial State: (empty)
New Poles: P1->P2->P3->P4 (over P1)
Result: Wall 1 (Closed): P1->P2->P3
After Global Undo: (empty)
```

**Example 4.2: Pentagon**
```
Initial State: (empty)
New Poles: P1->P2->P3->P4->P5->P6 (over P1)
Result: Wall 1 (Closed): P1->P2->P3->P4->P5
After Global Undo: (empty)
```

**Example 4.3: Near-Miss Self-Close**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4->P5->P6->P7 (near P4 but not overlapping)
Result: Wall 2 (Open): P4->P5->P6->P7
Note: Does NOT close because P7 doesn't overlap P4
```

### Global Undo Behavior
- **Action**: Removes the entire closed wall
- **Restoration**: Returns to pre-placement state

---

## Scenario 5: Wall Closure by Merging Both Endpoints

### Description
Special case of Scenario 3: Placing first pole of new wall over one endpoint of another wall AND last pole over THE OTHER endpoint of that SAME wall.

### Behavior
- Merges walls into closed wall
- Target wall: Wall with lowest index
- Removes duplicate poles (endpoints)
- Saves closed wall to database

### Examples

**Example 5.1: Simple Closure**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4 (over P3)->P5->P6 (over P1)
Result: Wall 1 (Closed): P1->P2->P3->P5
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 5.2: Reverse Direction Closure**
```
Initial State: Wall 1 (Open): P1->P2->P3
New Poles: P4 (over P1)->P5->P6 (over P3)
Result: Wall 1 (Closed): P1->P5->P3->P2
After Global Undo: Wall 1 (Open): P1->P2->P3
```

**Example 5.3: Closure with Multiple Poles**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
New Poles: P6 (over P5)->P7->P8->P9->P10 (over P1)
Result: Wall 1 (Closed): P1->P2->P3->P4->P5->P7->P8->P9
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

### Global Undo Behavior
- **Action**: Opens the wall, removes added poles
- **Restoration**: Returns to original open wall state

---

## Scenario 6: Self-Loop During Placement (New Wall)

### Description
Placing the last pole of a NEW wall over a pole that is NOT the first pole of the same wall during placement.

### Behavior
- Creates TWO walls from single placement
- Wall 1 (Open): From start to loop point
- Wall 2 (Closed): Loop segment
- Both walls saved to database

### Examples

**Example 6.1: Mid-Point Loop**
```
Initial State: (empty)
New Poles: P1->P2->P3->P4->P5->P6->P7->P8 (over P4)
Result:
  - Wall 1 (Open): P1->P2->P3->P4
  - Wall 2 (Closed): P5->P6->P7->P4
After Global Undo: (empty) [removes both walls]
```

**Example 6.2: Early Loop**
```
Initial State: (empty)
New Poles: P1->P2->P3->P4->P5 (over P2)
Result:
  - Wall 1 (Open): P1->P2
  - Wall 2 (Closed): P3->P4->P2
After Global Undo: (empty)
```

**Example 6.3: Late Loop**
```
Initial State: (empty)
New Poles: P1->P2->P3->P4->P5->P6->P7 (over P5)
Result:
  - Wall 1 (Open): P1->P2->P3->P4->P5
  - Wall 2 (Closed): P6->P5
Note: Wall 2 auto-opens (only 2 poles)
Result (corrected):
  - Wall 1 (Open): P1->P2->P3->P4->P5
  - Wall 2 (Open): P6->P5
```

### Global Undo Behavior
- **Action**: Removes both created walls
- **Restoration**: Returns to pre-placement state

---

## Scenario 7: Self-Loop During Extension

### Description
Extending an existing wall where the last pole of the new segment overlaps a pole that is NOT the first pole of the existing wall.

### Behavior
- Splits existing wall at loop point
- Original wall: From start to loop point
- New wall (Closed): Loop segment
- Both walls saved to database

### Examples

**Example 7.1: Loop at Midpoint**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
New Poles: P6 (over P5)->P7->P8 (over P3)
Result:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Closed): P5->P7->P3
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

**Example 7.2: Loop at Second Pole**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
New Poles: P6 (over P5)->P7->P8->P9 (over P2)
Result:
  - Wall 1 (Open): P1->P2
  - Wall 2 (Closed): P5->P7->P8->P2
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

**Example 7.3: Loop at Fourth Pole**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5->P6
New Poles: P7 (over P6)->P8->P9 (over P4)
Result:
  - Wall 1 (Open): P1->P2->P3->P4
  - Wall 2 (Closed): P6->P8->P4
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5->P6
```

### Global Undo Behavior
- **Action**: Removes new wall, restores original wall
- **Restoration**: Original wall returned to full state

---

## Scenario 8: Wall Split by Edge Overlap

### Description
Placing new wall where an edge (segment between two consecutive poles) overlaps an edge of an existing wall, causing the new wall to split into two separate walls.

### Behavior
- Splits new wall at intersection points
- Creates 2 or more walls from single placement
- Existing wall remains unchanged
- All new wall segments saved to database

### Examples

**Example 8.1: Single Edge Overlap**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
New Poles: P6->P7->P8 (over P2)->P9 (over P3)->P10
Result:
  - Wall 1 (Open): P1->P2->P3->P4->P5 [unchanged]
  - Wall 2 (Open): P6->P7->P8
  - Wall 3 (Open): P9->P10
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

**Example 8.2: Multiple Edge Overlaps**
```
Initial State:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
New Poles: P7->P8 (over P2)->P9 (over P3)->P10->P11 (over P5)->P12 (over P6)->P13
Result:
  - Wall 1 (Open): P1->P2->P3 [unchanged]
  - Wall 2 (Open): P4->P5->P6 [unchanged]
  - Wall 3 (Open): P7->P8
  - Wall 4 (Open): P9->P10->P11
  - Wall 5 (Open): P12->P13
After Global Undo:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P4->P5->P6
```

**Example 8.3: Edge Overlap Creating Closed Wall**
```
Initial State: Wall 1 (Closed): P1->P2->P3->P4
New Poles: P5->P6 (over P1)->P7 (over P2)->P8->P9 (over P3)->P10 (over P4)->P11
Result:
  - Wall 1 (Closed): P1->P2->P3->P4 [unchanged]
  - Wall 2 (Open): P5->P6
  - Wall 3 (Open): P7->P8->P9
  - Wall 4 (Open): P10->P11
```

### Global Undo Behavior
- **Action**: Removes all new wall segments
- **Restoration**: Existing walls remain unchanged

---

## Scenario 9: Pole Removal During Edit

### Description
Removing poles from existing walls during edit mode using Delete or ALT+Delete.

---

### Scenario 9.1: Simple Pole Deletion

**Description**: Pressing Delete on a selected pole removes it from the wall.

**Behavior**:
- Removes pole from wall
- Maintains wall connectivity (edges reconnect)
- Preserves open/closed state (if possible)
- Updates wall in database

**Examples**:

**Example 9.1.1: Delete Middle Pole (Open Wall)**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4
Action: Delete P3
Result: Wall 1 (Open): P1->P2->P4
After Global Undo: Wall 1 (Open): P1->P2->P3->P4
```

**Example 9.1.2: Delete Middle Pole (Closed Wall)**
```
Initial State: Wall 1 (Closed): P1->P2->P3->P4
Action: Delete P3
Result: Wall 1 (Closed): P1->P2->P4
After Global Undo: Wall 1 (Closed): P1->P2->P3->P4
```

**Example 9.1.3: Delete Pole Causing Auto-Open**
```
Initial State: Wall 1 (Closed): P1->P2->P3
Action: Delete P3
Result: Wall 1 (Open): P1->P2
Note: Only 2 poles remain, wall auto-opens
After Global Undo: Wall 1 (Closed): P1->P2->P3
```

**Example 9.1.4: Delete Causing Wall Removal**
```
Initial State: Wall 1 (Open): P1->P2
Action: Delete P2
Result: Wall removed (only 1 pole remains)
After Global Undo: Wall 1 (Open): P1->P2
```

**Global Undo Behavior**:
- **Action**: Restores deleted pole
- **Restoration**: Wall returned to previous state

---

### Scenario 9.2: Wall Split at Pole (Open Wall)

**Description**: Pressing ALT+Delete on selected pole in OPEN wall splits wall into two at that pole.

**Behavior**:
- Creates two walls from one
- Original wall: From start to split pole
- New wall: From split pole to end
- Creates temporary duplicate pole at split point
- User must move duplicate pole before confirming
- Saves both walls to database

**Examples**:

**Example 9.2.1: Split at Midpoint**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4
Action: ALT+Delete P3
Temporary State:
  - Wall 1 (Open): P1->P2->P3
  - Temp Wall (Open): P5 (over P3)->P4
User Action: Move P5 away from P3
After Confirm:
  - Wall 1 (Open): P1->P2->P3
  - Wall 2 (Open): P5->P4
After Global Undo: Wall 1 (Open): P1->P2->P3->P4
```

**Example 9.2.2: Split at Second Pole**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
Action: ALT+Delete P2
Temporary State:
  - Wall 1 (Open): P1->P2
  - Temp Wall (Open): P6 (over P2)->P3->P4->P5
User Action: Move P6 away
After Confirm:
  - Wall 1 (Open): P1->P2
  - Wall 2 (Open): P6->P3->P4->P5
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

**Example 9.2.3: Split Near End**
```
Initial State: Wall 1 (Open): P1->P2->P3->P4->P5
Action: ALT+Delete P4
Temporary State:
  - Wall 1 (Open): P1->P2->P3->P4
  - Temp Wall (Open): P6 (over P4)->P5
User Action: Move P6 away
After Confirm:
  - Wall 1 (Open): P1->P2->P3->P4
  - Wall 2 (Open): P6->P5
After Global Undo: Wall 1 (Open): P1->P2->P3->P4->P5
```

**Global Undo Behavior**:
- **Action**: Merges split walls back into one
- **Restoration**: Original wall restored

---

### Scenario 9.3: Wall Opening at Pole (Closed Wall)

**Description**: Pressing ALT+Delete on selected pole in CLOSED wall opens the wall at that pole.

**Behavior**:
- Opens closed wall
- Split pole becomes start AND end of open wall
- Creates temporary duplicate pole
- User must move duplicate pole before confirming
- Pole order: From split point around to split point
- Updates wall in database

**Examples**:

**Example 9.3.1: Open at Arbitrary Pole**
```
Initial State: Wall 1 (Closed): P1->P2->P3->P4
Action: ALT+Delete P3
Temporary State: Wall 1 (Open): P5 (over P3)->P4->P1->P2->P3
User Action: Move P5 away from P3
After Confirm: Wall 1 (Open): P5->P4->P1->P2->P3
After Global Undo: Wall 1 (Closed): P1->P2->P3->P4
```

**Example 9.3.2: Open at First Pole**
```
Initial State: Wall 1 (Closed): P1->P2->P3->P4->P5
Action: ALT+Delete P1
Temporary State: Wall 1 (Open): P6 (over P1)->P2->P3->P4->P5->P1
User Action: Move P6 away
After Confirm: Wall 1 (Open): P6->P2->P3->P4->P5->P1
After Global Undo: Wall 1 (Closed): P1->P2->P3->P4->P5
```

**Example 9.3.3: Open Pentagon**
```
Initial State: Wall 1 (Closed): P1->P2->P3->P4->P5
Action: ALT+Delete P4
Temporary State: Wall 1 (Open): P6 (over P4)->P5->P1->P2->P3->P4
User Action: Move P6 away
After Confirm: Wall 1 (Open): P6->P5->P1->P2->P3->P4
After Global Undo: Wall 1 (Closed): P1->P2->P3->P4->P5
```

**Global Undo Behavior**:
- **Action**: Closes wall, removes duplicate pole
- **Restoration**: Original closed wall restored

---

## Complex Multi-Operation Examples

### Complex Example 1: Multi-Wall Merge and Split During Placement

```
Initial State:
  - Wall 1 (Open): P1->P2->P3->P4->P5
  - Wall 2 (Open): P6->P7->P8
  - Wall 3 (Closed): P9->P10->P11

New Poles: P11->P12 (over P2)->P13 (over P3)->P14->P15 (over P9)->P16 (over P10)->P17 (over P6)->P18 (over P7)->P19 (over P3)->P20

Analysis:
  - P11: Start at arbitrary position
  - P12 (over P2): Middle pole of Wall 1 → No merge (Scenario 2)
  - P13 (over P3): Middle pole of Wall 1 → No merge (Scenario 2)
  - P14: Free placement
  - P15 (over P9): Endpoint of Wall 3 (closed) → Merge candidate
  - P16 (over P10): Another pole of Wall 3 → Creates closed loop
  - P17 (over P6): Endpoint of Wall 2 → Merge candidate
  - P18 (over P7): Another endpoint of Wall 2 → Closes with Wall 2
  - P19 (over P3): Middle pole of Wall 1 → Split point
  - P20: End

Result:
  - Wall 1 (Open): P1->P2->P3->P4->P5 [unchanged]
  - Wall 2 (Open): P7->P8 [P6 merged]
  - Wall 3 (Closed): P9->P10->P11 [unchanged]
  - Wall 4 (Open): P11->P12
  - Wall 5 (Closed): P3->P14->P9->P10->P6->P7
  - Wall 6 (Open): P3->P20

After Global Undo:
  - Wall 1 (Open): P1->P2->P3->P4->P5
  - Wall 2 (Open): P6->P7->P8
  - Wall 3 (Closed): P9->P10->P11
```

### Complex Example 2: Splitting Closed Wall During Edit

```
Initial State: Wall 1 (Closed): P1->P2->P3->P4->P5->P6

Edit Operations:
  1. ALT+Delete P3 → Creates temp pole P7 (over P3)
  2. Move P7 to new position
  3. Create new pole P8 (over P5)

Temporary State: Wall 1 (Open): P7->P4->P5->P6->P1->P2->P3 with P8 over P5

Analysis:
  - P7->P8 creates segment over existing pole P5
  - Creates closed loop from P7 to P5 back to P7

After Confirm:
  - Wall 1 (Closed): P1->P2->P5->P6
  - Wall 2 (Closed): P2->P3->P4->P5

After Global Undo: Wall 1 (Closed): P1->P2->P3->P4->P5->P6
```

### Complex Example 3: Moving Pole Creates Split (Closed Wall)

```
Initial State: Wall 1 (Closed): P1->P2->P3->P4->P5->P6

Edit Operation: Move P5 over P2 (drag and drop)

Analysis:
  - P5 now overlaps P2
  - Creates closed segment: P2->P3->P4->P5 (back to P2)
  - Remaining segment: P1->P2->P5->P6

Result:
  - Wall 1 (Closed): P1->P2->P6
  - Wall 2 (Closed): P2->P3->P4

After Global Undo: Wall 1 (Closed): P1->P2->P3->P4->P5->P6
```

### Complex Example 4: Moving Pole Creates Closed + Open (Closed Wall)

```
Initial State: Wall 1 (Closed): P1->P2->P3->P4->P5->P6

Edit Operation: Move P4 over P2

Analysis:
  - P4 now overlaps P2
  - Creates closed segment: P2->P3->P4 (back to P2)
  - Remaining open segment: P2->P5->P6->P1 (only 2 unique poles after dedup)

Result:
  - Wall 1 (Closed): P1->P2->P5->P6
  - Wall 2 (Open): P2->P3

After Global Undo: Wall 1 (Closed): P1->P2->P3->P4->P5->P6
```

---

## Edge Cases and Special Considerations

### Tolerance and Overlap Detection
- **Collision Tolerance**: 5 pixels (configurable)
- **Pole-on-Pole**: Poles within tolerance are considered overlapping
- **Pole-on-Edge**: Pole within tolerance of line segment
- **Edge-on-Edge**: Intersection detection between line segments

### Auto-Close Detection
- **During Placement**: When last pole is within tolerance of first pole
- **Tolerance**: 15 pixels / scale (adaptive based on zoom)
- **Minimum Poles**: 3 poles required for closure
- **Priority**: Auto-close takes precedence over endpoint merge

### Wall Indexing
- **New Walls**: Assigned next available index
- **Merged Walls**: Use lowest index from involved walls
- **Deleted Walls**: Removed from encounter
- **Index Gaps**: Allowed (indices are not renumbered)

### Pole Height Preservation
- **Merge Operations**: Height copied from target wall poles
- **New Poles**: Use default height
- **Edit Operations**: Preserve existing heights

### Color and Material Properties
- **Merge**: Target wall properties preserved
- **Split**: Original wall properties copied to new walls
- **New Walls**: Use default or user-specified properties

---

## Implementation Status

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Simple Placement | ✅ Implemented | Tested and verified |
| 2. Edge/Middle Overlap | ✅ Implemented | Tested and verified |
| 3. Endpoint Merge | ✅ Implemented | Fixed: Array index → wall.index |
| 4. Self-Close | ✅ Implemented | Tested and verified |
| 5. Both Endpoints Merge | 🔄 In Testing | Complex merge scenario |
| 6. Self-Loop (New) | 🔄 In Testing | Split during placement |
| 7. Self-Loop (Extend) | 🔄 In Testing | Split during extension |
| 8. Edge Overlap Split | 🔄 In Testing | Multiple wall creation |
| 9.1. Delete Pole | ✅ Implemented | Tested and verified |
| 9.2. Split Wall (Open) | 🔄 In Testing | ALT+Delete implementation |
| 9.3. Open Wall (Closed) | 🔄 In Testing | ALT+Delete implementation |

**Legend:**
- ✅ Implemented and tested
- 🔄 Implemented, testing in progress
- ⏳ Planned
- ❌ Not implemented

---

## Testing Checklist

### Scenario 1 Tests
- [ ] Place simple open wall (2 poles)
- [ ] Place simple open wall (5 poles)
- [ ] Place multiple independent walls
- [ ] Undo simple placement

### Scenario 2 Tests
- [ ] Place over middle pole of existing wall
- [ ] Place over edge of existing wall
- [ ] Place crossing multiple edges
- [ ] Undo edge overlap placement

### Scenario 3 Tests
- [ ] Extend wall from last pole
- [ ] Extend wall from first pole
- [ ] Merge two walls (last to first)
- [ ] Merge two walls (first to last)
- [ ] Undo wall merge

### Scenario 4 Tests
- [ ] Close wall (3 poles)
- [ ] Close wall (5 poles)
- [ ] Auto-close on proximity
- [ ] Undo self-close

### Scenario 5 Tests
- [ ] Close by connecting both endpoints
- [ ] Reverse direction closure
- [ ] Undo endpoint closure

### Scenario 6 Tests
- [ ] Loop at midpoint (new wall)
- [ ] Loop at early pole
- [ ] Loop at late pole
- [ ] Undo self-loop placement

### Scenario 7 Tests
- [ ] Loop at midpoint (extension)
- [ ] Loop at second pole
- [ ] Loop at fourth pole
- [ ] Undo self-loop extension

### Scenario 8 Tests
- [ ] Split on single edge overlap
- [ ] Split on multiple edge overlaps
- [ ] Edge overlap with closed wall
- [ ] Undo edge split

### Scenario 9 Tests
- [ ] Delete middle pole (open wall)
- [ ] Delete middle pole (closed wall)
- [ ] Delete causing auto-open
- [ ] Delete causing removal
- [ ] ALT+Delete split open wall
- [ ] ALT+Delete open closed wall
- [ ] Undo pole deletion
- [ ] Undo wall split
- [ ] Undo wall opening

### Complex Scenario Tests
- [ ] Multi-wall merge and split
- [ ] Split closed wall during edit
- [ ] Move pole creates split
- [ ] Move pole creates closed + open

---

## Known Issues and Limitations

### Current Issues (2025-11-11)
1. ✅ **FIXED**: Wall edit flicker - Wall briefly showing original position when pressing Enter
2. ✅ **FIXED**: Wall merge losing poles - Only new poles shown instead of merged result
3. ✅ **FIXED**: Array index vs wall.index mismatch in merge detection
4. 🔄 **Testing**: Scenarios 5-8 require comprehensive testing
5. 🔄 **Testing**: ALT+Delete functionality (9.2, 9.3)

### Limitations
- Maximum poles per wall: No enforced limit (performance may degrade with 1000+ poles)
- Undo history: Limited by browser memory
- Concurrent editing: Not supported (single user edit mode)

---

## Future Enhancements

1. **Snap-to-Grid Enhancement**: Configurable snap tolerance
2. **Visual Feedback**: Real-time merge/split preview during placement
3. **Batch Operations**: Select and delete/move multiple poles
4. **Wall Properties**: Per-pole height/material variations
5. **Templates**: Save and reuse common wall patterns
6. **Import/Export**: Copy/paste walls between encounters

---

## References

- **Debugging Log**: `Documents/Tasks/EPIC-001/phases/PHASE_8.8_DEBUGGING_SESSIONS.md`
- **Phase 6 Spec**: `Documents/Tasks/EPIC-001/phases/PHASE_6_SCENE_EDITOR.md`
- **Implementation**: `Source/WebClientApp/src/components/encounter/drawing/WallDrawingTool.tsx`
- **Merge Logic**: `Source/WebClientApp/src/utils/wallMergeUtils.ts`
- **Split Logic**: `Source/WebClientApp/src/utils/wallSplitUtils.ts`

---

**Last Reviewed**: 2025-11-11
**Next Review**: After completing Scenarios 5-8 testing
