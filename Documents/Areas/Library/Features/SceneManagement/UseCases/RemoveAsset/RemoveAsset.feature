# Generated: 2025-10-02
# Use Case: Remove Asset

Feature: Remove Asset
  As a Game Master
  I want to remove placed assets from a scene
  So that I can manage scene composition and remove unwanted placements

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    And the scene has placed assets
    

  @happy-path
  Scenario: Successfully remove single asset from scene
    Given my scene has 5 placed assets
    And one asset has ID "asset-123"
    When I remove asset "asset-123" from the scene
    Then the asset is removed successfully
    And the scene should now have 4 placed assets

  @happy-path
  Scenario: Successfully remove all assets from scene
    Given my scene has 10 placed assets
    When I remove all assets from the scene
    Then all assets is removed successfully
    And the scene should have 0 placed assets

  @happy-path
  Scenario: Successfully remove asset and verify scene state
    Given my scene has placed asset "Dragon Token" at position X=100, Y=200
    When I remove the "Dragon Token" asset
    Then the asset is removed
    And attempting to move that asset should fail
    And the scene should not contain the asset

  @error-handling
  Scenario: Handle removing non-existent asset
    Given my scene has 3 placed assets
    And no asset with ID "asset-999" exists on the scene
    When I attempt to remove asset "asset-999"
    Then I should see error with not found error
    And I should see error "Asset not found on scene"

  @error-handling
  Scenario: Handle removing asset from non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to remove asset from scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @authorization
  Scenario: User cannot remove asset from scene they don't own
    Given a scene exists owned by another user
    And that scene has placed assets
    When I attempt to remove an asset from that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this scene"

  @edge-case
  Scenario: Remove asset from scene with single asset
    Given my scene has exactly 1 placed asset
    When I remove that asset
    Then the asset is removed successfully
    And the scene should have 0 placed assets

  @edge-case
  Scenario: Remove asset preserves stage and grid
    Given my scene has configured stage and grid
    And the scene has 3 placed assets
    When I remove one asset
    Then the asset is removed
    And the stage configuration should remain unchanged
    And the grid configuration should remain unchanged

  @integration
  Scenario: Remove asset preserves other assets
    Given my scene has 6 placed assets:
      | AssetID   | Name          | Position  |
      | asset-1   | Dragon        | 100, 200  |
      | asset-2   | Knight        | 300, 400  |
      | asset-3   | Tree          | 500, 600  |
      | asset-4   | Rock          | 700, 800  |
      | asset-5   | Tower         | 900, 1000 |
      | asset-6   | Chest         | 200, 300  |
    When I remove asset "asset-3"
    Then the scene should have 5 placed assets
    And assets 1, 2, 4, 5, and 6 should remain intact
    And their positions should be unchanged

  @integration
  Scenario: Remove and re-add asset
    Given my scene has asset "Dragon Token" at position X=100, Y=200
    When I remove the "Dragon Token" asset
    And I place the same asset template at position X=500, Y=600
    Then the scene should have the asset at new position
    And the new asset should have a different placement ID
