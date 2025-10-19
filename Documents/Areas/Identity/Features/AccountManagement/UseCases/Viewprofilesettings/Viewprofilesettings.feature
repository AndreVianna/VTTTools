# Generated: 2025-01-15
# Use Case: View Profile Settings

@use-case @identity @profile @read-only
Feature: View Profile Settings
  As an authenticated user
  I want to view my profile information
  So that I can understand my current account settings

  Background:
    Given I am authenticated as a registered user
    And my profile data is available

  # ========================================
  # Happy Path Scenarios
  # ========================================

  @happy-path
  Scenario: Successfully view complete profile information
    Given I have a complete profile with all fields populated
    When I navigate to profile settings page
    Then I should see my email address displayed
    And I should see my name displayed
    And I should see my displayName displayed
    And I should see my phone number displayed
    And I should see my profile picture
    And I should see my account created date
    And I should see my last login date

  @happy-path
  Scenario: View profile with minimal information
    Given I have a profile with only required fields
    And I have no phone number set
    And I have no profile picture uploaded
    When I navigate to profile settings page
    Then I should see my email address
    And I should see my name
    And I should see my displayName
    And I should see a placeholder for phone number
    And I should see default avatar with my initials

  # ========================================
  # Profile Picture Display
  # ========================================

  @happy-path @avatar
  Scenario: Display uploaded profile picture
    Given I have uploaded a custom profile picture
    When I view my profile settings
    Then I should see my profile picture displayed
    And the picture should be 120x120 pixels
    And the picture should load from blob storage

  @happy-path @avatar
  Scenario: Display fallback avatar with initials
    Given I have not uploaded a profile picture
    And my name is "John Doe"
    And my displayName is "JD"
    When I view my profile settings
    Then I should see a default avatar
    And the avatar should display initials "JD"
    And the avatar should have a background color

  @error-handling @avatar
  Scenario: Handle profile picture loading failure
    Given I have a profile picture URL configured
    But the image file is no longer available
    When I view my profile settings
    Then I should see fallback avatar with my initials
    And I should not see a broken image

  # ========================================
  # Account Metadata Display
  # ========================================

  @happy-path @metadata
  Scenario: View account verification status indicators
    Given my email is verified
    And I have two-factor authentication enabled
    When I view my profile settings
    Then I should see "Email Verified" with checkmark icon
    And I should see "2FA Enabled" indicator
    And indicators should use appropriate colors

  @happy-path @metadata
  Scenario: View unverified account status
    Given my email is not verified
    And I have not enabled two-factor authentication
    When I view my profile settings
    Then I should see "Email Not Verified" with warning icon
    And I should see "2FA Disabled" indicator
    And I should see a link to verify email

  @happy-path @metadata
  Scenario: View account timestamps
    Given my account was created on "2024-01-15"
    And I last logged in on "2025-01-15 10:30 AM"
    When I view my profile settings
    Then I should see "Account Created: January 15, 2024"
    And I should see "Last Login: January 15, 2025 at 10:30 AM"
    And dates should be formatted in user-friendly format

  # ========================================
  # Field Readonly Behavior
  # ========================================

  Rule: Email address cannot be changed via profile settings

    @validation
    Scenario: Email field displayed as readonly
      Given I am viewing my profile settings
      Then the email field should be displayed
      And the email field should be readonly
      And I should see text "Email cannot be changed"
      And I should see instruction to contact support for email changes

  Rule: Profile fields are readonly until edit mode activated

    @happy-path
    Scenario: View mode shows readonly fields with edit option
      Given I am viewing my profile settings
      Then all editable fields should be readonly
      And I should see an "Edit Profile" button
      And I should not see "Save" or "Cancel" buttons
      And fields should have subtle styling indicating view mode

  # ========================================
  # Loading and State Management
  # ========================================

  @loading
  Scenario: Display loading state while fetching profile
    Given I am not yet authenticated
    When I navigate to profile settings page
    Then I should see a loading spinner
    And I should not see profile data
    And I should not see edit controls

  @loading
  Scenario: Profile loads from authentication context
    Given I am authenticated
    And my user data is cached in Auth Context
    When I navigate to profile settings page
    Then my profile should display immediately
    And I should not see a loading spinner
    And data should come from the cached context

  # ========================================
  # Navigation and Access
  # ========================================

  @authorization
  Scenario: Authenticated user can access profile settings
    Given I am authenticated as a standard user
    When I navigate to /settings/profile
    Then the profile settings page should load
    And I should see my profile information
    And I should have access to edit controls

  @authorization
  Scenario: Unauthenticated user redirected to login
    Given I am not authenticated
    When I attempt to access /settings/profile
    Then I should be redirected to login page
    And I should not see profile information
    And the URL should be /login with returnUrl parameter

  # ========================================
  # Edge Cases
  # ========================================

  @edge-case
  Scenario: Handle missing optional fields gracefully
    Given I have a profile with no phone number
    And I have no profile picture
    And I have never logged in before
    When I view my profile settings
    Then phone field should show empty placeholder
    And I should see default avatar
    And last login should show "Never" or be omitted
    And no errors should be displayed

  @edge-case
  Scenario: Display long name without breaking layout
    Given my name is "Very Long Name With Many Characters 123"
    When I view my profile settings
    Then the name should be displayed completely
    And the layout should not be broken
    And the text should wrap or truncate gracefully

  @edge-case
  Scenario: Handle international characters in profile data
    Given my name contains Unicode characters "用户名123"
    And my phone has international format "+86 123 4567 8900"
    When I view my profile settings
    Then all characters should display correctly
    And formatting should be preserved
    And no encoding issues should occur

  # ========================================
  # Error Handling
  # ========================================

  @error-handling
  Scenario: Handle Auth Context user data not available
    Given my authentication token is valid
    But user profile data failed to load in Auth Context
    When I navigate to profile settings
    Then I should see an error message
    And I should see option to refresh or retry
    And I should not see partial profile data

  @error-handling
  Scenario: Handle corrupted profile data
    Given my profile data has missing required fields
    When I view my profile settings
    Then I should see available fields
    And missing required fields should show default values
    And I should see a notice about incomplete data
    And I should be able to proceed to edit mode

  # ========================================
  # UI/UX Requirements
  # ========================================

  @ux
  Scenario: Profile information organized logically
    When I view my profile settings
    Then profile picture should appear at top
    And personal information section should be grouped
    And contact information should be grouped separately
    And account metadata should be in separate section
    And sections should have clear visual separation

  @ux
  Scenario: Clear indication of edit capability
    Given I am viewing my profile settings
    Then editable fields should have subtle visual indicators
    And "Edit Profile" button should be prominently displayed
    And readonly email field should be clearly marked
    And hover states should indicate interactivity

  @ux @responsive
  Scenario: Profile settings responsive on mobile
    Given I am viewing profile settings on mobile device
    Then the layout should adapt to narrow viewport
    And profile picture should remain visible
    And all fields should be readable
    And buttons should be touch-friendly
    And scrolling should work smoothly
