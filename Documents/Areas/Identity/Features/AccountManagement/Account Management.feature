# Generated: 2025-01-15
# Feature: Account Management

@feature @identity @account-management
Feature: Account Management
  As an authenticated user
  I want to manage my profile and security settings
  So that I can maintain accurate account information and protect my account

  Background:
    Given I am authenticated as a registered user
    And my account is active

  # ========================================
  # Profile Management Scenarios
  # ========================================

  @happy-path @profile
  Scenario: View complete profile information
    Given I have a profile with username, email, and phone
    And I have uploaded a profile picture
    When I navigate to profile settings
    Then I should see my profile information displayed
    And I should see my account metadata
    And I should see my email verification status
    And I should see my profile picture

  @happy-path @profile
  Scenario: Successfully update profile information
    Given I am viewing my profile settings
    When I update my username to a valid new username
    And I update my phone number
    And I save the changes
    Then profile is updated successfully
    And I should see a confirmation message
    And I should see the updated information displayed

  @validation @profile
  Scenario: Prevent duplicate username during profile update
    Given another user exists with username "existinguser"
    When I attempt to update my username to "existinguser"
    Then update fails
    And I should see error "Username already taken"
    And original username remains unchanged

  # ========================================
  # Security Settings Scenarios
  # ========================================

  @happy-path @security
  Scenario: View security status without 2FA
    Given I have not enabled two-factor authentication
    When I navigate to security settings
    Then I should see my password status
    And I should see "2FA Disabled" indicator
    And I should see "Enable 2FA" option
    And I should not see recovery codes option

  @happy-path @security
  Scenario: View security status with 2FA enabled
    Given I have enabled two-factor authentication
    And I have recovery codes generated
    When I navigate to security settings
    Then I should see my password status
    And I should see "2FA Enabled" indicator with checkmark
    And I should see "Disable 2FA" option
    And I should see "Manage Recovery Codes" option

  # ========================================
  # Password Management Scenarios
  # ========================================

  Rule: Password change requires current password verification

    @happy-path @password
    Scenario: Successfully change password
      Given I know my current password
      When I provide my current password
      And I provide a strong new password
      And I confirm the new password
      Then my password should be changed successfully
      And I should see a success message
      And I should be able to login with the new password

    @error-handling @password
    Scenario: Reject password change with incorrect current password
      Given I provide an incorrect current password
      When I attempt to change my password
      Then the change should fail
      And I should see error "Current password is incorrect"
      And my password should remain unchanged

  Rule: New password must meet strength requirements

    @validation @password
    Scenario: Reject weak password during change
      Given I provide my correct current password
      When I provide a weak new password with only 4 characters
      Then the change should fail
      And I should see error indicating password requirements
      And I should see which requirements are not met

    @data-driven @password
    Scenario Outline: Validate password strength requirements
      Given I provide my correct current password
      When I provide new password "<password>"
      Then the result should be "<result>"
      And the password strength should be "<strength>"

      Examples:
        | password      | result  | strength |
        | Test1234!     | success | strong   |
        | weakpass      | failure | weak     |
        | NoNumbers!    | failure | medium   |
        | nonumbers123  | failure | medium   |

  # ========================================
  # Two-Factor Authentication Scenarios
  # ========================================

  Rule: Two-factor setup requires verification with authenticator app

    @happy-path @2fa
    Scenario: Successfully enable two-factor authentication
      Given I have an authenticator app installed
      When I initiate 2FA setup
      Then I should see a QR code
      And I should see a manual entry code
      When I scan the QR code with my authenticator app
      And I provide a valid 6-digit verification code
      Then 2FA should be enabled successfully
      And I should receive recovery codes
      And I should see 2FA enabled in security settings

    @error-handling @2fa
    Scenario: Reject invalid verification code during 2FA setup
      Given I am setting up two-factor authentication
      And I have scanned the QR code
      When I provide an invalid 6-digit code
      Then the verification should fail
      And I should see error "Invalid code. Please check your authenticator app."
      And I should be able to retry with a new code
      And 2FA should remain disabled

  Rule: Two-factor authentication can be disabled with password

    @happy-path @2fa
    Scenario: Successfully disable two-factor authentication
      Given I have two-factor authentication enabled
      When I request to disable 2FA
      And I provide my current password
      Then 2FA should be disabled successfully
      And my recovery codes should be invalidated
      And I should see "2FA Disabled" in security settings

  # ========================================
  # Recovery Codes Management Scenarios
  # ========================================

  Rule: Recovery codes can only be used once

    @happy-path @recovery-codes
    Scenario: View remaining recovery codes
      Given I have 2FA enabled
      And I have 7 unused recovery codes
      When I open recovery codes manager
      Then I should see "7 unused recovery codes remaining"
      And I should be able to view the codes
      And I should have download and copy options

    @validation @recovery-codes
    Scenario: Warning when recovery codes running low
      Given I have 2FA enabled
      And I have only 2 unused recovery codes
      When I open recovery codes manager
      Then I should see a low codes warning
      And I should see "You're running low on recovery codes"
      And I should see "Regenerate Codes" option highlighted

  Rule: Recovery code regeneration requires password verification

    @happy-path @recovery-codes
    Scenario: Successfully regenerate recovery codes
      Given I have 2FA enabled with existing recovery codes
      When I request to regenerate recovery codes
      And I provide my current password
      Then new recovery codes is generated
      And all old recovery codes should be invalidated
      And I should see the new codes displayed
      And I should have options to save the new codes

    @error-handling @recovery-codes
    Scenario: Reject regeneration with incorrect password
      Given I have 2FA enabled
      When I request to regenerate recovery codes
      And I provide an incorrect password
      Then the regeneration should fail
      And I should see error "Incorrect password"
      And my existing recovery codes should remain valid

  # ========================================
  # Edge Cases and Integration
  # ========================================

  @edge-case @profile
  Scenario: Update profile with minimum valid data
    Given I have a profile with minimal information
    When I update only my username
    And the username has exactly 3 characters
    And I save the changes
    Then my profile is updated successfully
    And only my username should be changed
    And other fields should remain unchanged

  @edge-case @profile
  Scenario: Handle profile picture upload at maximum size
    Given I have a profile picture that is 4.9MB
    When I upload the picture
    Then the upload should succeed
    And my profile picture is updated
    And the old picture should be deleted

  @integration @cross-area
  Scenario: Profile update reflects across application
    Given I update my username and profile picture
    When the update completes successfully
    Then my username should appear in navigation
    And my profile picture should appear in header
    And my username should be available to other features

  @error-handling @security
  Scenario: Handle network error during password change
    Given I provide valid password change data
    When a network error occurs during submission
    Then I should see error "Connection error. Please try again."
    And I should remain on the password change dialog
    And I should be able to retry the operation

  @authorization @security
  Scenario: Unauthorized user cannot access account management
    Given I am not authenticated
    When I attempt to access profile settings
    Then I should be redirected to login
    And I should not see any profile information

  @authorization @security
  Scenario: Expired session prevents account modifications
    Given my authentication session has expired
    When I attempt to update my profile
    Then the update should fail
    And I should be redirected to login
    And I should see message "Session expired. Please login again."
