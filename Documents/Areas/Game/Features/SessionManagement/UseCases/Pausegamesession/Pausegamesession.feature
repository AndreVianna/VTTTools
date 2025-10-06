# Generated: 2025-10-03
# Use Case: Pause Game Session
@use-case @game @session-management
Feature: Pause Game Session
  As a Game Master
  I want to pause an active game session
  So that I can temporarily suspend gameplay while preserving session state

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Session must be InProgress to pause

    @happy-path
    Scenario: Successfully pause InProgress session
      Given the session status is InProgress
      When I pause the game session
      Then the session status should be Paused
      And I should receive confirmation
      And the pause timestamp should be recorded

    @business-rule
    Scenario: Cannot pause session from Draft status
      Given the session status is Draft
      When I attempt to pause the game session
      Then the request should fail
      And I should see error "Cannot pause session from Draft status"

    @business-rule
    Scenario: Cannot pause session from Scheduled status
      Given the session status is Scheduled
      When I attempt to pause the game session
      Then the request should fail
      And I should see error "Cannot pause session from Scheduled status"

    @business-rule
    Scenario: Cannot pause session from Finished status
      Given the session status is Finished
      When I attempt to pause the game session
      Then the request should fail
      And I should see error "Cannot pause session from Finished status"

    @business-rule
    Scenario: Cannot pause session from Cancelled status
      Given the session status is Cancelled
      When I attempt to pause the game session
      Then the request should fail
      And I should see error "Cannot pause session from Cancelled status"

  @authorization @error-handling
  Scenario: Non-owner cannot pause session
    Given the session is owned by another Game Master
    And the session status is InProgress
    When I attempt to pause the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can pause the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to pause the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Pause session notifies participants
    Given the session status is InProgress
    And the session has active participants
    When I pause the game session
    Then the session status should be Paused
    And participants should be notified of session pause
    And session activity should be suspended
