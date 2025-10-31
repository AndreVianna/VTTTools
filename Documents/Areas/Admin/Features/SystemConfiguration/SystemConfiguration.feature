Feature: Admin System Configuration
  As a system administrator
  I want to configure system-wide settings
  So that I can control security, features, storage, and services without code deployment

  Background:
    Given I am logged in as an administrator in the admin app
    And the admin dashboard is displayed

  @smoke
  Scenario: View system configuration page
    When I navigate to the System Configuration page
    Then I should see configuration tabs: Security Settings, Feature Flags, Storage, Email, Service APIs, Maintenance Mode
    And the Security Settings tab should be selected by default

  @critical
  Scenario: Update max login attempts
    Given I am on the Security Settings tab
    When I change the "Max Login Attempts" value to "3"
    And I click "Save Changes"
    Then the setting should be updated
    And I should see a success notification "Configuration saved successfully"
    And an audit log entry should be created

  @critical
  Scenario: Enable 2FA enforcement for all users
    Given I am on the Security Settings tab
    When I select "Required for All Users" for 2FA enforcement
    And I click "Save Changes"
    Then a confirmation dialog should appear with warning
    When I confirm the change
    Then 2FA should be enforced for all users
    And non-2FA users should be required to set up 2FA on next login
    And an audit log entry should be created

  @critical
  Scenario: Toggle feature flag
    Given I am on the Feature Flags tab
    When I toggle the "Scene Collaboration" feature flag to "Enabled"
    Then the feature should be enabled immediately
    And new requests should see the feature as enabled within 30 seconds
    And an audit log entry should be created

  @high
  Scenario: Create custom feature flag
    Given I am on the Feature Flags tab
    When I click "Add New Feature Flag"
    And I fill in:
      | Field       | Value                          |
      | Key         | beta_ui_components             |
      | Display Name | Beta UI Components            |
      | Description  | Enable experimental UI features |
    And I submit the form
    Then a new feature flag should be created
    And it should appear in the feature flags list
    And an audit log entry should be created

  @high
  Scenario: Test database connection
    Given I am on the Storage Configuration tab
    When I enter a database connection string
    And I click "Test Connection"
    Then the system should validate the connection string
    And I should see "Connection successful" with latency in ms
    Or I should see "Connection failed: {error message}"

  @high
  Scenario: Update blob storage quota
    Given I am on the Storage Configuration tab
    When I change the "Per-user quota (GB)" to "10"
    And I click "Save Changes"
    Then the quota should be updated
    And users should be limited to 10 GB of storage
    And an audit log entry should be created

  @medium
  Scenario: Send test email
    Given I am on the Email Settings tab
    When I enter SMTP configuration:
      | Host     | smtp.gmail.com     |
      | Port     | 587                |
      | Username | admin@example.com  |
      | Password | ************       |
    And I click "Send Test Email"
    And I enter recipient "test@example.com"
    Then a test email should be sent
    And I should see "Test email sent successfully"
    Or I should see "Failed to send email: {error message}"

  @medium
  Scenario: Edit password reset email template
    Given I am on the Email Settings tab
    When I click the "Password Reset" template
    Then a template editor dialog should open
    When I edit the subject to "Reset Your VTT Tools Password"
    And I edit the body with markdown
    And I click "Save"
    Then the template should be updated
    And future password reset emails should use the new template
    And an audit log entry should be created

  @medium
  Scenario: Add new service API configuration
    Given I am on the Service API Settings tab
    When I click "Add Service"
    And I fill in:
      | Field       | Value                    |
      | Name        | Payment Gateway          |
      | Type        | REST API                 |
      | Host        | api.stripe.com           |
      | Port        | 443                      |
      | API Key     | sk_test_************     |
      | Timeout     | 30                       |
      | Rate Limit  | 100 requests/sec         |
    And I click "Save"
    Then the service should be added
    And an audit log entry should be created

  @critical
  Scenario: Enable maintenance mode
    Given I am on the Maintenance Mode tab
    When I toggle "Enable Maintenance Mode" to "On"
    Then a confirmation dialog should appear: "This will log out all users and prevent logins. Continue?"
    When I confirm the action
    Then maintenance mode should be activated
    And the main app should display a maintenance page
    And the admin app should remain accessible
    And I should see a red banner "MAINTENANCE MODE ACTIVE"
    And an audit log entry should be created

  @high
  Scenario: Schedule future maintenance window
    Given I am on the Maintenance Mode tab
    When I set the start time to "2025-11-01 22:00 UTC"
    And I set the end time to "2025-11-01 23:00 UTC"
    And I enable "Automatically enter maintenance mode at start time"
    And I enable "Automatically exit maintenance mode at end time"
    And I click "Save"
    Then the maintenance should be scheduled
    And I should see a countdown "Maintenance starts in X hours Y minutes"
    And users should see a notification about upcoming maintenance

  @low
  Scenario: View current storage usage
    Given I am on the Storage Configuration tab
    Then I should see a storage usage meter
    And it should display "Used: X GB / Y GB (Z%)"
    And the meter should be green if usage < 75%
    Or yellow if usage is 75-90%
    Or red if usage > 90%
