# Generated: 2025-10-03
# Use Case: List Game Sessions By Owner
@use-case @game @session-management
Feature: List Game Sessions By Owner
  As a Game Master
  I want to retrieve all game sessions I own
  So that I can manage and review my sessions

  Background:
    Given I am authenticated as a Game Master

  @happy-path
  Scenario: Retrieve all own game sessions
    Given I own multiple game sessions with different statuses
    When I request my game sessions
    Then the request should succeed
    And I should receive all my sessions
    And the response should include sessions with all statuses

  @happy-path
  Scenario: Retrieve empty list when no sessions exist
    Given I do not own any game sessions
    When I request my game sessions
    Then the request should succeed
    And I should receive an empty list

  @happy-path
  Scenario: Retrieve sessions with multiple statuses
    Given I own sessions with statuses Draft, Scheduled, InProgress, Paused, Finished, and Cancelled
    When I request my game sessions
    Then the request should succeed
    And the response should include 6 sessions
    And all sessions should belong to me

  @error-handling
  Scenario: Request fails for non-existent owner
    Given I request sessions for a non-existent user ID
    When I send the request
    Then the request should fail with not found error
    And I should see error "Owner not found"

  @authorization @edge-case
  Scenario: Admin retrieves sessions for any owner
    Given I am authenticated as an admin
    And another Game Master owns multiple sessions
    When I request that GM's sessions
    Then the request should succeed
    And I should receive all their sessions
