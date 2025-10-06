# Generated: 2025-10-03
# Use Case: List Schedules By Owner
@use-case @game @schedule-management
Feature: List Schedules By Owner
  As a Game Master
  I want to retrieve all schedules I own
  So that I can manage and view my game sessions

  Background:
    Given I am authenticated as a Game Master

  @happy-path
  Scenario: Successfully retrieve all own schedules
    Given I own multiple schedules with different recurrence types
    When I request my schedules
    Then the request should succeed
    And I should receive all my schedules
    And the response should include all recurrence types

  @happy-path
  Scenario: Retrieve empty list when no schedules exist
    Given I do not own any schedules
    When I request my schedules
    Then the request should succeed
    And I should receive an empty list

  @happy-path
  Scenario: Retrieved schedules include all recurrence types
    Given I own schedules with Once, Daily, Weekly, and Monthly frequencies
    When I request my schedules
    Then the request should succeed
    And the response should include schedules with all frequency types

  @authorization @error-handling
  Scenario: Cannot retrieve schedules owned by another user
    Given another Game Master owns multiple schedules
    When I attempt to request their schedules
    Then the request should fail with authorization error
    And I should see error "Cannot access schedules owned by another user"
