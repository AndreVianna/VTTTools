# Generated: 2025-10-02
# Use Case: Delete Adventure

Feature: Delete Adventure
  As a Game Master
  I want to delete an adventure
  So that I can remove unused game modules and all associated scenes

  Background:
    Given I am authenticated as a Game Master
    And I own an adventure in my library
    

  Rule: Deleting adventure cascades to all owned scenes

    Scenario: Delete adventure successfully cascades to scenes
      Given my adventure has 5 associated scenes
      When I delete the adventure
      Then the adventure is removed
      And all 5 scenes is removed
      And I should receive deletion confirmation

    Scenario: Delete adventure cascades to scenes with assets
      Given my adventure has 4 scenes
      And the first scene has 8 placed assets
      And the second scene has 5 placed assets
      And the third scene has 3 placed assets
      And the fourth scene has 6 placed assets
      When I delete the adventure
      Then the adventure is removed
      And all 4 scenes is removed
      And all scene asset placements is removed

  @happy-path
  Scenario: Successfully delete standalone adventure
    Given my adventure is standalone with null CampaignId
    And the adventure has 3 scenes
    When I delete the adventure
    Then the adventure is removed
    And all 3 scenes is removed
    And the adventure should not appear in standalone adventures list

  @happy-path
  Scenario: Successfully delete adventure from campaign
    Given my adventure is in a campaign with 6 adventures
    When I delete the adventure
    Then the adventure is removed
    And the campaign should now have 5 adventures
    And the campaign should remain intact

  @happy-path
  Scenario: Successfully delete adventure with no scenes
    Given my adventure has no associated scenes
    When I delete the adventure
    Then the adventure is removed
    And I should receive deletion confirmation

  @error-handling
  Scenario: Handle deletion of non-existent adventure
    Given no adventure exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete adventure "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my adventure exists with scenes
    And the database is unavailable
    When I attempt to delete the adventure
    Then I should see error with server error
    And I should see error "Failed to delete adventure"
    And the adventure should remain in the database

  @authorization
  Scenario: User cannot delete adventure they don't own
    Given an adventure exists owned by another user
    When I attempt to delete that adventure
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this adventure"
    And the adventure should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete adventure
    Given I am not authenticated
    And an adventure exists
    When I attempt to delete the adventure
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published adventure
    Given my adventure is published and public
    And the adventure has 4 scenes
    When I delete the adventure
    Then the adventure is removed successfully
    And public users should no longer see the adventure
    And all scenes is removed

  @integration
  Scenario: Delete adventure preserves unrelated data integrity
    Given I own 2 adventures
    And the first adventure has 4 scenes
    And the second adventure has 5 scenes
    When I delete the first adventure
    Then the first adventure and its 4 scenes is removed
    And the second adventure and its 5 scenes should remain intact

  @data-driven
  Scenario Outline: Delete adventures of different types
    Given I own an adventure with type "<type>"
    And the adventure has <scenes> scenes
    When I delete the adventure
    Then the adventure is removed successfully
    And all <scenes> scenes is removed

    Examples:
      | type          | scenes |
      | Generic       | 3      |
      | DungeonCrawl  | 8      |
      | OpenWorld     | 12     |
      | Investigation | 5      |
