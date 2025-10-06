# Generated: 2025-10-03
# Use Case: Delete Game Session
@use-case @game @session-management
Feature: Delete Game Session
  As a Game Master
  I want to delete my game sessions
  So that I can remove sessions I no longer need

  Background:
    Given I am authenticated as a Game Master

  @happy-path
  Scenario: Successfully delete own game session
    Given I am the owner of a game session
    When I delete the game session
    Then the request should succeed
    And the session should be removed from the system

  @happy-path
  Scenario: Successfully delete Draft session with hard delete
    Given I am the owner of a game session
    And the session status is Draft
    When I delete the game session
    Then the request should succeed
    And the session should be permanently deleted

  @authorization @error-handling
  Scenario: Non-owner cannot delete session
    Given a session is owned by another Game Master
    When I attempt to delete the game session
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can delete the session"
    And the session should remain in the system

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to delete the game session
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Cannot delete already deleted session
    Given I previously deleted a game session
    When I attempt to delete the same session again
    Then the request should fail with not found error
    And I should see error "Game session not found"
