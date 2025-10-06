# Generated: 2025-10-02
# Use Case: Unpublish Asset

Feature: Unpublish Asset
  As a Game Master
  I want to mark assets as unpublished
  So that I can remove assets from production use and return them to draft state

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Only asset owner or admin can unpublish

    Scenario: Owner can unpublish their asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-123"
      And the asset is published (IsPublished=true)
      When I unpublish the asset
      Then the asset should be unpublished successfully
      And IsPublished should be set to false

    Scenario: Non-owner cannot unpublish asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-789"
      And the asset is published
      When I attempt to unpublish the asset
      Then I should see error with forbidden error
      And I should see error "Access denied - must be asset owner"

    Scenario: Admin can unpublish any asset
      Given I am authenticated as an admin
      And asset "asset-456" is owned by "user-789"
      And the asset is published
      When I unpublish the asset
      Then the asset should be unpublished successfully

  Rule: Unpublishing does not affect IsPublic status

    Scenario: Unpublish preserves public visibility
      Given I own asset "asset-123" with:
        | isPublic    | true |
        | isPublished | true |
      When I unpublish the asset
      Then IsPublished should be set to false
      And IsPublic should remain true
      And the asset should still be publicly visible but not approved

    Scenario: Unpublish preserves private visibility
      Given I own asset "asset-123" with:
        | isPublic    | false |
        | isPublished | false |
      When I unpublish the asset
      Then the operation should succeed
      And IsPublic should remain false

  @happy-path
  Scenario: Successfully unpublish published asset
    Given I own asset "asset-123"
    And the asset has IsPublished set to true
    When I unpublish the asset
    Then the asset is updated successfully
    And IsPublished should be set to false
    And the asset should return to draft state

  @happy-path
  Scenario: Unpublish operation is idempotent
    Given I own asset "asset-123"
    And the asset is already unpublished (IsPublished=false)
    When I attempt to unpublish the asset again
    Then the operation should succeed without error
    And IsPublished should remain false

  @error-handling
  Scenario: Handle non-existent asset
    Given no asset exists with ID "nonexistent-asset"
    When I attempt to unpublish asset "nonexistent-asset"
    Then I should see error with not found error
    And I should see error "Asset not found"

  @error-handling
  Scenario: Handle invalid asset ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to unpublish the asset
    Then I should see error with validation error
    And I should see error "Invalid asset ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to unpublish an asset
    Then I should see error with server error
    And I should see error "Failed to unpublish asset"

  @error-handling
  Scenario: Handle service timeout
    Given the Assets service times out
    When I attempt to unpublish an asset
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot unpublish assets
    Given I am not authenticated
    And an asset exists with ID "asset-123"
    When I attempt to unpublish the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Unpublish preserves all other asset properties
    Given I own asset "asset-123" with full data:
      | name        | Ancient Dragon     |
      | description | Legendary creature |
      | type        | Creature           |
      | display     | resource-456       |
      | isPublic    | true               |
    And the asset is published
    When I unpublish the asset
    Then only IsPublished should change to false
    And all other properties should remain unchanged

  @edge-case
  Scenario: Unpublish then publish workflow
    Given I own asset "asset-123" with IsPublished set to true
    When I unpublish the asset
    And then I publish the asset again
    Then both operations should succeed
    And the asset is published again

  @edge-case
  Scenario: Unpublish asset that is private
    Given I own asset "asset-123" with:
      | isPublic    | false |
      | isPublished | false |
    When I attempt to unpublish the asset
    Then the operation should succeed (idempotent)
    And IsPublished should remain false
    And IsPublic should remain false

  @integration
  Scenario: Unpublish maintains asset references integrity
    Given I own asset "asset-123"
    And the asset references display resource "image-456"
    And the asset is published
    When I unpublish the asset
    Then the asset should be unpublished successfully
    And the display resource reference should remain valid

  @integration
  Scenario: Unpublish does not affect asset usage in scenes
    Given I own asset "asset-123"
    And the asset is used in 3 scenes
    And the asset is published
    When I unpublish the asset
    Then the asset should be unpublished successfully
    And the asset should remain usable in existing scenes
    And scene references should remain intact

  @performance
  Scenario: Unpublish operation completes within threshold
    Given I own asset "asset-perf-test"
    And the asset is published
    When I unpublish the asset
    Then the operation should complete within 150ms
    And the asset state is updated in database

  @data-driven
  Scenario Outline: Unpublish with different initial states
    Given I own asset with IsPublic "<isPublic>" and IsPublished "<isPublished>"
    When I attempt to unpublish the asset
    Then the result should be "<result>"
    And the final IsPublished should be "<finalPublished>"
    And the final IsPublic should be "<finalPublic>"

    Examples:
      | isPublic | isPublished | result              | finalPublished | finalPublic |
      | true     | true        | success             | false          | true        |
      | true     | false       | success_idempotent  | false          | true        |
      | false    | true        | success             | false          | false       |
      | false    | false       | success_idempotent  | false          | false       |
