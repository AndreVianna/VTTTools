# Generated: 2025-10-03
# Use Case: Get Schedule
@use-case @game @schedule-management
Feature: Get Schedule
  As a schedule owner or participant
  I want to retrieve schedule details by ID
  So that I can view game session information

  Background:
    Given I am authenticated

  @happy-path
  Scenario: Owner successfully retrieves own schedule
    Given I am the owner of a schedule
    When I request the schedule by ID
    Then the request should succeed
    And I should receive the complete schedule details
    And the response should include start time
    And the response should include duration
    And the response should include participants
    And the response should include recurrence pattern

  @happy-path @authorization
  Scenario: Participant successfully retrieves schedule
    Given a schedule is owned by another user
    And I am a participant in the schedule
    When I request the schedule by ID
    Then the request should succeed
    And I should receive the schedule details

  @authorization @error-handling
  Scenario: Non-participant cannot retrieve schedule
    Given a schedule is owned by another user
    And I am not a participant in the schedule
    When I attempt to request the schedule by ID
    Then the request should fail with authorization error
    And I should see error "Access denied: You are not authorized to view this schedule"

  @error-handling
  Scenario: Retrieve non-existent schedule returns not found
    Given no schedule exists with the requested ID
    When I request the schedule by ID
    Then the request should fail with not found error
    And I should see error "Schedule not found"

  @edge-case
  Scenario: Retrieve schedule with complete data
    Given I am the owner of a schedule
    And the schedule has multiple participants
    And the schedule has a recurrence pattern
    When I request the schedule by ID
    Then the request should succeed
    And the response should include all participants with roles
    And the response should include complete recurrence details
