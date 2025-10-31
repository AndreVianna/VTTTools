Feature: Admin Audit Log Viewing
  As a system administrator
  I want to view and search audit logs
  So that I can monitor user activity and investigate security incidents

  Background:
    Given I am logged in as an administrator in the admin app
    And the admin dashboard is displayed

  @smoke
  Scenario: View audit log table
    When I navigate to the Audit Log Viewer page
    Then I should see a table of audit log entries
    And the table should display columns: Timestamp, User, Action, Entity Type, Entity ID, IP Address, Result, Duration
    And the entries should be sorted by timestamp descending

  @critical
  Scenario: Infinite scroll pagination
    Given I am viewing the audit log table
    And there are more than 100 audit log entries
    When I scroll to the bottom of the table
    Then the next 100 audit log entries should load automatically
    And I should see a total of 200 entries in the table

  @critical
  Scenario: Expand row to view request/response JSON
    Given I am viewing the audit log table
    When I click on an audit log entry row
    Then the row should expand inline
    And I should see the request JSON formatted and syntax-highlighted
    And I should see the response JSON formatted and syntax-highlighted

  @high
  Scenario: Filter audit logs by date range
    Given I am viewing the audit log table
    When I select a date range from "2025-10-01" to "2025-10-31"
    Then the table should show only audit logs within that date range
    And older entries should not be visible

  @high
  Scenario: Search audit logs by user email
    Given I am viewing the audit log table
    When I type "test.user@example.com" in the search bar
    Then the table should show only audit logs for that user
    And entries from other users should be filtered out

  @high
  Scenario: Filter by action type
    Given I am viewing the audit log table
    When I select "Login" from the action filter
    Then the table should show only Login actions
    And other action types should not be visible

  @critical
  Scenario: Switch to live monitoring view
    Given I am viewing the audit log table
    When I click the "Switch to Live Monitoring" button
    Then I should see a separate live monitoring grid
    And the grid should display "Live Monitoring Active" banner
    And I should be required to select a single filter dimension

  @critical
  Scenario: Live monitoring with single-dimension filter (user)
    Given I am in the live monitoring view
    When I select "Filter by User" and choose "active.user@example.com"
    Then I should see only real-time actions for that user
    And new audit entries for that user should appear at the top automatically
    And the list should be limited to the last 500 entries

  @critical
  Scenario: Live monitoring auto-updates
    Given I am in the live monitoring view
    And I have selected "Filter by Action: Login"
    When a new Login action occurs in the system
    Then the new entry should appear at the top within 3 seconds
    And the list should auto-scroll to show the latest entry

  @medium
  Scenario: Pause and resume live monitoring
    Given I am in the live monitoring view
    And auto-updates are active
    When I click the "Pause" button
    Then auto-updates should stop
    And new entries should not appear until I click "Resume"

  @medium
  Scenario: Export audit logs to CSV
    Given I am viewing the audit log table
    And I have applied filters (date range, action type)
    When I click the "Export" button
    And I select "CSV" format and "1000" row limit
    And I confirm the export
    Then a CSV file should download with the filtered audit logs
    And the filename should include the current timestamp

  @medium
  Scenario: View audit log detail dialog
    Given I am viewing the audit log table
    When I click on an audit log entry
    And I click the "View Details" button
    Then a detail dialog should open
    And I should see complete information: user, entity, request/response JSON, error details, performance metrics
    And I should have buttons to copy JSON data

  @low
  Scenario: Save filter preset
    Given I am viewing the audit log table
    And I have applied multiple filters
    When I click "Save Current Filters"
    And I name the preset "Failed Logins Last 24h"
    Then the preset should be saved
    And I should be able to load it later from the "Load Saved Filter" dropdown

  @low
  Scenario: Clear all filters
    Given I am viewing the audit log table
    And I have applied multiple filters
    When I click the "Clear All Filters" button
    Then all filters should reset to defaults
    And I should see the last 7 days of audit logs
