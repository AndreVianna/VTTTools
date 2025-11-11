# Generated: 2025-10-02
# Use Case: Delete World

Feature: Delete World
  As a Game Master
  I want to delete an world
  So that I can remove unused story arcs and all associated content

  Background:
    Given I am authenticated as a Game Master
    And I own an world in my library
    

  Rule: Deleting world cascades to all owned campaigns

    Scenario: Delete world successfully cascades to campaigns
      Given my world has 3 associated campaigns
      When I delete the world
      Then the world is removed
      And all 3 campaigns is removed
      And I should receive deletion confirmation

    Scenario: Delete world cascades to campaigns and adventures
      Given my world has 2 campaigns
      And the first campaign has 3 adventures
      And the second campaign has 2 adventures
      When I delete the world
      Then the world is removed
      And both campaigns is removed
      And all 5 adventures is removed

    Scenario: Delete world cascades through entire hierarchy
      Given my world has complete content hierarchy:
        | Level      | Count |
        | Campaigns  | 2     |
        | Adventures | 4     |
        | Encounters     | 8     |
      When I delete the world
      Then the world is removed
      And all campaigns is removed
      And all adventures is removed
      And all encounters is removed

  @happy-path
  Scenario: Successfully delete world with no campaigns
    Given my world has no associated campaigns
    When I delete the world
    Then the world is removed
    And I should receive deletion confirmation

  @happy-path
  Scenario: Successfully delete world and verify removal
    Given my world has ID "550e8400-e29b-41d4-a716-446655440000"
    When I delete the world
    Then the world is removed
    And attempting to retrieve world "550e8400-e29b-41d4-a716-446655440000" should fail
    And I should see error "World not found"

  @error-handling
  Scenario: Handle deletion of non-existent world
    Given no world exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete world "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "World not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my world exists
    And the database is unavailable
    When I attempt to delete the world
    Then I should see error with server error
    And I should see error "Failed to delete world"
    And the world should remain in the database

  @authorization
  Scenario: User cannot delete world they don't own
    Given an world exists owned by another user
    When I attempt to delete that world
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this world"
    And the world should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete world
    Given I am not authenticated
    And an world exists
    When I attempt to delete the world
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published world
    Given my world is published and public
    When I delete the world
    Then the world is removed successfully
    And public users should no longer see the world

  @edge-case
  Scenario: Attempt to delete already deleted world
    Given my world was recently deleted
    When I attempt to delete the world again
    Then I should see error with not found error
    And I should see error "World not found"

  @integration
  Scenario: Delete world preserves unrelated data integrity
    Given my world has 2 campaigns
    And I own another separate world with 3 campaigns
    When I delete the first world
    Then the first world and its 2 campaigns is removed
    And the second world and its 3 campaigns should remain intact
