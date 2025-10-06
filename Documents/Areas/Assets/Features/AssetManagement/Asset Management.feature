# Generated: 2025-10-02
# Feature: Asset Management

Feature: Asset Management
  As a Game Master
  I want to manage reusable game asset templates
  So that I can organize and maintain my library of game assets for use in adventures and scenes

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Assets must have valid names and descriptions

    Scenario: Accept asset with valid name and description
      Given I provide name "Ancient Dragon" with 13 characters
      And I provide description "Legendary creature" with 18 characters
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And I should see the asset in my library

    Scenario: Reject asset with empty name
      Given I provide empty name
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset name is required"

    Scenario: Reject asset with name exceeding 128 characters
      Given I provide name with 129 characters
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset name must not exceed 128 characters"

    Scenario: Reject asset with description exceeding 4096 characters
      Given I provide valid name "Dragon"
      And I provide description with 4097 characters
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error "Asset description must not exceed 4096 characters"

  Rule: Asset type must be valid AssetType enum value

    Scenario: Accept asset with valid type
      Given I provide name "Goblin" and type "Creature"
      When I create the asset
      Then I should see confirmation "Asset created" successfully
      And the asset type should be "Creature"

    Scenario: Reject asset with invalid type
      Given I provide name "Token" and invalid type "InvalidType"
      When I attempt to create the asset
      Then I should see error with validation error
      And I should see error containing valid asset types

  @happy-path
  Scenario: Successfully create complete asset with all properties
    Given I am authenticated as a Game Master
    And I provide name "Red Dragon Token"
    And I provide type "Creature"
    And I provide description "Legendary red dragon miniature"
    And I provide display resource with valid image
    When I create the asset
    Then I should see confirmation "Asset created" with generated ID
    And the asset should have IsPublished set to false
    And the asset should have IsPublic set to false
    And I should be set as the owner

  @error-handling
  Scenario: Handle service unavailable during asset creation
    Given the Assets service is unavailable
    When I attempt to create an asset
    Then I should see error with service error
    And I should see error "Service temporarily unavailable"
    And my input data should be preserved for retry

  @error-handling
  Scenario: Handle invalid owner reference
    Given I provide valid asset data
    And the owner ID references non-existent user
    When I attempt to create the asset
    Then I should see error with not found error
    And I should see error "User not found"

  @error-handling
  Scenario: Handle invalid display resource reference
    Given I provide valid asset data
    And I provide display resource with non-existent resource ID
    When I attempt to create the asset
    Then I should see error with not found error
    And I should see error "Display resource not found"

  @error-handling
  Scenario: Handle display resource with wrong type
    Given I provide valid asset data
    And I provide display resource referencing audio file instead of image
    When I attempt to create the asset
    Then I should see error with validation error
    And I should see error "Display resource must be an image"

  @edge-case
  Scenario: Create asset with maximum allowed name length
    Given I provide name with exactly 128 characters
    And I provide valid type "Object"
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset name should have 128 characters

  @edge-case
  Scenario: Create asset with maximum allowed description length
    Given I provide valid name "Large Object"
    And I provide description with exactly 4096 characters
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset description should have 4096 characters

  @edge-case
  Scenario: Create minimal asset with only required fields
    Given I provide name "Simple Token"
    And I provide type "Token"
    When I create the asset
    Then I should see confirmation "Asset created" successfully
    And the asset description should be empty
    And the asset display should be null

  @authorization
  Scenario: Unauthorized user cannot create assets
    Given I am not authenticated
    When I attempt to create an asset
    Then I should see error with unauthorized error
    And I should be redirected to login

  @data-driven
  Scenario Outline: Validate asset creation with different types
    Given I provide name "Test Asset"
    And I provide type "<assetType>"
    When I create the asset
    Then the result should be "<result>"
    And the asset type should be "<assetType>"

    Examples:
      | assetType   | result  |
      | Creature    | success |
      | Character   | success |
      | NPC         | success |
      | Object      | success |
      | Token       | success |
      | Wall        | success |
      | Door        | success |
      | Effect      | success |

  @integration
  Scenario: Asset creation integrates with Identity for ownership
    Given I am authenticated with user ID "user-guid-123"
    And I create an asset with name "Integration Test"
    When the asset is persisted
    Then the asset owner ID should be "user-guid-123"
    And the owner should be able to query their assets

  @integration
  Scenario: Asset creation validates Media resource reference
    Given I am authenticated as a Game Master
    And a valid image resource exists with ID "resource-guid-456"
    When I create an asset with display resource ID "resource-guid-456"
    Then I should see confirmation "Asset created" successfully
    And the asset display should reference resource "resource-guid-456"
