# Use Case UC008: External Login Providers

## Actor
User (new or existing user preferring external authentication)

## Goal
Authenticate using external login providers (OAuth) to access the platform without creating separate credentials

## Preconditions
- User has account with supported external provider (Google, Microsoft, etc.)
- External authentication services are configured and available
- User is on login or registration page

## Main Flow
1. User accesses login page and sees external provider options
2. User selects preferred external provider (Google, Microsoft, etc.)
3. System redirects to external provider's authentication page
4. User authenticates with external provider credentials
5. External provider redirects back with authorization code
6. System exchanges code for user profile information
7. System creates or links account based on email address
8. User is authenticated and redirected to dashboard

## Alternative Flows
**A1 - Account Linking (Existing User):**
1. External login email matches existing VTTTools account
2. System offers to link external provider to existing account
3. User confirms account linking after password verification
4. System associates external provider with existing account

**A2 - New Account Creation:**
1. External login email doesn't match existing account
2. System creates new account using external provider information
3. System sets up basic profile from provider data
4. User completes any required additional profile information

**A3 - External Provider Error:**
1. External authentication fails or is cancelled
2. System displays appropriate error message
3. System provides fallback options (standard login/registration)
4. User can retry or use alternative authentication method

## Postconditions
- User is authenticated via external provider
- Account is properly linked to external provider
- User has seamless future access via external authentication
- User profile includes external provider information

## Acceptance Criteria
- [ ] External login provider integration (OAuth)
- [ ] Account linking functionality for external providers
- [ ] Proper error handling for external authentication failures

## Technical Notes
**React Implementation Considerations:**
- Implement OAuth2/OpenID Connect flows with proper security measures
- Use VttTools.Auth microservice external authentication providers
- Handle OAuth callbacks and state management securely
- Implement proper error handling for OAuth flow failures
- Create reusable external provider button components
- Use React Router for OAuth callback handling
- Implement account linking workflows with proper user consent
- Add proper loading states during external authentication
- Store external provider tokens securely for profile sync
- Implement proper CSRF protection for OAuth flows