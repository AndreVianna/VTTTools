# Generated: 2025-10-02
# Use Case: Update Scene

Feature: Update Scene
  As a Game Master
  I want to update an existing scene
  So that I can modify scene properties and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own a scene in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update scene with valid new name
      Given my scene has name "Original Scene"
      When I update the scene name to "Updated Battle Arena"
      Then the scene is updated successfully
      And the scene name should be "Updated Battle Arena"

    Scenario: Reject update with empty name
      Given my scene has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "Scene name is required"

  Rule: Published scenes must be public

    Scenario: Update scene to published and public
      Given my scene has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the scene is updated successfully
      And the scene should be publicly visible

    Scenario: Reject update to published without public
      Given my scene has IsPublished=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published scenes must be public"

  @happy-path
  Scenario: Successfully update scene description
    Given my scene has description "Old description"
    When I update the description to "New tactical map description"
    Then the scene is updated successfully
    And the description should be "New tactical map description"

  @happy-path
  Scenario: Successfully update multiple scene properties
    Given my scene exists
    When I update the scene with:
      | Field        | Value                  |
      | Name         | Revised Scene          |
      | Description  | Updated battle map     |
      | IsPublic     | true                   |
    Then the scene is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent scene
    Given no scene exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update scene "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Scene not found"

  @authorization
  Scenario: User cannot update scene they don't own
    Given a scene exists owned by another user
    When I attempt to update that scene
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this scene"

  @edge-case
  Scenario: Update scene preserves stage and grid configuration
    Given my scene has configured stage and grid
    When I update the scene name
    Then the scene name is updated
    And the stage configuration should remain unchanged
    And the grid configuration should remain unchanged
