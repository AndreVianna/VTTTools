# UC025: Upload Asset Images

## Use Case Overview
**Use Case ID**: UC025  
**Use Case Name**: Upload Asset Images  
**User Story**: As a GM, I want to upload asset images so that I can customize the visual representation  
**Primary Actor**: Game Master (GM)  
**Scope**: VTTTools React Frontend - Asset Management  
**Level**: User Task  

## Preconditions
- User is authenticated as a GM
- User is in asset creation or editing mode
- User has assets that require image representation

## Main Success Scenario
1. **Upload Initiation**: GM accesses image upload interface during asset creation/editing
2. **File Selection**: GM selects image file using drag-drop or file picker
3. **File Validation**: System validates file format, size, and content
4. **Image Preview**: System displays image preview with upload progress
5. **Image Processing**: System processes image (resize, optimize) if necessary
6. **Upload Completion**: System uploads image to storage and associates with asset
7. **Confirmation**: System confirms successful upload and displays final image

## Alternative Flows

### 2a. Drag and Drop Upload
- 2a1. GM drags image file(s) over upload zone
- 2a2. System highlights drop zone and shows visual feedback
- 2a3. GM drops file onto upload area
- 2a4. System immediately begins validation process
- 2a5. Continue from step 3

### 2b. Multiple File Upload
- 2b1. GM selects multiple image files at once
- 2b2. System displays upload queue with all selected files
- 2b3. GM can reorder, remove, or add more files to queue
- 2b4. System processes files sequentially with progress tracking
- 2b5. Continue from step 3 for each file

### 3a. File Validation Failure
- 3a1. System detects invalid file format, size, or content
- 3a2. System displays specific error message with requirements
- 3a3. GM can choose different file or adjust current file
- 3a4. Return to step 2 with corrected file

### 5a. Image Editing Required
- 5a1. System detects image needs cropping or basic editing
- 5a2. GM uses built-in image editor for basic adjustments
- 5a3. GM crops, rotates, or adjusts image as needed
- 5a4. Continue from step 6 with edited image

### 6a. Upload Failure
- 6a1. System encounters error during upload process
- 6a2. System displays error message with retry option
- 6a3. GM can retry upload or select different file
- 6a4. If retry successful, continue from step 7

## Postconditions
**Success**: Image successfully uploaded, processed, and associated with asset
**Failure**: Upload process fails, user receives guidance for resolution

## Business Rules
- Maximum file size: 10MB per image
- Supported formats: PNG, JPEG, WebP, GIF (static)
- Image dimensions: Minimum 100x100px, Maximum 4096x4096px
- File name sanitization removes special characters
- Duplicate image detection suggests existing assets
- Automatic thumbnail generation for library display
- Image optimization for web display while preserving quality

## Technical Requirements

### React Components Needed
- **ImageUploadZone**: Drag-and-drop upload area with visual feedback
- **FileSelector**: File picker button with format filtering
- **UploadProgress**: Progress bar with upload status and cancellation
- **ImagePreview**: Preview component with editing capabilities
- **ImageEditor**: Basic image editing tools (crop, rotate, resize)
- **ValidationDisplay**: Component showing file validation errors
- **UploadQueue**: Multi-file upload management interface

### API Integration Points
**EXISTING BACKEND SERVICES (Already Implemented):**
- **POST** `/api/resources` - Upload file using Media Service with `UploadRequest` contract
- **GET** `/api/resources/{id}` - Download/preview uploaded files
- **DELETE** `/api/resources/{id}` - Remove uploaded files
- **Service Discovery**: Use .NET Aspire service discovery for dynamic endpoints
- **Authentication**: Integrated with WebApp ASP.NET Core Identity
- **Storage**: Azure Blob Storage already configured in Media Service

**Frontend Integration Requirements:**
- Use existing `VttTools.Media.ApiContracts.UploadRequest` with properties: Id, Type, Resource, File
- Integrate with service discovery patterns (no hardcoded URLs)
- Handle authentication tokens from WebApp Identity system
- Support IFormFile interface for file uploads as defined in existing contract

### State Management
- Upload progress state with per-file tracking
- Image preview state with editing capabilities
- Validation error state with field-specific messages
- Queue management state for multiple uploads
- Image processing state with optimization progress
- Asset association state linking images to assets

### File Processing Features
- Client-side file validation before upload
- Image compression and optimization
- Automatic thumbnail generation
- EXIF data stripping for privacy
- Format conversion capabilities
- Progress tracking with cancellation support

## Acceptance Criteria
- [ ] Drag-and-drop interface provides clear visual feedback during drag operations
- [ ] File picker filters to only show supported image formats
- [ ] Upload progress displays percentage, speed, and time remaining
- [ ] File validation occurs within 500ms of selection
- [ ] Image preview appears within 1 second of successful validation
- [ ] Upload completes within 30 seconds for 10MB files on average connection
- [ ] Basic image editing tools (crop, rotate) work smoothly without page refresh
- [ ] Multiple file uploads process in parallel with queue management
- [ ] Upload cancellation works at any point during the process
- [ ] Error messages specify exact validation failures with resolution steps
- [ ] Successful uploads immediately update asset preview in all relevant views

## Error Handling Requirements
- File size exceeded with clear indication of limit and current size
- Unsupported file format with list of supported formats
- Network interruption during upload with auto-retry capabilities
- Server storage limits with guidance on space management
- Corrupt or unreadable image files with file integrity checking
- Concurrent upload conflicts with intelligent queuing
- Browser compatibility issues with graceful feature detection

## Performance Requirements
- File validation completes within 500ms for files up to 10MB
- Upload progress updates at minimum every 500ms during transfer
- Image preview generation within 2 seconds of upload completion
- Parallel uploads support up to 5 simultaneous files
- Client-side image compression reduces file size by 10-30% before upload
- Upload interface remains responsive during file processing

## Security Considerations  
- File type validation based on content, not just extension
- Malware scanning integration for uploaded images
- EXIF data sanitization to remove location and personal information
- File name sanitization to prevent directory traversal attacks
- Rate limiting to prevent upload abuse
- Virus scanning integration before file storage
- Secure file URLs with time-based access tokens
- Input validation for all file metadata

## Accessibility Requirements
- Screen reader support for upload progress and status
- Keyboard navigation for all upload controls
- High contrast mode support for upload interface
- Alternative text support for uploaded images
- Focus management during upload process
- Error announcement for assistive technologies

## Integration Requirements
- Seamless integration with asset creation and editing workflows
- Automatic asset thumbnail updates when images are uploaded
- Scene Builder integration for immediate asset availability
- Asset library updates reflecting new images without page refresh
- Undo capability for recently uploaded images during editing sessions