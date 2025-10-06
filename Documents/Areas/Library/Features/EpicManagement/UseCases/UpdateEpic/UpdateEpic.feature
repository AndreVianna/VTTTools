# Generated: 2025-10-02
# Use Case: Update Epic

Feature: Update Epic
  As a Game Master
  I want to update an existing epic
  So that I can modify epic properties and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own an epic in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update epic with valid new name
      Given my epic has name "Original Name"
      When I update the epic name to "Updated Epic Name"
      Then the epic is updated successfully
      And the epic name should be "Updated Epic Name"

    Scenario: Reject update with empty name
      Given my epic has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "Epic name is required"
      And the epic name should remain "Valid Name"

    Scenario: Reject update with name exceeding 128 characters
      Given my epic exists
      When I attempt to update with name of 129 characters
      Then I should see error with validation error
      And I should see error "Epic name must not exceed 128 characters"

  Rule: Published epics must be public

    Scenario: Update epic to published and public
      Given my epic has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the epic is updated successfully
      And the epic should be marked as published
      And the epic should be publicly visible

    Scenario: Reject update to published without public
      Given my epic has IsPublished=false and IsPublic=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published epics must be public"

  @happy-path
  Scenario: Successfully update epic description
    Given my epic has description "Old description"
    When I update the description to "New comprehensive description"
    Then the epic is updated successfully
    And the description should be "New comprehensive description"

  @happy-path
  Scenario: Successfully update epic background resource
    Given my epic has no background resource
    When I update with valid image resource as background
    Then the epic is updated successfully
    And the background resource should be associated

  @happy-path
  Scenario: Successfully update multiple epic properties
    Given my epic exists
    When I update the epic with:
      | Field        | Value                  |
      | Name         | Revised Epic Name      |
      | Description  | Updated description    |
      | IsPublic     | true                   |
    Then the epic is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent epic
    Given no epic exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update epic "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle update with invalid background resource
    Given my epic exists
    When I attempt to update with non-existent background resource
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"

  @error-handling
  Scenario: Handle update with description exceeding maximum length
    Given my epic exists
    When I attempt to update with description of 4097 characters
    Then I should see error with validation error
    And I should see error "Epic description must not exceed 4096 characters"

  @authorization
  Scenario: User cannot update epic they don't own
    Given an epic exists owned by another user
    When I attempt to update that epic
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this epic"

  @authorization
  Scenario: Unauthorized user cannot update epic
    Given I am not authenticated
    And an epic exists
    When I attempt to update the epic
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Update epic to remove background resource
    Given my epic has background resource
    When I update to remove background resource
    Then the epic is updated successfully
    And the background resource should be null

  @edge-case
  Scenario: Update epic with same values
    Given my epic has name "Epic Name"
    When I update with the same name "Epic Name"
    Then the epic is updated successfully
    And no actual changes is saved

  @data-driven
  Scenario Outline: Update epic publication status combinations
    Given my epic has IsPublished=<old_published> and IsPublic=<old_public>
    When I update to IsPublished=<new_published> and IsPublic=<new_public>
    Then the result should be <result>

    Examples:
      | old_published | old_public | new_published | new_public | result  |
      | false         | false      | true          | true       | success |
      | false         | false      | false         | true       | success |
      | true          | true       | false         | false      | success |
      | false         | false      | true          | false      | failure |
