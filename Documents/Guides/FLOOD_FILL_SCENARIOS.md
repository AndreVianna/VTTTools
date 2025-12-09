# Flood Fill Algorithm - Test Scenarios

This document describes all scenarios the region flood fill algorithm must handle correctly.

---

## Scenario 1: Simple Closed Room

**Description:** Click inside a single closed rectangular room.

```text
┌─────────────┐
│             │
│      ●      │
│             │
└─────────────┘
```

**Expected:** Fill only the room interior.

---

## Scenario 2: Room with Internal Division

**Description:** A room divided by an internal wall creating two sub-rooms.

```text
┌──────┬──────┐
│      │      │
│  ●   │   ○  │
│      │      │
└──────┴──────┘
```

**Expected:**
- Click at ● → Fill left sub-room only
- Click at ○ → Fill right sub-room only

---

## Scenario 3: L-Shaped Room

**Description:** An L-shaped room formed by walls.

```text
┌───────┐
│       │
│   ●   └────┐
│            │
└────────────┘
```

**Expected:** Fill the entire L-shaped interior.

---

## Scenario 4: Room with Multiple Internal Divisions

**Description:** A building with multiple rooms created by internal walls.

```text
┌─────┬─────┬─────┐
│     │     │     │
│  ●  │  ○  │  ◇  │
│     │     │     │
├─────┴─────┼─   ─┤
│           │     │
│     ◆     │     │
│           │     │
└───────────┴─────┘
```

**Expected:**
- Click at ● → Fill top-left room only
- Click at ○ → Fill top-middle room only
- Click at ◇ → Fill top-right + bottom-right area (connected)
- Click at ◆ → Fill bottom-left area only

---

## Scenario 5: Nested Rooms (Room Inside Room)

**Description:** A smaller room completely inside a larger room.

```text
┌─────────────────┐
│                 │
│    ┌───────┐    │
│    │       │    │
│  ● │   ○   │    │
│    │       │    │
│    └───────┘    │
│                 │
└─────────────────┘
```

**Expected:**
- Click at ● → Fill outer room (excluding inner room/area)
- Click at ○ → Fill inner room only

---

## Scenario 6: Click Outside All Walls

**Description:** Click in unbounded area outside any closed structure.

```text
        ●

    ┌───────┐
    │       │
    │   ○   │
    │       │
    └───────┘
```

**Expected:**
- Click at ● → Fill entire stage  (excluding closed room/area)
- Click at ○ → Fill room interior only

---

## Scenario 7: Open Wall (Not Closed Polygon)

**Description:** Walls that don't form a closed shape.

```text
    ───────┐
           │
    ●      │   │
               │
      ─────────┴──
```

**Expected:** Click at ● → Fill entire stage (walls don't enclose the area)

---

## Scenario 8: T-Junction Internal Wall

**Description:** Internal wall connecting to external wall at a T-junction.

```text
┌──────┬──────┐
│      │      │
│  ●   │   ○  │
│      │      │
│      │      │
│             │
│      ◆      │
└─────────────┘
```

**Expected:**
No matter where you click fill the whole room

---

## Scenario 9: Door (Open vs Closed)

**Description:** Room with a door segment.

```text
┌─────┬─────┐
│     │     │
│  ●  D  ○  │
│     │     │
└─────┴─────┘

D = Door segment
```

**Expected:**
- Door (Ignores OPEN and CLOSED) → ● and ○ are separate rooms

---

## Scenario 10: Window (Open vs Closed)

**Description:** Room with a window segment.

```text
┌─────┬─────┐
│     │     │
│  ●  W  ○  │
│     │     │
└─────┴─────┘

W = Window segment
```

**Expected:**
- Window (Ignores OPEN and CLOSED) → ● and ○ are separate rooms

---

## Scenario 11: Passage (Always Open Door)

**Description:** Door preset with isOpaque=false (always passable).

```text
┌─────┬─────┐
│     │     │
│  ●  P  ○  │
│     │     │
└─────┴─────┘

P = Passage (Door + isOpaque=false)
```

**Expected:** ● and ○ are always connected regardless of state.

---

## Scenario 12: Fence (See-Through Barrier)

**Description:** Wall with isOpaque=false (fence - blocks movement but not vision).

```text
┌─────╥─────┐
│     ║     │
│  ●  ║  ○  │
│     ║     │
└─────╨─────┘

║ = Fence (Wall + isOpaque=false)
```

**Expected:** ● and ○ are separate rooms (fence blocks fill).

---
## Scenario 13: Opening (Always open window)

**Description:** Window preset with isOpaque=false (always passable).

```text
┌─────┬─────┐
│     │     │
│  ●  O  ○  │
│     │     │
└─────┴─────┘

O = Opening (Window + isOpaque=false)
```

**Expected:** ● and ○ are always connected regardless of state.

---

## Scenario 14: Complex Building Layout

**Description:** Real-world building with multiple rooms, corridors, and doors.

```text
┌───W───┬─D─┬───W───W───┐
│       │   │           │
W  BED  │   │  LIVING   │
│       D   D           │
├───────┤   ├─────┬─PPP─┤
│       D   │     O     │
W BATH  │   │ KIT │ DIN W
│       │   D     P     │
├───────┴───┴─D───┴─────┤
│                       │
│        Backyard       │
╘═══════════════════════╛

D = Door
W = Window
P = Passage
O = Opening
═ = Fence
```

**Expected:** Each room fills independently unless connected by passages or openings.

---

## Scenario 15: Walls Extending Beyond Stage

**Description:** Walls that extend outside the visible stage area.

```text
─────────┬──────────────
         │
    ●    │    ○
         │
─────────┼──────────────
         │
         │
```

**Expected:**
- Click at ● → Fill left side of stage
- Click at ○ → Fill right side of stage

---

## Segment Type Reference

| Preset   | SegmentType | isOpaque | Default State | Blocks Fill? |
|----------|-------------|----------|---------------|--------------|
| Wall     | Wall        | true     | Visible       | Always       |
| Fence    | Wall        | false    | Visible       | Always       |
| Door     | Door        | true     | Closed        | Always       |
| Window   | Window      | true     | Closed        | Always       |
| Passage  | Door        | false    | Open          | Never        |
| Opening  | Window      | false    | Open          | Never        |

---

## Summary

The flood fill algorithm must:

1. **Consider ALL wall segments** - not just closed polygons
2. **Respect segment visibility** - walls, fences, doors, and windows are always blocking; passages and openings are always non-blocking
3. **Handle internal divisions** - T-junctions, crosses, partial walls
4. **Detect unbounded areas** - return isFullStage when click is outside all enclosures
5. **Support nested structures** - rooms inside rooms
6. **Work with any wall angle** - not just axis-aligned
ResourceService.cs
