# Grid Display Implementation Task

## Overview

### What is VTT Tools?
VTT Tools is a Virtual Table Top application for playing tabletop role-playing games (RPGs) online. Think of it as a digital replacement for a physical game table where players move miniatures and interact with maps.

### Why Do We Need Grids?
In tabletop RPGs, grids are essential for:
- **Movement**: Players move characters a specific number of grid squares
- **Distance**: Combat range, spell areas, and line-of-sight calculations
- **Positioning**: Tactical combat requires precise character placement
- **Measurement**: Each grid square typically represents 5 feet in game distance

### Feature Requirements
We need to implement a grid display system that:
- Shows overlay grids on top of background images (maps)
- Supports different grid types: Square, Hexagonal, Isometric
- Allows fine-tuning to align with grids already drawn on background images
- Follows background image panning and zooming exactly
- Can be shown/hidden and configured in real-time

## Current State Analysis

### ✅ What's Already Working

#### 1. Complete Domain Models
```csharp
// Source/Domain/Library/Scenes/Model/Grid.cs
public record Grid {
    public GridType Type { get; init; }                    // NoGrid, Square, HexV, HexH, Isometric  
    public Vector2 CellSize { get; init; } = new(50, 50);  // Float precision for fine-tuning
    public Vector2 Offset { get; init; }                   // Alignment offset
    public bool Snap { get; init; }                        // Future snap-to-grid feature
}
```

#### 2. Working Data Flow
- Scene.Grid (C#) → GridDetails (DTO) → ILayersSetup.grid (TypeScript) → GridLayer
- Grid settings modal UI exists
- Basic TypeScript grid rendering infrastructure

#### 3. Basic Grid Rendering
```typescript
// Source/WebApp.WebAssembly/src/layers/GridLayer.ts - Already exists!
private renderSquareGrid(offsetX: number, offsetY: number, cellWidth: number, cellHeight: number): void {
    this.drawVerticalLines(offsetX, cellWidth, canvasWidth, canvasHeight);
    this.drawHorizontalLines(offsetY, cellHeight, canvasWidth, canvasHeight);
}
```

### ❌ Critical Issues to Fix

#### 1. 🚨 BLOCKING ISSUE: Grid Doesn't Follow Background Panning
**Problem**: Grid only receives zoom scaling, not panning translation
**Root Cause**: `Layer.render()` only applies `ctx.scale()`, missing translation transform
**Impact**: Grid appears to "float" independently of background image

#### 2. No Grid Visibility Control  
**Problem**: `GridType.NoGrid` is ignored, grid always shows
**Impact**: Users can't hide the grid when not needed

#### 3. Grid Settings Disconnected
**Problem**: Grid settings modal exists but changes don't update the actual grid
**Impact**: Users can configure grid but nothing happens

## Technical Solution Approach

### Architecture Overview
```
Background Layer  ←─┐
Grid Layer        ←─┼─ All layers must use same transformation matrix
Assets Layer      ←─┘
```

### Transformation Strategy
```typescript
// Current (broken):
ctx.scale(zoomLevel, zoomLevel);  // Only zoom, no panning

// Fixed (needed):
ctx.setTransform(
    zoomLevel, 0, 0, zoomLevel,    // Scale transform
    panning.x * zoomLevel,         // Translate X with zoom applied
    panning.y * zoomLevel          // Translate Y with zoom applied  
);
```

### Data Flow Requirements
```
Scene.Stage.Panning (C#) → StageDetails (DTO) → TypeScript → Layer.render()
```

## Development Roadmap

| Phase | Timeline | Objective | Deliverable |
|-------|----------|-----------|-------------|
| 1 | Week 1 | Fix grid transformation | Grid follows background panning |
| 2 | Week 2 | Grid visibility control | Grid show/hide works |
| 3 | Week 3 | Grid configuration | Real-time grid updates |
| 4 | Week 4 | Polish & testing | Production-ready grid |

---

## Phase 1: Fix Grid Transformation (CRITICAL)

### Objective
Make the grid follow background image panning and zooming exactly.

### Context
This is the blocking issue that must be fixed first. Currently, the grid only receives zoom information but not panning information, causing it to appear disconnected from the background.

### Task 1.1: Investigate Current Panning Data Flow

**Goal**: Understand how Stage.Panning currently flows from C# to TypeScript

**Steps**:
1. Open `Source/Domain/Library/Scenes/Model/Stage.cs`
2. Verify `Stage` has `Point Panning { get; init; }`
3. Open `Source/WebApp.Common/Contracts/Library/Scenes/StageDetails.cs`
4. Check if `StageDetails` includes panning information
5. Open `Source/WebApp.WebAssembly/src/types/ILayersSetup.ts`
6. Verify if panning data reaches TypeScript

**Expected Finding**: Panning data may not be flowing to TypeScript at all

**Files to Check**:
- `Source/Domain/Library/Scenes/Model/Stage.cs`
- `Source/WebApp.Common/Contracts/Library/Scenes/StageDetails.cs`
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`

**Acceptance Criteria**:
- Document current panning data flow
- Identify where panning data is lost or missing
- Create plan to fix data flow if needed

### Task 1.2: Update Layer Rendering Interface

**Goal**: Modify base Layer class to accept panning information

**Steps**:
1. Open `Source/WebApp.WebAssembly/src/layers/Layer.ts`
2. Update the `render()` method signature:

**Before**:
```typescript
render(zoomLevel: number): void {
    this.clear();
    this.ctx.scale(zoomLevel, zoomLevel);
    this.drawLayer();
}
```

**After**:
```typescript
render(zoomLevel: number, panning: Point = { x: 0, y: 0 }): void {
    this.clear();
    this.ctx.setTransform(
        zoomLevel, 0, 0, zoomLevel,     // Scale transformation
        panning.x * zoomLevel,          // Translate X with zoom applied
        panning.y * zoomLevel           // Translate Y with zoom applied
    );
    this.drawLayer();
}
```

3. Add import for Point type if needed:
```typescript
import { IPoint as Point } from '../types/IPoint';
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/src/layers/Layer.ts`

**Acceptance Criteria**:
- `Layer.render()` accepts panning parameter with default value
- Canvas transformation includes both zoom and panning
- All existing functionality continues to work

### Task 1.3: Update SceneBuilder Render Calls

**Goal**: Pass panning data to all layer render calls

**Steps**:
1. Open `Source/WebApp.WebAssembly/src/SceneBuilder.ts`
2. Find the `render()` method (around line 102)
3. Update the layer render calls:

**Before**:
```typescript
private static render(): void {
    const state = this.builder.state;
    for (const layer of this.builder.layers) {
        layer.render(state.zoomLevel);
    }
}
```

**After**:
```typescript
private static render(): void {
    const state = this.builder.state;
    const panning = { x: state.panning?.x || 0, y: state.panning?.y || 0 };
    for (const layer of this.builder.layers) {
        layer.render(state.zoomLevel, panning);
    }
}
```

4. Ensure `IBuilderState` includes panning information:
```typescript
interface IBuilderState {
    // ... existing properties
    panning?: Point;
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/src/SceneBuilder.ts`
- `Source/WebApp.WebAssembly/src/types/IBuilderState.ts` (if panning not included)

**Acceptance Criteria**:
- All layer render calls include panning data
- Panning defaults to (0,0) if not available
- No compilation errors

### Task 1.4: Ensure Panning Data Flows from C# to TypeScript

**Goal**: Complete the data flow from Scene.Stage.Panning to TypeScript

**Steps**:
1. Open `Source/WebApp.Common/Contracts/Library/Scenes/StageDetails.cs`
2. Ensure it includes panning:
```csharp
public record StageDetails {
    public ResourceFileInfo Background { get; init; } = null!;
    public float ZoomLevel { get; init; } = 1;
    public Point Panning { get; init; }  // ← Ensure this exists
}
```

3. Open `Source/WebApp.WebAssembly/src/types/IStage.ts` (create if needed)
4. Ensure TypeScript interface matches:
```typescript
interface IStage {
    background: ResourceFileInfo;
    zoomLevel: number;
    panning: Point;
}
```

5. Update `ILayersSetup.ts` to include stage:
```typescript
interface ILayersSetup {
    imageUrl: string;
    stage: IStage;        // ← Add this
    grid: IGrid;
    assets: IAsset[];
}
```

6. Update SceneBuilder setup to use stage panning data

**Files to Modify**:
- `Source/WebApp.Common/Contracts/Library/Scenes/StageDetails.cs`
- `Source/WebApp.WebAssembly/src/types/IStage.ts` (create)
- `Source/WebApp.WebAssembly/src/types/ILayersSetup.ts`
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`

**Acceptance Criteria**:
- Stage.Panning flows from C# to TypeScript
- SceneBuilder receives and uses panning data
- All layers can access current panning state

### Task 1.5: Test Grid Transformation

**Goal**: Verify grid follows background panning correctly

**Steps**:
1. Build and run the application
2. Navigate to Scene Builder
3. Load a scene with a background image and grid enabled
4. Test panning with right-mouse drag
5. Verify grid moves exactly with background
6. Test zooming with mouse wheel
7. Verify grid scales correctly with background

**Manual Testing Checklist**:
- [ ] Grid appears on top of background image
- [ ] Grid moves exactly with background during panning
- [ ] Grid scales correctly during zoom operations
- [ ] Grid maintains alignment at different zoom levels
- [ ] No visual lag or separation between grid and background

**Acceptance Criteria**:
- Grid transformation matches background transformation exactly
- No visual separation between grid and background during operations
- Grid remains aligned at all zoom levels

---

## Phase 2: Grid Visibility Control

### Objective
Implement proper grid show/hide functionality and connect the grid settings modal.

### Task 2.1: Handle GridType.NoGrid

**Goal**: Make grid disappear when GridType.NoGrid is selected

**Steps**:
1. Open `Source/WebApp.WebAssembly/src/layers/GridLayer.ts`
2. Update the `drawLayer()` method:

**Before**:
```typescript
protected drawLayer(): void {
    const offsetX = this.grid.offset?.x || 0;
    const offsetY = this.grid.offset?.y || 0;
    const cellWidth = this.grid.cell?.width || RenderConstants.defaultGridCellSize;
    const cellHeight = this.grid.cell?.height || RenderConstants.defaultGridCellSize;

    console.log("Drawing Grid:", this.grid);
    switch (this.grid.type) {
        case GridType.Square:
            this.renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight);
            break;
        case GridType.HexV:
        case GridType.HexH:
        case GridType.Isometric:
            this.renderUnsupportedGridMessage("Grid type not supported.");
            break;
    }
}
```

**After**:
```typescript
protected drawLayer(): void {
    // Early return for no grid - this hides the grid completely
    if (this.grid.type === GridType.NoGrid) {
        return;
    }

    const offsetX = this.grid.offset?.x || 0;
    const offsetY = this.grid.offset?.y || 0;
    const cellWidth = this.grid.cell?.width || RenderConstants.defaultGridCellSize;
    const cellHeight = this.grid.cell?.height || RenderConstants.defaultGridCellSize;

    switch (this.grid.type) {
        case GridType.Square:
            this.renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight);
            break;
        case GridType.HexV:
        case GridType.HexH:
        case GridType.Isometric:
            this.renderUnsupportedGridMessage("Grid type not supported.");
            break;
    }
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/src/layers/GridLayer.ts`

**Acceptance Criteria**:
- Grid disappears when GridType.NoGrid is set
- Grid appears when any other GridType is set
- No errors or console warnings

### Task 2.2: Connect Grid Settings Modal

**Goal**: Wire the grid settings modal to actually update the grid

**Steps**:
1. Open `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor`
2. Find the grid settings modal
3. Ensure grid settings form has proper binding:

```html
<!-- Grid Settings Modal -->
<div class="modal" id="grid-settings-modal">
    <div class="modal-content">
        <h3>Grid Settings</h3>
        
        <label>Grid Type:</label>
        <select @bind="GridSettings.Type" @bind:after="UpdateGrid">
            <option value="@GridType.NoGrid">No Grid</option>
            <option value="@GridType.Square">Square</option>
            <option value="@GridType.HexV">Hexagonal (Vertical)</option>
            <option value="@GridType.HexH">Hexagonal (Horizontal)</option>
            <option value="@GridType.Isometric">Isometric</option>
        </select>
        
        <label>Cell Width:</label>
        <input type="number" @bind="GridSettings.CellSize.X" @bind:after="UpdateGrid" step="0.1" />
        
        <label>Cell Height:</label>
        <input type="number" @bind="GridSettings.CellSize.Y" @bind:after="UpdateGrid" step="0.1" />
        
        <label>Offset X:</label>
        <input type="number" @bind="GridSettings.Offset.X" @bind:after="UpdateGrid" step="0.1" />
        
        <label>Offset Y:</label>
        <input type="number" @bind="GridSettings.Offset.Y" @bind:after="UpdateGrid" step="0.1" />
        
        <button @onclick="CloseGridSettings">Close</button>
    </div>
</div>
```

4. Open `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`
5. Add grid update method:

```csharp
private async Task UpdateGrid()
{
    // Update the current scene's grid settings
    State.Scene.Grid = GridSettings;
    
    // Trigger grid re-render via JavaScript interop
    await JS.InvokeVoidAsync("SceneBuilder.updateGrid", new {
        type = (int)GridSettings.Type,
        cell = new { width = GridSettings.CellSize.X, height = GridSettings.CellSize.Y },
        offset = new { x = GridSettings.Offset.X, y = GridSettings.Offset.Y },
        snap = GridSettings.Snap
    });
}
```

6. Update `SceneBuilder.ts` to handle grid updates:

```typescript
static updateGrid(gridConfig: IGrid): void {
    // Find existing grid layer
    const gridLayer = this.builder.layers.find(l => l.id === 'grid') as GridLayer;
    if (gridLayer) {
        // Update grid configuration
        (gridLayer as any).grid = gridConfig;
        // Re-render just the grid layer
        gridLayer.render(this.builder.state.zoomLevel, this.builder.state.panning);
    }
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor`
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`
- `Source/WebApp.WebAssembly/src/SceneBuilder.ts`

**Acceptance Criteria**:
- Grid settings modal controls are properly bound
- Changes in modal immediately update the visible grid
- No page refresh required for grid updates
- Grid configuration persists during session

---

## Phase 3: Grid Configuration Integration

### Objective
Complete real-time grid configuration with fine-tuning controls for perfect alignment.

### Task 3.1: Implement Real-time Grid Updates

**Goal**: Show grid changes immediately as user adjusts settings

**Steps**:
1. Update grid settings modal to use `@oninput` instead of `@onchange` for immediate updates:

```html
<input type="number" @bind="GridSettings.CellSize.X" @oninput="UpdateGridRealtime" step="0.1" />
<input type="range" @bind="GridSettings.Offset.X" @oninput="UpdateGridRealtime" 
       min="-100" max="100" step="0.1" />
```

2. Add real-time update method:

```csharp
private async Task UpdateGridRealtime(ChangeEventArgs e)
{
    // Update immediately without waiting for blur
    await UpdateGrid();
}
```

3. Add visual feedback for grid alignment:

```typescript
// In GridLayer.ts - add grid highlighting for fine-tuning
private renderGridWithHighlight(offsetX: number, offsetY: number, cellWidth: number, cellHeight: number): void {
    // Normal grid rendering
    this.renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight);
    
    // Add highlighting for alignment feedback
    this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow highlight
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(offsetX, offsetY, cellWidth, cellHeight); // Highlight first cell
    this.ctx.strokeStyle = '#000000'; // Reset to default
    this.ctx.lineWidth = 1;
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor`
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`
- `Source/WebApp.WebAssembly/src/layers/GridLayer.ts`

**Acceptance Criteria**:
- Grid updates immediately as user drags sliders
- Visual feedback helps user align grid with background
- No performance issues during real-time updates

### Task 3.2: Grid Settings Persistence

**Goal**: Save and restore grid settings properly

**Steps**:
1. Ensure grid settings are saved when scene is saved
2. Add grid validation:

```csharp
private bool ValidateGridSettings()
{
    if (GridSettings.CellSize.X <= 0 || GridSettings.CellSize.Y <= 0)
    {
        // Show error message
        return false;
    }
    return true;
}
```

3. Add grid reset functionality:

```csharp
private void ResetGridToDefaults()
{
    GridSettings = new GridDetails
    {
        Type = GridType.Square,
        CellSize = new Vector2(50, 50),
        Offset = new Vector2(0, 0),
        Snap = false
    };
    await UpdateGrid();
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs`

**Acceptance Criteria**:
- Grid settings save with scene
- Grid settings restore when scene loads
- Invalid grid settings show helpful error messages
- Reset button restores sensible defaults

---

## Phase 4: Polish & Testing

### Objective
Create a production-ready grid implementation with proper styling and comprehensive testing.

### Task 4.1: Grid Visual Styling

**Goal**: Add configurable grid appearance options

**Steps**:
1. Add grid styling configuration:

```typescript
interface IGridStyle {
    color: string;
    opacity: number;
    lineWidth: number;
}

// In GridLayer.ts
private applyGridStyle(style: IGridStyle): void {
    this.ctx.strokeStyle = style.color;
    this.ctx.globalAlpha = style.opacity;
    this.ctx.lineWidth = style.lineWidth;
}
```

2. Add styling controls to grid settings modal:

```html
<label>Grid Color:</label>
<input type="color" @bind="GridSettings.Color" @bind:after="UpdateGrid" />

<label>Grid Opacity:</label>
<input type="range" @bind="GridSettings.Opacity" @bind:after="UpdateGrid" 
       min="0.1" max="1.0" step="0.1" />
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/src/layers/GridLayer.ts`
- `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor`

**Acceptance Criteria**:
- Grid color can be customized
- Grid opacity can be adjusted
- Grid line thickness can be configured
- Visual changes apply immediately

### Task 4.2: Performance Optimization

**Goal**: Ensure grid renders efficiently

**Steps**:
1. Add performance monitoring:

```typescript
private renderSquareGrid(offsetX: number, offsetY: number, cellWidth: number, cellHeight: number): void {
    const startTime = performance.now();
    
    // ... existing rendering code ...
    
    const endTime = performance.now();
    if (endTime - startTime > 16) { // More than one frame at 60fps
        console.warn(`Grid rendering took ${endTime - startTime}ms`);
    }
}
```

2. Optimize line drawing:

```typescript
private drawOptimizedLines(isVertical: boolean, start: number, step: number, maxCanvas: number, crossStart: number, crossEnd: number): void {
    this.ctx.beginPath();
    for (let pos = start; pos < maxCanvas; pos += step) {
        this.ctx.moveTo(isVertical ? pos : crossStart, isVertical ? crossStart : pos);
        this.ctx.lineTo(isVertical ? pos : crossEnd, isVertical ? crossEnd : pos);
    }
    this.ctx.stroke();
}
```

**Files to Modify**:
- `Source/WebApp.WebAssembly/src/layers/GridLayer.ts`

**Acceptance Criteria**:
- Grid renders in under 16ms (60fps)
- No performance degradation during pan/zoom
- Efficient line drawing algorithms

### Task 4.3: Comprehensive Testing

**Goal**: Validate grid works correctly in all scenarios

**Testing Scenarios**:

#### Manual Testing Checklist

**Basic Functionality**:
- [ ] Grid appears when GridType.Square is selected
- [ ] Grid disappears when GridType.NoGrid is selected
- [ ] Grid follows background during panning
- [ ] Grid scales correctly during zoom
- [ ] Grid settings modal opens and closes properly

**Grid Alignment**:
- [ ] Grid cell size adjustments work with decimal precision
- [ ] Grid offset fine-tuning aligns with background images
- [ ] Grid maintains alignment at different zoom levels
- [ ] Grid positioning is consistent across browser sessions

**Performance**:
- [ ] No lag during real-time grid updates
- [ ] Smooth performance during pan and zoom operations
- [ ] No memory leaks during extended use
- [ ] Responsive grid updates in settings modal

**Cross-Browser Testing**:
- [ ] Chrome: Grid renders correctly
- [ ] Firefox: Grid renders correctly  
- [ ] Edge: Grid renders correctly
- [ ] Safari (if accessible): Grid renders correctly

**Error Handling**:
- [ ] Invalid grid settings show appropriate errors
- [ ] Grid gracefully handles missing data
- [ ] No console errors during normal operation

#### Automated Testing Opportunities

```typescript
// Example unit test for grid calculations
describe('GridLayer', () => {
    test('calculates correct vertical line positions', () => {
        const grid = new GridLayer({
            type: GridType.Square,
            cell: { width: 50, height: 50 },
            offset: { x: 10, y: 10 },
            snap: false
        });
        
        const positions = grid.calculateVerticalLinePositions(0, 200);
        expect(positions).toEqual([10, 60, 110, 160]);
    });
});
```

**Acceptance Criteria**:
- All manual testing scenarios pass
- No console errors during testing
- Performance meets requirements (smooth at 60fps)
- Grid works consistently across supported browsers

---

## Testing Guidelines

### Development Testing

1. **After Each Task**: Run the specific acceptance criteria
2. **After Each Phase**: Complete the phase testing checklist
3. **Before Deployment**: Run the comprehensive testing scenarios

### Test Environment Setup

1. **Build Application**:
   ```bash
   cd Source
   dotnet build VttTools.sln
   ```

2. **Run Application**:
   ```bash
   cd Source
   dotnet run --project AppHost
   ```

3. **Navigate to Scene Builder**:
   - Create or open an adventure
   - Create or open a scene
   - Navigate to Scene Builder

### Common Testing Scenarios

#### Scenario 1: Basic Grid Display
1. Load Scene Builder with a background image
2. Set GridType to Square
3. Verify grid appears over background
4. Adjust cell size and verify immediate update

#### Scenario 2: Grid Alignment
1. Load a background image that already has a grid
2. Use offset controls to align overlay grid with background grid
3. Verify alignment persists during zoom/pan operations

#### Scenario 3: Grid Visibility
1. Set GridType to NoGrid
2. Verify grid disappears completely
3. Switch back to Square grid
4. Verify grid reappears with previous settings

---

## Common Issues & Troubleshooting

### Issue: Grid Not Appearing

**Symptoms**: Grid settings show Square type but no grid visible

**Possible Causes**:
- GridType.NoGrid case not handled properly
- Canvas transformation issues
- Grid data not flowing from C# to TypeScript

**Debug Steps**:
1. Check browser console for errors
2. Verify grid data in SceneBuilder setup: `console.log("Grid setup:", setup.grid)`
3. Check if GridLayer.drawLayer() is being called: Add `console.log("Drawing grid")`

### Issue: Grid Not Following Background

**Symptoms**: Grid appears to "float" independently of background

**Possible Causes**:
- Panning data not reaching GridLayer
- Transformation matrix incorrect
- Different transformation applied to different layers

**Debug Steps**:
1. Verify panning data: `console.log("Panning:", panning)`
2. Check transformation matrix: `console.log("Transform:", ctx.getTransform())`
3. Compare with BackgroundLayer transformation

### Issue: Grid Settings Not Updating

**Symptoms**: Modal changes don't affect visible grid

**Possible Causes**:
- Event handlers not wired correctly
- Grid update method not called
- JavaScript interop issues

**Debug Steps**:
1. Check if update methods are called: Add `console.log("UpdateGrid called")`
2. Verify JavaScript interop: Check browser console for JS errors
3. Confirm grid configuration reaches TypeScript: Log received data

### Issue: Performance Problems

**Symptoms**: Lag during grid operations, slow rendering

**Possible Causes**:
- Inefficient line drawing
- Too many render calls
- Large grid sizes

**Debug Steps**:
1. Monitor render times: Add `performance.now()` measurements
2. Check render frequency: Count render calls per second
3. Test with different grid sizes: Identify performance thresholds

---

## File Reference

### Key Files for Grid Implementation

| File | Purpose | Phase |
|------|---------|-------|
| `Source/Domain/Library/Scenes/Model/Grid.cs` | Domain model | All |
| `Source/WebApp.Common/Contracts/Library/Scenes/GridDetails.cs` | DTO | All |
| `Source/WebApp.WebAssembly/src/layers/GridLayer.ts` | Grid rendering | 1,2,3,4 |
| `Source/WebApp.WebAssembly/src/layers/Layer.ts` | Base layer class | 1 |
| `Source/WebApp.WebAssembly/src/SceneBuilder.ts` | Main scene builder | 1,2,3 |
| `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor` | UI | 2,3 |
| `Source/WebApp.WebAssembly/Pages/Library/Scenes/SceneBuilderPage.razor.cs` | UI logic | 2,3 |

### Important Constants

```typescript
// Source/WebApp.WebAssembly/src/constants/RenderConstants.ts
export const RenderConstants = {
    defaultGridCellSize: 50,
    gridMessageFont: "16px Arial",
    gridMessageColor: "#666666",
    zoomStep: 0.1
};
```

---

## Success Criteria

Upon completion of all phases, the grid display feature should:

### Functional Requirements ✅
- [ ] Display square grids over background images
- [ ] Follow background panning and zooming exactly
- [ ] Allow real-time grid configuration
- [ ] Support grid show/hide functionality
- [ ] Maintain settings across sessions
- [ ] Provide fine-tuning for background alignment

### Technical Requirements ✅
- [ ] Maintain 60fps performance during operations
- [ ] Work consistently across supported browsers
- [ ] Handle edge cases gracefully
- [ ] Follow existing code patterns and conventions
- [ ] Include appropriate error handling
- [ ] Generate no console errors during normal operation

### User Experience Requirements ✅
- [ ] Immediate visual feedback for setting changes
- [ ] Intuitive grid configuration interface
- [ ] Smooth grid operations without lag
- [ ] Clear visual distinction between grid and background
- [ ] Helpful error messages for invalid settings

---

## Next Steps After Completion

Once the basic square grid is working correctly:

1. **Phase 5**: Implement hexagonal grid types (HexV, HexH)
2. **Phase 6**: Implement isometric grid type
3. **Phase 7**: Add snap-to-grid functionality for asset placement
4. **Phase 8**: Advanced grid features (sub-grids, custom patterns)

This task document provides the foundation for implementing the core grid display functionality. Focus on getting the square grid working perfectly before moving to additional grid types.