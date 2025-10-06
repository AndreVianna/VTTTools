# Generated: 2025-10-03
# Use Case: List Active Game Sessions
@use-case @game @session-management
Feature: List Active Game Sessions
  As a user of the platform
  I want to retrieve all active game sessions
  So that I can see which games are currently in progress

  Background:
    Given the game session service is available

  @happy-path
  Scenario: Retrieve all active game sessions
    Given multiple game sessions exist with different statuses
    And 2 sessions have status InProgress
    When I request the list of active game sessions
    Then the request should succeed
    And I should receive 2 sessions
    And all returned sessions should have status InProgress

  @happy-path
  Scenario: Retrieve empty list when no active sessions exist
    Given no active game sessions exist
    When I request the list of active game sessions
    Then the request should succeed
    And I should receive an empty list

  @edge-case
  Scenario: Only InProgress sessions are returned
    Given sessions exist with statuses Draft, Scheduled, InProgress, Paused, Finished, and Cancelled
    And only 1 session has status InProgress
    When I request the list of active game sessions
    Then the request should succeed
    And I should receive 1 session
    And the session status should be InProgress
    And sessions with other statuses should not be included

  @authorization
  Scenario: Authenticated users can retrieve active sessions
    Given I am authenticated as a valid user
    And active game sessions exist
    When I request the list of active game sessions
    Then the request should succeed
    And I should receive all InProgress sessions
