# Generated: 2025-10-02
# Use Case: Remove Asset

Feature: Remove Asset
  As a Game Master
  I want to remove placed assets from a encounter
  So that I can manage encounter composition and remove unwanted placements

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    And the encounter has placed assets
    

  @happy-path
  Scenario: Successfully remove single asset from encounter
    Given my encounter has 5 placed assets
    And one asset has ID "asset-123"
    When I remove asset "asset-123" from the encounter
    Then the asset is removed successfully
    And the encounter should now have 4 placed assets

  @happy-path
  Scenario: Successfully remove all assets from encounter
    Given my encounter has 10 placed assets
    When I remove all assets from the encounter
    Then all assets is removed successfully
    And the encounter should have 0 placed assets

  @happy-path
  Scenario: Successfully remove asset and verify encounter state
    Given my encounter has placed asset "Dragon Token" at position X=100, Y=200
    When I remove the "Dragon Token" asset
    Then the asset is removed
    And attempting to move that asset should fail
    And the encounter should not contain the asset

  @error-handling
  Scenario: Handle removing non-existent asset
    Given my encounter has 3 placed assets
    And no asset with ID "asset-999" exists on the encounter
    When I attempt to remove asset "asset-999"
    Then I should see error with not found error
    And I should see error "Asset not found on encounter"

  @error-handling
  Scenario: Handle removing asset from non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to remove asset from encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @authorization
  Scenario: User cannot remove asset from encounter they don't own
    Given a encounter exists owned by another user
    And that encounter has placed assets
    When I attempt to remove an asset from that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this encounter"

  @edge-case
  Scenario: Remove asset from encounter with single asset
    Given my encounter has exactly 1 placed asset
    When I remove that asset
    Then the asset is removed successfully
    And the encounter should have 0 placed assets

  @edge-case
  Scenario: Remove asset preserves stage and grid
    Given my encounter has configured stage and grid
    And the encounter has 3 placed assets
    When I remove one asset
    Then the asset is removed
    And the stage configuration should remain unchanged
    And the grid configuration should remain unchanged

  @integration
  Scenario: Remove asset preserves other assets
    Given my encounter has 6 placed assets:
      | AssetID   | Name          | Position  |
      | asset-1   | Dragon        | 100, 200  |
      | asset-2   | Knight        | 300, 400  |
      | asset-3   | Tree          | 500, 600  |
      | asset-4   | Rock          | 700, 800  |
      | asset-5   | Tower         | 900, 1000 |
      | asset-6   | Chest         | 200, 300  |
    When I remove asset "asset-3"
    Then the encounter should have 5 placed assets
    And assets 1, 2, 4, 5, and 6 should remain intact
    And their positions should be unchanged

  @integration
  Scenario: Remove and re-add asset
    Given my encounter has asset "Dragon Token" at position X=100, Y=200
    When I remove the "Dragon Token" asset
    And I place the same asset template at position X=500, Y=600
    Then the encounter should have the asset at new position
    And the new asset should have a different placement ID
