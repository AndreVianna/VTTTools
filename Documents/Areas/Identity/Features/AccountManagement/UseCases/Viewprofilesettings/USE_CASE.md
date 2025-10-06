# View Profile Settings Use Case

**Original Request**: Display user profile information in settings interface

**View Profile Settings** is a UI presentation operation that displays the current user's profile information including username, email, phone number, avatar, and account metadata. This use case operates within the Identity area and enables users to view their profile information.

---

## Change Log
- *2025-01-15* — **1.0.0** — Use case specification created from ProfileSettings.tsx analysis

---

## Use Case Overview

### Business Context
- **Parent Feature**: Account Management
- **Owning Area**: Identity
- **Business Value**: Transparency in user data, foundation for profile management
- **User Benefit**: View and understand current account information

### Scope Definition
- **Primary Actor**: Authenticated User
- **Scope**: Profile data presentation
- **Level**: User Interface Component

---

## UI Presentation

### Presentation Type
- **UI Type**: FORM
- **Access Method**: Page at /settings/profile or within settings tabs

- **Container Page**: Settings page (Profile Settings section)
- **Form Location**: Paper component with grid layout
- **Submit Action**: N/A (view mode - Edit button enables editing)
- **Key UI Elements**:
  - Avatar: Profile picture (120x120) with fallback initials, photo upload button (edit mode only)
  - TextField: Email address (readonly, cannot be changed)
  - TextField: Username (readonly in view mode, editable in edit mode)
  - TextField: Phone number (optional, readonly in view mode, editable in edit mode)
  - Button: "Edit Profile" (view mode) / "Save Changes" + "Cancel" (edit mode)
  - Grid: Account information (created date, last login, email verified status, 2FA status)

### UI State Requirements
- **Data Dependencies**: useAuth hook (user object, updateProfile function)
- **State Scope**: Local component state (isEditing, formData, validationErrors)
- **API Calls**: GET /api/users/me (via useAuth.user), PUT /api/users/profile (on save)
- **State Management**: React useState for edit mode and form data, Auth Context for user

### UI Behavior & Flow
- **User Interactions**:
  1. Page loads showing current profile info in readonly mode
  2. User views profile data, account information
  3. User clicks "Edit Profile" to enable editing
  4. Fields become editable (except email)
  5. User can modify username, phone, avatar
  6. User clicks "Save Changes" or "Cancel"
  7. On save, data is validated and submitted
  8. On success, edit mode exits and updated data displays
- **Validation Feedback**: N/A in view mode (only reading data)
- **Loading States**: Loading spinner while user data loads initially
- **Success Handling**: Display updated information in view mode
- **Error Handling**: N/A in view mode (errors handled in update flow)

---

## Architecture Integration

### Clean Architecture Mapping
- **Application Service**: ProfileService.GetProfile(userId) - implicit via Auth Context
- **Domain Entities**: User (aggregate root)
- **Domain Services**: None (read-only operation)
- **Infrastructure Dependencies**: UserRepository, BlobStorage (for avatar URLs)

### Hexagonal Architecture
- **Primary Port Operation**: IProfileService.GetProfile(userId)
- **Secondary Port Dependencies**:
  - IUserRepository.FindById(userId)
  - IBlobStorage.GetSignedUrl(avatarPath) [if using signed URLs]
- **Adapter Requirements**: HTTP adapter, database adapter

### DDD Alignment
- **Bounded Context**: Identity
- **Ubiquitous Language**: User profile, account information, email verification, 2FA status
- **Business Invariants**: None (read-only)
- **Domain Events**: None (read operation)

---

## Functional Specification

### Input Requirements
- **Input Data**: Current user ID (from auth context)
- **Input Validation**: User must be authenticated
- **Preconditions**: User is authenticated, session is valid

### Business Logic
- **Business Rules**:
  - Email is displayed but readonly (cannot be changed via profile settings)
  - Profile picture displays fallback initials if no avatar uploaded
  - Account created date and last login are readonly metadata
  - Email verification status indicated with visual indicator
  - 2FA status displayed (enabled/disabled)
- **Processing Steps**:
  1. Component mounts
  2. Read user data from Auth Context (useAuth hook)
  3. If user data not loaded, show loading spinner
  4. Once loaded, display profile information
  5. Show account metadata (created, last login, verification status)
  6. Wait for user interaction (Edit button click)
- **Domain Coordination**: None (data already loaded in context)
- **Validation Logic**: None (view mode)

### Output Specification
- **Output Data**: Rendered profile information UI
- **Output Format**: React components (MUI Paper, Grid, TextField, Avatar, Typography)
- **Postconditions**: User understands current profile state

### Error Scenarios
- **User Not Loaded**: Show loading spinner or error message
- **Missing User Data**: Gracefully handle missing fields (show empty/default)
- **Avatar Load Failure**: Show fallback initials avatar

---

## Implementation Guidance

### Technical Requirements
- **Interface Contract**:
  ```typescript
  interface UserProfile {
    email: string
    userName: string
    phoneNumber?: string
    profilePictureUrl?: string
    emailConfirmed: boolean
    twoFactorEnabled: boolean
    createdAt: Date
    lastLoginAt?: Date
  }
  ```
- **Data Access Patterns**: Read from Auth Context (already loaded)
- **External Integration**: Avatar URLs from blob storage
- **Performance Requirements**: Instant display (data already in context)

### Testing Strategy
- **Acceptance Criteria**:
  - AC-01: Profile information displays correctly for authenticated user
  - AC-02: Email field is readonly and displays user's email
  - AC-03: Avatar shows profile picture or fallback initials
  - AC-04: Account metadata displays correctly (dates, status indicators)
  - AC-05: Loading state shows while user data loads
  - AC-06: Email verification status indicated visually (checkmark or warning)
  - AC-07: 2FA status indicated visually (enabled/disabled label)

---

## Implementation Notes

### Development Approach
- **Implementation Pattern**: React component reading from Auth Context
- **Code Organization**: Component in src/components/auth/ProfileSettings.tsx
- **Testing Approach**: RTL for component rendering

### Dependencies
- **Technical Dependencies**:
  - React useAuth hook
  - Material-UI Paper, Grid, TextField, Avatar, Button, Typography
  - Date formatting library (date-fns or dayjs)
- **Area Dependencies**: None
- **External Dependencies**: Avatar images from blob storage

### Architectural Considerations
- **Area Boundary Respect**: Pure UI component within Identity
- **Interface Design**: Displays UserDto from domain
- **Error Handling**: Graceful fallbacks for missing data
- **UX Considerations**:
  - Clear visual separation between editable and readonly fields
  - Email readonly notice ("Email cannot be changed. Contact support...")
  - Profile picture upload hint in edit mode

---

This View Profile Settings use case provides implementation guidance for profile information display within the Identity area.
