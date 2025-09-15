# Use Case UC006: Password Reset

## Actor
User (registered user who has forgotten password)

## Goal
Regain access to account by securely resetting forgotten password through email-based recovery process

## Preconditions
- User has a registered account with valid email address
- User cannot remember current password
- Password reset service is available

## Main Flow
1. User accesses password reset form from login page
2. User enters registered email address
3. System validates email format and checks if account exists
4. User submits password reset request
5. System generates secure reset token and sends email
6. User receives password reset email with secure link
7. User clicks reset link and is directed to password reset confirmation page
8. User enters new password with strength validation
9. User confirms new password
10. System validates new password and updates account
11. User is redirected to login with success message

## Alternative Flows
**A1 - Email Not Found:**
1. System determines email is not registered
2. System displays generic "if email exists" message for security
3. User can retry with different email or contact support

**A2 - Expired Reset Token:**
1. User clicks reset link after token expiration
2. System displays expired token message
3. System provides option to request new reset email
4. User can restart password reset process

**A3 - Invalid New Password:**
1. New password doesn't meet security requirements
2. System displays specific validation errors
3. System provides clear guidance for password improvement
4. User modifies password until requirements are met

## Postconditions
- User password is successfully updated
- User can login with new password
- Previous password is invalidated
- Reset token is consumed and invalidated

## Acceptance Criteria
- [ ] Password reset request form with email validation
- [ ] Password reset email generation and delivery
- [ ] Password reset confirmation form with new password validation

## Technical Notes
**React Implementation Considerations:**
- Use React Hook Form for password reset request and confirmation forms
- Implement secure token handling for reset links
- Use same password validation components as registration
- Integrate with VttTools.Auth microservice password reset endpoints
- Implement proper loading states for email sending and password updates
- Use React Router for reset link routing with token parameters
- Implement token expiration handling and user feedback
- Add proper form validation with real-time feedback
- Use secure HTTPS-only reset links for security compliance
- Implement rate limiting UI feedback to prevent abuse