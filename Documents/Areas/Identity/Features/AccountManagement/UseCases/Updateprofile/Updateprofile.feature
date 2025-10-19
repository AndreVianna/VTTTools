# Generated: 2025-01-15
# Use Case: Update Profile

@use-case @identity @profile @modification
Feature: Update Profile
  As an authenticated user
  I want to update my profile information
  So that I can keep my account data accurate and current

  Background:
    Given I am authenticated as a registered user
    And I am viewing my profile settings in edit mode

  # ========================================
  # Happy Path Scenarios
  # ========================================

  @happy-path
  Scenario: Successfully update all editable profile fields
    Given my current displayName is "olduser"
    And my current phone is "+1-555-0100"
    When I update my displayName to "newuser"
    And I update my phone to "+1-555-0200"
    And I click "Save Changes"
    Then my profile is updated successfully
    And I should see confirmation message "Profile updated successfully"
    And I should see my new displayName "newuser" displayed
    And I should see my new phone "+1-555-0200" displayed
    And I should exit edit mode automatically

  @happy-path
  Scenario: Update only displayName
    Given my current displayName is "johnsmith"
    When I update my displayName to "john_smith_2025"
    And I leave other fields unchanged
    And I click "Save Changes"
    Then only my displayName is updated
    And my phone should remain unchanged
    And I should see confirmation message

  @happy-path
  Scenario: Update only phone number
    Given my current phone is "+1-555-0100"
    When I update my phone to "+1-555-0999"
    And I leave other fields unchanged
    And I click "Save Changes"
    Then only my phone is updated
    And my displayName should remain unchanged
    And I should see confirmation message

  # ========================================
  # Phone Number Validation
  # ========================================

  Rule: Phone number is optional but must be valid if provided

    @validation @phone
    Scenario: Successfully remove phone number
      Given my current phone is "+1-555-0100"
      When I clear the phone number field
      And I click "Save Changes"
      Then the update should succeed
      And my phone is removed
      And I should see confirmation message

    @validation @phone
    Scenario: Accept valid phone number formats
      When I update my phone to "+1-555-0199"
      And I click "Save Changes"
      Then the update should succeed
      And my phone is updated

    @validation @phone
    Scenario: Reject invalid phone number format
      When I update my phone to "invalid-phone"
      And I click "Save Changes"
      Then the update should fail
      And I should see error "Invalid phone number format"
      And I should remain in edit mode

    @data-driven @validation @phone
    Scenario Outline: Validate international phone formats
      When I update my phone to "<phone>"
      And I click "Save Changes"
      Then the result should be "<result>"

      Examples:
        | phone              | result  |
        | +1-555-0100        | success |
        | +44 20 7123 4567   | success |
        | +86 138 0000 0000  | success |
        | 555-0100           | success |
        | (555) 555-0100     | success |
        | not-a-phone        | failure |
        | 123                | failure |

  # ========================================
  # Avatar Upload Scenarios
  # ========================================

  Rule: Avatar must be an image file under 5MB

    @happy-path @avatar
    Scenario: Successfully upload profile picture
      Given I have no profile picture currently
      When I select a valid image file (2MB PNG)
      And the file uploads successfully
      And I click "Save Changes"
      Then my profile picture is updated
      And I should see the new picture displayed
      And I should see confirmation message

    @happy-path @avatar
    Scenario: Replace existing profile picture
      Given I have an existing profile picture
      When I select a new image file
      And the upload succeeds
      And I click "Save Changes"
      Then my old picture should be deleted from storage
      And my new picture should be displayed
      And I should see confirmation message

    @validation @avatar
    Scenario: Reject avatar file exceeding size limit
      When I select an image file that is 6MB
      Then I should see error "Image must be less than 5MB"
      And the file should not be uploaded
      And I should be able to select a different file

    @validation @avatar
    Scenario: Accept avatar at maximum allowed size
      When I select an image file that is exactly 5MB
      And the upload succeeds
      And I click "Save Changes"
      Then the update should succeed
      And my profile picture is updated

    @validation @avatar
    Scenario: Reject non-image file types
      When I attempt to upload a PDF file
      Then I should see error "Please upload an image file"
      And the file should not be uploaded

    @data-driven @validation @avatar
    Scenario Outline: Validate image file type restrictions
      When I attempt to upload a file of type "<file_type>"
      Then the result should be "<result>"

      Examples:
        | file_type  | result  |
        | image/png  | success |
        | image/jpeg | success |
        | image/jpg  | success |
        | image/gif  | success |
        | image/webp | success |
        | text/plain | failure |
        | video/mp4  | failure |
        | application/pdf | failure |

  # ========================================
  # Email Field Restrictions
  # ========================================

  Rule: Email address cannot be changed via profile settings

    @validation @email
    Scenario: Email field remains readonly in edit mode
      Given I am in edit mode
      Then the email field should be readonly
      And I should not be able to modify email
      And I should see text "Email cannot be changed. Contact support to change email."

  # ========================================
  # Edit Mode Behaviors
  # ========================================

  @happy-path @ux
  Scenario: Cancel profile edit discards changes
    Given I have modified my displayName to "tempname"
    And I have modified my phone
    When I click "Cancel"
    Then my changes should be discarded
    And I should exit edit mode
    And my original data should be displayed
    And no API call should be made

  @happy-path @ux
  Scenario: Enter edit mode from view mode
    Given I am viewing my profile in readonly mode
    When I click "Edit Profile"
    Then fields should become editable
    And I should see "Save Changes" button
    And I should see "Cancel" button
    And I should not see "Edit Profile" button

  # ========================================
  # Loading and Error States
  # ========================================

  @loading
  Scenario: Display loading state during save
    Given I have made valid changes to my profile
    When I click "Save Changes"
    Then I should see a loading spinner on the save button
    And all form fields should be disabled
    And I should not be able to edit further
    And cancel button should be disabled

  @error-handling
  Scenario: Handle network error during save
    Given I have made valid changes
    When I click "Save Changes"
    And a network error occurs
    Then I should see error "Connection error. Please try again."
    And I should remain in edit mode
    And my changes should be preserved in the form
    And I should be able to retry

  @error-handling
  Scenario: Handle avatar upload failure
    Given I have selected a valid image
    When the blob storage upload fails
    Then I should see error "Failed to upload avatar. Please try again."
    And my profile data should not be updated
    And I should remain in edit mode
    And I should be able to retry upload

  @error-handling
  Scenario: Handle server validation error
    Given I have made changes to my profile
    When I click "Save Changes"
    And the server returns validation error
    Then I should see the specific error message
    And the problematic field should be highlighted
    And I should remain in edit mode
    And I should be able to correct the issue

  # ========================================
  # Edge Cases
  # ========================================

  @edge-case
  Scenario: Update profile with Unicode characters in displayName
    When I update my displayName to "用户名_user123"
    And I click "Save Changes"
    Then the update should succeed
    And Unicode characters should be preserved
    And the displayName should display correctly

  @edge-case
  Scenario: Concurrent update conflict handling
    Given another session has updated my profile
    When I attempt to save my changes
    Then I should be warned about concurrent changes
    And I should see option to refresh and see current data
    Or I should see option to overwrite with my changes

  @edge-case
  Scenario: Update with only whitespace changes
    Given my displayName is "My Display Name"
    When I update my displayName to "My Display Name   " with trailing spaces
    And I click "Save Changes"
    Then I should see trim whitespace
    And my displayName should remain "My Display Name"
    And the update should succeed without actual change

  # ========================================
  # Authorization
  # ========================================

  @authorization
  Scenario: Expired session during profile update
    Given I have made changes to my profile
    And my session has expired
    When I click "Save Changes"
    Then the update should fail
    And I should see error "Session expired. Please login again."
    And I should be redirected to login
    And my changes should be preserved in local state if possible

  # ========================================
  # Integration and Side Effects
  # ========================================

  @integration @cross-area
  Scenario: Profile update publishes domain event
    When I successfully update my displayName and avatar
    Then a UserProfileUpdated action is logged
    And the event should include changed fields
    And other areas should receive the update notification
    And my Auth Context is updated with new data

  @integration
  Scenario: Updated profile reflects in navigation
    Given I am viewing navigation with my old displayName
    When I update my displayName to "newname"
    And the update completes successfully
    Then the navigation should show "newname"
    And my avatar should update in header
    And changes should be visible without page refresh
