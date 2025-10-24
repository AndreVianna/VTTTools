# Generated: 2025-01-15
# Use Case: View Security Settings

@use-case @identity @security @read-only
Feature: View Security Settings
  As an authenticated user
  I want to view my security settings and status
  So that I can understand my account security configuration

  Background:
    Given I am authenticated
    And I am on the security settings page

  Rule: Display security status based on 2FA configuration

    @happy-path
    Scenario: View security settings without 2FA enabled
      Given I have not enabled two-factor authentication
      Then I should see "Security Settings" heading
      And I should see "Change Password" button
      And I should see "2FA Disabled" status
      And I should see "Enable 2FA" button
      And I should not see "Disable 2FA" button

    @happy-path
    Scenario: View security settings with 2FA enabled
      Given I have enabled two-factor authentication
      Then I should see "Security Settings" heading
      And I should see "Change Password" button
      And I should see "2FA Enabled" status
      And I should see "Disable 2FA" button
      And I should not see "Enable 2FA" button

  Rule: Navigation from security settings

    @happy-path @navigation
    Scenario: Navigate to change password dialog
      When I click the "Change Password" button
      Then the password change dialog should open

    @happy-path @navigation
    Scenario: Navigate to 2FA setup dialog
      Given I have not enabled two-factor authentication
      When I click the "Enable 2FA" button
      Then the 2FA setup dialog should open

  Rule: Authorization

    @authorization
    Scenario: Authenticated user can access security settings
      Given I am authenticated
      When I navigate to "/settings/security"
      Then the security settings page should load
      And I should see security options

    @authorization
    Scenario: Unauthenticated user redirected to login
      Given I am not authenticated
      When I attempt to navigate to "/settings/security"
      Then I should be redirected to login page
      And the URL should include returnUrl parameter
