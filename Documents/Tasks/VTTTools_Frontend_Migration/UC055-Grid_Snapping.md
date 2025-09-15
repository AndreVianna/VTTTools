# UC055 - Grid Snapping

## Use Case Information
- **Use Case ID**: UC055
- **Use Case Name**: Grid Snapping
- **User Story**: As a GM, I want grid snapping functionality so that I can precisely align assets with the grid system
- **Actor(s)**: Game Master
- **System**: VTTTools React Frontend Application - Scene Builder

## Preconditions
- User is authenticated as a GM
- Scene Builder canvas is initialized (UC047)
- Grid system is configured and active (UC049)
- Assets are available for placement and manipulation (UC051, UC052)
- Grid snapping system is enabled and configured

## Postconditions
- Assets are precisely aligned to grid intersection points or edges
- Grid snapping behavior is consistent across all manipulation operations
- Snapping sensitivity and behavior matches user preferences
- Visual feedback confirms successful snapping operations
- Scene maintains grid alignment for professional appearance

## Main Flow
1. **GM enables grid snapping** through toggle control or keyboard shortcut
2. **System activates snapping calculation engine** for current grid configuration
3. **GM begins asset manipulation** (placement, movement, rotation, or scaling)
4. **System detects asset position relative to grid** during manipulation
5. **System calculates nearest snap points** based on grid type and snap settings
6. **System provides visual feedback** when asset approaches snap threshold
7. **System applies automatic snapping** when asset is within snap sensitivity range
8. **GM completes manipulation** with asset precisely aligned to grid
9. **System confirms snap operation** with visual indicator or subtle animation
10. **Asset maintains grid alignment** until deliberately moved away from snap position

## Alternative Flows
### A1: Snap to Grid Intersections
4a. Asset center point approaches grid intersection
5a. System calculates distance to nearest intersection points
6a. System snaps asset center to exact intersection when within threshold
7a. Visual snap indicator shows successful intersection alignment

### A2: Snap to Grid Edges
4a. Asset edge approaches grid line (horizontal or vertical)
5a. System calculates alignment to nearest grid edge
6a. System snaps asset edge to align with grid line
7a. Asset maintains edge alignment with visual confirmation

### A3: Corner Point Snapping
4a. Asset corner approaches grid intersection
5a. System detects corner proximity to intersection
6a. System snaps asset corner to intersection point
7a. Asset rotates/adjusts to maintain corner alignment

### A4: Temporary Snap Override
At any point during manipulation:
- GM holds Alt key to temporarily disable snapping
- System ignores snap calculations for free positioning
- Visual indicators show snap override is active
- GM releases Alt to re-enable snapping

### A5: Snap Sensitivity Adjustment
1a. GM adjusts snap sensitivity through settings panel
2a. System updates snap threshold distance
3a. Subsequent operations use new sensitivity settings
4a. Visual feedback adapts to new sensitivity levels

### A6: Multi-Asset Group Snapping
3a. GM manipulates multiple selected assets as group
4a. System uses group anchor point for snap calculations
5a. All assets in group move together maintaining relative positions
6a. Group snaps to grid based on defined anchor point

## Technical Implementation Notes

### Grid Snapping Engine
```typescript
interface GridSnappingSystem {
  enabled: boolean;
  sensitivity: number; // pixels - snap threshold distance
  snapToIntersections: boolean;
  snapToEdges: boolean;
  snapToCenter: boolean;
  visualFeedback: boolean;
  gridType: GridType;
  gridSize: number;
}

interface SnapCalculation {
  snapPoint: Point;
  snapType: SnapType;
  distance: number;
  isActive: boolean;
}

enum SnapType {
  Intersection = 'intersection',
  HorizontalEdge = 'horizontal-edge',
  VerticalEdge = 'vertical-edge',
  Center = 'center'
}
```

### Grid Type Specific Snapping
```typescript
class GridSnapCalculator {
  // Square grid snapping
  calculateSquareGridSnap(assetPosition: Point, gridSize: number): SnapCalculation {
    const nearestX = Math.round(assetPosition.x / gridSize) * gridSize;
    const nearestY = Math.round(assetPosition.y / gridSize) * gridSize;
    return {
      snapPoint: { x: nearestX, y: nearestY },
      snapType: SnapType.Intersection,
      distance: this.calculateDistance(assetPosition, { x: nearestX, y: nearestY }),
      isActive: this.distance < this.sensitivity
    };
  }

  // Hexagonal grid snapping
  calculateHexGridSnap(assetPosition: Point, hexSize: number, orientation: HexOrientation): SnapCalculation {
    const hexCoords = this.pixelToHex(assetPosition, hexSize, orientation);
    const roundedHex = this.roundHex(hexCoords);
    const snapPixel = this.hexToPixel(roundedHex, hexSize, orientation);
    return {
      snapPoint: snapPixel,
      snapType: SnapType.Intersection,
      distance: this.calculateDistance(assetPosition, snapPixel),
      isActive: this.distance < this.sensitivity
    };
  }

  // Isometric grid snapping
  calculateIsoGridSnap(assetPosition: Point, gridSize: number): SnapCalculation {
    const isoCoords = this.cartesianToIsometric(assetPosition);
    const snappedIso = this.snapToIsometricGrid(isoCoords, gridSize);
    const snapPixel = this.isometricToCartesian(snappedIso);
    return {
      snapPoint: snapPixel,
      snapType: SnapType.Intersection,
      distance: this.calculateDistance(assetPosition, snapPixel),
      isActive: this.distance < this.sensitivity
    };
  }
}
```

### Visual Snap Feedback
```typescript
interface SnapFeedbackSystem {
  showSnapIndicators: boolean;
  snapIndicatorColor: string;
  snapAnimationDuration: number;
  highlightActiveSnaps: boolean;
}

class SnapVisualFeedback {
  private snapIndicators: Konva.Group;

  showSnapPreview(snapPoint: Point, snapType: SnapType): void {
    const indicator = this.createSnapIndicator(snapPoint, snapType);
    this.snapIndicators.add(indicator);
    this.animateSnapIndicator(indicator);
  }

  hideSnapPreview(): void {
    this.snapIndicators.removeChildren();
  }

  createSnapIndicator(point: Point, type: SnapType): Konva.Shape {
    switch (type) {
      case SnapType.Intersection:
        return new Konva.Circle({
          x: point.x,
          y: point.y,
          radius: 4,
          stroke: '#00ff00',
          strokeWidth: 2,
          opacity: 0.8
        });
      case SnapType.HorizontalEdge:
      case SnapType.VerticalEdge:
        return new Konva.Line({
          points: this.getSnapLinePoints(point, type),
          stroke: '#00ff00',
          strokeWidth: 1,
          opacity: 0.6
        });
    }
  }
}
```

### Asset Integration with Snapping
```typescript
interface SnapEnabledAsset extends PlacedAsset {
  snapAnchorPoint: 'center' | 'corner' | 'edge';
  snapToGrid: boolean;
  customSnapPoints?: Point[]; // asset-specific snap points
}

class AssetSnapController {
  applySnapToAsset(asset: SnapEnabledAsset, newPosition: Point): Point {
    if (!asset.snapToGrid || !this.snapSystem.enabled) {
      return newPosition;
    }

    const snapCalculation = this.calculateBestSnap(asset, newPosition);
    if (snapCalculation.isActive) {
      this.showSnapFeedback(snapCalculation);
      return snapCalculation.snapPoint;
    }

    this.hideSnapFeedback();
    return newPosition;
  }
}
```

## Acceptance Criteria

### Grid Snapping Functionality
- [ ] Grid snapping toggle with visual feedback showing when snapping is active/inactive
- [ ] Asset snapping to grid intersection points with configurable snap sensitivity
- [ ] Snapping sensitivity configuration allowing users to adjust snap threshold (5-20 pixels)
- [ ] Visual snap indicators during asset movement showing available snap points
- [ ] Edge snapping for asset alignment to grid lines (horizontal and vertical)
- [ ] Center-point snapping for precise asset positioning at grid intersections

### Grid Type Specific Snapping
- [ ] Snap-to-grid validation for different grid types (square, hexagonal, isometric)
- [ ] Square grid snapping with intersection and edge alignment
- [ ] Hexagonal grid snapping accounting for hex orientation and geometry
- [ ] Isometric grid snapping with proper perspective and angle calculations
- [ ] Grid-specific visual feedback adapting to current grid configuration

### Visual Feedback System
- [ ] Visual snap indicators during asset movement with clear snap point visualization
- [ ] Snap threshold visualization showing when snapping will activate
- [ ] Different visual indicators for different snap types (intersection, edge, center)
- [ ] Smooth animation feedback when snapping occurs
- [ ] Configurable visual feedback intensity and color options

### User Control and Override
- [ ] Temporary snap disable (Alt key) for free positioning without permanent setting change
- [ ] Snap sensitivity adjustment through settings panel with real-time preview
- [ ] Per-asset snap configuration (some assets snap, others don't)
- [ ] Bulk snap operations for multiple selected assets
- [ ] Snap mode selection (intersection-only, edges-only, or both)

### Performance and Technical
- [ ] Snap calculations maintain 60fps performance during asset manipulation
- [ ] Snapping works consistently across all manipulation operations (move, rotate, scale)
- [ ] Memory efficient snap calculation without performance impact on large scenes
- [ ] Accurate snap calculations at all zoom levels
- [ ] Cross-browser compatibility for snap calculations and visual feedback

### Integration Requirements
- [ ] Integration with Grid System Configuration (UC049) for consistent behavior
- [ ] Compatibility with Basic Asset Placement (UC051) and Advanced Asset Manipulation (UC052)
- [ ] Proper interaction with Zoom and Pan Controls (UC054) maintaining accuracy
- [ ] State persistence for snap settings across scene save/load operations

### Multi-Asset Snapping
- [ ] Group asset snapping maintaining relative positions within group
- [ ] Smart anchor point selection for group snapping operations
- [ ] Visual feedback for group snapping operations
- [ ] Consistent snapping behavior regardless of asset selection size

### User Experience
- [ ] Intuitive snapping behavior following standard design application conventions
- [ ] Clear visual distinction between snapped and unsnapped asset states
- [ ] Smooth asset movement with snap assistance rather than forced constraint
- [ ] Settings panel for snap configuration with immediate effect preview

## Business Value
- **Professional Results**: Grid alignment creates clean, professional-looking battle maps
- **Efficiency Gains**: Automatic alignment reduces time spent on precise positioning
- **Consistency**: Grid snapping ensures uniform asset spacing and alignment
- **Ease of Use**: Reduces skill barrier for creating well-organized scenes
- **Game System Support**: Proper grid alignment supports various tabletop gaming systems

## Dependencies
- **UC047**: Canvas Foundation - Stage and rendering system for snap calculations
- **UC049**: Grid System Configuration - Active grid required for snap calculations
- **UC051**: Basic Asset Placement - Asset manipulation triggers snapping
- **UC052**: Advanced Asset Manipulation - All manipulation types need snap support
- **UC054**: Zoom and Pan Controls - Snap accuracy at different zoom levels

## Risk Factors
- **Performance Impact**: Complex snap calculations may affect manipulation responsiveness
- **Grid Complexity**: Hexagonal and isometric grids require complex geometry calculations
- **User Frustration**: Over-aggressive snapping may interfere with intended positioning
- **Visual Clarity**: Snap indicators must be visible without cluttering the interface
- **Cross-Browser Math**: Floating point calculations may vary across browsers

## Definition of Done
- All acceptance criteria verified through comprehensive testing
- Performance benchmarks met for snap calculations at various scene complexities
- Cross-browser compatibility validated for all grid types and snap operations
- Integration testing completed with all related Scene Builder features
- User experience testing confirms snapping enhances rather than hinders workflow
- Visual feedback system tested across different screen sizes and resolutions
- Accessibility considerations addressed for snap feedback and controls
- Grid-specific snap accuracy verified through automated geometric tests