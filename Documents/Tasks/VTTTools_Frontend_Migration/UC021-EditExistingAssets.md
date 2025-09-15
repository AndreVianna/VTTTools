# UC021: Edit Existing Assets

## Use Case Overview
**Use Case ID**: UC021  
**Use Case Name**: Edit Existing Assets  
**User Story**: As a GM, I want to edit existing assets so that I can update their properties  
**Primary Actor**: Game Master (GM)  
**Scope**: VTTTools React Frontend - Asset Management  
**Level**: User Task  

## Preconditions
- User is authenticated as a GM
- User has access to asset library
- At least one asset exists in the user's library
- User has edit permissions for the asset

## Main Success Scenario
1. **Asset Selection**: GM navigates to asset library and selects an existing asset to edit
2. **Edit Mode Activation**: System displays asset details in edit mode with all editable fields
3. **Property Modification**: GM modifies asset properties (name, description, type, stats, etc.)
4. **Image Update** (Optional): GM uploads a new image or modifies existing image properties
5. **Validation**: System validates all modified fields in real-time
6. **Save Changes**: GM saves the updated asset information
7. **Confirmation**: System confirms successful update and refreshes asset display

## Alternative Flows

### 2a. Asset Not Found
- 2a1. System displays "Asset not found" error message
- 2a2. System redirects user back to asset library
- 2a3. Use case ends

### 5a. Validation Errors
- 5a1. System displays specific validation errors for invalid fields
- 5a2. GM corrects the validation errors
- 5a3. Continue from step 5

### 6a. Save Operation Fails
- 6a1. System displays error message with retry option
- 6a2. GM chooses to retry or cancel operation
- 6a3. If retry, continue from step 6; if cancel, return to step 3

## Postconditions
**Success**: Asset properties are updated in the system and reflected in all relevant views
**Failure**: Asset remains unchanged, user receives appropriate error feedback

## Business Rules
- GMs can only edit assets they own or have been granted edit permissions
- Asset type changes may require additional validation
- Asset images must comply with size and format restrictions (10MB limit)
- Asset names must be unique within the user's library
- System maintains audit trail of asset modifications

## Technical Requirements

### React Components Needed
- **AssetEditForm**: Main editing form with all asset fields
- **AssetImageUpload**: Specialized component for handling asset image updates
- **AssetTypeSelector**: Component for changing asset type with validation
- **ValidationErrorDisplay**: Component for showing field-specific errors
- **SaveConfirmation**: Component for save operation feedback

### API Integration Points
- **GET** `/api/assets/{assetId}` - Retrieve asset details for editing
- **PUT** `/api/assets/{assetId}` - Update asset properties
- **POST** `/api/assets/{assetId}/image` - Upload new asset image (if changed)
- **DELETE** `/api/assets/{assetId}/image` - Remove asset image (if applicable)

### State Management
- Asset editing state (form data, validation errors, loading states)
- Image upload progress and status
- Integration with asset library cache invalidation
- Optimistic updates with rollback on failure

### Validation Rules
- Required fields: name, type
- Name length: 1-100 characters
- Description length: 0-1000 characters
- Image format: PNG, JPEG, WebP
- Image size: Maximum 10MB
- Real-time validation with 300ms debounce

## Acceptance Criteria
- [ ] Asset edit form displays all current asset properties correctly
- [ ] Real-time validation provides immediate feedback on field changes
- [ ] Image upload/replacement works with drag-drop and file picker
- [ ] Asset type changes trigger appropriate validation and field updates
- [ ] Save operation completes within 3 seconds for property-only changes
- [ ] Save operation completes within 10 seconds when including image uploads
- [ ] Error messages are specific and provide actionable guidance
- [ ] Successful saves update the asset library view immediately
- [ ] Changes are reflected in Scene Builder if asset is currently in use
- [ ] Form maintains unsaved changes state with confirmation on navigation away

## Error Handling Requirements
- Network connectivity issues during save operations
- Asset not found or permission denied scenarios  
- Invalid file format or size validation for images
- Concurrent modification conflicts (optimistic locking)
- Server-side validation failures
- Image upload failures with specific error messaging

## Performance Requirements
- Form loads within 1 second of asset selection
- Real-time validation responses within 200ms
- Image preview updates within 500ms of selection
- Save operations provide loading indicators for operations >1 second
- Form remains responsive during image upload operations

## Security Considerations  
- Validate asset ownership before allowing edits
- Sanitize all user input to prevent XSS attacks
- Validate uploaded images for malicious content
- Implement CSRF protection for all save operations
- Log asset modification activities for audit purposes