# UC048 - Background Image Management

## Use Case Information
- **Use Case ID**: UC048
- **Use Case Name**: Background Image Management
- **User Story**: As a GM, I want to upload and manage background images so that I can set the visual foundation for my battle maps
- **Actor(s)**: Game Master (GM)
- **System**: VTTTools React Frontend Application - Scene Builder Background System

## Preconditions
- GM is logged into the VTTTools application
- Scene Builder is open with canvas foundation established (UC047)
- Background layer is initialized and ready for content
- File upload system is available and operational
- GM has background images available for upload (PNG, JPEG, WebP)

## Postconditions
- Background image is successfully loaded and displayed on Background layer
- Canvas dimensions are adjusted to accommodate background image
- Scene visual foundation is established for further content addition
- Background image metadata is stored for scene persistence
- Image loading performance is optimized for user experience

## Main Flow
1. **GM initiates background image upload** through drag-and-drop or file browser
2. **System validates image file** (format, size, dimensions)
3. **System displays upload progress** with visual feedback during transfer
4. **System processes image** for optimal canvas rendering (resizing, format conversion if needed)
5. **System loads image onto Background layer** with proper positioning and scaling
6. **System adjusts canvas dimensions** to match background image proportions
7. **System caches image** for efficient re-rendering and persistence
8. **System updates scene state** with background image metadata
9. **GM reviews background placement** and can proceed with scene building

## Alternative Flows
### A1: Background Image Replacement
1a. GM selects new background image when one already exists
2a. System confirms replacement operation with existing background
3a. GM confirms replacement, system removes current background
4a. New image upload proceeds as main flow
5a. Canvas adjusts to new dimensions maintaining existing asset positions where possible

### A2: Background Image Removal
1a. GM selects option to remove current background image
2a. System confirms removal operation and warns about visual impact
3a. GM confirms removal, system clears Background layer
4a. Canvas returns to default size or maintains current dimensions
5a. Scene continues with transparent/default background

### A3: Image Upload Validation Failure
2a. System detects invalid file (unsupported format, too large, corrupted)
2b. System displays specific error message with resolution guidance
2c. GM can try different file or adjust current file
2d. Upload process can restart with valid file

### A4: Large Image Processing
4a. System detects very large image requiring processing
4b. System shows processing progress with estimated completion time
4c. System applies optimization (resizing, compression) while maintaining quality
4d. Processed image continues with main flow

## Technical Implementation Notes

### Background Image Architecture
```typescript
interface BackgroundImageState {
  imageUrl: string | null;
  originalDimensions: { width: number; height: number };
  displayDimensions: { width: number; height: number };
  position: { x: number; y: number };
  scale: { x: number; y: number };
  isLoading: boolean;
  error: string | null;
}

interface BackgroundLayer extends Konva.Layer {
  backgroundImage: Konva.Image | null;
  setBackgroundImage: (imageObj: HTMLImageElement) => void;
  clearBackground: () => void;
  updateImageTransform: (transform: ImageTransform) => void;
}

interface ImageUploadConfig {
  maxFileSize: number; // 10MB limit
  supportedFormats: string[];
  maxDimensions: { width: number; height: number };
  compressionQuality: number;
}
```

### Image Processing Pipeline
- **File Validation**: Format checking, size limits, basic corruption detection
- **Image Loading**: HTMLImageElement with promise-based loading
- **Canvas Integration**: Konva.Image creation with proper scaling and positioning
- **Optimization**: Automatic resizing for very large images, quality balancing
- **Caching Strategy**: Browser cache coordination with scene persistence

### Performance Optimization
- **Progressive Loading**: Show placeholder during image processing
- **Image Caching**: Efficient caching of processed images
- **Memory Management**: Proper disposal of large image objects
- **Lazy Rendering**: Background layer caching for improved performance

### File Upload Integration
- **Drag-Drop Support**: HTML5 drag-drop API with visual feedback
- **File Browser**: Traditional file input integration
- **Azure Blob Storage**: Integration with existing VTTTools storage system
- **Progress Tracking**: Real-time upload progress with cancellation support

## Acceptance Criteria

### Image Upload Functionality
- [ ] Background image upload supports drag-drop interface with visual feedback for file acceptance
- [ ] File browser integration allows traditional file selection for users who prefer click-based upload
- [ ] Image format support includes PNG, JPEG, and WebP with appropriate file extension validation
- [ ] File size validation enforces 10MB limit with clear error messages for oversized files
- [ ] Upload progress displays with percentage complete and estimated time remaining

### Background Layer Rendering
- [ ] Image display on Background layer renders with proper scaling and positioning without distortion
- [ ] Canvas dimensions adjust dynamically based on background image dimensions while maintaining aspect ratio
- [ ] Background images load and render within 3 seconds for files up to 10MB
- [ ] Image quality is maintained during canvas rendering with appropriate resolution for screen display
- [ ] Background layer caching improves performance for repeated rendering operations

### Image Management Operations
- [ ] Background image removal functionality clears Background layer and returns canvas to default state
- [ ] Background replacement preserves existing scene assets while updating foundation image
- [ ] Image positioning controls allow fine-tuning of background placement within canvas bounds
- [ ] Background image metadata persists with scene data for proper save/load operations
- [ ] Multiple background image formats handle consistently across different browsers

### Error Handling and Validation
- [ ] Loading states and error handling provide clear feedback for all background image operations
- [ ] Unsupported file format errors specify which formats are accepted (PNG, JPEG, WebP)
- [ ] File size errors provide specific guidance about the 10MB limit and suggest optimization
- [ ] Corrupted image file detection prevents application errors with helpful error messages
- [ ] Network failure during upload provides retry options with progress preservation

### Performance Requirements
- [ ] Background image processing maintains application responsiveness during upload and rendering
- [ ] Large image handling (up to 10MB) completes without blocking user interface
- [ ] Memory usage for background images remains efficient with proper cleanup of unused resources
- [ ] Canvas performance maintains 60fps with complex background images displayed
- [ ] Image caching reduces load times for previously uploaded backgrounds

### Integration Requirements
- [ ] Background system integrates with existing Azure Blob Storage for persistent image storage
- [ ] Background image changes coordinate with undo/redo system for operation reversibility
- [ ] Canvas sizing changes accommodate existing assets without disrupting their positions
- [ ] Background image data includes in scene save/load operations with proper error handling
- [ ] Real-time collaboration synchronizes background changes across all connected users

## Business Value
- **Visual Foundation**: Professional battle map creation starts with high-quality background images
- **User Experience**: Intuitive upload process encourages creative scene building
- **Performance**: Optimized image handling allows complex scenes without performance degradation
- **Flexibility**: Support for multiple image formats accommodates various content sources
- **Workflow Efficiency**: Quick background setup enables rapid scene creation

## Dependencies
- **Canvas Foundation**: Requires established multi-layer canvas system (UC047)
- **File Upload Service**: Integration with Azure Blob Storage for image persistence
- **Image Processing**: Browser APIs for image loading, resizing, and format handling
- **Undo/Redo System**: Coordination with change tracking for background operations

## Risk Factors
- **File Size Impact**: Large background images could impact application performance
- **Browser Compatibility**: Different browsers may handle image formats and sizes differently
- **Memory Usage**: Multiple large images could lead to browser memory issues
- **Upload Reliability**: Network issues could interrupt image upload process

## Definition of Done
- All acceptance criteria are met and verified across supported browsers
- Performance benchmarks maintained with maximum size background images
- Image upload tested with various file formats and sizes including edge cases
- Error handling covers all identified failure scenarios with user-friendly messages
- Integration testing completed with canvas foundation and scene persistence
- Memory usage profiling confirms efficient image resource management
- Cross-browser compatibility verified for image rendering and upload functionality
- User testing confirms intuitive background management workflow