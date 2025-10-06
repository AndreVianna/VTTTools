# Generated: 2025-10-02
# Use Case: List Assets By Owner

Feature: List Assets By Owner
  As a Game Master
  I want to view all assets I own
  So that I can manage my personal asset library

  Background:
    Given I am authenticated as a Game Master
    

  Rule: User can only list their own assets unless admin

    Scenario: Owner can list their own assets
      Given I am authenticated with user ID "user-123"
      And assets exist owned by "user-123"
      When I request my assets
      Then I should receive only my assets
      And all returned assets should be owned by "user-123"

    Scenario: User cannot list another user's assets
      Given I am authenticated with user ID "user-123"
      When I attempt to request assets owned by "user-456"
      Then I should see error with forbidden error
      And I should see error "Access denied - cannot view other users' assets"

    Scenario: Admin can list any user's assets
      Given I am authenticated as an admin
      When I request assets owned by "user-456"
      Then I should receive all assets owned by "user-456"

  @happy-path
  Scenario: Successfully retrieve my asset library
    Given I am authenticated with user ID "user-123"
    And I own the following assets:
      | id       | name          | type      | isPublic |
      | asset-1  | Red Dragon    | Creature  | true     |
      | asset-2  | Castle Wall   | Wall      | false    |
      | asset-3  | Magic Effect  | Effect    | true     |
    When I request my assets
    Then I should receive 3 assets
    And all assets should be owned by me

  @happy-path
  Scenario: Empty result when user owns no assets
    Given I am authenticated with user ID "user-new"
    And I own no assets
    When I request my assets
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle non-existent owner ID
    Given I am authenticated as an admin
    And no user exists with ID "nonexistent-user"
    When I attempt to request assets owned by "nonexistent-user"
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request my assets
    Then I should see error with server error
    And I should see error "Failed to retrieve assets"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to request my assets
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot list assets by owner
    Given I am not authenticated
    When I attempt to request assets by owner
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: List includes all asset visibility states
    Given I own assets with different visibility:
      | id       | isPublic | isPublished |
      | asset-1  | true     | true        |
      | asset-2  | true     | false       |
      | asset-3  | false    | false       |
    When I request my assets
    Then I should receive all 3 assets
    And the list should include both public and private assets

  @edge-case
  Scenario: List handles large personal asset collections
    Given I own 500 assets
    When I request my assets
    Then I should receive all 500 assets
    And the response should complete within 2 seconds

  @pagination
  Scenario: List my assets with pagination
    Given I own 100 assets
    When I request my assets with page size 25
    Then I should receive 25 assets per page
    And pagination metadata should indicate total count of 100

  @filtering
  Scenario: Filter my assets by type
    Given I own assets with different types:
      | id       | type      |
      | asset-1  | Creature  |
      | asset-2  | Creature  |
      | asset-3  | Wall      |
      | asset-4  | Effect    |
    When I request my assets filtered by type "Creature"
    Then I should receive 2 assets
    And all returned assets should be type "Creature"

  @sorting
  Scenario: Sort my assets by name
    Given I own assets:
      | name          | type      |
      | Zebra Token   | Token     |
      | Apple Wall    | Wall      |
      | Dragon        | Creature  |
    When I request my assets sorted by name ascending
    Then assets should be ordered: Apple Wall, Dragon, Zebra Token

  @sorting
  Scenario: Sort my assets by creation date
    Given I own assets created on different dates:
      | name    | createdAt  |
      | Asset A | 2025-01-03 |
      | Asset B | 2025-01-01 |
      | Asset C | 2025-01-02 |
    When I request my assets sorted by creation date descending
    Then assets should be ordered: Asset A, Asset C, Asset B

  @performance
  Scenario: Query completes within performance threshold
    Given I own 200 assets
    When I request my assets
    Then the response should be received within 500ms
    And all asset data should be complete

  @integration
  Scenario: Listed assets include valid owner reference
    Given I am authenticated with user ID "user-123"
    And I own 5 assets
    When I request my assets
    Then all returned assets should have owner ID "user-123"
    And the owner ID should reference valid user in Identity context

  @data-driven
  Scenario Outline: List assets with different ownership and roles
    Given I am authenticated with role "<role>" and user ID "<userId>"
    And assets exist owned by "<targetOwner>"
    When I request assets owned by "<targetOwner>"
    Then the result should be "<result>"

    Examples:
      | role        | userId  | targetOwner | result     |
      | user        | user-1  | user-1      | success    |
      | user        | user-1  | user-2      | forbidden  |
      | admin       | admin-1 | user-1      | success    |
      | admin       | admin-1 | user-2      | success    |
