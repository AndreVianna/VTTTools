# Generated: 2025-10-03
# Use Case: Delete Schedule
@use-case @game @schedule-management
Feature: Delete Schedule
  As a Game Master
  I want to delete a schedule
  So that I can remove scheduling patterns I no longer need

  Background:
    Given I am authenticated as a Game Master
    And I have a schedule

  Rule: Deleting schedule does not delete generated sessions

    @happy-path @business-rule
    Scenario: Delete schedule preserves generated sessions
      Given the schedule has generated 3 game sessions
      When I delete the schedule
      Then the request should succeed
      And the schedule should be removed
      And all 3 generated sessions should still exist
      And the generated sessions should maintain their status

    @edge-case
    Scenario: Generated sessions remain independent after schedule deletion
      Given the schedule has generated sessions with different statuses
      When I delete the schedule
      Then the request should succeed
      And sessions with Scheduled status should still exist
      And sessions with InProgress status should still exist
      And sessions with Finished status should still exist

  @happy-path
  Scenario: Successfully delete schedule
    Given I am the owner of the schedule
    When I delete the schedule
    Then the request should succeed
    And the schedule should be removed from the system

  @authorization @error-handling
  Scenario: Non-owner cannot delete schedule
    Given the schedule is owned by another Game Master
    When I attempt to delete the schedule
    Then the request should fail with authorization error
    And I should see error "Only the schedule owner can delete this schedule"
    And the schedule should remain in the system

  @error-handling
  Scenario: Handle non-existent schedule
    Given the schedule does not exist
    When I attempt to delete the schedule
    Then the request should fail with not found error
    And I should see error "Schedule not found"

  @error-handling
  Scenario: Unauthenticated user cannot delete schedule
    Given I am not authenticated
    When I attempt to delete a schedule
    Then the request should fail with authentication error
    And I should see error "Authentication required"
