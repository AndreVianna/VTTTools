# Generated: 2025-10-02
# Use Case: Create Asset

Feature: Create Asset
  As a Game Master
  I want to create new reusable game asset templates
  So that I can build a content library reducing repetitive setup work

  Background:
    Given I am authenticated as a Game Master
    
    And I have a valid owner ID

  Rule: Asset name is required and cannot exceed 128 characters

    Scenario: Accept asset with valid name
      Given I provide name "Ancient Red Dragon"
      And I provide type "Creature"
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And the asset name should be "Ancient Red Dragon"

    Scenario: Reject asset with empty name
      Given I provide empty name
      And I provide type "Creature"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset name is required"

    Scenario: Reject asset with whitespace-only name
      Given I provide name "   "
      And I provide type "Creature"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset name is required"

    Scenario: Reject asset with name exceeding 128 characters
      Given I provide name with 129 characters
      And I provide type "Creature"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset name must not exceed 128 characters"

  Rule: Asset description cannot exceed 4096 characters

    Scenario: Accept asset with valid description
      Given I provide name "Dragon"
      And I provide description with 4000 characters
      When I create the asset
      Then I should see confirmation "Asset created" successfully

    Scenario: Accept asset with maximum description length
      Given I provide name "Dragon"
      And I provide description with exactly 4096 characters
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And the asset description should have 4096 characters

    Scenario: Reject asset with description exceeding maximum
      Given I provide name "Dragon"
      And I provide description with 4097 characters
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset description must not exceed 4096 characters"

  Rule: Asset type must be valid AssetType enum value

    Scenario: Accept valid asset type
      Given I provide name "Token"
      And I provide type "Token"
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And the asset type should be "Token"

    Scenario: Reject invalid asset type
      Given I provide name "Item"
      And I provide invalid type "InvalidType"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error message listing valid asset types

  Rule: Owner must reference existing User

    Scenario: Accept asset with valid owner
      Given I am authenticated with user ID "user-123"
      And user "user-123" exists in the system
      When I create an asset
      Then I should see confirmation "Asset created" successfully
      And the asset owner ID should be "user-123"

    Scenario: Reject asset with non-existent owner
      Given I provide owner ID "nonexistent-user"
      And user "nonexistent-user" does not exist
      When I attempt to create the asset
      Then I should see error with not found error
      And I should see error "User not found"

  Rule: Display resource must be an Image type if provided

    Scenario: Accept asset with valid image resource
      Given I provide name "Dragon"
      And I provide display resource referencing image "image-123"
      And resource "image-123" exists with type "Image"
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And the asset display should reference resource "image-123"

    Scenario: Reject asset with non-existent display resource
      Given I provide name "Dragon"
      And I provide display resource referencing "nonexistent-resource"
      And resource "nonexistent-resource" does not exist
      When I attempt to create the asset
      Then I should see error with not found error
      And I should see error "Display resource not found"

    Scenario: Reject asset with non-image display resource
      Given I provide name "Dragon"
      And I provide display resource referencing "audio-123"
      And resource "audio-123" exists with type "Audio"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Display resource must be an image"

  @happy-path
  Scenario: Successfully create asset with minimal data
    Given I provide name "Goblin Scout"
    And I provide type "Creature"
    When I create the asset
    Then I should see confirmation "Asset created" with generated ID
    And the asset should have IsPublished set to false
    And the asset should have IsPublic set to false
    And the asset description should be empty
    And the asset display should be null

  @happy-path
  Scenario: Successfully create asset with full data
    Given I provide name "Ancient Red Dragon"
    And I provide type "Creature"
    And I provide description "Legendary dragon with devastating flame breath"
    And I provide display resource with image "dragon-image"
    And I provide frame with shape "Circle" and color "#FF0000"
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset should have all provided properties
    And the asset display should include frame styling

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to create an asset
    Then I should see error with server error
    And I should see error "Failed to create asset"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out during creation
    When I attempt to create an asset
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"
    And my input should be preserved for retry

  @authorization
  Scenario: Unauthenticated user cannot create assets
    Given I am not authenticated
    When I attempt to create an asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Create asset with name at exactly 128 characters
    Given I provide name with exactly 128 characters
    And I provide type "Object"
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset name should have 128 characters

  @edge-case
  Scenario: Create asset with empty description
    Given I provide name "Simple Token"
    And I provide type "Token"
    And I provide empty description
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset description should be empty

  @edge-case
  Scenario: Create asset with frame but no display resource
    Given I provide name "Token"
    And I provide type "Token"
    And I provide frame styling without resource
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset display should be null

  @data-driven
  Scenario Outline: Create assets with all valid types
    Given I provide name "<name>"
    And I provide type "<type>"
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset type should be "<type>"

    Examples:
      | name              | type        |
      | Dragon Token      | Creature    |
      | Hero Character    | Character   |
      | Merchant NPC      | NPC         |
      | Treasure Chest    | Object      |
      | Stone Wall        | Wall        |
      | Wooden Door       | Door        |
      | Magic Effect      | Effect      |
      | Battle Music      | Music       |
