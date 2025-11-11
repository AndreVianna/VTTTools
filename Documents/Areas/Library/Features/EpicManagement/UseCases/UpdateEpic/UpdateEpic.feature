# Generated: 2025-10-02
# Use Case: Update World

Feature: Update World
  As a Game Master
  I want to update an existing world
  So that I can modify world properties and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own an world in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update world with valid new name
      Given my world has name "Original Name"
      When I update the world name to "Updated World Name"
      Then the world is updated successfully
      And the world name should be "Updated World Name"

    Scenario: Reject update with empty name
      Given my world has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "World name is required"
      And the world name should remain "Valid Name"

    Scenario: Reject update with name exceeding 128 characters
      Given my world exists
      When I attempt to update with name of 129 characters
      Then I should see error with validation error
      And I should see error "World name must not exceed 128 characters"

  Rule: Published worlds must be public

    Scenario: Update world to published and public
      Given my world has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the world is updated successfully
      And the world should be marked as published
      And the world should be publicly visible

    Scenario: Reject update to published without public
      Given my world has IsPublished=false and IsPublic=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published worlds must be public"

  @happy-path
  Scenario: Successfully update world description
    Given my world has description "Old description"
    When I update the description to "New comprehensive description"
    Then the world is updated successfully
    And the description should be "New comprehensive description"

  @happy-path
  Scenario: Successfully update world background resource
    Given my world has no background resource
    When I update with valid image resource as background
    Then the world is updated successfully
    And the background resource should be associated

  @happy-path
  Scenario: Successfully update multiple world properties
    Given my world exists
    When I update the world with:
      | Field        | Value                  |
      | Name         | Revised World Name      |
      | Description  | Updated description    |
      | IsPublic     | true                   |
    Then the world is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent world
    Given no world exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update world "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "World not found"

  @error-handling
  Scenario: Handle update with invalid background resource
    Given my world exists
    When I attempt to update with non-existent background resource
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"

  @error-handling
  Scenario: Handle update with description exceeding maximum length
    Given my world exists
    When I attempt to update with description of 4097 characters
    Then I should see error with validation error
    And I should see error "World description must not exceed 4096 characters"

  @authorization
  Scenario: User cannot update world they don't own
    Given an world exists owned by another user
    When I attempt to update that world
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this world"

  @authorization
  Scenario: Unauthorized user cannot update world
    Given I am not authenticated
    And an world exists
    When I attempt to update the world
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Update world to remove background resource
    Given my world has background resource
    When I update to remove background resource
    Then the world is updated successfully
    And the background resource should be null

  @edge-case
  Scenario: Update world with same values
    Given my world has name "World Name"
    When I update with the same name "World Name"
    Then the world is updated successfully
    And no actual changes is saved

  @data-driven
  Scenario Outline: Update world publication status combinations
    Given my world has IsPublished=<old_published> and IsPublic=<old_public>
    When I update to IsPublished=<new_published> and IsPublic=<new_public>
    Then the result should be <result>

    Examples:
      | old_published | old_public | new_published | new_public | result  |
      | false         | false      | true          | true       | success |
      | false         | false      | false         | true       | success |
      | true          | true       | false         | false      | success |
      | false         | false      | true          | false      | failure |
