# Generated: 2025-10-11 (Phase 5 BDD Rewrite)
# Use Case: Delete Asset
# UI Component: AssetPreviewDialog.tsx (delete confirmation)
# Phase: EPIC-001 Phase 5

Feature: Delete Asset
  As a Game Master
  I want to delete assets I no longer need
  So that I can keep my library organized and remove outdated content

  Background:
    Given I am authenticated as a Game Master
    And I am on the Asset Library page

  # ═══════════════════════════════════════════════════════════════
  # DELETE CONFIRMATION DIALOG
  # ═══════════════════════════════════════════════════════════════

  @smoke @happy-path
  Scenario: Delete button opens confirmation dialog
    Given I own asset "Test Asset"
    And I open the asset in preview dialog (view mode)
    When I click the "Delete" button
    Then a delete confirmation dialog should open
    And the confirmation should ask "Delete Asset?"
    And the message should say 'Are you sure you want to delete "Test Asset"?'
    And I should see "Cancel" button
    And I should see "Delete" button (red, danger color)
    And the main preview dialog should be hidden behind confirmation

  @ui
  Scenario: Published asset shows warning in delete confirmation
    Given I own a published asset "Published Asset"
    And I open the asset in preview dialog
    When I click "Delete"
    Then the confirmation dialog should open
    And I should see a warning alert
    And the warning should say "This asset is published and may be in use in scenes"
    And the warning should have severity "warning" (orange/yellow)

  @ui
  Scenario: Unpublished asset shows no warning
    Given I own an unpublished asset "Draft Asset"
    And I open the asset in preview
    When I click "Delete"
    Then the confirmation dialog should open
    And I should not see a warning alert

  # ═══════════════════════════════════════════════════════════════
  # DELETE EXECUTION
  # ═══════════════════════════════════════════════════════════════

  @happy-path @critical
  Scenario: Confirm delete removes asset successfully
    Given I own asset "Delete Me"
    And the asset is displayed in Asset Library
    And I open the asset in preview
    And I click "Delete"
    When I click "Delete" in the confirmation dialog
    Then the asset should be deleted via DELETE /api/assets/{id}
    And I should receive 204 No Content response
    And both dialogs should close (confirmation + preview)
    And I should return to Asset Library
    And the Asset Library should refetch
    And "Delete Me" should no longer appear in the grid
    And the asset count should decrease by 1

  @happy-path
  Scenario: Cancel delete keeps asset
    Given I own asset "Keep Me"
    And I open the asset in preview
    And I click "Delete"
    When I click "Cancel" in the confirmation dialog
    Then the confirmation dialog should close
    And I should return to the preview dialog
    And the asset should NOT be deleted
    And the asset should still exist in the library

  # ═══════════════════════════════════════════════════════════════
  # AUTHORIZATION
  # ═══════════════════════════════════════════════════════════════

  @authorization @critical
  Scenario: Owner can delete their own asset
    Given I am authenticated with user ID "user-123"
    And I own asset "My Asset" with OwnerId "user-123"
    When I delete the asset
    Then the delete should succeed
    And the asset should be removed from database

  @authorization @critical
  Scenario: Non-owner cannot delete asset
    Given user "user-A" owns asset "asset-123"
    And I am authenticated as user "user-B"
    When I attempt to delete asset "asset-123"
    Then I should receive 403 Forbidden error
    And the asset should not be deleted

  @authorization
  Scenario: Unauthenticated user cannot delete assets
    Given I am not authenticated
    When I navigate to Asset Library
    Then I should be redirected to login
    And I should not be able to open preview dialog
    And I should not be able to delete any assets

  # ═══════════════════════════════════════════════════════════════
  # DELETE BUTTON VISIBILITY RULES
  # ═══════════════════════════════════════════════════════════════

  Rule: Delete button only appears in view mode for asset owners

    @ui @authorization @critical
    Scenario: Owner sees delete button in view mode
      Given I own asset "My Asset"
      And I open the asset in view mode
      Then I should see "Delete" button
      And the button should be visible and enabled

    @ui @authorization
    Scenario: Non-owner does not see delete button
      Given another user owns asset "Their Asset"
      And the asset is public published
      And I can view the asset
      When I open the asset in preview dialog
      Then I should not see "Delete" button
      And I should only see "Close" button

  # ═══════════════════════════════════════════════════════════════
  # LOADING STATES
  # ═══════════════════════════════════════════════════════════════

  @ui-feedback
  Scenario: Delete button shows loading state during deletion
    Given I am in delete confirmation dialog
    When I click "Delete"
    Then the button text should change to "Deleting..."
    And I should see a loading spinner icon
    And the "Delete" button should be disabled
    And the "Cancel" button should be disabled
    When deletion completes
    Then both dialogs should close

  # ═══════════════════════════════════════════════════════════════
  # ERROR HANDLING
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Handle delete of non-existent asset
    Given asset "nonexistent" does not exist
    When I attempt to delete asset "nonexistent"
    Then I should receive 404 Not Found error

  @error-handling
  Scenario: Handle backend service unavailable during delete
    Given I own asset "Asset"
    And the Assets API returns 503 Service Unavailable
    When I confirm delete
    Then I should see error message
    And the confirmation dialog should remain open
    And I should be able to retry

  @error-handling
  Scenario: Handle asset in use on scenes (future constraint)
    Given I own asset "In Use Asset"
    And the asset is placed on 3 active scenes
    When I attempt to delete the asset
    Then the backend may return validation error
    And error should indicate "Asset is in use on scenes"
    And the asset should not be deleted

  # ═══════════════════════════════════════════════════════════════
  # INTEGRATION & CACHE INVALIDATION
  # ═══════════════════════════════════════════════════════════════

  @integration
  Scenario: Successful delete updates Asset Library immediately
    Given I own 5 assets
    And I am viewing the Asset Library showing all 5
    When I delete one asset
    Then the Asset Library should refetch
    And I should see 4 assets remaining
    And the deleted asset should not appear

  @integration
  Scenario: Delete invalidates RTK Query cache
    Given asset "Asset" is loaded in cache
    When I delete the asset
    Then RTK Query should invalidate tags: Asset:{id} and Asset:LIST
    And subsequent queries should not return the deleted asset

  # ═══════════════════════════════════════════════════════════════
  # DELETE FROM DIFFERENT ENTRY POINTS
  # ═══════════════════════════════════════════════════════════════

  @ui-interaction
  Scenario: Delete via preview dialog in view mode
    Given I open an asset in view mode
    When I click "Delete" button
    Then delete confirmation should open

  @ui-interaction
  Scenario: Cannot delete while in edit mode
    Given I open an asset in edit mode
    Then I should not see "Delete" button
    And I should see "Cancel" and "Save Changes" buttons
    And I must cancel or save before I can delete

  # ═══════════════════════════════════════════════════════════════
  # EDGE CASES
  # ═══════════════════════════════════════════════════════════════

  @edge-case
  Scenario: Delete last asset shows empty library
    Given I own exactly 1 asset
    When I delete that asset
    Then the Asset Library should show 0 assets found
    And I should see only the virtual "Add" card

  @edge-case
  Scenario: Delete asset from last page removes page
    Given I own 13 assets (2 pages: 12 + 1)
    And I am on page 2 showing 1 asset
    When I delete that asset
    Then I should have 12 assets on 1 page
    And I should be redirected to page 1
