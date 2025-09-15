# UC051 - Basic Asset Placement

## Use Case Information
- **Use Case ID**: UC051
- **Use Case Name**: Basic Asset Placement
- **User Story**: As a GM, I want to place assets on the canvas using drag-and-drop so that I can quickly position elements in my scenes
- **Actor(s)**: Game Master
- **System**: VTTTools React Frontend Application - Scene Builder

## Preconditions
- User is authenticated as a GM
- Scene Builder canvas is initialized and loaded (UC047)
- Asset Library Integration is functional (UC050)
- At least one asset is available in the asset library
- Canvas layers are properly configured

## Postconditions
- Asset is successfully placed on the Scene Builder canvas
- Asset is positioned at the intended location with pixel-perfect accuracy
- Asset is selectable and ready for further manipulation
- Scene state is updated to reflect the new asset placement
- Asset appears on the correct layer (Assets layer) in the rendering order

## Main Flow
1. **GM opens Scene Builder** with initialized canvas and asset library
2. **GM selects asset from library** through the integrated asset browser (UC050)
3. **GM initiates drag operation** by clicking and holding on desired asset
4. **System provides visual feedback** showing asset being dragged and cursor changes
5. **GM drags asset over canvas** while system shows placement preview
6. **System calculates valid placement position** based on canvas coordinates
7. **GM releases mouse button** to drop asset at desired location
8. **System validates placement position** and checks for any placement constraints
9. **System creates asset instance** on canvas with proper positioning and layer assignment
10. **System updates scene state** to persist asset placement
11. **Asset becomes selectable** for further manipulation operations

## Alternative Flows
### A1: Invalid Placement Location
8a. System detects invalid placement position (outside canvas bounds)
8b. System shows visual indicator of invalid placement (red highlight)
8c. System prevents asset drop and maintains drag operation
8d. GM repositions asset to valid location or cancels operation

### A2: Placement Collision Detection
8a. System detects potential asset collision or overlap issue
8b. System provides visual warning but allows placement
8c. GM can proceed with placement or adjust position
8d. System completes placement with overlap handling

### A3: Asset Loading Error During Placement
5a. System fails to load asset image during drag operation
5b. System displays placeholder image or loading indicator
5c. GM can continue with placement using placeholder
5d. System attempts to reload asset image after placement

### A4: Drag Operation Cancelled
At any point during drag:
- GM presses Escape key or performs cancel gesture
- System cancels drag operation and returns to normal state
- Asset returns to library without placement

## Technical Implementation Notes

### Konva.js Integration
```typescript
interface AssetPlacementProps {
  stage: Konva.Stage;
  assetsLayer: Konva.Layer;
  onAssetPlaced: (asset: PlacedAsset) => void;
}

interface PlacedAsset {
  id: string;
  assetId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
}
```

### Drag and Drop Implementation
- **HTML5 Drag API**: Integration with native browser drag-and-drop
- **Konva.js Event System**: Canvas-based drag handling for smooth performance
- **Collision Detection**: Basic boundary checking and overlap detection
- **Visual Feedback**: Real-time preview during drag operations

### Performance Considerations
- **Asset Image Caching**: Pre-load and cache frequently used asset images
- **Efficient Rendering**: Minimize re-renders during drag operations
- **Memory Management**: Proper cleanup of drag operation resources
- **Viewport Culling**: Only render assets visible in current viewport

### State Management Integration
```typescript
interface SceneBuilderState {
  placedAssets: PlacedAsset[];
  selectedAssets: string[];
  dragState: {
    isDragging: boolean;
    draggedAsset: Asset | null;
    previewPosition: { x: number; y: number } | null;
  };
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] Drag-and-drop asset placement from library onto canvas with smooth interaction
- [ ] Asset positioning with pixel-perfect placement accuracy (±1 pixel tolerance)
- [ ] Asset selection visualization with clear selection indicators after placement
- [ ] Basic asset movement capability after initial placement
- [ ] Asset layer management ensuring proper rendering on Assets layer
- [ ] Asset collision detection for placement validation without blocking placement

### User Experience Requirements
- [ ] Visual feedback during drag operation (cursor changes, asset preview)
- [ ] Smooth drag animation maintaining 60fps during operation
- [ ] Clear visual indicators for valid vs invalid placement locations
- [ ] Immediate asset selection after successful placement
- [ ] Intuitive drag-and-drop interaction following desktop UI conventions

### Technical Requirements
- [ ] Integration with Konva.js Stage and Layer system for optimal performance
- [ ] Proper event handling for mouse and touch interactions
- [ ] Asset image loading and caching for immediate placement feedback
- [ ] State management integration for scene persistence
- [ ] Canvas coordinate system integration for accurate positioning

### Performance Requirements
- [ ] Drag operations maintain 60fps performance with up to 50 existing assets
- [ ] Asset placement completes within 100ms of drop action
- [ ] Memory usage during drag operations remains stable
- [ ] No memory leaks from cancelled drag operations

### Validation Requirements
- [ ] Placement boundary validation (assets cannot be placed outside canvas)
- [ ] Asset image format validation (PNG, JPEG, WebP support)
- [ ] Scene state validation after asset placement
- [ ] Asset ID uniqueness validation for placed assets

### Integration Requirements
- [ ] Seamless integration with Asset Library Integration (UC050)
- [ ] Proper layer ordering with Canvas Foundation (UC047)
- [ ] Compatible with Grid System Configuration (UC049) for future snapping
- [ ] Foundation for Advanced Asset Manipulation (UC052)

## Business Value
- **Rapid Scene Creation**: GMs can quickly populate scenes with visual elements
- **Intuitive Workflow**: Familiar drag-and-drop interaction reduces learning curve
- **Creative Freedom**: Precise placement control enables detailed scene composition
- **Efficiency Gains**: Reduced time from asset selection to scene placement
- **Foundation Building**: Establishes core interaction pattern for Scene Builder

## Dependencies
- **UC047**: Canvas Foundation - Multi-layer canvas system must be functional
- **UC050**: Asset Library Integration - Asset selection and browsing capability required
- **Asset Management System**: Backend API for asset metadata and image URLs
- **File Upload System**: Asset images must be properly uploaded and accessible

## Risk Factors
- **Performance Degradation**: Large numbers of assets may impact drag responsiveness
- **Cross-Browser Compatibility**: Drag-and-drop behavior varies across browsers
- **Touch Device Support**: Touch-based drag operations require special handling
- **Asset Loading Failures**: Network issues may prevent asset image loading during placement
- **Memory Management**: Improper cleanup could lead to memory leaks during extended use

## Definition of Done
- All acceptance criteria are met and verified through automated testing
- Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- Performance benchmarks met for drag operations and asset placement
- Integration testing with Canvas Foundation and Asset Library completed
- Touch device interaction tested and functional
- Memory leak testing passed for extended drag sessions
- User acceptance testing confirms intuitive drag-and-drop workflow