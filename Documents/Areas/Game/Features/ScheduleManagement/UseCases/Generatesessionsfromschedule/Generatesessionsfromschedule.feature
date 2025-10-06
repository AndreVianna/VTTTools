# Generated: 2025-10-03
# Use Case: Generate Sessions From Schedule
@use-case @game @schedule-management
Feature: Generate Sessions From Schedule
  As a Game Master
  I want to generate GameSession instances from a schedule recurrence pattern
  So that I can create actual game sessions based on my planned schedule

  Background:
    Given I am authenticated as a Game Master
    And I have a schedule

  Rule: Generated sessions are independent from schedule

    @happy-path @business-rule
    Scenario: Generated sessions preserved after schedule deletion
      Given the schedule has generated 3 game sessions
      When I delete the schedule
      Then all 3 generated sessions should still exist
      And the generated sessions should maintain their status

    @edge-case
    Scenario: Sessions with different statuses preserved after deletion
      Given the schedule has generated sessions with Scheduled, InProgress, and Finished statuses
      When I delete the schedule
      Then all generated sessions should still exist
      And each session should maintain its original status

  @happy-path
  Scenario: Generate sessions for Once frequency schedule
    Given the schedule has Once frequency
    When I generate sessions from the schedule
    Then the request should succeed
    And 1 game session should be created
    And the session should have Status=Scheduled

  @happy-path
  Scenario: Generate sessions for Daily frequency schedule
    Given the schedule has Daily frequency
    And the schedule spans 5 days
    When I generate sessions from the schedule
    Then the request should succeed
    And 5 game sessions should be created
    And all sessions should have Status=Scheduled

  @happy-path
  Scenario: Generate sessions for Weekly frequency schedule
    Given the schedule has Weekly frequency
    And the schedule spans 4 weeks
    When I generate sessions from the schedule
    Then the request should succeed
    And 4 game sessions should be created
    And all sessions should have Status=Scheduled

  @happy-path
  Scenario: Generate sessions for Monthly frequency schedule
    Given the schedule has Monthly frequency
    And the schedule spans 3 months
    When I generate sessions from the schedule
    Then the request should succeed
    And 3 game sessions should be created
    And all sessions should have Status=Scheduled

  @business-rule
  Scenario: Duplicate prevention skips already-generated occurrences
    Given the schedule has Daily frequency spanning 4 days
    And a session already exists for occurrence 2
    When I generate sessions from the schedule
    Then the request should succeed
    And 3 new sessions should be created
    And the existing session should not be duplicated

  @happy-path
  Scenario: Participants copied from schedule to generated sessions
    Given the schedule has 4 participants
    When I generate sessions from the schedule
    Then all generated sessions should have 4 participants
    And participants should match the schedule participants

  @authorization @error-handling
  Scenario: Only owner can trigger session generation
    Given the schedule is owned by another Game Master
    When I attempt to generate sessions from the schedule
    Then the request should fail with authorization error
    And I should see error "Only the schedule owner can generate sessions"

  @error-handling
  Scenario: Handle non-existent schedule
    Given the schedule does not exist
    When I attempt to generate sessions
    Then the request should fail with not found error
    And I should see error "Schedule not found"
