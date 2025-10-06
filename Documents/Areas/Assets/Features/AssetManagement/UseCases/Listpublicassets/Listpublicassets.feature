# Generated: 2025-10-02
# Use Case: List Public Assets

Feature: List Public Assets
  As a Game Master
  I want to browse publicly available assets
  So that I can discover and use community-shared content

  Background:
    Given the Assets service is operational

  Rule: Only assets with IsPublic=true should be returned

    Scenario: List includes only public assets
      Given assets exist with different visibility:
        | id       | isPublic | isPublished | owner   |
        | asset-1  | true     | true        | user-1  |
        | asset-2  | false    | false       | user-2  |
        | asset-3  | true     | false       | user-3  |
      When I request public assets
      Then I should receive 2 assets
      And all returned assets should have IsPublic set to true
      And asset "asset-2" should not be in the results

  @happy-path
  Scenario: Successfully retrieve public asset catalog
    Given public assets exist in the system:
      | id       | name            | type      | owner   |
      | asset-1  | Shared Dragon   | Creature  | user-1  |
      | asset-2  | Public Wall     | Wall      | user-2  |
      | asset-3  | Community Token | Token     | user-3  |
    When I request public assets
    Then I should receive 3 assets
    And all assets should be publicly accessible

  @happy-path
  Scenario: Empty result when no public assets exist
    Given no public assets exist in the system
    When I request public assets
    Then I should receive an empty array
    And I should receive 200 OK status

  @authorization
  Scenario: Unauthenticated users can view public assets
    Given I am not authenticated
    And public assets exist
    When I request public assets
    Then I should receive the public asset list
    And no authentication should be required

  @authorization
  Scenario: Authenticated users can view public assets
    Given I am authenticated as a Game Master
    And public assets exist
    When I request public assets
    Then I should receive the public asset list
    And I should see assets from all users

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request public assets
    Then I should see error with server error
    And I should see error "Failed to retrieve assets"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to request public assets
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @edge-case
  Scenario: List excludes unpublished public assets
    Given assets exist:
      | id       | isPublic | isPublished |
      | asset-1  | true     | true        |
      | asset-2  | true     | false       |
    When I request only published public assets
    Then I should receive 1 asset
    And only asset "asset-1" should be returned

  @edge-case
  Scenario: List includes public assets from all owners
    Given public assets exist owned by different users:
      | id       | owner   |
      | asset-1  | user-1  |
      | asset-2  | user-2  |
      | asset-3  | user-3  |
    When I request public assets
    Then I should receive assets from all 3 owners
    And ownership should not affect visibility

  @pagination
  Scenario: List public assets with pagination
    Given 100 public assets exist
    When I request public assets with page size 20
    Then I should receive 20 assets per page
    And pagination metadata should indicate total count of 100

  @filtering
  Scenario: Filter public assets by type
    Given public assets exist with different types:
      | id       | type      |
      | asset-1  | Creature  |
      | asset-2  | Creature  |
      | asset-3  | Wall      |
    When I request public assets filtered by type "Creature"
    Then I should receive 2 assets
    And all returned assets should be type "Creature"

  @filtering
  Scenario: Filter public assets by published status
    Given public assets exist:
      | id       | isPublished |
      | asset-1  | true        |
      | asset-2  | false       |
      | asset-3  | true        |
    When I request public assets filtered by IsPublished=true
    Then I should receive 2 assets
    And all returned assets is published

  @sorting
  Scenario: Sort public assets by name
    Given public assets exist:
      | name            |
      | Zebra Token     |
      | Apple Wall      |
      | Dragon Creature |
    When I request public assets sorted by name ascending
    Then assets should be ordered: Apple Wall, Dragon Creature, Zebra Token

  @sorting
  Scenario: Sort public assets by creation date
    Given public assets exist with creation dates:
      | name    | createdAt  |
      | Asset A | 2025-01-03 |
      | Asset B | 2025-01-01 |
      | Asset C | 2025-01-02 |
    When I request public assets sorted by creation date descending
    Then assets should be ordered: Asset A, Asset C, Asset B

  @performance
  Scenario: Query completes within performance threshold
    Given 500 public assets exist
    When I request public assets
    Then the response should be received within 1 second
    And all asset data should be complete

  @integration
  Scenario: Public assets include valid display resources
    Given public assets exist with display resources:
      | id       | displayResourceId |
      | asset-1  | resource-123      |
      | asset-2  | resource-456      |
    When I request public assets
    Then all display resources should reference valid Media resources
    And display resource types should be Image

  @data-driven
  Scenario Outline: List public assets with different filter combinations
    Given public assets exist with various properties
    When I request public assets with type "<type>" and published "<published>"
    Then I should receive only matching assets

    Examples:
      | type      | published | expectedCount |
      | Creature  | true      | 5             |
      | Creature  | false     | 3             |
      | Wall      | true      | 2             |
      | any       | true      | 12            |
