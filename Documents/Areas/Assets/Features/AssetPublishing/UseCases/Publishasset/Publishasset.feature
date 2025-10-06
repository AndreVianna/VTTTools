# Generated: 2025-10-02
# Use Case: Publish Asset

Feature: Publish Asset
  As a Game Master
  I want to mark assets as published
  So that I can approve assets for production use and distinguish drafts from approved content

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Asset must be public before it can be published (IsPublic=true required)

    Scenario: Accept publishing public asset
      Given I own asset "asset-123" with IsPublic set to true
      And the asset is unpublished (IsPublished=false)
      When I publish the asset
      Then the asset is published successfully
      And IsPublished should be set to true

    Scenario: Reject publishing private asset
      Given I own asset "asset-123" with IsPublic set to false
      And the asset is unpublished
      When I attempt to publish the asset
      Then I should see error with validation error
      And I should see error "Cannot publish private asset - set IsPublic=true first"

  Rule: Only asset owner or admin can publish

    Scenario: Owner can publish their asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-123"
      And the asset is public and unpublished
      When I publish the asset
      Then the asset is published successfully

    Scenario: Non-owner cannot publish asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-789"
      When I attempt to publish the asset
      Then I should see error with forbidden error
      And I should see error "Access denied - must be asset owner"

    Scenario: Admin can publish any asset
      Given I am authenticated as an admin
      And asset "asset-456" is owned by "user-789"
      And the asset is public and unpublished
      When I publish the asset
      Then the asset is published successfully

  @happy-path
  Scenario: Successfully publish public unpublished asset
    Given I own asset "asset-123"
    And the asset has IsPublic set to true
    And the asset has IsPublished set to false
    When I publish the asset
    Then the asset is updated successfully
    And IsPublished should be true
    And IsPublic should remain true
    And the asset should be approved for production use

  @happy-path
  Scenario: Publish operation is idempotent
    Given I own asset "asset-123"
    And the asset is already published (IsPublished=true)
    When I attempt to publish the asset again
    Then the operation should succeed without error
    And IsPublished should remain true
    And no duplicate publish events should occur

  @error-handling
  Scenario: Handle non-existent asset
    Given no asset exists with ID "nonexistent-asset"
    When I attempt to publish asset "nonexistent-asset"
    Then I should see error with not found error
    And I should see error "Asset not found"

  @error-handling
  Scenario: Handle invalid asset ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to publish the asset
    Then I should see error with validation error
    And I should see error "Invalid asset ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to publish an asset
    Then I should see error with server error
    And I should see error "Failed to publish asset"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to publish an asset
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot publish assets
    Given I am not authenticated
    And an asset exists with ID "asset-123"
    When I attempt to publish the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Two-step workflow - set public first, then publish
    Given I own asset "asset-123"
    And the asset has IsPublic set to false
    And the asset has IsPublished set to false
    When I first update IsPublic to true via Update Asset
    And then I publish the asset via Publish Asset
    Then both operations should succeed
    And the final state should be IsPublic=true and IsPublished=true

  @edge-case
  Scenario: Publish requires public - sequential validation
    Given I own asset "asset-123" with IsPublic set to false
    When I attempt to publish the asset without updating IsPublic
    Then I should see error with validation error
    And I should be instructed to set IsPublic=true first

  @edge-case
  Scenario: Publish preserves all other asset properties
    Given I own asset "asset-123" with full data:
      | name        | Ancient Dragon        |
      | description | Legendary creature    |
      | type        | Creature              |
      | display     | resource-456          |
    And the asset is public and unpublished
    When I publish the asset
    Then only IsPublished should change to true
    And name, description, type, and display should remain unchanged

  @integration
  Scenario: Publish maintains asset references integrity
    Given I own asset "asset-123"
    And the asset references display resource "image-456"
    And the asset is public and unpublished
    When I publish the asset
    Then the asset is published successfully
    And the display resource reference should remain valid
    And the resource should still be accessible

  @performance
  Scenario: Publish operation completes within threshold
    Given I own asset "asset-perf-test"
    And the asset is public and unpublished
    When I publish the asset
    Then the operation should complete within 150ms
    And the asset state is updated in database

  @data-driven
  Scenario Outline: Publish with different initial states
    Given I own asset with IsPublic "<isPublic>" and IsPublished "<isPublished>"
    When I attempt to publish the asset
    Then the result should be "<result>"
    And the final IsPublished should be "<finalPublished>"

    Examples:
      | isPublic | isPublished | result            | finalPublished |
      | true     | false       | success           | true           |
      | true     | true        | success_idempotent| true           |
      | false    | false       | validation_error  | false          |
