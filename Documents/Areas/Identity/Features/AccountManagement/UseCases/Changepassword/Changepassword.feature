# Generated: 2025-01-15
# Use Case: Change Password

@use-case @identity @security @password @critical
Feature: Change Password
  As an authenticated user
  I want to change my account password
  So that I can maintain account security and update compromised passwords

  Background:
    Given I am authenticated as a registered user
    And I have a password-based account
    And I am viewing security settings

  # ========================================
  # Happy Path Scenarios
  # ========================================

  @happy-path
  Scenario: Successfully change password with valid inputs
    Given I click "Change Password"
    And the password change dialog opens
    When I enter my current password "OldPass123!"
    And I enter new password "NewSecure456!"
    And I confirm new password "NewSecure456!"
    And I click "Change Password" button
    Then my password should be changed successfully
    And I should see confirmation "Password updated successfully"
    And the dialog should close
    And I should be able to login with new password

  # ========================================
  # Current Password Verification
  # ========================================

  Rule: Password change requires current password verification

    @validation @critical
    Scenario: Verify current password before allowing change
      Given I open password change dialog
      When I enter current password "WrongPass123"
      And I enter valid new password
      And I confirm new password
      And I submit the form
      Then the change should fail
      And I should see error "Current password is incorrect"
      And my password should remain unchanged
      And I should remain on the dialog

    @validation
    Scenario: Current password field is required
      Given I open password change dialog
      When I leave current password field empty
      And I enter new password
      And I confirm new password
      Then the submit button is disabled
      Or I should see validation error "Current password is required"

    @happy-path
    Scenario: Correct current password allows change
      Given I enter my correct current password
      And I enter valid new password meeting all requirements
      And I confirm new password correctly
      When I submit the form
      Then the password verification should succeed
      And my password is updated
      And I should see success message

  # ========================================
  # Password Strength Requirements
  # ========================================

  Rule: New password must meet strength requirements

    @validation @password-strength
    Scenario: Display password strength requirements
      When I open password change dialog
      Then I should see password requirements list
      And requirements should include "At least 8 characters"
      And requirements should include "Uppercase letter"
      And requirements should include "Lowercase letter"
      And requirements should include "Number"
      And requirements should include "Special character"

    @validation @password-strength
    Scenario: Real-time password strength indicator
      Given I am entering a new password
      When I type "weak"
      Then strength indicator should show "Weak" in red
      When I type "Weak123"
      Then strength indicator should show "Medium" in yellow
      When I type "Weak123!"
      Then strength indicator should show "Strong" in green

    @validation @password-strength
    Scenario: Visual feedback on requirement completion
      Given I am entering a new password
      When I type "newpass"
      Then "At least 8 characters" should show checkmark
      But "Uppercase letter" should show X
      When I type "Newpass"
      Then "Uppercase letter" should show checkmark
      When I type "Newpass1"
      Then "Number" should show checkmark
      When I type "Newpass1!"
      Then "Special character" should show checkmark
      And all requirements should be satisfied

  Rule: Password must be at least 8 characters long

    @validation
    Scenario: Reject password shorter than 8 characters
      Given I enter correct current password
      When I enter new password "Pass1!"
      And I confirm the password
      And I attempt to submit
      Then I should see error "Password must be at least 8 characters"
      And the change should not proceed
      And password strength should show "Too short"

    @validation
    Scenario: Accept password at minimum length
      Given I enter correct current password
      When I enter new password "Pass123!"
      And the password is exactly 8 characters
      And I confirm the password
      And I submit
      Then the change should succeed
      And my password is updated

    @data-driven @validation
    Scenario Outline: Validate password length requirements
      Given I enter correct current password
      When I enter new password with <length> characters
      Then the result should be <result>
      And strength indicator should show <strength>

      Examples:
        | length | result  | strength |
        | 4      | failure | weak     |
        | 7      | failure | weak     |
        | 8      | success | medium   |
        | 12     | success | strong   |
        | 20     | success | strong   |

  Rule: Password must contain uppercase, lowercase, number, and special character

    @validation
    Scenario: Reject password missing uppercase
      Given I enter correct current password
      When I enter new password "password123!"
      And I confirm the password
      And I submit
      Then I should see error indicating missing requirements
      And I should see "Missing: Uppercase letter"
      And the change should not proceed

    @validation
    Scenario: Reject password missing lowercase
      Given I enter correct current password
      When I enter new password "PASSWORD123!"
      And I confirm the password
      And I submit
      Then I should see error indicating missing requirements
      And I should see "Missing: Lowercase letter"

    @validation
    Scenario: Reject password missing number
      Given I enter correct current password
      When I enter new password "PasswordTest!"
      And I confirm the password
      And I submit
      Then I should see error indicating missing requirements
      And I should see "Missing: Number"

    @validation
    Scenario: Reject password missing special character
      Given I enter correct current password
      When I enter new password "Password123"
      And I confirm the password
      And I submit
      Then I should see error indicating missing requirements
      And I should see "Missing: Special character"

    @data-driven @validation
    Scenario Outline: Validate password complexity requirements
      Given I enter correct current password
      When I enter new password "<password>"
      And I confirm the password
      And I submit
      Then the result should be "<result>"
      And I should see message "<feedback>"

      Examples:
        | password      | result  | feedback                          |
        | Test1234!     | success | Password updated successfully     |
        | lowercase1!   | failure | Missing: Uppercase letter         |
        | UPPERCASE1!   | failure | Missing: Lowercase letter         |
        | NoNumbers!    | failure | Missing: Number                   |
        | NoSpecial123  | failure | Missing: Special character        |
        | weak          | failure | Password is too weak              |

  # ========================================
  # Password Confirmation Matching
  # ========================================

  Rule: New password must match confirmation

    @validation
    Scenario: Reject mismatched password confirmation
      Given I enter correct current password
      And I enter new password "NewPass123!"
      When I enter confirmation "DifferentPass123!"
      And I submit
      Then I should see error "Passwords do not match"
      And the change should not proceed
      And I should be able to correct the mismatch

    @validation
    Scenario: Accept matching password confirmation
      Given I enter correct current password
      And I enter new password "NewPass123!"
      When I enter confirmation "NewPass123!"
      And I submit
      Then password validation should pass
      And my password is updated successfully

    @ux
    Scenario: Real-time confirmation matching feedback
      Given I enter new password "NewPass123!"
      When I start typing confirmation "New"
      Then I should not see mismatch error yet
      When I complete confirmation with "Pass123!"
      Then I should see confirmation checkmark
      When I change confirmation to "Wrong"
      Then I should see error "Passwords do not match"

  # ========================================
  # Optional: New Password Different from Current
  # ========================================

  @validation @optional
  Scenario: Reject new password same as current
    Given I enter correct current password "MyPass123!"
    When I enter new password "MyPass123!"
    And I confirm new password "MyPass123!"
    And I submit
    Then I should see error "New password must be different from current password"
    And the change should not proceed

  # ========================================
  # Dialog UI and Behavior
  # ========================================

  @ux @dialog
  Scenario: Password change dialog structure
    When I click "Change Password"
    Then a modal dialog should open
    And I should see dialog title "Change Password"
    And I should see three password input fields
    And I should see password strength indicator
    And I should see requirements checklist
    And I should see "Cancel" button
    And I should see "Change Password" submit button

  @ux @dialog
  Scenario: Cancel password change
    Given I have entered password data
    When I click "Cancel"
    Then the dialog should close
    And no password change should occur
    And I should return to security settings
    And no API call should be made

  @ux @dialog
  Scenario: Close dialog without changes
    Given I open password change dialog
    And I have not entered any data
    When I close the dialog using X button
    Then the dialog should close
    And I should return to security settings

  # ========================================
  # Loading and Async Behavior
  # ========================================

  @loading
  Scenario: Display loading state during password change
    Given I have entered valid password change data
    When I click "Change Password"
    Then I should see loading spinner on button
    And the button text should show "Changing..."
    And all input fields should be disabled
    And cancel button should be disabled
    And I should not be able to edit fields

  @loading
  Scenario: Re-enable form after error
    Given I submit password change
    And an error occurs
    When the error is displayed
    Then input fields should be re-enabled
    And I should be able to correct inputs
    And I should be able to resubmit

  # ========================================
  # Error Handling
  # ========================================

  @error-handling
  Scenario: Handle network error during password change
    Given I submit valid password change
    When a network error occurs
    Then I should see error "Connection error. Please try again."
    And I should remain on the dialog
    And my inputs should be preserved
    And I should be able to retry
    And my password should remain unchanged

  @error-handling
  Scenario: Handle rate limiting on password change attempts
    Given I have attempted password change 5 times with wrong current password
    When I attempt another change
    Then I should see error "Too many attempts. Please try again later."
    And the form should be disabled temporarily
    And a countdown or retry time should be shown

  @error-handling
  Scenario: Handle server validation error
    Given I submit password change
    When server returns validation error
    Then I should see the specific error message
    And the relevant field should be highlighted
    And I should remain on the dialog
    And I should be able to correct and resubmit

  # ========================================
  # Security Side Effects
  # ========================================

  @security @session-management
  Scenario: Optionally terminate other sessions after password change
    Given I have multiple active sessions
    When I successfully change my password
    Then other sessions may be terminated
    And I should be notified "Other sessions have been logged out for security"
    And my current session should remain active

  @security @integration
  Scenario: Password change publishes security event
    When I successfully change my password
    Then a PasswordChanged action is logged
    And the event should include user ID and timestamp
    And security monitoring should be notified
    And the event should not include password data

  # ========================================
  # Edge Cases
  # ========================================

  @edge-case
  Scenario: Handle very long password
    Given I enter correct current password
    When I enter new password with 128 characters
    And the password meets complexity requirements
    And I confirm it correctly
    And I submit
    Then the change should succeed
    And the long password should be accepted

  @edge-case
  Scenario: Handle Unicode characters in password
    Given I enter correct current password
    When I enter new password "Pässw0rd!用户"
    And I confirm it correctly
    And I submit
    Then the change should succeed
    And Unicode characters should be preserved
    And I should be able to login with the new password

  @edge-case
  Scenario: Handle paste into password fields
    Given I copy "SecurePass123!" to clipboard
    When I paste into new password field
    Then my password be filled
    And strength indicator should update
    And requirements is validated

  @edge-case
  Scenario: Handle browser autofill
    Given my browser offers to fill current password
    When I accept the autofill
    Then the correct password should be filled
    And I should be able to proceed with new password

  # ========================================
  # Authorization
  # ========================================

  @authorization
  Scenario: Expired session during password change
    Given I open password change dialog
    And my session expires
    When I submit the password change
    Then I should see error "Session expired. Please login again."
    And I should be redirected to login
    And my password should remain unchanged

  @authorization
  Scenario: Social auth user cannot change password
    Given I authenticated using Google social login
    And I have no password set
    When I view security settings
    Then I should not see "Change Password" option
    Or I should see message "Password managed by Google"

  # ========================================
  # Password Visibility Toggles
  # ========================================

  @ux @password-visibility
  Scenario: Toggle password field visibility
    Given I am entering current password
    When I click the visibility toggle icon
    Then my password be shown as plain text
    When I click the toggle again
    Then my password be masked again

  @ux @password-visibility
  Scenario: Independent visibility toggles for each field
    Given I have entered passwords in all fields
    When I toggle visibility for current password
    Then only current password should be visible
    And new password and confirmation should remain masked

  # ========================================
  # Accessibility
  # ========================================

  @ux @accessibility
  Scenario: Keyboard navigation in password dialog
    When I open password change dialog
    Then I should be able to tab through all fields
    And I should be able to tab to buttons
    And Enter key should submit form
    And Escape key should close dialog
    And focus indicators should be visible

  @ux @responsive
  Scenario: Password change dialog responsive on mobile
    Given I am changing password on mobile device
    Then the dialog should fit viewport
    And password fields should be large enough
    And visibility toggle should be touch-friendly
    And keyboard should open appropriately
    And strength indicator should be visible
