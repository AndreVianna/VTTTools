# Generated: 2025-10-02
# Use Case: Get Asset

Feature: Get Asset
  As a Game Master
  I want to retrieve specific asset details by ID
  So that I can view and use asset information in my game

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Asset ID must be valid and exist in system

    Scenario: Retrieve existing asset successfully
      Given an asset exists with ID "asset-123"
      When I request asset "asset-123"
      Then I should receive the asset details
      And the asset ID should be "asset-123"

    Scenario: Reject request with non-existent asset ID
      Given no asset exists with ID "nonexistent-asset"
      When I attempt to request asset "nonexistent-asset"
      Then I should see error with not found error
      And I should see error "Asset not found"

    Scenario: Reject request with invalid ID format
      Given I provide invalid ID format "not-a-guid"
      When I attempt to request the asset
      Then I should see error with validation error
      And I should see error "Invalid asset ID format"

  Rule: Only owner or public assets can be retrieved

    Scenario: Owner can retrieve their private asset
      Given I am authenticated with user ID "user-123"
      And an asset exists with ID "asset-456" owned by "user-123"
      And the asset is private (IsPublic=false)
      When I request asset "asset-456"
      Then I should receive the asset details
      And the asset should be owned by "user-123"

    Scenario: Non-owner cannot retrieve private asset
      Given I am authenticated with user ID "user-123"
      And an asset exists with ID "asset-789" owned by "user-456"
      And the asset is private (IsPublic=false)
      When I attempt to request asset "asset-789"
      Then I should see error with forbidden error
      And I should see error "Access denied"

    Scenario: Anyone can retrieve public asset
      Given I am authenticated with user ID "user-123"
      And an asset exists with ID "asset-public" owned by "user-456"
      And the asset is public (IsPublic=true)
      When I request asset "asset-public"
      Then I should receive the asset details
      And the asset should be publicly accessible

  @happy-path
  Scenario: Successfully retrieve complete asset with all properties
    Given an asset exists with full details
      | id          | asset-complete-123           |
      | name        | Ancient Red Dragon           |
      | type        | Creature                     |
      | description | Legendary dragon             |
      | isPublic    | true                         |
      | isPublished | true                         |
    And I am the owner of the asset
    When I request the asset
    Then I should receive all asset properties
    And the asset should include display information
    And the asset should include frame styling

  @happy-path
  Scenario: Retrieve asset with minimal properties
    Given an asset exists with minimal data
      | id   | asset-minimal-123 |
      | name | Simple Token      |
      | type | Token             |
    And I am the owner of the asset
    When I request the asset
    Then I should receive the asset details
    And the asset description should be empty
    And the asset display should be null

  @error-handling
  Scenario: Handle database connection failure during retrieval
    Given the database is unavailable
    When I attempt to request an asset
    Then I should see error with server error
    And I should see error "Failed to retrieve asset"

  @error-handling
  Scenario: Handle service timeout during retrieval
    Given the Assets service times out
    When I attempt to request an asset
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot retrieve private assets
    Given I am not authenticated
    And an asset exists that is private
    When I attempt to request the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @authorization
  Scenario: Unauthenticated user can retrieve public assets
    Given I am not authenticated
    And an asset exists that is public
    When I request the asset
    Then I should receive the asset details
    And the asset should be publicly accessible

  @authorization
  Scenario: Admin can retrieve any asset regardless of ownership
    Given I am authenticated as an admin
    And an asset exists owned by another user
    And the asset is private
    When I request the asset
    Then I should receive the asset details
    And my admin privileges should grant access

  @edge-case
  Scenario: Retrieve asset with empty optional fields
    Given an asset exists with no description
    And the asset has no display resource
    When I request the asset
    Then I should receive the asset details
    And the asset description should be empty
    And the asset display should be null

  @integration
  Scenario: Retrieved asset includes valid owner reference
    Given an asset exists with owner ID "user-123"
    And user "user-123" exists in Identity context
    When I request the asset
    Then the asset owner ID should be "user-123"
    And the owner should be a valid user

  @integration
  Scenario: Retrieved asset includes valid display resource reference
    Given an asset exists with display resource "image-456"
    And resource "image-456" exists in Media context
    When I request the asset
    Then the asset display should reference resource "image-456"
    And the resource should be a valid image

  @performance
  Scenario: Asset retrieval completes within performance threshold
    Given an asset exists with ID "asset-perf-test"
    When I request the asset
    Then the response should be received within 200ms
    And the asset details should be complete

  @data-driven
  Scenario Outline: Retrieve assets with different visibility settings
    Given I am authenticated with user ID "user-123"
    And an asset exists with owner "<owner>" and IsPublic "<isPublic>"
    When I request the asset
    Then the result should be "<result>"

    Examples:
      | owner   | isPublic | result    |
      | user-123| false    | success   |
      | user-123| true     | success   |
      | user-456| true     | success   |
      | user-456| false    | forbidden |
