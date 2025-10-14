# Generated: 2025-10-11 (Phase 5 BDD Rewrite)
# Use Case: Update Asset
# UI Component: AssetPreviewDialog.tsx
# Phase: EPIC-001 Phase 5

Feature: Update Asset
  As a Game Master
  I want to edit existing assets including their images and properties
  So that I can refine my content library without recreating assets

  Background:
    Given I am authenticated as a Game Master
    And I am on the Asset Library page

  # ═══════════════════════════════════════════════════════════════
  # DIALOG OPENING & VIEW MODE
  # ═══════════════════════════════════════════════════════════════

  @smoke @happy-path
  Scenario: Preview dialog opens in view mode with correct state
    Given an Object asset named "Wooden Crate" exists in my library
    When I click the "Wooden Crate" asset card
    Then the Asset Preview Dialog should open
    And the dialog title should be "Asset Details"
    And the dialog should be in view mode (read-only)
    And I should see asset name "Wooden Crate"
    And I should see the asset description
    And I should see the asset properties in read-only mode
    And I should see "Edit" button
    And I should see "Delete" button
    And I should see "Close" button
    And I should not see "Save Changes" button

  @ui @critical @bug-prevention
  Scenario: Dialog opens with existing resources visible (REGRESSION TEST)
    Given I own an asset "Hero" with 2 uploaded images:
      | image       | role    |
      | token.png   | Token   |
      | display.png | Display |
    When I click the "Hero" asset card to open preview dialog
    Then I should see the Token preview showing "token.png"
    And I should see the Display preview showing "display.png"
    And the Manage panel should show both images in the Image Library
    And both images should have their role badges

  @ui @critical @bug-prevention
  Scenario: Manage panel auto-expands when opening asset with resources (REGRESSION TEST)
    Given an asset exists with 3 uploaded images
    When I click the asset card to open preview
    And I click "Edit" button
    Then the Manage panel should auto-expand immediately
    And I should see all 3 images in the Image Library grid
    And images should not be hidden behind collapsed panel

  # ═══════════════════════════════════════════════════════════════
  # ENTERING EDIT MODE
  # ═══════════════════════════════════════════════════════════════

  @ui @happy-path
  Scenario: Click Edit button enters edit mode
    Given the preview dialog is open in view mode
    When I click the "Edit" button
    Then the dialog should enter edit mode
    And the dialog title should change to "Edit Asset"
    And the "Identity & Basics" accordion should appear and be expanded
    And the "Properties" accordion should appear and be collapsed
    And fields should become editable
    And I should see "Save Changes" button
    And I should see "Cancel" button
    And I should not see "Edit" or "Delete" buttons

  # ═══════════════════════════════════════════════════════════════
  # BASIC FIELD UPDATES
  # ═══════════════════════════════════════════════════════════════

  @happy-path @critical
  Scenario: Update asset name successfully
    Given I own asset "Old Name"
    And I open the asset in edit mode
    When I change the name to "New Name"
    And I click "Save Changes"
    Then the asset should be updated successfully
    And I should receive 204 No Content response
    And the dialog should close
    And the Asset Library should refetch
    And the asset card should now show "New Name"

  # ═══════════════════════════════════════════════════════════════
  # AUTHORIZATION SCENARIOS (CRITICAL - EXPOSES 403 BUG)
  # ═══════════════════════════════════════════════════════════════

  @authorization @critical @bug-diagnosis
  Scenario: Owner can update their own asset (should succeed, currently returns 403)
    Given I am authenticated with user ID "019639ea-c7de-7a01-8548-41edfccde206"
    And I create an asset "My Asset"
    And the asset OwnerId is "019639ea-c7de-7a01-8548-41edfccde206"
    When I click the asset card to open preview
    And I click "Edit" button
    And I change the name to "Updated Name"
    And I click "Save Changes"
    Then the backend should extract userId from x-user header
    And the backend should load asset and compare OwnerId with userId
    And the comparison should match
    And the update should succeed with 204 No Content
    And I should NOT receive 403 Forbidden error

  @authorization @critical @bug-diagnosis
  Scenario: Edit asset immediately after creating it (same session)
    When I create an asset "Fresh Asset" in this session
    And the create dialog closes
    And I immediately click the "Fresh Asset" card
    And I click "Edit" button
    And I change the description to "Updated description"
    And I click "Save Changes"
    Then the update should succeed without 403 error
    And the description should be saved

  @authorization @critical
  Scenario: Non-owner cannot update asset (should return 403)
    Given user "user-A" owns asset "asset-123"
    And I am authenticated as user "user-B"
    When I attempt to update asset "asset-123"
    Then I should receive 403 Forbidden error
    And the backend error message should be "NotAllowed"
    And no changes should be persisted

  # ═══════════════════════════════════════════════════════════════
  # AUTHORIZATION: UPDATE EXISTING ASSETS
  # ═══════════════════════════════════════════════════════════════

  @authorization @critical @e2e
  Scenario: Update existing seeded asset succeeds for owner
    Given the database contains pre-seeded asset:
      | Id        | 0199bf66-76d7-7e4a-9398-8022839c7d80   |
      | Name      | "Pre-Seeded Asset"                     |
      | OwnerId   | {my user ID}                           |
    And I am authenticated as the owner
    When I navigate to Asset Library
    And I click the asset card
    And I click "Edit" button
    And I change the name to "Updated Asset"
    And I click "Save Changes"
    Then the update should succeed
    And I should receive success confirmation
    And the asset name should be updated in the library

  @authorization @critical @e2e
  Scenario: Update asset after page refresh maintains authorization
    Given I created an asset "My Asset" earlier
    When I refresh the browser (F5)
    And I navigate to Asset Library
    And I edit "My Asset" and save changes
    Then the update should succeed
    And I should NOT receive authorization errors

  @authorization @error-handling
  Scenario: Update fails with clear error when not authorized
    Given another user owns asset "Their Asset"
    And I try to access and edit that asset
    When I attempt to save changes
    Then I should see error message "You don't have permission to edit this asset"
    And the changes should not be saved

  # NOTE: For diagnosing 403 authorization bugs, implement these UNIT TESTS:
  # - Frontend: Test GUID→byte array encoding matches .NET Guid.ToByteArray()
  # - Backend: Test UserIdentificationHandler decodes x-user header correctly
  # - Backend: Add logging to AssetService.UpdateAssetAsync for debugging

  # ═══════════════════════════════════════════════════════════════
  # RESOURCE MANAGEMENT IN EDIT MODE (REGRESSION TESTS)
  # ═══════════════════════════════════════════════════════════════

  @resources @critical @bug-prevention
  Scenario: Resources loaded correctly when opening for edit (REGRESSION)
    Given I own asset "Hero" with resources:
      | resourceId | role    |
      | image-1    | Token   |
      | image-2    | Display |
    When I open in edit mode
    Then resources state should be initialized with asset.resources
    And I should see both images in Manage panel
    And image-1 should show Token badge
    And image-2 should show Display badge

  @resources @critical @bug-prevention
  Scenario: Add image to asset with existing images (REGRESSION)
    Given I own asset "Dragon" with 1 Token image
    And I open in edit mode
    When I upload new image "display.png"
    And I Ctrl+Click to assign Display role
    Then I should see 2 images total
    And original Token image should still be present
    When I click "Save Changes"
    Then the asset should have 2 resources
    When I reopen the asset
    Then both images should be visible with correct roles

  @resources @critical
  Scenario: Remove image and save
    Given I own asset with 2 images
    And I open in edit mode
    When I remove the first image
    And I click "Save Changes"
    Then the asset should be updated with 1 resource
    When I reopen
    Then I should see only 1 image

  @resources @critical
  Scenario: Change image role and save
    Given I own asset with image having Token role
    And I open in edit mode
    When I Ctrl+Click to add Display role
    Then image should show both badges
    When I click "Save Changes"
    Then resource role should be 3 (Token | Display)
    When I reopen
    Then role should be persisted

  # ═══════════════════════════════════════════════════════════════
  # PROPERTY UPDATES
  # ═══════════════════════════════════════════════════════════════

  @happy-path @object
  Scenario: Update Object properties
    Given I own Object asset with isMovable=true, isOpaque=false
    And I open in edit mode
    When I uncheck "isMovable" and check "isOpaque"
    And I click "Save Changes"
    Then objectProps should be updated to isMovable=false, isOpaque=true

  @happy-path @creature
  Scenario: Update Creature category
    Given I own Creature with category "Character"
    And I open in edit mode
    When I change category to "Monster"
    And I click "Save Changes"
    Then creatureProps.category should be "Monster"
    And asset card should show red "Monster" badge

  # ═══════════════════════════════════════════════════════════════
  # CANCEL & STATE RESET
  # ═══════════════════════════════════════════════════════════════

  @ui-interaction @critical
  Scenario: Cancel resets all changes including resources
    Given I own asset "Asset" with 1 Token image
    And I open in edit mode
    And I change name to "Different"
    And I upload new Display image
    And I remove existing Token image
    When I click "Cancel"
    Then dialog should return to view mode
    And name should reset to "Asset"
    And resources should reset to original (1 Token image)
    And new Display image should be discarded

  # ═══════════════════════════════════════════════════════════════
  # VALIDATION
  # ═══════════════════════════════════════════════════════════════

  @validation @critical
  Scenario: Save disabled when name empty
    Given I am editing an asset
    When I clear the name
    Then "Save Changes" button should be disabled

  @validation @business-rule
  Scenario: Cannot publish private asset
    Given I own private unpublished asset
    And I open in edit mode
    When I check "isPublished" but leave "isPublic" unchecked
    And I click "Save Changes"
    Then I should see validation error
    And error should be "Published assets must be public"

  # ═══════════════════════════════════════════════════════════════
  # DATABASE PERSISTENCE FOR UPDATES
  # ═══════════════════════════════════════════════════════════════

  @database @backend-integration @critical
  Scenario: Update persists changes to database correctly
    Given I own asset "Dragon" with:
      | name        | "Dragon"              |
      | description | "Original desc"       |
      | resources   | [image-1 (Token)]     |
    When I update to:
      | name        | "Red Dragon"          |
      | description | "Updated desc"        |
      | resources   | [image-1 (Token), image-2 (Display)] |
    And I save the changes
    Then the database Asset record should be updated:
      | Field       | New Value                     |
      | Name        | "Red Dragon"                  |
      | Description | "Updated desc"                |
      | UpdatedAt   | > original UpdatedAt          |
    And AssetResources table should have 2 records
    And AssetResources should contain:
      | ResourceId | Role |
      | image-1    | 1    |
      | image-2    | 2    |

  @database @backend-integration
  Scenario: Adding resource creates new AssetResource record
    Given I own asset with ID "asset-123" having 1 existing resource
    When I upload new image and assign Token role
    And I save
    Then a new AssetResource record should be INSERT ed
    And the record should link AssetId "asset-123" to new ResourceId with Role=1

  @database @backend-integration
  Scenario: Removing resource deletes AssetResource record
    Given I own asset with 2 resources
    When I remove one resource and save
    Then one AssetResource record should be DELETED from database
    And the Resource record should remain (orphan cleanup is Phase 6 scope)

  @database @backend-integration
  Scenario: Changing resource role updates AssetResource.Role value
    Given I own asset with resource having Role=1 (Token)
    When I Ctrl+Click to add Display role (making Role=3)
    And I save
    Then the AssetResource.Role value should UPDATE from 1 to 3 in database

  # ═══════════════════════════════════════════════════════════════
  # LOADING & ERROR HANDLING
  # ═══════════════════════════════════════════════════════════════

  @ui-feedback
  Scenario: Save shows loading state
    Given I am editing an asset
    When I click "Save Changes"
    Then button should show "Saving..." with spinner
    And button should be disabled

  @error-handling
  Scenario: Service unavailable preserves changes
    Given I am editing an asset
    And API returns 503
    When I click "Save Changes"
    Then error should be shown
    And dialog should stay in edit mode
    And changes should be preserved for retry
