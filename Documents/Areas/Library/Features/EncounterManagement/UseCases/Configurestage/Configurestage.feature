# Generated: 2025-10-02
# Use Case: Configure Stage

Feature: Configure Stage
  As a Game Master
  I want to configure the stage for a encounter
  So that I can set background, viewport, and dimensions for tactical maps

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    

  Rule: Stage dimensions must be positive

    Scenario: Configure stage with valid dimensions
      Given my encounter exists
      When I configure stage with width 2048 and height 1536
      Then the stage is updated successfully
      And the stage width should be 2048
      And the stage height should be 1536

    Scenario: Reject stage configuration with zero width
      Given my encounter exists
      When I attempt to configure stage with width 0 and height 1080
      Then I should see error with validation error
      And I should see error "Stage dimensions must be positive"

    Scenario: Reject stage configuration with negative dimensions
      Given my encounter exists
      When I attempt to configure stage with width 1920 and height -100
      Then I should see error with validation error
      And I should see error "Stage dimensions must be positive"

  @happy-path
  Scenario: Successfully configure stage with background image
    Given my encounter has no stage background
    And I have a valid image resource
    When I configure stage with that background resource
    Then the stage is updated successfully
    And the background resource should be associated

  @happy-path
  Scenario: Successfully configure complete stage
    Given my encounter exists
    When I configure stage with:
      | Property   | Value              |
      | Background | image-resource-id  |
      | Width      | 1920               |
      | Height     | 1080               |
      | ViewportX  | 100                |
      | ViewportY  | 50                 |
    Then the stage is updated successfully
    And all stage properties should be set correctly

  @happy-path
  Scenario: Successfully update existing stage configuration
    Given my encounter has stage with width 1920 and height 1080
    When I update stage dimensions to width 2560 and height 1440
    Then the stage is updated successfully
    And the new dimensions should be preserved

  @happy-path
  Scenario: Successfully remove stage background
    Given my encounter has stage with background resource
    When I configure stage to remove background
    Then the stage is updated successfully
    And the background should be null

  @error-handling
  Scenario: Handle stage configuration for non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to configure stage for encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @error-handling
  Scenario: Handle stage configuration with invalid background resource
    Given my encounter exists
    When I attempt to configure stage with non-existent background resource
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"

  @authorization
  Scenario: User cannot configure stage for encounter they don't own
    Given a encounter exists owned by another user
    When I attempt to configure stage for that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this encounter"

  @edge-case
  Scenario: Configure stage with maximum dimensions
    Given my encounter exists
    When I configure stage with width 8192 and height 8192
    Then the stage is updated successfully
    And the dimensions should be preserved

  @edge-case
  Scenario: Configure stage viewport outside bounds
    Given my encounter has stage width 1920 and height 1080
    When I configure viewport to X=2000 and Y=1200
    Then the stage is updated successfully
    And the viewport coordinates should be set

  @integration
  Scenario: Configure stage preserves grid and asset placements
    Given my encounter has configured grid and 5 placed assets
    When I update the stage dimensions
    Then the stage is updated
    And the grid configuration should remain unchanged
    And all asset placements should remain intact
