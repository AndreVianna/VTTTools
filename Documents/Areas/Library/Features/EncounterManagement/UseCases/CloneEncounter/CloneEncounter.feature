# Generated: 2025-10-02
# Use Case: Clone Encounter

Feature: Clone Encounter
  As a Game Master
  I want to clone an existing encounter with all its components
  So that I can reuse encounter configurations for different encounters

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    

  Rule: Cloning creates deep copy with new unique IDs

    Scenario: Clone encounter creates new unique ID
      Given my encounter has ID "550e8400-e29b-41d4-a716-446655440000"
      When I clone the encounter
      Then a new encounter should be created
      And the new encounter should have a different ID
      And the original encounter should remain unchanged

    Scenario: Clone encounter duplicates stage configuration
      Given my encounter has stage with background and dimensions
      When I clone the encounter
      Then the cloned encounter should have identical stage configuration
      And the stage should be a separate instance

    Scenario: Clone encounter duplicates grid configuration
      Given my encounter has configured grid
      When I clone the encounter
      Then the cloned encounter should have identical grid configuration
      And the grid should be a separate instance

    Scenario: Clone encounter duplicates all asset placements
      Given my encounter has 8 placed assets
      When I clone the encounter
      Then the cloned encounter should have 8 placed assets
      And each cloned asset should have new unique ID
      And each asset should have same position and properties

  @happy-path
  Scenario: Successfully clone encounter with all properties
    Given my encounter has:
      | Property     | Value                      |
      | Name         | Original Battle Map        |
      | Description  | Original description       |
      | IsPublished  | true                       |
      | IsPublic     | true                       |
    When I clone the encounter
    Then the cloned encounter should have:
      | Property     | Value                           |
      | Name         | Original Battle Map (Copy)      |
      | Description  | Original description            |
      | IsPublished  | false                           |
      | IsPublic     | false                           |

  @happy-path
  Scenario: Successfully clone encounter with complete composition
    Given my encounter has:
      | Component | Configuration          |
      | Stage     | 1920x1080, background  |
      | Grid      | Square, size 50        |
      | Assets    | 12 placed              |
    When I clone the encounter
    Then the cloned encounter should have identical stage
    And the cloned encounter should have identical grid
    And the cloned encounter should have 12 placed assets
    And all configurations should match

  @happy-path
  Scenario: Successfully clone standalone encounter
    Given my encounter is standalone with null AdventureId
    When I clone the encounter
    Then the cloned encounter should also be standalone
    And the AdventureId should be null

  @happy-path
  Scenario: Successfully clone encounter in adventure
    Given my encounter is in adventure "550e8400-e29b-41d4-a716-446655440000"
    When I clone the encounter
    Then the cloned encounter should reference the same adventure
    And the AdventureId should be "550e8400-e29b-41d4-a716-446655440000"

  @error-handling
  Scenario: Handle cloning non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to clone encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @error-handling
  Scenario: Handle database failure during clone
    Given my encounter exists with stage, grid, and assets
    And the database is unavailable
    When I attempt to clone the encounter
    Then I should see error with server error
    And I should see error "Failed to clone encounter"

  @authorization
  Scenario: User cannot clone encounter they don't own
    Given a encounter exists owned by another user
    When I attempt to clone that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to clone this encounter"

  @edge-case
  Scenario: Clone encounter with no assets
    Given my encounter has stage and grid but no assets
    When I clone the encounter
    Then the cloned encounter is created
    And the cloned encounter should have no assets

  @edge-case
  Scenario: Clone encounter with maximum assets
    Given my encounter has 100 placed assets
    When I clone the encounter
    Then the cloned encounter should have 100 placed assets
    And all assets should be properly duplicated
    And the operation should complete within acceptable time

  @integration
  Scenario: Clone encounter and verify independence from original
    Given my encounter has stage, grid, and 5 assets
    When I clone the encounter
    And I update the original encounter name to "Original Modified"
    And I update the cloned encounter name to "Clone Modified"
    And I move an asset in the original encounter
    Then the original encounter should have name "Original Modified"
    And the cloned encounter should have name "Clone Modified"
    And the asset positions should differ between encounters
    And changes should not affect each other

  @data-driven
  Scenario Outline: Clone encounters with different grid types
    Given my encounter has grid type "<grid_type>"
    And the encounter has <asset_count> placed assets
    When I clone the encounter
    Then the cloned encounter should have grid type "<grid_type>"
    And the cloned encounter should have <asset_count> placed assets

    Examples:
      | grid_type  | asset_count |
      | Square     | 5           |
      | Hexagonal  | 8           |
      | Isometric  | 10          |
      | None       | 3           |
