# Update Profile Use Case

**Original Request**: Modify user profile data (username, phone, avatar)

**Update Profile** is a profile modification operation that validates and persists changes to user profile information. This use case operates within the Identity area and enables users to update their username, phone number, and profile picture.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from ProfileSettings.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Account Management
- **Owning Area**: Identity
- **Business Value**: User autonomy in profile management, accurate user data
- **User Benefit**: Personalize profile, keep contact information current

### Scope Definition
- **Primary Actor**: Authenticated User
- **Scope**: Profile data modification and persistence
- **Level**: User Goal

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Edit mode in ProfileSettings component

- **Container Page**: Settings page (Profile Settings in edit mode)
- **Form Location**: Paper component with editable fields
- **Submit Action**: Validates inputs, calls useAuth().updateProfile(), saves changes
- **Key UI Elements**:
  - Avatar: Profile picture with "Upload" icon button for file selection
  - TextField: Username input with validation (3-50 chars, alphanumeric/underscore/hyphen)
  - TextField: Phone number input (optional) with format validation
  - Button: "Save Changes" with loading state
  - Button: "Cancel" to discard changes
  - Alert: Success/error messages

### UI State Requirements
- **Data Dependencies**: useAuth hook (updateProfile function, isLoading, error)
- **State Scope**: Local form state (formData: userName, phoneNumber, profilePictureUrl, validationErrors, isEditing)
- **API Calls**: PUT /api/users/profile, POST /api/users/avatar (for image upload)
- **State Management**: React useState for form, Auth Context for profile updates

### UI Behavior & Flow
- **User Interactions**:
  1. User clicks "Edit Profile"
  2. Fields become editable
  3. User modifies username and/or phone
  4. User optionally uploads new avatar
  5. User clicks "Save Changes"
  6. Client validates inputs
  7. API call submits changes
  8. On success, Auth Context updates, edit mode exits
  9. User sees updated profile in view mode
- **Validation Feedback**:
  - Username: 3-50 chars, alphanumeric/underscore/hyphen only, inline error messages
  - Phone: Optional, format validation if provided
  - Avatar: File type validation (image files only)
- **Loading States**: Save button shows spinner, all inputs disabled during save
- **Success Handling**: Exit edit mode, show updated data, optional success toast
- **Error Handling**: Error alert displayed, stay in edit mode for corrections

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ProfileService.UpdateProfile(UpdateProfileCommand)
- **Domain Entities**: User (aggregate root)
- **Domain Services**: UsernameUniquenessService, ProfileValidationService
- **Infrastructure Dependencies**: UserRepository, BlobStorageService (for avatar uploads)

### Hexagonal Architecture
- **Primary Port Operation**: IProfileService.UpdateProfile(userId, updates)
- **Secondary Port Dependencies**:
  - IUserRepository.FindByUsername(username) [for uniqueness check]
  - IUserRepository.Update(user)
  - IBlobStorage.UploadFile(file) [for avatar]
  - IBlobStorage.DeleteFile(oldAvatarPath) [cleanup]
- **Adapter Requirements**: HTTP adapter, database adapter, blob storage adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: Profile update, username change, avatar upload, contact information
- **Business Invariants**:
  - Username must be unique across platform
  - Username can only contain valid characters
  - Email cannot be changed via profile settings
  - Phone number format must be valid (if provided)
- **Domain Events**: UserProfileUpdated(userId, changes, timestamp)

---

## Functional Specification

### Input Requirements
- **Input Data**:
  - Username (string, 3-50 chars, alphanumeric/underscore/hyphen)
  - Phone number (string, optional, valid phone format)
  - Avatar file (image file, optional, max 5MB)
- **Input Validation**:
  - Username: Length, character restrictions, uniqueness
  - Phone: Format validation if provided (regex)
  - Avatar: File type (image/*), file size (<5MB)
- **Preconditions**: User is authenticated, in edit mode

### Business Logic
- **Business Rules**:
  - Username must be unique (case-insensitive check)
  - Username validation: 3-50 chars, alphanumeric + underscore/hyphen
  - Phone number optional, validated if provided
  - Avatar uploaded to blob storage, URL stored in profile
  - Old avatar deleted from storage when new one uploaded
  - Only changed fields are updated (delta updates)
  - Email cannot be changed (must contact support)
- **Processing Steps**:
  1. Client: Validate form inputs
  2. Identify changed fields (compare with original user data)
  3. If avatar changed, upload to blob storage first
  4. Submit ProfileService.UpdateProfile with changes
  5. Server: Check username uniqueness (if changed)
  6. Server: Validate business rules
  7. Server: Update User entity
  8. Server: Persist to repository
  9. Server: Publish UserProfileUpdated event
  10. Client: Update Auth Context with new user data
  11. Client: Exit edit mode, show updated profile
- **Domain Coordination**:
  - User entity validates changes
  - UsernameUniquenessService ensures no conflicts
  - BlobStorageService handles avatar upload/cleanup
- **Validation Logic**:
  - Frontend: Format, length, character restrictions
  - Backend: Uniqueness, business rules, sanitization

### Output Specification
- **Output Data**:
  - Success: { user: UserDto, message: "Profile updated successfully" }
  - Error: { error: string, field?: string }
- **Output Format**: JSON response
- **Postconditions**:
  - User profile updated in database
  - Auth Context reflects changes
  - UserProfileUpdated event published

### Error Scenarios
- **Username Too Short**: Client validation → "Username must be at least 3 characters"
- **Invalid Username Characters**: Client validation → "Username can only contain letters, numbers, underscores, and hyphens"
- **Username Taken**: Backend 409 → "Username already taken"
- **Invalid Phone Format**: Client validation → "Invalid phone number format"
- **Avatar Too Large**: Client validation → "Image must be less than 5MB"
- **Invalid File Type**: Client validation → "Please upload an image file"
- **Upload Failure**: Backend error → "Failed to upload avatar. Please try again."
- **Network Error**: "Connection error. Please try again."

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface IProfileService {
    UpdateProfile(userId: string, updates: ProfileUpdates): Promise<UpdateResult>
  }

  interface ProfileUpdates {
    userName?: string
    phoneNumber?: string
    profilePictureUrl?: string
  }

  interface UpdateResult {
    user: UserDto
    message: string
  }
  ```
- **Data Access Patterns**: Repository for User updates, blob storage for avatars
- **External Integration**: Azure Blob Storage / AWS S3 / local file storage for avatars
- **Performance Requirements**: Update response <1s, avatar upload <5s

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Valid profile updates save successfully
  - AC-02: Username uniqueness enforced (409 if taken)
  - AC-03: Username validation works (length, characters)
  - AC-04: Phone validation works (format)
  - AC-05: Avatar upload works, old avatar deleted
  - AC-06: Cancel button discards changes
  - AC-07: Only changed fields are submitted (delta updates)
  - AC-08: Auth Context updates after successful save

---

## Implementation Notes

### Security Considerations
- **Username Enumeration**: Consider rate limiting to prevent username enumeration via uniqueness checks
- **File Upload Security**: Validate file types, scan for malware, limit file sizes
- **Avatar URLs**: Use signed URLs or CDN for avatar serving
- **Input Sanitization**: Sanitize all inputs to prevent injection attacks

---

This Update Profile use case provides implementation guidance for profile modification within the Identity area.
