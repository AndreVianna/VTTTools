# Generated: 2025-10-02
# Use Case: List Assets By Type

Feature: List Assets By Type
  As a Game Master
  I want to filter assets by their type
  So that I can find specific categories of assets for my game

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Type parameter must be valid AssetType enum value

    Scenario: Accept valid asset type filter
      Given assets exist with type "Creature"
      When I request assets filtered by type "Creature"
      Then I should receive only assets of type "Creature"

    Scenario: Reject invalid asset type filter
      Given I provide invalid type "InvalidType"
      When I attempt to request assets by type
      Then I should see error with validation error
      And I should see error message listing valid asset types

  Rule: User can only see their own or public assets filtered by type

    Scenario: Owner sees their assets of specified type
      Given I am authenticated with user ID "user-123"
      And I own assets of type "Creature"
      When I request my assets filtered by type "Creature"
      Then I should receive only my Creature assets

    Scenario: User sees public assets of specified type
      Given public assets exist of type "Wall"
      When I request public assets filtered by type "Wall"
      Then I should receive only public Wall assets

    Scenario: Admin sees all assets of specified type
      Given I am authenticated as an admin
      And assets exist owned by different users of type "Effect"
      When I request all assets filtered by type "Effect"
      Then I should receive Effect assets from all owners

  @happy-path
  Scenario: Successfully filter assets by Creature type
    Given assets exist:
      | id       | type      | owner   | isPublic |
      | asset-1  | Creature  | user-1  | true     |
      | asset-2  | Wall      | user-1  | true     |
      | asset-3  | Creature  | user-2  | true     |
      | asset-4  | Token     | user-1  | false    |
    And I am authenticated with user ID "user-1"
    When I request assets filtered by type "Creature"
    Then I should receive 2 Creature assets
    And asset "asset-2" and "asset-4" should not be in results

  @happy-path
  Scenario: Empty result when no assets of specified type exist
    Given no assets exist of type "Music"
    When I request assets filtered by type "Music"
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request assets by type
    Then I should see error with server error
    And I should see error "Failed to retrieve assets"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to request assets by type
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user sees only public assets by type
    Given I am not authenticated
    And assets exist of type "Token":
      | id       | isPublic |
      | asset-1  | true     |
      | asset-2  | false    |
    When I request assets filtered by type "Token"
    Then I should receive 1 asset
    And only public assets should be returned

  @edge-case
  Scenario: Filter handles all 15 valid asset types
    Given assets exist for all valid types
    When I request assets filtered by each type sequentially
    Then each query should return only assets of the specified type

  @edge-case
  Scenario: Filter with type returns mixed ownership when public
    Given public assets exist of type "Door":
      | id       | owner   |
      | asset-1  | user-1  |
      | asset-2  | user-2  |
      | asset-3  | user-3  |
    When I request public assets filtered by type "Door"
    Then I should receive 3 Door assets from different owners

  @pagination
  Scenario: Filter by type with pagination
    Given 100 assets exist of type "Creature"
    When I request Creature assets with page size 25
    Then I should receive 25 assets per page
    And all assets should be of type "Creature"

  @sorting
  Scenario: Sort filtered assets by name
    Given assets exist of type "Creature":
      | name            |
      | Zebra Beast     |
      | Ancient Dragon  |
      | Goblin Warrior  |
    When I request Creature assets sorted by name ascending
    Then assets should be ordered: Ancient Dragon, Goblin Warrior, Zebra Beast

  @performance
  Scenario: Type filter query completes within performance threshold
    Given 1000 assets exist with various types
    And 200 assets are of type "Creature"
    When I request assets filtered by type "Creature"
    Then the response should be received within 500ms
    And exactly 200 assets should be returned

  @integration
  Scenario: Filtered assets include valid display resources
    Given assets exist of type "Token" with display resources
    When I request assets filtered by type "Token"
    Then all returned assets should have type "Token"
    And display resources should reference valid Media resources

  @data-driven
  Scenario Outline: Filter assets by different types
    Given assets exist with type "<assetType>"
    When I request assets filtered by type "<assetType>"
    Then I should receive only assets of type "<assetType>"
    And the count should match expected "<count>"

    Examples:
      | assetType   | count |
      | Creature    | 15    |
      | Character   | 8     |
      | NPC         | 12    |
      | Object      | 20    |
      | Wall        | 10    |
      | Door        | 5     |
      | Effect      | 7     |
      | Token       | 25    |

  @data-driven
  Scenario Outline: Combine type filter with visibility
    Given I am authenticated with user ID "<userId>"
    And assets exist:
      | type     | owner    | isPublic |
      | Creature | user-1   | true     |
      | Creature | user-1   | false    |
      | Creature | user-2   | true     |
      | Creature | user-2   | false    |
    When I request assets filtered by type "Creature"
    Then I should receive "<count>" assets

    Examples:
      | userId  | count | note                                    |
      | user-1  | 3     | Own private + own public + others public|
      | user-2  | 3     | Own private + own public + others public|
      | admin-1 | 4     | Admin sees all                          |
