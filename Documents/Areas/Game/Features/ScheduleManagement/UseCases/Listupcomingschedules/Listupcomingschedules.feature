# Generated: 2025-10-03
# Use Case: List Upcoming Schedules
@use-case @game @schedule-management
Feature: List Upcoming Schedules
  As a Game Master
  I want to query schedules with occurrences in a date range
  So that I can view my upcoming scheduled sessions

  Background:
    Given I am authenticated as a Game Master
    And the schedule service is available

  @happy-path
  Scenario: Retrieve schedules within date range
    Given I have schedules with occurrences in the next 30 days
    And I have schedules with occurrences outside the date range
    When I request schedules from today to 30 days ahead
    Then the request should succeed
    And I should receive only schedules with occurrences in that range
    And schedules without occurrences in the range should not be included

  @happy-path
  Scenario: Retrieve empty list when no upcoming occurrences exist
    Given I have schedules but no occurrences in the specified date range
    When I request schedules from today to 30 days ahead
    Then the request should succeed
    And I should receive an empty list

  @edge-case
  Scenario: Handle date range boundary conditions
    Given I have a schedule with occurrence exactly on the start date
    And I have a schedule with occurrence exactly on the end date
    And I have schedules with occurrences outside the boundary
    When I request schedules for that exact date range
    Then the request should succeed
    And I should receive schedules with occurrences on start and end dates
    And schedules outside the boundary should not be included

  @data-driven
  Scenario Outline: Query schedules with different date ranges
    Given I have schedules spread across the next 90 days
    When I request schedules from "<start>" to "<end>"
    Then the request should succeed
    And I should receive <count> schedules

    Examples:
      | start     | end       | count |
      | today     | +7 days   | 3     |
      | today     | +30 days  | 12    |
      | today     | +90 days  | 25    |
      | +10 days  | +20 days  | 5     |

  @error-handling
  Scenario: Reject invalid date range
    Given I provide an end date before the start date
    When I request schedules for that invalid range
    Then the request should fail with validation error
    And I should see error "End date must be after start date"
