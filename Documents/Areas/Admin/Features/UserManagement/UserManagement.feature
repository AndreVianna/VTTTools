Feature: Admin User Management
  As a system administrator
  I want to manage user accounts through the admin application
  So that I can control access, roles, and account security

  Background:
    Given I am logged in as an administrator in the admin app
    And the admin dashboard is displayed

  @smoke
  Scenario: View user list
    When I navigate to the User Management page
    Then I should see a list of all registered users
    And the list should display user emails, names, and status

  @critical
  Scenario: Promote user to administrator
    Given I am viewing the user list
    When I select a non-admin user "test.user@example.com"
    And I open the user detail dialog
    And I toggle the "Administrator" role switch
    And I confirm the role change in the confirmation dialog
    Then the user should be assigned the Administrator role
    And an audit log entry should be created
    And I should see a success notification

  @critical
  Scenario: Cannot demote self from administrator
    Given I am viewing the user list
    When I select my own user account
    And I open the user detail dialog
    Then the "Administrator" role toggle should be disabled
    And I should see a message "Cannot demote yourself"

  @critical
  Scenario: Lock user account
    Given I am viewing the user list
    When I select a user "test.user@example.com"
    And I open the user detail dialog
    And I toggle the "Locked" status switch
    And I confirm the account lock in the confirmation dialog
    Then the user account should be locked
    And the user should not be able to log in
    And an audit log entry should be created

  @high
  Scenario: Force password reset
    Given I am viewing a user detail dialog for "test.user@example.com"
    When I click the "Force Password Reset" button
    And I confirm the action
    Then the user should receive a password reset email
    And the user should be required to reset password on next login
    And an audit log entry should be created

  @medium
  Scenario: Manually confirm user email
    Given I am viewing a user detail dialog for "unverified@example.com"
    And the user's email is not confirmed
    When I click the "Manually Confirm Email" button
    And I confirm the action
    Then the user's email should be marked as confirmed
    And an audit log entry should be created

  @medium
  Scenario: Create fake user account
    Given I am on the User Management page
    When I click the "Create User" button
    And I fill in the following details:
      | Field        | Value                     |
      | Email        | fake.user@example.com     |
      | Full Name    | Fake User                 |
      | Display Name | Fake                      |
      | Password     | P@ssw0rd123!             |
      | Email Confirmed | true                  |
      | Admin Role   | false                     |
    And I submit the form
    Then a new user should be created
    And the user should appear in the user list
    And an audit log entry should be created

  @medium
  Scenario: Search users by email
    Given I am on the User Management page
    When I type "test.user" in the search bar
    Then the user list should filter to show only matching emails
    And I should see "test.user@example.com" in the results

  @medium
  Scenario: Filter users by email confirmation status
    Given I am on the User Management page
    When I select "Unconfirmed" from the email confirmation filter
    Then the user list should show only users with unconfirmed emails
    And verified users should not be visible

  @low
  Scenario: Bulk lock user accounts
    Given I am on the User Management page
    When I select 3 users with checkboxes
    And I choose "Lock Selected Accounts" from the bulk actions dropdown
    And I confirm the bulk action
    Then all 3 selected users should be locked
    And I should see a success summary "3 accounts locked, 0 failed"
    And 3 audit log entries should be created
