# Generated: 2025-10-03
# Use Case: Update Schedule
@use-case @game @schedule-management
Feature: Update Schedule
  As a Game Master
  I want to update my scheduled game sessions
  So that I can accommodate changes in timing, participants, or session details

  Background:
    Given I am authenticated as a Game Master
    And I have an existing schedule

  Rule: Schedule start time must remain in the future after update

    @happy-path
    Scenario: Successfully update schedule start time to valid future date
      Given the current time is "2025-10-03T10:00:00Z"
      And the schedule start is "2025-10-10T18:00:00Z"
      When I update the schedule start to "2025-10-17T19:00:00Z"
      Then the request should succeed
      And the schedule start should be "2025-10-17T19:00:00Z"

    @business-rule
    Scenario: Reject update with start time in the past
      Given the current time is "2025-10-03T10:00:00Z"
      When I attempt to update the schedule start to "2025-10-01T18:00:00Z"
      Then the request should fail with validation error
      And I should see error "Schedule start time must be in the future"

  Rule: Schedule duration must remain positive after update

    @happy-path
    Scenario: Successfully update schedule duration to valid positive value
      When I update the schedule duration to "4 hours"
      Then the request should succeed
      And the schedule duration should be "4 hours"

    @business-rule
    Scenario: Reject update with zero duration
      When I attempt to update the schedule duration to "0 minutes"
      Then the request should fail with validation error
      And I should see error "Duration must be greater than zero"

    @business-rule
    Scenario: Reject update with negative duration
      When I attempt to update the schedule duration to "-60 minutes"
      Then the request should fail with validation error
      And I should see error "Duration must be greater than zero"

  Rule: Schedule participants must include the owner after update

    @happy-path
    Scenario: Successfully update schedule participants list
      Given the schedule has 3 participants
      When I update the participants to include different users
      And I include myself in the updated participant list
      Then the request should succeed
      And the updated participants should be saved

    @business-rule
    Scenario: Reject update with owner not in participants list
      Given the schedule has participants including me
      When I attempt to update the participants without including myself
      Then the request should fail with validation error
      And I should see error "Schedule owner must be included in participants list"

  @happy-path
  Scenario: Successfully update schedule recurrence pattern
    Given the schedule has weekly recurrence
    When I update the recurrence to monthly
    Then the request should succeed
    And the recurrence pattern should be monthly

  @authorization @error-handling
  Scenario: Non-owner cannot update schedule
    Given the schedule is owned by another Game Master
    When I attempt to update the schedule
    Then the request should fail with authorization error
    And I should see error "Only the schedule owner can update this schedule"

  @error-handling
  Scenario: Handle non-existent schedule
    Given the schedule does not exist
    When I attempt to update the schedule
    Then the request should fail with not found error
    And I should see error "Schedule not found"
