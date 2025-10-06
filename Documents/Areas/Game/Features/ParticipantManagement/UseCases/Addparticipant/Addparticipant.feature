# Generated: 2025-10-03
# Use Case: Add Participant
@use-case @game @participant-management
Feature: Add Participant to Game Session
  As a Game Master
  I want to add participants to my game sessions with specific roles
  So that I can build my session roster with appropriate permissions

  Background:
    Given I am authenticated as a Game Master
    And I have a game session

  Rule: Only one participant can have Master role

    @business-rule
    Scenario: Cannot add second participant with Master role
      Given a Game Master already exists in the session
      And a user exists who is not yet a participant
      When I attempt to add that user with Master role
      Then the request should fail with validation error
      And I should see error "A session can only have one participant with the Master role"
      And the participant roster should remain unchanged

  @happy-path
  Scenario: Successfully add participant with Guest role
    Given a user exists who is not yet a participant
    When I add that user to the session with Guest role
    Then the request should succeed
    And the user should be added to the participant roster
    And the user role should be Guest

  @happy-path
  Scenario: Successfully add participant with Player role
    Given a user exists who is not yet a participant
    When I add that user to the session with Player role
    Then the request should succeed
    And the user should be added to the participant roster
    And the user role should be Player

  @happy-path
  Scenario: Successfully add participant with Assistant role
    Given a user exists who is not yet a participant
    When I add that user to the session with Assistant role
    Then the request should succeed
    And the user should be added to the participant roster
    And the user role should be Assistant

  @authorization @error-handling
  Scenario: Non-owner cannot add participants
    Given the session is owned by another Game Master
    And a user exists who is not yet a participant
    When I attempt to add that user to the session
    Then the request should fail with authorization error
    And I should see error "Only the session owner can manage participants"

  @business-rule @error-handling
  Scenario: Cannot add participant to Finished session
    Given the session status is Finished
    And a user exists who is not yet a participant
    When I attempt to add that user to the session
    Then the request should fail with validation error
    And I should see error "Cannot add participants to a finished session"

  @error-handling
  Scenario: Cannot add non-existent user as participant
    Given I provide a user ID that does not exist
    When I attempt to add that user to the session
    Then the request should fail with validation error
    And I should see error "The specified user does not exist"

  @business-rule @error-handling
  Scenario: Cannot add duplicate participant
    Given a user is already a participant in the session
    When I attempt to add the same user again
    Then the request should fail with validation error
    And I should see error "This user is already a participant in the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to add a participant
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case
  Scenario: Add participant records join timestamp
    Given a user exists who is not yet a participant
    When I add that user to the session with Player role
    Then the request should succeed
    And the participant should have a recorded join timestamp
    And the join timestamp should be set to current time
