# Use Case UC004: User Login

## Actor
User (existing registered user)

## Goal
Authenticate and gain access to personalized gaming content and platform features

## Preconditions
- User has a registered and activated account
- User is not currently authenticated
- Authentication service is available

## Main Flow
1. User accesses login form from landing page or navigation
2. User enters email address with format validation
3. User enters password
4. User optionally selects "Remember me" checkbox for extended session
5. System validates form fields in real-time
6. User submits login form
7. System validates credentials within 3 seconds
8. System creates authentication session with appropriate duration
9. System redirects user to dashboard or previously requested page
10. User gains access to authenticated features and content

## Alternative Flows
**A1 - Invalid Credentials:**
1. System determines credentials are incorrect
2. System displays error message within 3 seconds with clear guidance
3. System suggests password reset option if multiple failures
4. User can retry with correct credentials or reset password

**A2 - Network Failure:**
1. Login submission fails due to network connectivity issues
2. System displays network error with specific timeout information
3. System provides retry button with 30-second timeout
4. System detects offline status and provides appropriate messaging
5. User can retry when connection is restored

**A3 - Account Locked/Suspended:**
1. System determines account is locked due to security policies
2. System displays appropriate message with contact information
3. System provides account recovery options if available
4. User must follow account recovery procedures

**A4 - Session Extension (Remember Me):**
1. User selects remember me option during login
2. System creates extended session token valid for 30 days
3. System stores token securely with appropriate security measures
4. User remains authenticated for extended period without re-login

## Postconditions
- User is successfully authenticated with valid session
- User has access to all authorized platform features
- User can access personalized content and settings
- Authentication state is maintained across application navigation

## Acceptance Criteria
- [ ] Login form validates credentials within 3 seconds of submission
- [ ] Invalid credentials show error message within 3 seconds with clear next steps
- [ ] Remember me checkbox persists session for 30 days with secure token storage
- [ ] Form validation displays field-specific errors within 200ms of field blur
- [ ] Network failures show retry button with 30-second timeout and offline detection

## Technical Notes
**React Implementation Considerations:**
- Use React Hook Form with controlled inputs for login form
- Implement real-time validation with 200ms debounce for field blur events
- Use React Context or Redux for authentication state management
- **EXISTING AUTHENTICATION**: Integrate with VttTools.Auth microservice endpoints
- **EXISTING ENDPOINTS**: Use `/api/auth` endpoints for login/logout operations
- **EXISTING AUTH FLOW**: Cookie-based authentication (not JWT) as implemented in Auth service
- Use React Query for login mutation with retry logic and error handling
- Implement proper loading states during authentication process
- Use React Router for post-login navigation and protected routes
- Implement offline detection using navigator.onLine API
- Add proper ARIA attributes for accessibility compliance
- Implement rate limiting UI feedback for security compliance
- Use proper error boundaries for authentication failures

**Backend Authentication (Already Implemented):**
- VttTools.Auth microservice with ASP.NET Core Identity at `/api/auth/`
- External login providers support via `/api/auth/perform_external_login`
- Logout endpoint at `/api/auth/logout`
- Cookie-based session management with secure storage
- Two-factor authentication and recovery codes support
- Account management endpoints under `/api/auth/manage/`