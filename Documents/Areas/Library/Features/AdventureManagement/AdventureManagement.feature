# Generated: 2025-10-02
# Feature-level BDD for Adventure Management
@feature @library @adventure-management
Feature: Adventure Management
  As a Game Master
  I want to manage individual game modules with encounters
  So that I can organize complete adventures within campaigns or standalone

  Background:
    Given I am authenticated as a Game Master
    And I have a valid media resource for adventure backgrounds

  # ═══════════════════════════════════════════════════════════════════════
  # HAPPY PATH SCENARIOS
  # ═══════════════════════════════════════════════════════════════════════

  @smoke @create
  Scenario: Create adventure within campaign
    Given I have an existing campaign
    When I create an adventure "Temple of Doom" within the campaign
    Then the adventure is created successfully
    And the adventure belongs to the campaign

  @smoke @create
  Scenario: Create standalone adventure
    When I create a standalone adventure "Wilderness Exploration"
    Then the adventure is created successfully
    And the adventure has no campaign association

  @create @type-categorization
  Scenario: Create adventure with dungeon crawl type
    Given I have an existing campaign
    When I create an adventure "Undermountain" with type "DungeonCrawl"
    Then the adventure is created successfully
    And the adventure type is "DungeonCrawl"

  @retrieve
  Scenario: Retrieve adventure details
    Given I have created an adventure "Lost Mines"
    When I retrieve the adventure by ID
    Then I receive the complete adventure details
    And the details include name, type, and campaign association

  @update
  Scenario: Update adventure properties including type
    Given I have created a "Generic" adventure "Starter Quest"
    When I update the name to "World Quest" and type to "OpenWorld"
    Then the adventure is updated successfully
    And the adventure name is "World Quest"
    And the adventure type is "OpenWorld"

  # ═══════════════════════════════════════════════════════════════════════
  # CLONING SCENARIOS
  # ═══════════════════════════════════════════════════════════════════════

  @clone @deep-copy
  Scenario: Clone adventure with all encounters
    Given I have created an adventure "Dragon's Lair" with 3 encounters
    When I clone the adventure as "Dragon's Lair - Copy"
    Then a new adventure is created with the cloned name
    And the new adventure contains 3 independent encounter copies
    And modifications to cloned encounters do not affect originals

  @clone @edge-case
  Scenario: Clone empty adventure
    Given I have created an adventure "Empty Module" with no encounters
    When I clone the adventure as "Empty Module - Copy"
    Then a new adventure is created with the cloned name
    And the new adventure contains no encounters

  # ═══════════════════════════════════════════════════════════════════════
  # BUSINESS RULES
  # ═══════════════════════════════════════════════════════════════════════

  @validation
  Rule: Adventure name must meet validation constraints

    Scenario: Reject adventure with empty name
      When I attempt to create an adventure with an empty name
      Then the creation fails with a validation error
      And the error indicates name is required

    Scenario: Reject adventure with name exceeding maximum length
      When I attempt to create an adventure with a 201-character name
      Then the creation fails with a validation error
      And the error indicates name exceeds maximum length

  @validation @type-categorization
  Rule: Adventure type must be valid enum value

    Scenario: Reject adventure with invalid type
      When I attempt to create an adventure with type "InvalidType"
      Then the creation fails with a validation error
      And the error indicates invalid adventure type

  # ═══════════════════════════════════════════════════════════════════════
  # HIERARCHY MANAGEMENT
  # ═══════════════════════════════════════════════════════════════════════

  @hierarchy @move-to-campaign
  Scenario: Move standalone adventure to campaign
    Given I have a standalone adventure "Rogue Gallery"
    And I have an existing campaign "Urban Legends"
    When I move the adventure to the campaign
    Then the adventure is associated with the campaign
    And the adventure is no longer standalone

  @hierarchy @make-standalone
  Scenario: Make adventure standalone
    Given I have an adventure "Side Quest" within a campaign
    When I make the adventure standalone
    Then the adventure has no campaign association
    And the adventure retains all its encounters

  @hierarchy @edge-case
  Scenario: Move adventure with many nested encounters
    Given I have a standalone adventure "Mega Dungeon" with 15 encounters
    And I have an existing campaign "World Saga"
    When I move the adventure to the campaign
    Then the adventure and all 15 encounters are moved successfully
    And all encounters remain accessible

  # ═══════════════════════════════════════════════════════════════════════
  # INTEGRATION SCENARIOS
  # ═══════════════════════════════════════════════════════════════════════

  @integration @cross-area @cascade-delete
  Scenario: Delete adventure cascades to all encounters
    Given I have created an adventure "Doomed Quest" with 5 encounters
    When I delete the adventure
    Then the adventure is deleted successfully
    And all 5 encounters are also deleted

  @integration @cross-area @campaign-reference
  Scenario: Reject adventure with non-existent campaign reference
    When I attempt to create an adventure within a non-existent campaign
    Then the creation fails with a validation error
    And the error indicates campaign does not exist

  @integration @cross-area @media-resource
  Scenario: Create adventure with valid background resource
    Given I have a valid image resource "forest-landscape.jpg"
    When I create an adventure "Forest Ambush" with the background resource
    Then the adventure is created successfully
    And the adventure background references the media resource

  # ═══════════════════════════════════════════════════════════════════════
  # AUTHORIZATION
  # ═══════════════════════════════════════════════════════════════════════

  @authorization
  Scenario: Only owner can update adventure
    Given another Game Master created an adventure "Their Quest"
    When I attempt to update the adventure name
    Then the update is rejected with an authorization error

  @authorization @clone
  Scenario: Only owner can clone adventure
    Given another Game Master created an adventure "Private Module"
    When I attempt to clone the adventure
    Then the cloning is rejected with an authorization error

  @authorization @delete
  Scenario: Only owner can delete adventure
    Given another Game Master created an adventure "Protected Quest"
    When I attempt to delete the adventure
    Then the deletion is rejected with an authorization error
