# Generated: 2025-10-02
# Use Case: Delete Encounter

Feature: Delete Encounter
  As a Game Master
  I want to delete a encounter
  So that I can remove unused tactical maps from my library

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    

  Rule: Encounter cannot be deleted if referenced by active game session

    Scenario: Successfully delete encounter not in active session
      Given my encounter is not referenced by any active game session
      When I delete the encounter
      Then the encounter is removed
      And I should receive deletion confirmation

    Scenario: Reject deletion of encounter in active game session
      Given my encounter is referenced by an active game session
      When I attempt to delete the encounter
      Then I should see error with validation error
      And I should see error "Cannot delete encounter referenced by active game session"
      And the encounter should remain in the database

  @happy-path
  Scenario: Successfully delete standalone encounter
    Given my encounter is standalone with null AdventureId
    And the encounter is not in any active game session
    When I delete the encounter
    Then the encounter is removed successfully
    And the encounter should not appear in standalone encounters list

  @happy-path
  Scenario: Successfully delete encounter from adventure
    Given my encounter is in an adventure with 10 encounters
    And the encounter is not in any active game session
    When I delete the encounter
    Then the encounter is removed
    And the adventure should now have 9 encounters
    And the adventure should remain intact

  @happy-path
  Scenario: Successfully delete encounter and verify removal
    Given my encounter has ID "550e8400-e29b-41d4-a716-446655440000"
    And the encounter is not in any active game session
    When I delete the encounter
    Then the encounter is removed
    And attempting to retrieve encounter "550e8400-e29b-41d4-a716-446655440000" should fail
    And I should see error "Encounter not found"

  @error-handling
  Scenario: Handle deletion of non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my encounter exists and is not in active session
    And the database is unavailable
    When I attempt to delete the encounter
    Then I should see error with server error
    And I should see error "Failed to delete encounter"
    And the encounter should remain in the database

  @authorization
  Scenario: User cannot delete encounter they don't own
    Given a encounter exists owned by another user
    When I attempt to delete that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this encounter"
    And the encounter should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete encounter
    Given I am not authenticated
    And a encounter exists
    When I attempt to delete the encounter
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published encounter
    Given my encounter is published and public
    And the encounter is not in any active game session
    When I delete the encounter
    Then the encounter is removed successfully
    And public users should no longer see the encounter

  @edge-case
  Scenario: Delete encounter removes all asset placements
    Given my encounter has 15 placed assets
    And the encounter is not in any active game session
    When I delete the encounter
    Then the encounter is removed
    And all 15 asset placements is removed
    And the asset templates should remain intact

  @integration
  Scenario: Delete encounter preserves unrelated data integrity
    Given I own 2 encounters in the same adventure
    And the first encounter has 8 placed assets
    And the second encounter has 6 placed assets
    And neither encounter is in active game session
    When I delete the first encounter
    Then the first encounter and its 8 asset placements is removed
    And the second encounter and its 6 asset placements should remain intact
    And the adventure should remain intact

  @integration
  Scenario: Prevent deletion and provide helpful message
    Given my encounter is referenced by 2 active game sessions
    When I attempt to delete the encounter
    Then I should see error with validation error
    And I should see error "Cannot delete encounter referenced by active game session"
    And I should see list of active sessions using the encounter
    And I should see suggestion to finish sessions first
