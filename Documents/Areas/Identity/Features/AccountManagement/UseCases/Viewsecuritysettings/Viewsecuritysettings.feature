# Generated: 2025-01-15
# Use Case: View Security Settings

@use-case @identity @security @read-only
Feature: View Security Settings
  As an authenticated user
  I want to view my security settings and status
  So that I can understand my account security configuration

  Background:
    Given I am authenticated as a registered user
    And I have access to security settings

  # ========================================
  # Happy Path Scenarios
  # ========================================

  @happy-path
  Scenario: View security settings without 2FA enabled
    Given I have not enabled two-factor authentication
    When I navigate to security settings page
    Then I should see "Security Settings" header
    And I should see password management section
    And I should see "Change Password" button
    And I should see two-factor authentication section
    And I should see "2FA Disabled" with error icon
    And I should see "Enable 2FA" button
    And I should not see recovery codes section

  @happy-path
  Scenario: View security settings with 2FA enabled
    Given I have enabled two-factor authentication
    And I have recovery codes generated
    When I navigate to security settings page
    Then I should see "Security Settings" header
    And I should see password management section
    And I should see "Change Password" button
    And I should see "2FA Enabled" with checkmark icon in green
    And I should see "Disable 2FA" button
    And I should see recovery codes section
    And I should see "Manage Recovery Codes" button

  # ========================================
  # Security Status Indicators
  # ========================================

  Rule: Visual indicators clearly communicate security status

    @happy-path @indicators
    Scenario: 2FA enabled indicator styling
      Given I have two-factor authentication enabled
      When I view security settings
      Then the 2FA status should show green checkmark icon
      And the status text should be "2FA Enabled"
      And the status should use success color styling
      And I should see positive confirmation message

    @happy-path @indicators
    Scenario: 2FA disabled indicator styling
      Given I have not enabled two-factor authentication
      When I view security settings
      Then the 2FA status should show error/warning icon
      And the status text should be "2FA Disabled"
      And the status should use warning color styling
      And I should see encouragement to enable 2FA

  # ========================================
  # Password Management Section
  # ========================================

  @happy-path @password
  Scenario: Password section always visible
    When I view security settings
    Then I should see password management section
    And I should see descriptive text about password security
    And I should see "Change Password" button
    And the button should be enabled and clickable

  @happy-path @password
  Scenario: Navigate to change password
    Given I am viewing security settings
    When I click "Change Password"
    Then the password change dialog should open
    And I should remain on security settings page
    And the page should not reload

  # ========================================
  # Two-Factor Authentication Section
  # ========================================

  @happy-path @2fa
  Scenario: 2FA section with setup option
    Given I have not enabled 2FA
    When I view security settings
    Then I should see 2FA section header
    And I should see status indicator showing disabled
    And I should see descriptive text about 2FA benefits
    And I should see "Enable 2FA" button prominently
    And I should not see "Disable 2FA" option

  @happy-path @2fa
  Scenario: 2FA section with disable option
    Given I have enabled 2FA
    When I view security settings
    Then I should see 2FA section header
    And I should see status indicator showing enabled
    And I should see "Disable 2FA" button
    And I should not see "Enable 2FA" option
    And I should see information about current 2FA configuration

  @happy-path @2fa
  Scenario: Navigate to 2FA setup
    Given I have not enabled 2FA
    When I click "Enable 2FA"
    Then the 2FA setup wizard dialog should open
    And I should remain on security settings page
    And the wizard should guide me through setup

  # ========================================
  # Recovery Codes Section
  # ========================================

  Rule: Recovery codes section only visible when 2FA is enabled

    @happy-path @recovery-codes
    Scenario: Recovery codes visible with 2FA enabled
      Given I have two-factor authentication enabled
      When I view security settings
      Then I should see recovery codes section
      And I should see descriptive text about recovery codes
      And I should see "Manage Recovery Codes" button
      And the button should be enabled

    @validation @recovery-codes
    Scenario: Recovery codes hidden without 2FA
      Given I have not enabled two-factor authentication
      When I view security settings
      Then I should not see recovery codes section
      And I should not see "Manage Recovery Codes" button

    @happy-path @recovery-codes
    Scenario: Navigate to recovery codes management
      Given I have 2FA enabled
      When I click "Manage Recovery Codes"
      Then the recovery codes manager dialog should open
      And I should see my remaining codes count
      And I should have options to view and regenerate codes

  # ========================================
  # Section Organization and Layout
  # ========================================

  @ux
  Scenario: Security settings logically organized
    When I view security settings
    Then sections should be in logical order
    And password management should be first
    And two-factor authentication should be second
    And recovery codes should be last if 2FA enabled
    And sections should be visually separated
    And each section should have clear headers

  @ux
  Scenario: Action buttons clearly associated with sections
    When I view security settings
    Then "Change Password" should be in password section
    And "Enable/Disable 2FA" should be in 2FA section
    And "Manage Recovery Codes" should be in recovery codes section
    And buttons should be visually aligned consistently
    And buttons should have clear, action-oriented labels

  # ========================================
  # Loading States
  # ========================================

  @loading
  Scenario: Display loading state while fetching security status
    Given I am authenticating
    When I navigate to security settings
    Then I should see a loading spinner
    And I should not see security sections yet
    And I should not see action buttons

  @loading
  Scenario: Security status loads from Auth Context
    Given I am authenticated
    And my user data is cached in Auth Context
    When I navigate to security settings
    Then security status should display immediately
    And I should not see a loading spinner
    And all sections should be visible based on my status

  # ========================================
  # Navigation and Access
  # ========================================

  @authorization
  Scenario: Authenticated user can access security settings
    Given I am authenticated as a standard user
    When I navigate to /settings/security
    Then the security settings page should load
    And I should see all security options
    And I should have access to all security features

  @authorization
  Scenario: Unauthenticated user redirected to login
    Given I am not authenticated
    When I attempt to access /settings/security
    Then I should be redirected to login page
    And I should not see security settings
    And the URL should include returnUrl parameter

  # ========================================
  # Error Handling
  # ========================================

  @error-handling
  Scenario: Handle Auth Context data not available
    Given my authentication token is valid
    But security status data is not in Auth Context
    When I navigate to security settings
    Then I should see default security display
    Or I should see error message with retry option
    And I should not see broken UI elements

  @error-handling
  Scenario: Handle missing security data gracefully
    Given my profile has missing 2FA status field
    When I view security settings
    Then I should see default to 2FA disabled
    And I should see 2FA as disabled
    And all functionality should remain accessible

  # ========================================
  # Informational Content
  # ========================================

  @ux @content
  Scenario: Display helpful security guidance
    When I view security settings
    Then I should see descriptive text for each security option
    And 2FA section should explain benefits
    And recovery codes should explain their purpose
    And password section should encourage strong passwords
    And content should be clear and user-friendly

  @ux @content
  Scenario: Security recommendations based on status
    Given I have not enabled 2FA
    When I view security settings
    Then I should see recommendation to enable 2FA
    And I should see explanation of security benefits
    And messaging should be encouraging, not alarming

  # ========================================
  # Edge Cases
  # ========================================

  @edge-case
  Scenario: Handle transition from 2FA enabled to disabled
    Given I have 2FA enabled and viewing security settings
    And recovery codes section is visible
    When I disable 2FA through the dialog
    And I return to security settings
    Then 2FA status should show as disabled
    And recovery codes section should be hidden
    And "Enable 2FA" button should be visible
    And the page should update without reload

  @edge-case
  Scenario: Handle transition from 2FA disabled to enabled
    Given I have 2FA disabled and viewing security settings
    When I enable 2FA through the setup wizard
    And I complete the setup successfully
    And I return to security settings
    Then 2FA status should show as enabled with checkmark
    And recovery codes section should now be visible
    And "Disable 2FA" button should be visible
    And the page should update without reload

  @edge-case
  Scenario: Security settings during suspended account
    Given my account is temporarily suspended
    When I attempt to access security settings
    Then I should see security status
    But action buttons should be disabled
    And I should see message about account status
    And I should not be able to modify security settings

  # ========================================
  # Integration with Other Security Features
  # ========================================

  @integration
  Scenario: Security settings reflect recent changes
    Given I recently changed my password
    When I view security settings immediately after
    Then the page should reflect current state
    And I should not see stale data
    And all indicators should be accurate

  @integration
  Scenario: Link to email verification from security settings
    Given my email is not verified
    When I view security settings
    Then I should see an indicator about email status
    And I should see link to verify email
    And clicking should navigate to verification process

  # ========================================
  # Responsive Design
  # ========================================

  @ux @responsive
  Scenario: Security settings responsive on mobile
    Given I am viewing security settings on mobile device
    Then the layout should adapt to narrow viewport
    And all sections should be readable
    And buttons should be touch-friendly
    And section dividers should remain clear
    And scrolling should work smoothly

  @ux @responsive
  Scenario: Security settings on tablet
    Given I am viewing security settings on tablet
    Then the layout should use available space efficiently
    And sections should be properly spaced
    And all interactive elements should be accessible
