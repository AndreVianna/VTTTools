# Generated: 2025-10-02
# Use Case: Delete Resource

Feature: Delete Resource
  As a Game Master
  I want to delete unused media resources
  So that I can free storage space and maintain organization

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational
    

  Rule: Resource cannot be deleted if referenced by Assets or Encounters

    Scenario: Accept deletion of unreferenced resource
      Given resource "resource-123" exists
      And no assets reference resource "resource-123"
      And no encounters reference resource "resource-123"
      When I delete the resource
      Then the resource should be deleted successfully
      And I should receive 204 No Content

    Scenario: Reject deletion when referenced by Asset
      Given resource "resource-456" exists
      And asset "asset-789" references resource "resource-456"
      When I attempt to delete the resource
      Then I should see error with conflict error
      And I should see error "Resource cannot be deleted. Referenced by 1 asset(s): {assetId}"

    Scenario: Reject deletion when referenced by Encounter
      Given resource "resource-789" exists
      And encounter "encounter-123" uses resource as background
      When I attempt to delete the resource
      Then I should see error with conflict error
      And I should see error "Resource cannot be deleted. Used as background in 1 encounter(s): {encounterId}"

    Scenario: Reject deletion with multiple references
      Given resource "resource-multi" exists
      And 3 assets reference the resource
      And 2 encounters reference the resource
      When I attempt to delete the resource
      Then I should see error with conflict error
      And I should see error "Referenced by 3 asset(s) and 2 encounter(s)"

  Rule: Resource entity and blob storage file must be synchronized during deletion

    Scenario: Delete entity before blob file
      Given resource exists with entity and blob file
      When I delete the resource
      Then entity should be deleted first
      And then blob file should be deleted
      And both is removed successfully

    Scenario: Handle blob deletion failure gracefully
      Given resource exists with entity and blob file
      And blob storage delete fails
      When I delete the resource
      Then entity should be deleted
      And blob deletion error should be logged
      And I should see warning about orphaned blob

  @happy-path
  Scenario: Successfully delete unreferenced resource
    Given resource exists with ID "resource-unused-123"
    And resource is not referenced anywhere
    When I delete the resource
    Then resource entity is removed from database
    And blob storage file is removed
    And I should receive 204 No Content

  @error-handling
  Scenario: Handle non-existent resource
    Given no resource exists with ID "nonexistent-resource"
    When I attempt to delete the resource
    Then I should see error with not found error
    And I should see error "Resource with ID {resourceId} not found"

  @error-handling
  Scenario: Handle invalid resource ID
    Given I provide empty Guid
    When I attempt to delete the resource
    Then I should see error with validation error
    And I should see error "Resource ID cannot be empty"

  @error-handling
  Scenario: Handle database unavailable
    Given the database is unavailable
    When I attempt to delete a resource
    Then I should see error with service unavailable error
    And I should see error "Database is temporarily unavailable"

  @error-handling
  Scenario: Handle concurrent deletion attempts
    Given resource exists with ID "resource-concurrent"
    And two deletion requests are submitted simultaneously
    When both deletions are processed
    Then only one should succeed
    And the second should return not found

  @authorization
  Scenario: Unauthenticated user cannot delete resources
    Given I am not authenticated
    And a resource exists
    When I attempt to delete the resource
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Delete resource immediately after removing references
    Given resource "resource-123" was referenced by asset "asset-456"
    And the asset reference is removed
    When I delete the resource
    Then the resource should be deleted successfully
    And no orphaned references should remain

  @edge-case
  Scenario: Orphaned blob cleanup
    Given resource entity deleted successfully
    And blob deletion fails
    When the operation completes
    Then orphaned blob should be logged for cleanup
    And background job should clean up eventually

  @integration
  Scenario: Cross-area reference check prevents deletion
    Given resource "resource-123" exists in Media
    And asset in Assets area references resource
    When I attempt to delete the resource
    Then Media should query Assets for references
    And deletion should be blocked
    And error should indicate cross-area usage

  @integration
  Scenario: Successful deletion allows re-upload with same name
    Given resource exists with filename "dragon.png"
    And resource is deleted successfully
    When I upload new file with same filename "dragon.png"
    Then new resource should be created
    And new resource should have different GUID in path

  @performance
  Scenario: Reference check completes within threshold
    Given resource exists with potential references
    When I delete the resource
    Then reference check should complete within 100ms
    And total deletion should complete within 500ms

  @data-driven
  Scenario Outline: Delete resources with different reference scenarios
    Given resource exists with <assetRefs> asset references and <encounterRefs> encounter references
    When I attempt to delete the resource
    Then the result should be "<result>"

    Examples:
      | assetRefs | encounterRefs | result    |
      | 0         | 0         | success   |
      | 1         | 0         | conflict  |
      | 0         | 1         | conflict  |
      | 5         | 3         | conflict  |
