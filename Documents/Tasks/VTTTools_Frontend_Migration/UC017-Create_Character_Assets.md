# Use Case UC017: Create Character Assets

## Actor
GM (Game Master)

## Goal
Create character assets to represent player characters in scenes and manage character information for campaign gameplay

## Preconditions
- GM is authenticated with asset creation permissions
- Asset management service is available
- GM has access to character images or artwork

## Main Flow
1. GM navigates to asset creation page and selects character asset type
2. System displays character asset creation form
3. GM enters character basic information (name, description, stats)
4. GM uploads character image or artwork
5. GM configures character properties and attributes
6. GM sets character visibility and sharing permissions
7. GM reviews character asset configuration
8. GM saves new character asset to library
9. Character asset becomes available for use in scenes

## Alternative Flows
**A1 - Image Upload Issues:**
1. Character image upload fails or exceeds size limits
2. System displays image-specific error with requirements
3. GM adjusts image size/format or selects different image
4. System processes corrected image successfully

**A2 - Duplicate Character Name:**
1. Character name already exists in GM's library
2. System suggests alternative names or allows duplicates
3. GM chooses to modify name or accept duplicate
4. System processes decision and continues creation

**A3 - Bulk Character Import:**
1. GM has multiple characters to import from external source
2. System provides bulk import functionality
3. GM uploads character data file or connects to external service
4. System processes bulk import with validation and error reporting

## Postconditions
- Character asset is successfully created and stored
- Character is available in asset library for scene placement
- Character properties are properly configured and accessible
- Asset appears in character category with proper metadata

## Acceptance Criteria
- [ ] Asset creation forms for each type (Character, Creature, NPC, Object)
- [ ] Asset editing interface with property updates
- [ ] Asset deletion with confirmation and dependency checking
- [ ] Asset categorization and organization interface
- [ ] Asset library browsing with search and filtering
- [ ] Asset image upload with 10MB limit validation
- [ ] File upload integration with drag-drop support

## Technical Notes
**React Implementation Considerations:**
- Create specialized character asset form with RPG-specific fields
- Use React Dropzone for character image upload with preview
- Implement character stat management with dynamic field addition
- **EXISTING API INTEGRATION**: Use existing Assets service at `/api/assets` endpoints
- **EXISTING CONTRACT**: Use `CreateAssetRequest` from `VttTools.Assets.ApiContracts`
- **EXISTING IMAGE UPLOAD**: Use Media service `/api/resources` with `UploadRequest` contract
- Use React Hook Form with character-specific validation schemas
- Add character template system for common character types
- Implement character image cropping and optimization
- Create character sheet preview functionality
- Add character import/export capabilities for external tool integration
- Use proper loading states and error handling for character creation

**Backend Infrastructure (Already Implemented):**
- Assets Service provides CRUD endpoints: GET, POST, PATCH, DELETE at `/api/assets`
- Media Service handles file uploads at `/api/resources` with Azure Blob Storage
- Service discovery via .NET Aspire AppHost for dynamic endpoint resolution
- Authentication integration with WebApp ASP.NET Core Identity
- All API contracts defined in `Source\Domain\Assets\ApiContracts\`