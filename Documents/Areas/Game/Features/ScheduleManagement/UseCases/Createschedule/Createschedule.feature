# Generated: 2025-10-03
# Use Case: Create Schedule
@use-case @game @schedule-management
Feature: Create Schedule
  As a Game Master
  I want to create a new game session schedule
  So that I can plan recurring campaign meetings with my players

  Background:
    Given I am authenticated as a Game Master
    And the schedule service is available

  Rule: Start date must be in the future

    @happy-path
    Scenario: Create schedule with valid future start date
      Given the current time is "2025-10-03T10:00:00Z"
      When I create a schedule with start "2025-10-10T18:00:00Z"
      Then my schedule should be created successfully
      And the schedule start should be "2025-10-10T18:00:00Z"

    @business-rule
    Scenario: Reject schedule with past start date
      Given the current time is "2025-10-03T10:00:00Z"
      When I attempt to create a schedule with start "2025-10-01T18:00:00Z"
      Then the request should fail with validation error
      And I should see error "Start date must be in the future"

  Rule: Duration must be positive

    @happy-path
    Scenario: Create schedule with valid positive duration
      When I create a schedule with duration "2 hours"
      Then my schedule should be created successfully
      And the schedule duration should be "2 hours"

    @business-rule
    Scenario: Reject schedule with zero duration
      When I attempt to create a schedule with duration "0 minutes"
      Then the request should fail with validation error
      And I should see error "Duration must be positive"

    @business-rule
    Scenario: Reject schedule with negative duration
      When I attempt to create a schedule with duration "-30 minutes"
      Then the request should fail with validation error
      And I should see error "Duration must be positive"

  Rule: Recurrence Until date must be after Start date when provided

    @happy-path
    Scenario: Create schedule with valid recurrence Until date
      When I create a schedule with start "2025-10-10T18:00:00Z"
      And recurrence frequency "Weekly" with until "2025-12-31T18:00:00Z"
      Then my schedule should be created successfully
      And the recurrence until should be "2025-12-31T18:00:00Z"

    @business-rule
    Scenario: Reject schedule with Until before Start
      When I attempt to create a schedule with start "2025-10-10T18:00:00Z"
      And recurrence frequency "Weekly" with until "2025-10-01T18:00:00Z"
      Then the request should fail with validation error
      And I should see error "Invalid recurrence: Until must be after Start"

  Rule: Participants must include the schedule owner

    @happy-path
    Scenario: Create schedule with owner included in participants
      Given my user ID is in the participant list
      When I create a schedule with multiple participants
      Then my schedule should be created successfully
      And I should be included in the participants

    @business-rule
    Scenario: Reject schedule when owner not in participants
      Given my user ID is not in the participant list
      When I attempt to create a schedule
      Then the request should fail with validation error
      And I should see error "Owner must be included in participants"

  Rule: All participant user IDs must reference existing users

    @happy-path
    Scenario: Create schedule with all existing participants
      Given all participant users exist in the system
      When I create a schedule with those participants
      Then my schedule should be created successfully
      And all participants should be included

    @business-rule
    Scenario: Reject schedule with non-existent participant
      Given a participant user ID does not exist
      When I attempt to create a schedule with that participant
      Then the request should fail with not found error
      And I should see error "One or more participants not found"

  @happy-path @data-driven
  Scenario Outline: Successfully create schedule with different recurrence frequencies
    Given the current time is "2025-10-03T10:00:00Z"
    When I create a schedule with start "2025-10-10T18:00:00Z"
    And recurrence frequency "<frequency>" with interval <interval>
    Then my schedule should be created successfully
    And the recurrence frequency should be "<frequency>"
    And the recurrence interval should be <interval>

    Examples:
      | frequency | interval |
      | Once      | 0        |
      | Daily     | 1        |
      | Weekly    | 1        |
      | Monthly   | 1        |
      | Yearly    | 1        |

  @error-handling
  Scenario: Handle non-existent session
    Given a schedule does not exist
    When I attempt to create a schedule
    Then the schedule service should be available
    And I should be able to create the schedule

  @error-handling
  Scenario: Handle service unavailable
    Given the schedule service is unavailable
    When I attempt to create a schedule with valid data
    Then the request should fail with service error
    And I should see error "Failed to create schedule"
