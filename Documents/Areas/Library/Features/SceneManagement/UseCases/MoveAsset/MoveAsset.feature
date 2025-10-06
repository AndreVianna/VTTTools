# Generated: 2025-10-02
# Use Case: Move Asset

Feature: Move Asset
  As a Game Master
  I want to move placed assets on a scene
  So that I can reposition and adjust asset placements during scene design

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    And the scene has placed assets
    

  @happy-path
  Scenario: Successfully move asset to new position
    Given my scene has asset at position X=100, Y=200
    When I move the asset to position X=500, Y=600
    Then the asset should be moved successfully
    And the asset position should be X=500, Y=600

  @happy-path
  Scenario: Successfully update asset dimensions
    Given my scene has asset with width 100 and height 100
    When I update the asset dimensions to width 150 and height 150
    Then the asset is updated successfully
    And the dimensions should be width 150 and height 150

  @happy-path
  Scenario: Successfully update asset Z-index
    Given my scene has asset with Z-index 0
    When I update the asset Z-index to 10
    Then the asset is updated successfully
    And the Z-index should be 10

  @happy-path
  Scenario: Successfully rotate asset
    Given my scene has asset with rotation 0
    When I rotate the asset to 90 degrees
    Then the asset is updated successfully
    And the rotation should be 90 degrees

  @happy-path
  Scenario: Successfully update multiple asset properties
    Given my scene has placed asset
    When I update the asset with:
      | Property  | Value |
      | X         | 750   |
      | Y         | 450   |
      | Width     | 120   |
      | Height    | 120   |
      | ZIndex    | 8     |
      | Rotation  | 180   |
    Then the asset is updated successfully
    And all properties should be set correctly

  @error-handling
  Scenario: Handle moving non-existent asset
    Given no asset with ID "asset-999" exists on my scene
    When I attempt to move asset "asset-999"
    Then I should see error with not found error
    And I should see error "Asset not found on scene"

  @error-handling
  Scenario: Handle moving asset on non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to move asset on scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @authorization
  Scenario: User cannot move asset on scene they don't own
    Given a scene exists owned by another user
    And that scene has placed assets
    When I attempt to move an asset on that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this scene"

  @edge-case
  Scenario: Move asset to negative coordinates
    Given my scene has asset at position X=100, Y=100
    When I move the asset to position X=-50, Y=-75
    Then the asset should be moved successfully
    And the position should be X=-50, Y=-75

  @edge-case
  Scenario: Move asset outside stage bounds
    Given my scene has stage width 1920 and height 1080
    And the scene has asset at position X=500, Y=500
    When I move the asset to position X=2500, Y=1500
    Then the asset should be moved successfully
    And the position should be preserved

  @edge-case
  Scenario: Rotate asset 360 degrees
    Given my scene has asset with rotation 0
    When I rotate the asset to 360 degrees
    Then the asset is updated successfully
    And the rotation should be 360 degrees

  @integration
  Scenario: Move asset preserves other assets
    Given my scene has 5 placed assets
    When I move the first asset to new position
    Then the first asset should be at new position
    And the other 4 assets should remain unchanged

  @data-driven
  Scenario Outline: Move asset with different rotations
    Given my scene has placed asset
    When I rotate the asset to <rotation> degrees
    Then the asset is updated successfully
    And the rotation should be <rotation> degrees

    Examples:
      | rotation |
      | 0        |
      | 45       |
      | 90       |
      | 180      |
      | 270      |
      | 360      |
