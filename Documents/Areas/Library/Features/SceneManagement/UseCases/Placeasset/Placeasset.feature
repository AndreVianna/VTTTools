# Generated: 2025-10-02
# Use Case: Place Asset

Feature: Place Asset
  As a Game Master
  I want to place asset instances on a scene
  So that I can populate tactical maps with tokens and objects

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    

  Rule: Asset must reference valid asset template

    Scenario: Place asset with valid template reference
      Given my scene exists
      And a valid asset template exists
      When I place the asset at position X=100, Y=200
      Then the asset should be placed successfully
      And the asset should reference the correct template

    Scenario: Reject placing asset with invalid template
      Given my scene exists
      When I attempt to place asset with non-existent template ID
      Then I should see error with not found error
      And I should see error "Asset template not found"

  @happy-path
  Scenario: Successfully place asset with position
    Given my scene has configured stage
    And I have asset template "Dragon Token"
    When I place the asset at:
      | Property | Value |
      | X        | 500   |
      | Y        | 300   |
    Then the asset should be placed on the scene
    And the asset position should be X=500, Y=300

  @happy-path
  Scenario: Successfully place asset with full properties
    Given my scene exists
    And I have asset template
    When I place the asset with:
      | Property  | Value |
      | X         | 400   |
      | Y         | 250   |
      | Width     | 100   |
      | Height    | 100   |
      | ZIndex    | 5     |
      | Rotation  | 45    |
    Then the asset should be placed successfully
    And all asset properties should be set correctly

  @happy-path
  Scenario: Successfully place multiple assets on scene
    Given my scene exists
    And I have 3 asset templates
    When I place all 3 assets at different positions
    Then all 3 assets should be placed successfully
    And each should have unique position

  @error-handling
  Scenario: Handle placing asset on non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to place asset on scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @authorization
  Scenario: User cannot place asset on scene they don't own
    Given a scene exists owned by another user
    And I have asset template
    When I attempt to place asset on that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this scene"

  @edge-case
  Scenario: Place asset at zero coordinates
    Given my scene exists
    And I have asset template
    When I place the asset at position X=0, Y=0
    Then the asset should be placed successfully
    And the position should be at origin

  @edge-case
  Scenario: Place asset outside stage bounds
    Given my scene has stage width 1920 and height 1080
    And I have asset template
    When I place the asset at position X=2500, Y=1500
    Then the asset should be placed successfully
    And the position should be preserved

  @edge-case
  Scenario: Place asset with negative Z-index
    Given my scene exists
    And I have asset template
    When I place the asset with Z-index of -5
    Then the asset should be placed successfully
    And the Z-index should be -5

  @integration
  Scenario: Place asset and verify scene asset collection
    Given my scene has 5 placed assets
    And I have a new asset template
    When I place the new asset on the scene
    Then the scene should now have 6 placed assets
    And the new asset should appear in the collection

  @data-driven
  Scenario Outline: Place assets with different dimensions
    Given my scene exists
    And I have asset template
    When I place the asset with width <width> and height <height>
    Then the asset should be placed successfully
    And the dimensions should be width <width> and height <height>

    Examples:
      | width | height |
      | 50    | 50     |
      | 100   | 100    |
      | 200   | 150    |
      | 64    | 64     |
