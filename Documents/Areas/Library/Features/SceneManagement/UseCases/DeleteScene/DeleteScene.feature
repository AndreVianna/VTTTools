# Generated: 2025-10-02
# Use Case: Delete Scene

Feature: Delete Scene
  As a Game Master
  I want to delete a scene
  So that I can remove unused tactical maps from my library

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    

  Rule: Scene cannot be deleted if referenced by active game session

    Scenario: Successfully delete scene not in active session
      Given my scene is not referenced by any active game session
      When I delete the scene
      Then the scene is removed
      And I should receive deletion confirmation

    Scenario: Reject deletion of scene in active game session
      Given my scene is referenced by an active game session
      When I attempt to delete the scene
      Then I should see error with validation error
      And I should see error "Cannot delete scene referenced by active game session"
      And the scene should remain in the database

  @happy-path
  Scenario: Successfully delete standalone scene
    Given my scene is standalone with null AdventureId
    And the scene is not in any active game session
    When I delete the scene
    Then the scene is removed successfully
    And the scene should not appear in standalone scenes list

  @happy-path
  Scenario: Successfully delete scene from adventure
    Given my scene is in an adventure with 10 scenes
    And the scene is not in any active game session
    When I delete the scene
    Then the scene is removed
    And the adventure should now have 9 scenes
    And the adventure should remain intact

  @happy-path
  Scenario: Successfully delete scene and verify removal
    Given my scene has ID "550e8400-e29b-41d4-a716-446655440000"
    And the scene is not in any active game session
    When I delete the scene
    Then the scene is removed
    And attempting to retrieve scene "550e8400-e29b-41d4-a716-446655440000" should fail
    And I should see error "Scene not found"

  @error-handling
  Scenario: Handle deletion of non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my scene exists and is not in active session
    And the database is unavailable
    When I attempt to delete the scene
    Then I should see error with server error
    And I should see error "Failed to delete scene"
    And the scene should remain in the database

  @authorization
  Scenario: User cannot delete scene they don't own
    Given a scene exists owned by another user
    When I attempt to delete that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this scene"
    And the scene should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete scene
    Given I am not authenticated
    And a scene exists
    When I attempt to delete the scene
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published scene
    Given my scene is published and public
    And the scene is not in any active game session
    When I delete the scene
    Then the scene is removed successfully
    And public users should no longer see the scene

  @edge-case
  Scenario: Delete scene removes all asset placements
    Given my scene has 15 placed assets
    And the scene is not in any active game session
    When I delete the scene
    Then the scene is removed
    And all 15 asset placements is removed
    And the asset templates should remain intact

  @integration
  Scenario: Delete scene preserves unrelated data integrity
    Given I own 2 scenes in the same adventure
    And the first scene has 8 placed assets
    And the second scene has 6 placed assets
    And neither scene is in active game session
    When I delete the first scene
    Then the first scene and its 8 asset placements is removed
    And the second scene and its 6 asset placements should remain intact
    And the adventure should remain intact

  @integration
  Scenario: Prevent deletion and provide helpful message
    Given my scene is referenced by 2 active game sessions
    When I attempt to delete the scene
    Then I should see error with validation error
    And I should see error "Cannot delete scene referenced by active game session"
    And I should see list of active sessions using the scene
    And I should see suggestion to finish sessions first
