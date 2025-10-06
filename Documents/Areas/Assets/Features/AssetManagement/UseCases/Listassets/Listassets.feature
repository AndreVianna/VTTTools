# Generated: 2025-10-02
# Use Case: List Assets

Feature: List Assets
  As a Game Master or administrator
  I want to query all assets in the system
  So that I can perform administrative operations and manage the asset library

  Background:
    Given I am authenticated as an administrator
    

  Rule: Only administrators can list all assets

    Scenario: Admin can list all assets
      Given I am authenticated as an admin
      And multiple assets exist owned by different users
      When I request all assets
      Then I should receive the complete asset list
      And the list should include assets from all owners

    Scenario: Non-admin user cannot list all assets
      Given I am authenticated as a regular user (not admin)
      When I attempt to request all assets
      Then I should see error with forbidden error
      And I should see error "Access denied - admin role required"

  @happy-path
  Scenario: Successfully retrieve all assets
    Given assets exist in the system:
      | id       | name         | owner    | isPublic |
      | asset-1  | Dragon       | user-1   | true     |
      | asset-2  | Goblin       | user-2   | false    |
      | asset-3  | Castle       | user-1   | true     |
    And I am authenticated as an admin
    When I request all assets
    Then I should receive 3 assets
    And the list should include all asset details

  @happy-path
  Scenario: List assets returns empty array when no assets exist
    Given no assets exist in the system
    And I am authenticated as an admin
    When I request all assets
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request all assets
    Then I should see error with server error
    And I should see error "Failed to retrieve assets"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to request all assets
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot list all assets
    Given I am not authenticated
    When I attempt to request all assets
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: List includes assets with all visibility combinations
    Given assets exist with different visibility:
      | id       | isPublic | isPublished |
      | asset-1  | true     | true        |
      | asset-2  | true     | false       |
      | asset-3  | false    | false       |
    And I am authenticated as an admin
    When I request all assets
    Then I should receive all 3 assets regardless of visibility

  @edge-case
  Scenario: List handles large asset collections efficiently
    Given 1000 assets exist in the system
    And I am authenticated as an admin
    When I request all assets
    Then I should receive all 1000 assets
    And the response should complete within 2 seconds

  @pagination
  Scenario: List assets with pagination support
    Given 100 assets exist in the system
    And I am authenticated as an admin
    When I request assets with page size 20
    Then I should receive 20 assets per page
    And pagination metadata should indicate total count of 100

  @filtering
  Scenario: List assets with optional filtering
    Given multiple assets exist with different types
    And I am authenticated as an admin
    When I request all assets with type filter "Creature"
    Then I should receive only assets of type "Creature"

  @sorting
  Scenario: List assets with sorting options
    Given multiple assets exist:
      | name    | createdAt  |
      | Zebra   | 2025-01-01 |
      | Apple   | 2025-01-02 |
      | Dragon  | 2025-01-03 |
    And I am authenticated as an admin
    When I request all assets sorted by name ascending
    Then assets should be ordered: Apple, Dragon, Zebra

  @performance
  Scenario: List operation completes within performance threshold
    Given 500 assets exist in the system
    And I am authenticated as an admin
    When I request all assets
    Then the response should be received within 1 second
    And all asset data should be complete

  @data-driven
  Scenario Outline: List assets with different user roles
    Given I am authenticated with role "<role>"
    When I attempt to request all assets
    Then the result should be "<result>"

    Examples:
      | role         | result     |
      | admin        | success    |
      | game_master  | forbidden  |
      | player       | forbidden  |
      | guest        | forbidden  |
