# UC052 - Advanced Asset Manipulation

## Use Case Information
- **Use Case ID**: UC052
- **Use Case Name**: Advanced Asset Manipulation
- **User Story**: As a GM, I want to manipulate placed assets with rotation, scaling, and locking so that I can precisely customize element positioning and properties
- **Actor(s)**: Game Master
- **System**: VTTTools React Frontend Application - Scene Builder

## Preconditions
- User is authenticated as a GM
- Scene Builder canvas is initialized (UC047)
- At least one asset is placed on the canvas (UC051)
- Asset selection functionality is operational
- Canvas layers and event handling are functional

## Postconditions
- Asset properties (rotation, scale, position) are modified as intended
- Asset manipulation changes are persisted in scene state
- Asset maintains visual quality after transformations
- Undo/redo system has recorded the manipulation operation
- Other users see real-time updates if in collaborative mode

## Main Flow
1. **GM selects placed asset** by clicking on it in the Scene Builder
2. **System displays selection indicators** and manipulation handles around asset
3. **GM chooses manipulation type** through context menu, keyboard shortcut, or direct handle interaction
4. **System enters manipulation mode** with appropriate visual feedback and cursor changes
5. **GM performs manipulation** (rotate, scale, or move) using handles or direct input
6. **System provides real-time preview** of manipulation with immediate visual feedback
7. **System validates manipulation** ensuring asset remains within acceptable parameters
8. **GM confirms manipulation** by releasing mouse or pressing Enter
9. **System applies transformation** and updates asset properties
10. **System updates scene state** and triggers save/sync operations
11. **System records operation** in undo/redo history for future reversal

## Alternative Flows
### A1: Multi-Asset Selection
1a. GM selects multiple assets using Ctrl+click or drag selection
2a. System shows group selection indicators
3a. GM performs bulk manipulation operation
4a. System applies transformation to all selected assets proportionally

### A2: Constrained Manipulation
5a. GM holds Shift key during scaling to maintain aspect ratio
5b. GM holds Ctrl key during rotation to snap to 15-degree increments
6a. System applies constraints and shows snapping indicators

### A3: Asset Locking
3a. GM selects "Lock Asset" from context menu or uses keyboard shortcut
3b. System applies lock state and changes visual indicators
3c. Asset becomes immovable but remains selectable
3d. GM can unlock asset through context menu or properties panel

### A4: Property Panel Input
3a. GM opens asset properties panel
4a. GM enters precise values for rotation, scale, or position
5a. System validates input values and applies changes
6a. System updates visual representation with exact values

### A5: Manipulation Limits Exceeded
7a. System detects manipulation exceeds limits (too small, too large, out of bounds)
7b. System prevents invalid manipulation and shows warning indicator
7c. System maintains last valid state
7d. GM adjusts manipulation to valid range or cancels operation

## Technical Implementation Notes

### Konva.js Transformer Integration
```typescript
interface AssetManipulationProps {
  selectedAssets: PlacedAsset[];
  onAssetTransform: (assetId: string, transform: Transform) => void;
  constraints: ManipulationConstraints;
}

interface Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  skewX?: number;
  skewY?: number;
}

interface ManipulationConstraints {
  minScale: number;
  maxScale: number;
  snapAngle: number;
  boundaryBox?: Rectangle;
  maintainAspectRatio?: boolean;
}
```

### Context Menu System
```typescript
interface ContextMenuAction {
  id: string;
  label: string;
  icon: string;
  action: (asset: PlacedAsset) => void;
  enabled: boolean;
  shortcut?: string;
}

const assetContextMenuActions: ContextMenuAction[] = [
  { id: 'rotate-left', label: 'Rotate Left 90°', action: rotateLeft90, enabled: !asset.locked },
  { id: 'rotate-right', label: 'Rotate Right 90°', action: rotateRight90, enabled: !asset.locked },
  { id: 'flip-horizontal', label: 'Flip Horizontal', action: flipHorizontal, enabled: !asset.locked },
  { id: 'flip-vertical', label: 'Flip Vertical', action: flipVertical, enabled: !asset.locked },
  { id: 'lock', label: asset.locked ? 'Unlock' : 'Lock', action: toggleLock },
  { id: 'properties', label: 'Properties...', action: openProperties },
  { id: 'delete', label: 'Delete', action: deleteAsset, enabled: !asset.locked }
];
```

### Asset Properties Panel
```typescript
interface AssetPropertiesPanel {
  asset: PlacedAsset;
  onPropertyChange: (property: string, value: any) => void;
  visible: boolean;
}

interface EditableProperties {
  name: string;
  x: number;
  y: number;
  rotation: number; // degrees
  scaleX: number; // percentage
  scaleY: number; // percentage
  opacity: number; // 0-1
  locked: boolean;
  visible: boolean;
  zIndex: number;
}
```

### Manipulation Handle System
- **Rotation Handle**: Circular handle above asset for rotation operations
- **Scale Handles**: Corner and edge handles for proportional and free scaling
- **Move Handle**: Center area for position manipulation
- **Visual Feedback**: Real-time transformation preview during manipulation

## Acceptance Criteria

### Rotation Functionality
- [ ] Asset rotation controls with angle input and visual rotation handles
- [ ] Smooth rotation with real-time visual feedback during manipulation
- [ ] Rotation snapping to 15-degree increments when Ctrl key held
- [ ] Precise angle input through properties panel (0-360 degrees)
- [ ] 90-degree rotation shortcuts (Ctrl+R for clockwise, Ctrl+Shift+R for counterclockwise)

### Scaling Functionality
- [ ] Asset scaling controls with proportional and free scaling options
- [ ] Maintain aspect ratio scaling when Shift key held during handle manipulation
- [ ] Scale range limits (minimum 10%, maximum 500%) with validation
- [ ] Precise scale percentage input through properties panel
- [ ] Corner handles for proportional scaling, edge handles for directional scaling

### Locking Functionality
- [ ] Asset locking functionality to prevent accidental modifications
- [ ] Visual indicator for locked assets (different border style/color)
- [ ] Locked assets remain selectable but manipulation handles are disabled
- [ ] Lock/unlock toggle through context menu and keyboard shortcut (Ctrl+L)
- [ ] Bulk lock/unlock operations for multiple selected assets

### Context Menu Operations
- [ ] Right-click context menu for asset operations (rotate, scale, lock, delete, properties)
- [ ] Context menu items enabled/disabled based on asset state and permissions
- [ ] Keyboard shortcuts displayed in context menu items
- [ ] Context menu positioning avoids screen edges and remains accessible

### Multi-Asset Selection
- [ ] Multi-asset selection for bulk operations using Ctrl+click or drag selection
- [ ] Group manipulation maintaining relative positions and proportions
- [ ] Visual indicators for group selection (shared bounding box)
- [ ] Group transformation handles working across multiple assets

### Properties Panel
- [ ] Asset property panel for detailed configuration and precise value input
- [ ] Real-time property updates with immediate visual feedback
- [ ] Input validation for all numeric properties (position, rotation, scale)
- [ ] Properties panel accessibility with keyboard navigation and screen reader support

### Undo/Redo Integration
- [ ] Undo/redo support for all asset manipulation operations
- [ ] Granular operation recording (separate entries for move, rotate, scale operations)
- [ ] Multi-asset operation undo/redo as single atomic operation
- [ ] Operation history maintained across session for complex scene building

### Performance Requirements
- [ ] Manipulation operations maintain 60fps during real-time preview
- [ ] Multi-asset manipulation performs smoothly with up to 20 selected assets
- [ ] Memory usage remains stable during extended manipulation sessions
- [ ] Transformation calculations optimized for complex scenes (100+ assets)

### Technical Requirements
- [ ] Integration with Konva.js Transformer for optimal performance and native feel
- [ ] Proper event handling for mouse, keyboard, and touch interactions
- [ ] Canvas coordinate system integration for accurate positioning
- [ ] State management integration for persistent scene modifications

## Business Value
- **Precision Control**: GMs can fine-tune asset placement with exact positioning and scaling
- **Creative Flexibility**: Advanced manipulation enables complex scene compositions
- **Workflow Efficiency**: Bulk operations and shortcuts reduce time for scene adjustments
- **Professional Results**: Precise controls enable creation of polished, professional-looking maps
- **User Empowerment**: Advanced tools give GMs creative control over their visual content

## Dependencies
- **UC047**: Canvas Foundation - Multi-layer system and event handling required
- **UC051**: Basic Asset Placement - Assets must be placed before manipulation
- **UC044**: Undo/Redo System - Operation history integration required
- **State Management**: Scene state persistence for manipulation changes
- **Context Menu System**: Reusable context menu infrastructure

## Risk Factors
- **Performance Impact**: Complex transformations may affect rendering performance
- **User Interface Complexity**: Advanced controls may overwhelm new users
- **Touch Device Challenges**: Precise manipulation difficult on touch interfaces
- **Cross-Browser Compatibility**: Transformation calculations may vary across browsers
- **Memory Leaks**: Improper cleanup of transformation objects could cause memory issues

## Definition of Done
- All acceptance criteria met and verified through comprehensive testing
- Performance benchmarks achieved for manipulation operations
- Cross-browser compatibility validated for all transformation features
- Integration testing completed with Canvas Foundation and Basic Asset Placement
- User experience testing confirms intuitive manipulation workflow
- Accessibility standards met for properties panel and keyboard shortcuts
- Memory leak testing passed for extended manipulation sessions
- Documentation updated with manipulation shortcuts and advanced features