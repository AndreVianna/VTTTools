# Generated: 2025-10-02
# Feature-level BDD for Campaign Management
@feature @library @campaign-management
Feature: Campaign Management
  As a Game Master
  I want to manage multi-adventure storylines
  So that I can organize connected adventures within epics or standalone

  Background:
    Given I am authenticated as a Game Master
    And I have an active account

  @happy-path @create
  Scenario: Create campaign within epic
    Given I have created an epic called "Dragon's Legacy"
    When I create a campaign "Rise of the Dragon Lords" within epic "Dragon's Legacy"
    Then the campaign is created successfully
    And the campaign belongs to epic "Dragon's Legacy"

  @happy-path @create
  Scenario: Create standalone campaign
    When I create a standalone campaign "Shadows of the Forgotten Realm"
    Then the campaign is created successfully
    And the campaign has no parent epic

  @happy-path @retrieve
  Scenario: Retrieve campaign details
    Given I have created a campaign "The Elemental War"
    When I retrieve the campaign "The Elemental War"
    Then I see the campaign name "The Elemental War"
    And I see all campaign properties

  @happy-path @update
  Scenario: Update campaign properties
    Given I have created a campaign "The Lost Kingdom"
    When I update the campaign name to "The Rediscovered Kingdom"
    And I update the campaign background image
    Then the campaign reflects all changes

  @happy-path @query
  Scenario: Query campaigns by epic
    Given I have created an epic "Cosmic Chronicles"
    And I have created campaign "Starfall" within epic "Cosmic Chronicles"
    And I have created campaign "Nebula's End" within epic "Cosmic Chronicles"
    When I query campaigns for epic "Cosmic Chronicles"
    Then I see 2 campaigns
    And I see campaign "Starfall"
    And I see campaign "Nebula's End"

  @happy-path @query
  Scenario: Query standalone campaigns
    Given I have created standalone campaign "The Wanderer's Tale"
    And I have created standalone campaign "Echoes of Time"
    When I query standalone campaigns
    Then I see both standalone campaigns
    And neither campaign has a parent epic

  Rule: Campaign names must be between 1 and 200 characters

    @business-rule @validation
    Scenario: Cannot create campaign with empty name
      When I attempt to create a campaign with an empty name
      Then the campaign creation fails
      And I see a validation error about the name

    @business-rule @validation
    Scenario: Cannot create campaign with name exceeding 200 characters
      When I attempt to create a campaign with a 201 character name
      Then the campaign creation fails
      And I see a validation error about name length

  @hierarchy @move
  Scenario: Move standalone campaign to epic
    Given I have created standalone campaign "The Wastelands"
    And I have created an epic "Post-Apocalypse Saga"
    When I move campaign "The Wastelands" to epic "Post-Apocalypse Saga"
    Then the campaign now belongs to epic "Post-Apocalypse Saga"

  @hierarchy @move
  Scenario: Make campaign standalone
    Given I have created an epic "The Winter's Tale"
    And I have created campaign "Frozen Kingdoms" within epic "The Winter's Tale"
    When I make campaign "Frozen Kingdoms" standalone
    Then the campaign has no parent epic

  @hierarchy @error
  Scenario: Cannot move campaign to non-existent epic
    Given I have created standalone campaign "Orphaned Stories"
    When I attempt to move campaign "Orphaned Stories" to a non-existent epic
    Then the operation fails
    And I see an error indicating the epic does not exist

  @integration @cross-area @cascade
  Scenario: Delete campaign cascades to adventures
    Given I have created campaign "The Cursed Lands"
    And I have added adventure "Village of Sorrow" to campaign "The Cursed Lands"
    And I have added adventure "Castle of Darkness" to campaign "The Cursed Lands"
    When I delete campaign "The Cursed Lands"
    Then the campaign is deleted
    And all adventures in the campaign are deleted

  @integration @cross-area @validation
  Scenario: Create campaign references valid epic
    Given I have created an epic "Legends of the North"
    When I create a campaign "Northern Lights" within epic "Legends of the North"
    Then the campaign is linked to epic "Legends of the North"
    And the epic reference is validated

  @integration @cross-area @media
  Scenario: Create campaign with background resource
    Given I have uploaded an image resource "epic-landscape.jpg"
    When I create a campaign "Vast Horizons" with background "epic-landscape.jpg"
    Then the campaign is created successfully
    And the background resource is validated and linked

  @authorization
  Scenario: Only owner can update campaign
    Given I have created campaign "My Private Story"
    And another Game Master exists
    When the other Game Master attempts to update my campaign
    Then the update is denied
    And I see an authorization error

  @authorization
  Scenario: Only owner can delete campaign
    Given I have created campaign "Precious Memories"
    And another Game Master exists
    When the other Game Master attempts to delete my campaign
    Then the deletion is denied
    And I see an authorization error

  @authorization @hierarchy
  Scenario: Only owner can move campaign between hierarchy levels
    Given I have created standalone campaign "Independent Adventure"
    And another Game Master has created an epic "Their Epic"
    When the other Game Master attempts to move my campaign to their epic
    Then the operation is denied
    And I see an authorization error

  @edge-case
  Scenario: Create campaign without adventures
    When I create a campaign "Empty Canvas"
    Then the campaign is created successfully
    And the campaign contains no adventures

  @edge-case @optional
  Scenario: Create standalone campaign without background
    When I create a standalone campaign "Minimalist Tale" without a background
    Then the campaign is created successfully
    And the campaign has no background image

  @edge-case @hierarchy
  Scenario: Move campaign with nested adventures
    Given I have created standalone campaign "The Deep Archive"
    And I have added 5 adventures with complex encounters to campaign "The Deep Archive"
    And I have created an epic "Master Archive"
    When I move campaign "The Deep Archive" to epic "Master Archive"
    Then the campaign and all nested adventures are moved successfully
    And all adventure references remain valid
