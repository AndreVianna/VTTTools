# Use Case UC012: Create New Adventures

## Actor
GM (Game Master)

## Goal
Create new adventures to organize and manage new gaming campaigns with all necessary configuration and setup

## Preconditions
- User is authenticated with GM privileges
- Adventure creation service is available
- User has necessary permissions to create adventures

## Main Flow
1. GM navigates to adventure creation page from dashboard or adventures list
2. System displays adventure creation form with required fields
3. GM enters adventure basic information (name, description, game system)
4. GM selects adventure type and campaign settings
5. GM configures initial adventure parameters and visibility
6. GM optionally uploads adventure image or selects from library
7. GM reviews adventure configuration
8. GM submits new adventure for creation
9. System creates adventure and assigns GM as owner
10. System redirects to adventure dashboard for further configuration

## Alternative Flows
**A1 - Validation Errors:**
1. System detects missing or invalid adventure information
2. System displays specific validation errors for each field
3. System provides guidance for required corrections
4. GM corrects issues and resubmits adventure creation

**A2 - Duplicate Adventure Name:**
1. System detects adventure name already exists for user
2. System suggests alternative names or allows duplicates
3. GM chooses to modify name or proceed with duplicate
4. System processes choice and continues creation

**A3 - Image Upload Issues:**
1. Adventure image upload fails or exceeds size limits
2. System displays image-specific error message
3. System provides image requirement guidelines
4. GM can skip image upload or try with different image

## Postconditions
- New adventure is successfully created and stored
- GM has ownership and full edit permissions
- Adventure is ready for scene and asset configuration
- Adventure appears in GM's adventures list

## Acceptance Criteria
- [ ] Adventure creation forms with validation
- [ ] Adventure editing interface with all field updates
- [ ] Adventure cloning functionality with deep-clone support
- [ ] Adventure deletion with confirmation dialogs
- [ ] Adventure visibility controls (public/private, published/draft)
- [ ] Adventure list page with card/list views and filtering
- [ ] Adventure type selection and image management

## Technical Notes
**React Implementation Considerations:**
- Use React Hook Form for adventure creation with comprehensive validation
- Implement step-by-step wizard for complex adventure setup
- Create reusable adventure form components
- **EXISTING API INTEGRATION**: Use Library service at `/api/adventures` endpoints
- **EXISTING ENDPOINTS**: POST for create, GET for list, PATCH for updates, DELETE for removal
- **CLONE SUPPORT**: Use existing `/api/adventures/clone/{id}` endpoint for adventure cloning
- **SCENE MANAGEMENT**: Use `/api/adventures/{id}/scenes` for scene operations
- Use React Dropzone with Media service `/api/resources` for image upload
- Implement proper loading states during adventure creation
- Add real-time form validation with visual feedback
- Use React Router for navigation after creation
- Implement draft saving functionality for complex setups
- Add proper error handling and recovery mechanisms

**Backend Infrastructure (Already Implemented):**
- Library Service provides complete adventure CRUD at `/api/adventures`
- Adventure cloning functionality with deep-clone support
- Scene management integration within adventures
- Service discovery via .NET Aspire for dynamic endpoints
- Authentication integration with WebApp ASP.NET Core Identity
- Image upload via Media service with Azure Blob Storage