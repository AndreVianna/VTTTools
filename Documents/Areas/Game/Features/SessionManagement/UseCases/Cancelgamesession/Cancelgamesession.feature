# Generated: 2025-10-03
# Use Case: Cancel Game Session
@use-case @game @session-management
Feature: Cancel Game Session
  As a Game Master
  I want to cancel a game session
  So that I can terminate any non-finished session when circumstances require it

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Session can be cancelled from any status except Finished

    @happy-path
    Scenario: Successfully cancel session from Draft status
      Given the session status is Draft
      When I cancel the game session
      Then the session status should be Cancelled
      And I should receive confirmation

    @happy-path
    Scenario: Successfully cancel session from Scheduled status
      Given the session status is Scheduled
      When I cancel the game session
      Then the session status should be Cancelled
      And I should receive confirmation

    @happy-path
    Scenario: Successfully cancel session from InProgress status
      Given the session status is InProgress
      When I cancel the game session
      Then the session status should be Cancelled
      And I should receive confirmation

    @happy-path
    Scenario: Successfully cancel session from Paused status
      Given the session status is Paused
      When I cancel the game session
      Then the session status should be Cancelled
      And I should receive confirmation

    @business-rule
    Scenario: Cannot cancel session from Finished status
      Given the session status is Finished
      When I attempt to cancel the game session
      Then the request should fail
      And I should see error "Cannot cancel session from Finished status"

    @business-rule
    Scenario: Cancelled status is terminal and cannot be changed
      Given the session status is Cancelled
      When I attempt to cancel the game session
      Then the request should fail
      And I should see error "Cannot cancel session from Cancelled status"

  @authorization @error-handling
  Scenario: Non-owner cannot cancel session
    Given the session is owned by another Game Master
    When I attempt to cancel the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can cancel the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to cancel the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"
