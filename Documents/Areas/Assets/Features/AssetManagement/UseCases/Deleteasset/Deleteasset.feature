# Generated: 2025-10-02
# Use Case: Delete Asset

Feature: Delete Asset
  As a Game Master
  I want to remove unused assets from my library
  So that I can clean up and reduce clutter in my asset collection

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Asset cannot be deleted if in use by scenes

    Scenario: Accept deletion of unused asset
      Given I own asset "asset-123"
      And the asset is not used in any scenes
      When I delete the asset
      Then the asset should be deleted successfully
      And I should receive 204 No Content response

    Scenario: Reject deletion of asset in use
      Given I own asset "asset-456"
      And the asset is used in 3 scenes
      When I attempt to delete the asset
      Then I should see error with conflict error
      And I should see error "Cannot delete asset - in use in 3 scenes"

    Scenario: Reject deletion with scene usage details
      Given I own asset "asset-789"
      And the asset is used in scenes "scene-1", "scene-2"
      When I attempt to delete the asset
      Then I should see error with conflict error
      And I should see which scenes reference the asset

  Rule: Only asset owner or admin can delete asset

    Scenario: Owner can delete their asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-123"
      And the asset is not in use
      When I delete the asset
      Then the asset should be deleted successfully

    Scenario: Non-owner cannot delete asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-789"
      When I attempt to delete the asset
      Then I should see error with forbidden error
      And I should see error "Access denied - must be asset owner"

    Scenario: Admin can delete any asset
      Given I am authenticated as an admin
      And asset "asset-456" is owned by "user-789"
      And the asset is not in use
      When I delete the asset
      Then the asset should be deleted successfully

  @happy-path
  Scenario: Successfully delete unused asset
    Given I own asset "asset-unused-123"
    And the asset is not used in any scenes
    When I delete the asset
    Then the asset is removed
    And I should receive 204 No Content response
    And subsequent queries for the asset should return not found

  @error-handling
  Scenario: Handle non-existent asset deletion
    Given no asset exists with ID "nonexistent-asset"
    When I attempt to delete asset "nonexistent-asset"
    Then I should see error with not found error
    And I should see error "Asset not found"

  @error-handling
  Scenario: Handle invalid asset ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to delete the asset
    Then I should see error with validation error
    And I should see error "Invalid asset ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to delete an asset
    Then I should see error with server error
    And I should see error "Failed to delete asset"

  @error-handling
  Scenario: Handle Library service unavailable during usage check
    Given I own asset "asset-123"
    And the Library service is unavailable
    When I attempt to delete the asset
    Then I should see error with service error
    And I should see error "Unable to verify asset usage"

  @authorization
  Scenario: Unauthenticated user cannot delete assets
    Given I am not authenticated
    And an asset exists with ID "asset-123"
    When I attempt to delete the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Delete asset immediately after removing from scenes
    Given I own asset "asset-123"
    And the asset was used in scene "scene-456"
    And I remove the asset from scene "scene-456"
    When I delete the asset
    Then the asset should be deleted successfully
    And no orphaned references should remain

  @edge-case
  Scenario: Attempt deletion with no usage in multiple contexts
    Given I own asset "asset-123"
    And the asset is not used in any scenes
    And the asset is not used in any adventures
    And the asset is not used in any epics
    When I delete the asset
    Then the asset should be deleted successfully

  @integration
  Scenario: Deletion queries Library context for usage check
    Given I own asset "asset-123"
    
    When I delete the asset
    Then I should see query Library for SceneAsset references
    And the usage check should complete before deletion

  @integration
  Scenario: Deletion prevented by cross-area reference
    Given I own asset "asset-123"
    And the asset is referenced by scene "scene-789" in Library context
    When I attempt to delete the asset
    Then I should see error with conflict error
    And the cross-area reference should be reported

  @data-driven
  Scenario Outline: Delete assets with different usage scenarios
    Given I own asset "asset-<id>"
    And the asset has <sceneCount> scene references
    When I attempt to delete the asset
    Then the result should be "<result>"

    Examples:
      | id  | sceneCount | result     |
      | 001 | 0          | success    |
      | 002 | 1          | conflict   |
      | 003 | 5          | conflict   |
      | 004 | 10         | conflict   |

  @performance
  Scenario: Usage check completes within performance threshold
    Given I own asset "asset-perf-test"
    And the asset is not in use
    When I delete the asset
    Then the usage check should complete within 100ms
    And the deletion should complete within 200ms total

  @concurrency
  Scenario: Handle concurrent deletion attempts
    Given I own asset "asset-123"
    And the asset is not in use
    And two deletion requests are submitted simultaneously
    When both deletions are processed
    Then only one deletion should succeed
    And the second deletion should return not found error
