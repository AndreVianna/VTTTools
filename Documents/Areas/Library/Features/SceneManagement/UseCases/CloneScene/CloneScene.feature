# Generated: 2025-10-02
# Use Case: Clone Scene

Feature: Clone Scene
  As a Game Master
  I want to clone an existing scene with all its components
  So that I can reuse scene configurations for different encounters

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    

  Rule: Cloning creates deep copy with new unique IDs

    Scenario: Clone scene creates new unique ID
      Given my scene has ID "550e8400-e29b-41d4-a716-446655440000"
      When I clone the scene
      Then a new scene should be created
      And the new scene should have a different ID
      And the original scene should remain unchanged

    Scenario: Clone scene duplicates stage configuration
      Given my scene has stage with background and dimensions
      When I clone the scene
      Then the cloned scene should have identical stage configuration
      And the stage should be a separate instance

    Scenario: Clone scene duplicates grid configuration
      Given my scene has configured grid
      When I clone the scene
      Then the cloned scene should have identical grid configuration
      And the grid should be a separate instance

    Scenario: Clone scene duplicates all asset placements
      Given my scene has 8 placed assets
      When I clone the scene
      Then the cloned scene should have 8 placed assets
      And each cloned asset should have new unique ID
      And each asset should have same position and properties

  @happy-path
  Scenario: Successfully clone scene with all properties
    Given my scene has:
      | Property     | Value                      |
      | Name         | Original Battle Map        |
      | Description  | Original description       |
      | IsPublished  | true                       |
      | IsPublic     | true                       |
    When I clone the scene
    Then the cloned scene should have:
      | Property     | Value                           |
      | Name         | Original Battle Map (Copy)      |
      | Description  | Original description            |
      | IsPublished  | false                           |
      | IsPublic     | false                           |

  @happy-path
  Scenario: Successfully clone scene with complete composition
    Given my scene has:
      | Component | Configuration          |
      | Stage     | 1920x1080, background  |
      | Grid      | Square, size 50        |
      | Assets    | 12 placed              |
    When I clone the scene
    Then the cloned scene should have identical stage
    And the cloned scene should have identical grid
    And the cloned scene should have 12 placed assets
    And all configurations should match

  @happy-path
  Scenario: Successfully clone standalone scene
    Given my scene is standalone with null AdventureId
    When I clone the scene
    Then the cloned scene should also be standalone
    And the AdventureId should be null

  @happy-path
  Scenario: Successfully clone scene in adventure
    Given my scene is in adventure "550e8400-e29b-41d4-a716-446655440000"
    When I clone the scene
    Then the cloned scene should reference the same adventure
    And the AdventureId should be "550e8400-e29b-41d4-a716-446655440000"

  @error-handling
  Scenario: Handle cloning non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to clone scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @error-handling
  Scenario: Handle database failure during clone
    Given my scene exists with stage, grid, and assets
    And the database is unavailable
    When I attempt to clone the scene
    Then I should see error with server error
    And I should see error "Failed to clone scene"

  @authorization
  Scenario: User cannot clone scene they don't own
    Given a scene exists owned by another user
    When I attempt to clone that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to clone this scene"

  @edge-case
  Scenario: Clone scene with no assets
    Given my scene has stage and grid but no assets
    When I clone the scene
    Then the cloned scene is created
    And the cloned scene should have no assets

  @edge-case
  Scenario: Clone scene with maximum assets
    Given my scene has 100 placed assets
    When I clone the scene
    Then the cloned scene should have 100 placed assets
    And all assets should be properly duplicated
    And the operation should complete within acceptable time

  @integration
  Scenario: Clone scene and verify independence from original
    Given my scene has stage, grid, and 5 assets
    When I clone the scene
    And I update the original scene name to "Original Modified"
    And I update the cloned scene name to "Clone Modified"
    And I move an asset in the original scene
    Then the original scene should have name "Original Modified"
    And the cloned scene should have name "Clone Modified"
    And the asset positions should differ between scenes
    And changes should not affect each other

  @data-driven
  Scenario Outline: Clone scenes with different grid types
    Given my scene has grid type "<grid_type>"
    And the scene has <asset_count> placed assets
    When I clone the scene
    Then the cloned scene should have grid type "<grid_type>"
    And the cloned scene should have <asset_count> placed assets

    Examples:
      | grid_type  | asset_count |
      | Square     | 5           |
      | Hexagonal  | 8           |
      | Isometric  | 10          |
      | None       | 3           |
