# UC049 - Grid System Configuration

## Use Case Information
- **Use Case ID**: UC049
- **Use Case Name**: Grid System Configuration
- **User Story**: As a GM, I want to configure different grid systems so that I can match my preferred game system's mapping requirements
- **Actor(s)**: Game Master (GM)
- **System**: VTTTools React Frontend Application - Scene Builder Grid System

## Preconditions
- GM is logged into the VTTTools application
- Scene Builder is open with canvas foundation and background established (UC047, UC048)
- Grid layer is initialized and ready for configuration
- Grid configuration panel is accessible within Scene Builder interface

## Postconditions
- Grid system is configured and rendered according to GM preferences
- Grid aligns properly with background image and scene proportions
- Grid snap points are calculated and ready for asset placement
- Grid configuration is saved as part of scene state
- Visual grid display matches selected game system requirements

## Main Flow
1. **GM opens grid configuration panel** from Scene Builder toolbar or settings
2. **System displays grid type options** (Square, Hexagonal, Isometric)
3. **GM selects grid type** appropriate for their game system
4. **System presents configuration options** specific to selected grid type
5. **GM customizes grid parameters** (cell size, line color, thickness, opacity)
6. **System renders grid preview** in real-time as parameters change
7. **GM confirms grid configuration** and applies to scene
8. **System calculates snap points** for the configured grid type
9. **Grid renders on Grid layer** with proper alignment and visual styling

## Alternative Flows
### A1: Hexagonal Grid Orientation
3a. GM selects Hexagonal grid type
4a. System presents orientation options (Horizontal tops, Vertical tops)
4b. GM selects orientation based on game system requirements
4c. Configuration continues with orientation-specific parameters

### A2: Grid Alignment to Background
6a. GM needs to align grid with background image features
6b. System provides grid offset controls (X/Y positioning)
6c. GM adjusts grid position to align with background elements
6d. System maintains grid alignment during future modifications

### A3: Grid Visibility Control
1a. GM wants to toggle grid visibility during scene use
1b. System provides visibility toggle with opacity slider
1c. Grid can be hidden completely or shown at reduced opacity
1d. Snap functionality remains active even when grid is visually hidden

### A4: Advanced Grid Customization
4a. GM needs specialized grid configuration (sub-grids, measurement units)
4b. System provides advanced options panel
4c. GM configures additional parameters (measurement display, sub-divisions)
4d. Advanced configuration integrates with basic grid rendering

## Technical Implementation Notes

### Grid System Architecture
```typescript
interface GridConfiguration {
  type: GridType;
  cellSize: number;
  lineColor: string;
  lineWidth: number;
  opacity: number;
  visible: boolean;
  offset: { x: number; y: number };
  measurements: GridMeasurements;
}

enum GridType {
  Square = 'square',
  HexHorizontal = 'hex-horizontal', 
  HexVertical = 'hex-vertical',
  Isometric = 'isometric'
}

interface GridMeasurements {
  unit: string; // 'ft', 'm', 'squares'
  scale: number; // units per grid cell
  showMeasurements: boolean;
}

interface SnapPoint {
  x: number;
  y: number;
  type: SnapType;
}

enum SnapType {
  Corner = 'corner',
  Center = 'center',
  Edge = 'edge',
  Face = 'face' // for hex grids
}
```

### Grid Mathematics Implementation
- **Square Grid**: Simple rectangular grid with configurable cell size
- **Hexagonal Grid**: Complex hex math with flat-top or pointy-top orientations
- **Isometric Grid**: Diamond-shaped grid with 30-degree perspective
- **Snap Calculations**: Grid-specific algorithms for determining snap points

### Grid Rendering Strategy
- **Konva.js Integration**: Custom Konva shapes for efficient grid rendering
- **Performance Optimization**: Only render visible grid area with viewport culling
- **Canvas Scaling**: Grid maintains proportions during zoom operations
- **Layer Management**: Grid renders on dedicated layer without interfering with other content

### Configuration UI Components
```typescript
interface GridConfigPanelProps {
  currentConfig: GridConfiguration;
  onConfigChange: (config: GridConfiguration) => void;
  onPreview: (config: GridConfiguration) => void;
}

const GridTypeSelector: React.FC = () => {
  // Grid type selection with visual previews
};

const GridCustomizer: React.FC = () => {
  // Grid-specific configuration options
};
```

## Acceptance Criteria

### Grid Type Support
- [ ] Grid configuration panel provides system type selection with visual previews for each type
- [ ] Square grid system renders with configurable cell size and line styling options
- [ ] Hexagonal grid system supports both horizontal and vertical orientation options (flat-top and pointy-top)
- [ ] Isometric grid system renders with proper 30-degree perspective and diamond alignment
- [ ] Grid type changes update rendering immediately with proper coordinate system conversion

### Customization Features
- [ ] Grid visibility toggle allows complete hiding or opacity-based fading (0-100%)
- [ ] Grid color customization supports full color picker with common gaming color presets
- [ ] Line thickness options range from 1-5 pixels with visual feedback for thickness changes
- [ ] Cell size configuration adapts to different background image scales and gaming system requirements
- [ ] Grid offset controls allow precise alignment with background image features

### Snap Point Calculation
- [ ] Grid snapping points calculation generates accurate snap locations for each grid type
- [ ] Square grid provides corner and center snap points for precise asset placement
- [ ] Hexagonal grid calculates face centers and vertex points for proper hex-based positioning
- [ ] Isometric grid generates diamond intersection points maintaining 3D perspective illusion
- [ ] Snap point visualization provides feedback during asset placement operations

### Performance and Rendering
- [ ] Grid rendering maintains 60fps performance with complex background images
- [ ] Large grid areas (100x100+ cells) render efficiently using viewport culling
- [ ] Grid scaling maintains line clarity and proportions during zoom operations
- [ ] Grid configuration changes update in real-time without performance degradation
- [ ] Memory usage for grid rendering remains under 10MB regardless of grid complexity

### Configuration Persistence
- [ ] Grid configuration saves as part of scene data with all parameters preserved
- [ ] Grid settings load correctly when reopening saved scenes
- [ ] Grid configuration exports/imports maintain accuracy across different systems
- [ ] Real-time collaboration synchronizes grid changes across all connected users
- [ ] Undo/redo operations include grid configuration changes

### Game System Integration
- [ ] Grid measurements display in common gaming units (feet, meters, squares)
- [ ] Grid scale configuration matches popular game system requirements (D&D 5ft squares, etc.)
- [ ] Measurement tools integrate with grid system for distance and area calculations
- [ ] Grid templates provide quick setup for popular game systems
- [ ] Advanced grid features support sub-grids and measurement overlays

## Business Value
- **Game System Compatibility**: Supports multiple tabletop gaming systems with appropriate grid types
- **Professional Appearance**: High-quality grid rendering creates polished battle maps
- **User Flexibility**: Extensive customization accommodates different visual preferences and game requirements
- **Workflow Efficiency**: Quick grid setup enables rapid scene creation
- **Asset Alignment**: Precise grid systems improve asset placement accuracy

## Dependencies
- **Canvas Foundation**: Requires established canvas and layer system (UC047)
- **Mathematical Libraries**: Grid calculation algorithms for different grid types
- **Configuration UI**: React components for grid parameter customization
- **Snap System**: Integration with asset placement snap functionality (UC055)

## Risk Factors
- **Mathematical Complexity**: Hexagonal and isometric grids require complex coordinate calculations
- **Performance Impact**: Large grids could affect canvas rendering performance
- **Cross-Browser Compatibility**: Grid rendering may vary across different browsers
- **Configuration Complexity**: Too many options could overwhelm users

## Definition of Done
- All acceptance criteria are met and verified across supported browsers
- Grid mathematics tested for accuracy with all supported grid types
- Performance benchmarks maintained with maximum complexity grid configurations
- Configuration UI tested for usability and intuitive workflow
- Integration testing completed with background images and asset placement
- Cross-browser compatibility verified for grid rendering accuracy
- Game system compatibility tested with popular tabletop gaming requirements
- User testing confirms grid configuration meets common use cases