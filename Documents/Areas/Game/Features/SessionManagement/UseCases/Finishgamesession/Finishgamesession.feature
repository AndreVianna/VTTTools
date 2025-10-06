# Generated: 2025-10-03
# Use Case: Finish Game Session
@use-case @game @session-management
Feature: Finish Game Session
  As a Game Master
  I want to finish a game session
  So that I can formally conclude gameplay and finalize session records

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Session must be InProgress or Paused to finish

    @happy-path
    Scenario: Successfully finish session from InProgress status
      Given the session status is InProgress
      When I finish the game session
      Then the session status should be Finished
      And I should receive confirmation

    @happy-path
    Scenario: Successfully finish session from Paused status
      Given the session status is Paused
      When I finish the game session
      Then the session status should be Finished
      And I should receive confirmation

    @business-rule
    Scenario: Cannot finish session from Draft status
      Given the session status is Draft
      When I attempt to finish the game session
      Then the request should fail
      And I should see error "Cannot finish session from Draft status"

    @business-rule
    Scenario: Cannot finish session from Scheduled status
      Given the session status is Scheduled
      When I attempt to finish the game session
      Then the request should fail
      And I should see error "Cannot finish session from Scheduled status"

    @business-rule
    Scenario: Cannot finish session already Finished
      Given the session status is Finished
      When I attempt to finish the game session
      Then the request should fail
      And I should see error "Session is already finished"

    @business-rule
    Scenario: Cannot finish cancelled session
      Given the session status is Cancelled
      When I attempt to finish the game session
      Then the request should fail
      And I should see error "Cannot finish cancelled session"

  @authorization @error-handling
  Scenario: Non-owner cannot finish session
    Given the session is owned by another Game Master
    When I attempt to finish the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can finish the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to finish the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case @terminal-status
  Scenario: Finished session is terminal and participant list is frozen
    Given the session status is InProgress
    And the session has active participants
    When I finish the game session
    Then the session status should be Finished
    And the participant list should be frozen
    And no further participant changes should be allowed
    And session completion time should be recorded
