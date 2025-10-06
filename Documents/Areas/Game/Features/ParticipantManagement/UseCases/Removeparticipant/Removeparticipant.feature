# Generated: 2025-10-03
# Use Case: Remove Participant
@use-case @game @participant-management
Feature: Remove Participant from Game Session
  As a Game Master
  I want to remove participants from my game session
  So that I can manage the session roster effectively

  Background:
    Given I am authenticated as a Game Master
    And I have a game session with multiple participants

  Rule: Game Master (Master role) cannot be removed from session

    @business-rule
    Scenario: Cannot remove Game Master from session
      Given I am the Game Master of the session
      When I attempt to remove myself from the session
      Then the request should fail with validation error
      And I should see error "Cannot remove Game Master from session"
      And I should remain in the participant roster

  @happy-path
  Scenario: Successfully remove Guest participant
    Given a Guest participant exists in the session
    When I remove that participant from the session
    Then the request should succeed
    And the participant should be removed from the roster

  @happy-path
  Scenario: Successfully remove Player participant
    Given a Player participant exists in the session
    When I remove that participant from the session
    Then the request should succeed
    And the participant should be removed from the roster

  @happy-path
  Scenario: Successfully remove Assistant participant
    Given an Assistant participant exists in the session
    When I remove that participant from the session
    Then the request should succeed
    And the participant should be removed from the roster

  @authorization @error-handling
  Scenario: Non-owner cannot remove participants
    Given the session is owned by another Game Master
    And a participant exists in the session
    When I attempt to remove that participant
    Then the request should fail with authorization error
    And I should see error "Only the session owner can manage participants"

  @business-rule @error-handling
  Scenario: Cannot remove participant from Finished session
    Given the session status is Finished
    And a Player participant exists in the session
    When I attempt to remove that participant
    Then the request should fail with validation error
    And I should see error "Cannot modify participants in finished session"

  @error-handling
  Scenario: Cannot remove non-participant user
    Given a user exists who is not a participant in the session
    When I attempt to remove that user from the session
    Then the request should fail with validation error
    And I should see error "User is not a participant in this session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to remove a participant
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Remove participant notifies remaining participants
    Given multiple participants exist in the session
    And a Player participant exists in the session
    When I remove that participant from the session
    Then the request should succeed
    And remaining participants should be notified of the removal
