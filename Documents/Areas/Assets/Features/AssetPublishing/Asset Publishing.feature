# Generated: 2025-10-02
# Feature: Asset Publishing

Feature: Asset Publishing
  As a Game Master
  I want to control asset publication state
  So that I can approve assets for production use and separate drafts from approved content

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Published assets must be public (IsPublished=true requires IsPublic=true)

    Scenario: Accept publishing when asset is public
      Given I own asset "asset-123" with IsPublic set to true
      And the asset is unpublished (IsPublished=false)
      When I publish the asset
      Then the asset is published successfully
      And IsPublished should be true
      And IsPublic should remain true

    Scenario: Reject publishing when asset is private
      Given I own asset "asset-123" with IsPublic set to false
      When I attempt to publish the asset
      Then I should see error with validation error
      And I should see error "Cannot publish private asset - set IsPublic=true first"
      And IsPublished should remain false

  Rule: Only asset owner or admin can publish asset

    Scenario: Owner can publish their asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-123"
      And the asset is public and unpublished
      When I publish the asset
      Then the asset is published successfully

    Scenario: Non-owner cannot publish asset
      Given I am authenticated with user ID "user-123"
      And asset "asset-456" is owned by "user-789"
      And the asset is public and unpublished
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
    Given I own asset "asset-123" with:
      | isPublic    | true  |
      | isPublished | false |
    When I publish the asset
    Then the asset is published successfully
    And IsPublished should be set to true
    And the asset should be approved for production use

  @happy-path
  Scenario: Idempotent publish operation (already published)
    Given I own asset "asset-123" with IsPublished set to true
    When I attempt to publish the asset again
    Then the operation should succeed
    And IsPublished should remain true
    And no error should be returned

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

  @authorization
  Scenario: Unauthenticated user cannot publish assets
    Given I am not authenticated
    And an asset exists with ID "asset-123"
    When I attempt to publish the asset
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Two-step workflow - make public then publish
    Given I own asset "asset-123" with:
      | isPublic    | false |
      | isPublished | false |
    When I first update IsPublic to true
    And then I publish the asset
    Then both operations should succeed
    And the asset should be public and published

  @edge-case
  Scenario: Cannot make asset private while published
    Given I own asset "asset-123" with:
      | isPublic    | true |
      | isPublished | true |
    When I attempt to update IsPublic to false
    Then I should see error with validation error
    And I should see error "Published assets must be public"

  @integration
  Scenario: Publishing workflow maintains referential integrity
    Given I own asset "asset-123" with valid display resource
    And the asset is public and unpublished
    When I publish the asset
    Then the asset is published successfully
    And all references should remain intact
    And the display resource should remain valid

  @data-driven
  Scenario Outline: Publish assets with different initial states
    Given I own asset with IsPublic "<currentPublic>" and IsPublished "<currentPublished>"
    When I attempt to publish the asset
    Then the result should be "<result>"
    And IsPublished should be "<finalPublished>"

    Examples:
      | currentPublic | currentPublished | result            | finalPublished |
      | true          | false            | success           | true           |
      | true          | true             | success_idempotent| true           |
      | false         | false            | validation_error  | false          |
      | false         | true             | invalid_state     | true           |
