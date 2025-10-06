# Generated: 2025-10-03
# Use Case: Get Game Session
@use-case @game @session-management
Feature: Get Game Session
  As a game session participant
  I want to retrieve complete session details
  So that I can view session information, chat history, and participant list

  Background:
    Given I am authenticated as a user

  @happy-path
  Scenario: Owner retrieves their own game session
    Given a game session exists with title "Dragon's Lair Campaign"
    And I am the owner of the session
    And the session has 3 participants
    And the session has 5 chat messages
    And the session has 2 game events
    When I retrieve the game session by ID
    Then the request should succeed
    And I should receive the complete game session
    And the response should include all participants
    And the response should include all messages
    And the response should include all events

  @happy-path @authorization
  Scenario: Participant retrieves session they are part of
    Given a game session exists owned by another user
    And I am a participant with role "Player"
    When I retrieve the game session by ID
    Then the request should succeed
    And I should receive the complete game session

  @authorization @error-handling
  Scenario: Non-participant cannot retrieve session
    Given a game session exists owned by another user
    And I am not a participant in the session
    When I attempt to retrieve the game session by ID
    Then the request should fail with authorization error
    And I should see error "User is not a participant in this session"

  @error-handling
  Scenario: Handle non-existent session
    Given no game session exists with the requested ID
    When I attempt to retrieve the game session by ID
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Retrieved session includes all collections populated
    Given a game session exists with complete data
    And I am a participant in the session
    And the session has an active scene assigned
    When I retrieve the game session by ID
    Then the request should succeed
    And the response should include the session status
    And the response should include the active scene ID
    And the response should include all participants with their roles
    And the response should include all messages with timestamps
    And the response should include all events with timestamps
