# Generated: 2025-10-03
# Use Case: Start Game Session
@use-case @game @session-management
Feature: Start Game Session
  As a Game Master
  I want to start a game session
  So that I can begin active gameplay with participants

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Session status must be Draft or Scheduled to start

    @happy-path
    Scenario: Successfully start session from Draft status
      Given the session status is Draft
      When I start the game session
      Then the session status should be InProgress
      And I should receive confirmation

    @happy-path
    Scenario: Successfully start session from Scheduled status
      Given the session status is Scheduled
      When I start the game session
      Then the session status should be InProgress
      And I should receive confirmation

    @business-rule
    Scenario: Cannot start session from InProgress status
      Given the session status is InProgress
      When I attempt to start the game session
      Then the request should fail
      And I should see error "Cannot start session from InProgress status"

    @business-rule
    Scenario: Cannot start session from Paused status
      Given the session status is Paused
      When I attempt to start the game session
      Then the request should fail
      And I should see error "Cannot start session from Paused status"

    @business-rule
    Scenario: Cannot start session from Finished status
      Given the session status is Finished
      When I attempt to start the game session
      Then the request should fail
      And I should see error "Cannot start session from Finished status"

    @business-rule
    Scenario: Cannot start session from Cancelled status
      Given the session status is Cancelled
      When I attempt to start the game session
      Then the request should fail
      And I should see error "Cannot start session from Cancelled status"

  @authorization @error-handling
  Scenario: Non-owner cannot start session
    Given the session is owned by another Game Master
    When I attempt to start the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can start the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to start the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Start session marks beginning of active gameplay
    Given the session status is Draft
    And the session has participants
    When I start the game session
    Then the session status should be InProgress
    And participants should be notified of session start
    And session start time should be recorded
