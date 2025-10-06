# Generated: 2025-10-02
# Use Case: Update Asset

Feature: Update Asset
  As a Game Master
  I want to modify existing asset properties
  So that I can refine and correct assets without recreating them

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Asset name is required if provided and cannot exceed 128 characters

    Scenario: Accept update with valid name
      Given I own asset "asset-123" with name "Dragon"
      When I update the asset name to "Ancient Dragon"
      Then the asset is updated successfully
      And the asset name should be "Ancient Dragon"

    Scenario: Reject update with empty name
      Given I own asset "asset-123"
      When I attempt to update the asset name to ""
      Then I should see error with validation error
      And I should see error "Asset name is required"

    Scenario: Reject update with name exceeding 128 characters
      Given I own asset "asset-123"
      When I attempt to update the asset name with 129 characters
      Then I should see error with validation error
      And I should see error "Asset name must not exceed 128 characters"

  Rule: Asset description cannot exceed 4096 characters if provided

    Scenario: Accept update with valid description
      Given I own asset "asset-123"
      When I update the asset description to 3000 characters
      Then the asset is updated successfully

    Scenario: Reject update with description exceeding maximum
      Given I own asset "asset-123"
      When I attempt to update the asset description with 4097 characters
      Then I should see error with validation error
      And I should see error "Asset description must not exceed 4096 characters"

  Rule: Published assets must be public (IsPublished=true requires IsPublic=true)

    Scenario: Accept publishing when asset is public
      Given I own asset "asset-123" with IsPublic set to true
      When I update IsPublished to true
      Then the asset is updated successfully
      And the asset is published and public

    Scenario: Reject publishing when asset is private
      Given I own asset "asset-123" with IsPublic set to false
      When I attempt to update IsPublished to true
      Then I should see error with validation error
      And I should see error "Published assets must be public"

    Scenario: Accept making asset private when unpublished
      Given I own asset "asset-123" with IsPublished set to false
      When I update IsPublic to false
      Then the asset is updated successfully
      And the asset should be private

  Rule: Only asset owner or admin can modify asset

    Scenario: Owner can update their asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-123"
      When I update the asset
      Then the asset is updated successfully

    Scenario: Non-owner cannot update asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-789"
      When I attempt to update the asset
      Then I should see error with forbidden error
      And I should see error "Access denied - must be asset owner"

    Scenario: Admin can update any asset
      Given I am authenticated as an admin
      And asset "asset-456" is owned by "user-789"
      When I update the asset
      Then the asset is updated successfully

  @happy-path
  Scenario: Successfully update asset name
    Given I own asset "asset-123" with name "Dragon"
    When I update the asset name to "Ancient Red Dragon"
    Then the asset is updated successfully
    And the asset name should be "Ancient Red Dragon"
    And other properties should remain unchanged

  @happy-path
  Scenario: Successfully update multiple properties
    Given I own asset "asset-123"
    When I update the asset with:
      | name        | Updated Dragon        |
      | description | New description here  |
      | type        | Creature              |
    Then the asset is updated successfully
    And all specified properties is updated
    And unspecified properties should remain unchanged

  @error-handling
  Scenario: Handle non-existent asset update
    Given no asset exists with ID "nonexistent-asset"
    When I attempt to update asset "nonexistent-asset"
    Then I should see error with not found error
    And I should see error "Asset not found"

  @error-handling
  Scenario: Handle invalid display resource reference
    Given I own asset "asset-123"
    When I attempt to update display resource to "nonexistent-resource"
    Then I should see error with not found error
    And I should see error "Display resource not found"

  @error-handling
  Scenario: Handle display resource with wrong type
    Given I own asset "asset-123"
    And resource "audio-456" exists with type "Audio"
    When I attempt to update display resource to "audio-456"
    Then I should see error with validation error
    And I should see error "Display resource must be an image"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to update an asset
    Then I should see error with server error
    And I should see error "Failed to update asset"

  @authorization
  Scenario: Unauthenticated user cannot update assets
    Given I am not authenticated
    And an asset exists with ID "asset-123"
    When I attempt to update the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Update only IsPublic flag
    Given I own asset "asset-123" with IsPublic set to false
    When I update only IsPublic to true
    Then the asset is updated successfully
    And IsPublic should be true
    And all other properties should remain unchanged

  @edge-case
  Scenario: Partial update preserves unchanged properties
    Given I own asset "asset-123" with full data
    When I update only the description
    Then the asset is updated successfully
    And the description is updated
    And name, type, and display should remain unchanged

  @edge-case
  Scenario: Update asset with name at maximum length
    Given I own asset "asset-123"
    When I update the asset name with exactly 128 characters
    Then the asset is updated successfully
    And the asset name should have 128 characters

  @integration
  Scenario: Update validates display resource exists in Media context
    Given I own asset "asset-123"
    And resource "image-789" exists in Media context with type "Image"
    When I update display resource to "image-789"
    Then the asset is updated successfully
    And the asset display should reference resource "image-789"

  @data-driven
  Scenario Outline: Update asset with published/public combinations
    Given I own asset "asset-123" with IsPublic "<currentPublic>" and IsPublished "<currentPublished>"
    When I attempt to update IsPublic to "<newPublic>" and IsPublished to "<newPublished>"
    Then the result should be "<result>"

    Examples:
      | currentPublic | currentPublished | newPublic | newPublished | result       |
      | false         | false            | true      | true         | success      |
      | true          | false            | true      | true         | success      |
      | false         | false            | false     | true         | validation_error |
      | true          | true             | false     | true         | validation_error |
      | true          | true             | false     | false        | success      |

  @concurrency
  Scenario: Handle concurrent update attempts
    Given I own asset "asset-123"
    And another user attempts to update the same asset simultaneously
    When both updates are submitted
    Then only authorized user's update should succeed
    And unauthorized user's update should fail with forbidden error
