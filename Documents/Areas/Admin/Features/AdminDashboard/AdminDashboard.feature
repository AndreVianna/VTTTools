Feature: Admin Dashboard (Main Page)
  As a system administrator
  I want to see a dashboard with system health and metrics
  So that I can monitor the platform and respond to issues quickly

  Background:
    Given I am logged in as an administrator in the admin app

  @smoke
  Scenario: Dashboard loads as main page
    When I log in to the admin app
    Then the admin dashboard should be displayed automatically
    And I should see all dashboard sections within 2 seconds:
      | Section                  |
      | System Health Status     |
      | Quick Stats              |
      | Recent Activity Feed     |
      | System Alerts & Warnings |
      | Performance Metrics      |
      | Quick Actions Panel      |

  @critical
  Scenario: View system health indicators (all healthy)
    Given I am on the admin dashboard
    Then I should see 4 health indicator cards:
      | Service      | Status  | Details               |
      | Database     | Green   | Response time < 500ms |
      | Blob Storage | Green   | 70% capacity used     |
      | Email Service| Green   | Last send successful  |
      | Main App     | Green   | Online, response OK   |

  @critical
  Scenario: Critical alert displayed (database down)
    Given the database is unreachable
    When I view the admin dashboard
    Then I should see a critical alert banner (red):
      """
      Database is unreachable. Users cannot access the application.
      """
    And the Database health card should show "Red" status
    And I should see an "View Details" action button

  @high
  Scenario: Warning alert (low storage space)
    Given blob storage usage is at 92%
    When I view the admin dashboard
    Then I should see a warning banner (yellow):
      """
      Blob storage 92% full. Consider expanding quota.
      """
    And the Blob Storage health card should show "Yellow" status
    And I should see an "Investigate" action button

  @high
  Scenario: Info notification (scheduled maintenance)
    Given a maintenance window is scheduled for "2025-11-01 22:00 UTC"
    When I view the admin dashboard
    Then I should see an info banner (blue):
      """
      Scheduled maintenance: Nov 1 2025 10:00 PM - 11:00 PM UTC
      """
    And I should see a "View Configuration" action button

  @high
  Scenario: View quick stats cards
    Given the system has operational data
    When I view the admin dashboard
    Then I should see 4 stat cards:
      | Stat                       | Value    |
      | Total Users                | 1,250    |
      | Active Users (Last 24h)    | 315 (25%)|
      | Total Public Library Items | 65       |
      | System Uptime              | 99.8%    |

  @high
  Scenario: Recent activity feed displays last 10 actions
    Given there are recent audit log entries
    When I view the admin dashboard
    Then the Recent Activity Feed should display the last 10 audit log entries
    And each entry should show: Icon, User email, Action description, Timestamp (relative), Result indicator
    And entries should be sorted by timestamp descending

  @medium
  Scenario: Activity feed auto-refreshes
    Given I am viewing the admin dashboard
    When a new audit log entry is created (user logs in)
    Then the activity feed should update within 30 seconds
    And the new entry should appear at the top of the feed

  @medium
  Scenario: Filter activity feed by failed actions
    Given I am viewing the Recent Activity Feed
    When I select "Failed actions" from the filter dropdown
    Then the feed should show only failed actions
    And successful actions should be filtered out

  @medium
  Scenario: View API performance chart
    Given I am viewing the admin dashboard
    Then I should see an "API Performance (Last 24 Hours)" chart
    And the chart should display two lines:
      | Line         | Y-Axis              |
      | Response Time| Average time (ms)   |
      | Request Rate | Requests per minute |
    And the X-axis should show hourly intervals

  @medium
  Scenario: View error rate chart
    Given I am viewing the admin dashboard
    Then I should see an "Error Rate (Last 24 Hours)" chart
    And the chart should display error count per hour
    And a threshold line should indicate normal error rate

  @medium
  Scenario: View resource usage progress bars
    Given I am viewing the admin dashboard
    Then I should see resource usage indicators:
      | Resource            | Usage     | Color  |
      | Database Connections| 15 / 20   | Green  |
      | Blob Storage        | 350 / 500 GB | Green  |
    And the progress bar should be green for < 75% usage
    Or yellow for 75-90% usage
    Or red for > 90% usage

  @medium
  Scenario: Navigate via quick actions panel
    Given I am viewing the admin dashboard
    When I click the "User Management" quick action button
    Then I should be navigated to the User Management page

  @low
  Scenario: Expand error log summary
    Given I am viewing the admin dashboard
    When I click to expand the "Error Log Summary" section
    Then I should see the last 10 errors in a table:
      | Timestamp | Error Type | Message | Severity |
    And each error should have a severity indicator (Critical, Warning, Info)

  @low
  Scenario: Click activity feed entry to view detail
    Given I am viewing the Recent Activity Feed
    When I click on an audit log entry
    Then I should be navigated to the Audit Log Viewer
    And the selected entry detail should be displayed

  @low
  Scenario: Dismiss alert
    Given I see a warning alert "Blob storage 92% full"
    When I click the "Dismiss" button on the alert
    Then the alert should be hidden for the current session
    And the alert may reappear on next login if condition persists

  @low
  Scenario: Manual refresh of health indicators
    Given I am viewing the admin dashboard
    When I click the "Refresh" button
    Then health checks should be executed immediately
    And all health indicators should update within 2 seconds

  @low
  Scenario: Dashboard displays when all systems operational
    Given all services are healthy
    And there are no alerts or warnings
    When I view the admin dashboard
    Then the System Alerts section should display:
      """
      All systems operational
      """
    And a green checkmark icon should be visible
