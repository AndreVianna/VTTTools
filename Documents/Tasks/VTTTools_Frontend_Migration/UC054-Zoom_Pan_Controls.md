# UC054 - Zoom and Pan Controls

## Use Case Information
- **Use Case ID**: UC054
- **Use Case Name**: Zoom and Pan Controls
- **User Story**: As a GM, I want zoom and pan controls so that I can navigate large battle maps efficiently
- **Actor(s)**: Game Master, Players (in collaborative mode)
- **System**: VTTTools React Frontend Application - Scene Builder

## Preconditions
- User is authenticated and has access to Scene Builder
- Scene Builder canvas is initialized and loaded (UC047)
- Scene contains content (background image, grid, or assets) to navigate
- Canvas dimensions are larger than viewport or detailed navigation is needed
- Mouse, keyboard, and touch input systems are functional

## Postconditions
- Canvas view is positioned at desired location and zoom level
- Zoom level and pan position are persisted for session continuity
- Navigation state is synchronized with other users in collaborative mode
- Canvas rendering maintains quality at all zoom levels
- User can efficiently navigate and work within large scene areas

## Main Flow
1. **User opens Scene Builder** with content requiring navigation (large map, detailed scene)
2. **System provides navigation controls** in the interface (zoom buttons, pan tools, shortcuts)
3. **User initiates navigation operation** through mouse, keyboard, or UI controls
4. **System detects navigation intent** and enters appropriate navigation mode
5. **User performs navigation gesture** (wheel scroll, drag, touch pinch, button click)
6. **System processes navigation input** with smooth animation and responsive feedback
7. **System validates navigation bounds** ensuring canvas stays within reasonable limits
8. **System updates canvas view** with smooth transition to new position/zoom level
9. **System maintains rendering quality** at new zoom level with appropriate detail
10. **System persists navigation state** for session continuity and collaborative sync

## Alternative Flows
### A1: Mouse Wheel Zoom
3a. User scrolls mouse wheel over canvas
4a. System detects wheel event and cursor position
5a. System zooms in/out centered on cursor position
6a. Canvas smoothly transitions to new zoom level

### A2: Touch Pinch Zoom (Mobile/Tablet)
3a. User performs pinch gesture on touch screen
4a. System detects multi-touch pinch gesture
5a. System calculates zoom delta and center point
6a. Canvas zooms smoothly centered on pinch gesture

### A3: Keyboard Navigation
3a. User presses navigation keys (arrow keys, +/- for zoom, spacebar+drag for pan)
4a. System processes keyboard shortcuts
5a. System applies navigation increments
6a. Canvas moves or zooms by defined amounts

### A4: Pan with Mouse Drag
3a. User middle-clicks or spacebar+left-clicks and drags
4a. System enters pan mode with appropriate cursor
5a. User drags to desired direction
6a. Canvas follows drag movement smoothly

### A5: Navigation Toolbar Controls
3a. User clicks zoom in/out buttons or pan direction controls
4a. System applies predefined navigation increments
5a. Canvas animates to new view state smoothly

### A6: Fit-to-View Operations
3a. User selects fit-to-window, fit-to-content, or actual size
4a. System calculates appropriate zoom and position
5a. Canvas animates to calculated view state

## Technical Implementation Notes

### Zoom and Pan System Architecture
```typescript
interface NavigationControls {
  zoom: number; // 0.1x to 4.0x range
  panX: number; // X offset from center
  panY: number; // Y offset from center
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  panStep: number;
}

interface NavigationState {
  currentZoom: number;
  currentPan: { x: number; y: number };
  isNavigating: boolean;
  navigationMode: 'zoom' | 'pan' | 'fit';
  targetView?: ViewTarget;
}

interface ViewTarget {
  zoom: number;
  pan: { x: number; y: number };
  duration: number; // animation duration
}
```

### Konva.js Stage Integration
```typescript
interface StageNavigationProps {
  stage: Konva.Stage;
  onNavigationChange: (state: NavigationState) => void;
  constraints: NavigationConstraints;
}

interface NavigationConstraints {
  minZoom: number;
  maxZoom: number;
  boundaryRect?: Rectangle;
  smoothAnimations: boolean;
  cursorCenterZoom: boolean;
}
```

### Navigation Methods Implementation
```typescript
class NavigationController {
  private stage: Konva.Stage;
  private animationId: number | null = null;

  // Mouse wheel zoom centered on cursor
  handleWheelZoom(event: WheelEvent): void {
    const pointer = this.stage.getPointerPosition();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomToPoint(pointer, zoomDelta);
  }

  // Touch pinch zoom
  handleTouchZoom(event: TouchEvent): void {
    if (event.touches.length === 2) {
      const pinchData = this.calculatePinchData(event.touches);
      this.zoomToPoint(pinchData.center, pinchData.scale);
    }
  }

  // Smooth pan animation
  panTo(targetX: number, targetY: number, duration: number = 300): void {
    this.animateToView({ zoom: this.stage.scaleX(), pan: { x: targetX, y: targetY } }, duration);
  }

  // Fit operations
  fitToWindow(): void {
    const viewportSize = { width: this.stage.width(), height: this.stage.height() };
    const contentBounds = this.getContentBounds();
    const fitView = this.calculateFitView(viewportSize, contentBounds);
    this.animateToView(fitView, 500);
  }
}
```

### Keyboard Shortcuts
```typescript
const navigationShortcuts = {
  'plus': () => this.zoomIn(),
  'minus': () => this.zoomOut(),
  'space+drag': () => this.enablePanMode(),
  'home': () => this.fitToWindow(),
  'end': () => this.actualSize(),
  'ctrl+0': () => this.fitToContent(),
  'arrowLeft': () => this.panLeft(),
  'arrowRight': () => this.panRight(),
  'arrowUp': () => this.panUp(),
  'arrowDown': () => this.panDown()
};
```

## Acceptance Criteria

### Zoom Functionality
- [ ] Zoom controls with 0.1x to 4.0x magnification range with smooth transitions
- [ ] Mouse wheel zoom with cursor-centered zooming for intuitive navigation
- [ ] Zoom in/out buttons with consistent zoom steps (e.g., 25% increments)
- [ ] Keyboard shortcuts for zoom operations (+/- keys, Ctrl+0 for fit)
- [ ] Touch pinch-to-zoom support for tablet and touch screen users
- [ ] Zoom level indicator with percentage display (e.g., "150%")

### Pan Functionality
- [ ] Pan functionality with mouse drag and touch gestures for smooth navigation
- [ ] Middle-mouse button pan and spacebar+left-click pan alternatives
- [ ] Keyboard arrow key panning with configurable step size
- [ ] Pan boundary constraints preventing navigation beyond reasonable limits
- [ ] Smooth pan animations maintaining user orientation

### Fit Controls
- [ ] Zoom fit controls (fit to window, actual size, fit to content) for quick navigation
- [ ] Fit to window centers and scales content to viewport size
- [ ] Actual size (100% zoom) returns to 1:1 pixel ratio
- [ ] Fit to content encompasses all scene elements with appropriate margins
- [ ] Keyboard shortcuts for all fit operations

### Performance and Animation
- [ ] Smooth zoom and pan animations with performance optimization maintaining 60fps
- [ ] Animation duration configuration for different navigation operations
- [ ] Responsive navigation that doesn't lag behind user input
- [ ] Efficient rendering during navigation operations (viewport culling)
- [ ] Memory usage optimization during extended navigation sessions

### Visual Feedback
- [ ] Zoom level indicator showing current magnification percentage
- [ ] Navigation controls with clear visual states (enabled, disabled, active)
- [ ] Cursor changes during different navigation modes (pan cursor, zoom cursor)
- [ ] Visual boundaries or constraints indication when limits are reached
- [ ] Progress indication during animated navigation operations

### Keyboard and Touch Support
- [ ] Keyboard shortcuts for zoom and pan operations with standard conventions
- [ ] Touch gesture support for mobile and tablet navigation
- [ ] Accessibility support for keyboard-only navigation
- [ ] Consistent behavior across different input methods
- [ ] Configurable input sensitivity and acceleration

### Integration Requirements
- [ ] Navigation state persistence across scene save/load operations
- [ ] Real-time synchronization of navigation state in collaborative mode
- [ ] Integration with grid snapping system for aligned navigation
- [ ] Canvas coordinate system integration maintaining accuracy at all zoom levels

### Technical Performance
- [ ] Navigation operations maintain consistent performance with scenes up to 100 assets
- [ ] Memory usage remains stable during zoom operations
- [ ] Canvas quality maintained at all zoom levels (no pixelation or blur)
- [ ] Cross-browser compatibility for all navigation features

## Business Value
- **Enhanced Usability**: Users can efficiently navigate large, detailed battle maps
- **Improved Accessibility**: Multiple navigation methods accommodate different user preferences
- **Professional Experience**: Smooth, responsive navigation creates polished user experience
- **Detailed Work Support**: High zoom levels enable precise editing and positioning
- **Mobile Compatibility**: Touch navigation supports tablet and mobile usage

## Dependencies
- **UC047**: Canvas Foundation - Stage and rendering system required
- **UC055**: Grid Snapping - Aligned navigation for grid-based movement
- **Performance Optimization**: Viewport culling for efficient rendering during navigation
- **State Management**: Navigation state persistence and synchronization
- **Input Handling**: Mouse, keyboard, and touch event processing

## Risk Factors
- **Performance Degradation**: Complex scenes may impact navigation smoothness
- **Cross-Browser Compatibility**: Navigation behavior may vary across different browsers
- **Touch Device Challenges**: Touch navigation precision on small screens
- **Memory Usage**: High zoom levels may increase memory consumption
- **User Confusion**: Too many navigation options may overwhelm users

## Definition of Done
- All acceptance criteria verified through comprehensive testing
- Performance benchmarks met for navigation operations at various zoom levels
- Cross-browser and cross-device compatibility validated
- Integration testing completed with Canvas Foundation and other Scene Builder features
- User experience testing confirms intuitive navigation workflow
- Accessibility standards met for keyboard and screen reader users
- Touch device testing completed for mobile and tablet navigation
- Memory leak testing passed for extended navigation sessions