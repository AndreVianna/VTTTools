# Generated: 2025-10-03
# Use Case: Resume Game Session
@use-case @game @session-management
Feature: Resume Game Session
  As a Game Master
  I want to resume a paused game session
  So that I can continue gameplay after a break

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Session must be Paused to resume

    @happy-path
    Scenario: Successfully resume session from Paused status
      Given the session status is Paused
      When I resume the game session
      Then the session status should be InProgress
      And I should receive confirmation

    @business-rule
    Scenario: Cannot resume session from Draft status
      Given the session status is Draft
      When I attempt to resume the game session
      Then the request should fail
      And I should see error "Cannot resume session from Draft status"

    @business-rule
    Scenario: Cannot resume session from Scheduled status
      Given the session status is Scheduled
      When I attempt to resume the game session
      Then the request should fail
      And I should see error "Cannot resume session from Scheduled status"

    @business-rule
    Scenario: Cannot resume session from InProgress status
      Given the session status is InProgress
      When I attempt to resume the game session
      Then the request should fail
      And I should see error "Cannot resume session from InProgress status"

    @business-rule
    Scenario: Cannot resume session from Finished status
      Given the session status is Finished
      When I attempt to resume the game session
      Then the request should fail
      And I should see error "Cannot resume session from Finished status"

    @business-rule
    Scenario: Cannot resume session from Cancelled status
      Given the session status is Cancelled
      When I attempt to resume the game session
      Then the request should fail
      And I should see error "Cannot resume session from Cancelled status"

  @authorization @error-handling
  Scenario: Non-owner cannot resume session
    Given the session is owned by another Game Master
    And the session status is Paused
    When I attempt to resume the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can resume the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to resume the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"
