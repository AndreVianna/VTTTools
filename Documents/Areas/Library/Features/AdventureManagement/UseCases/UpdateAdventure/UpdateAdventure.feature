# Generated: 2025-10-02
# Use Case: Update Adventure

Feature: Update Adventure
  As a Game Master
  I want to update an existing adventure
  So that I can modify adventure properties, type, and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own an adventure in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update adventure with valid new name
      Given my adventure has name "Original Adventure"
      When I update the adventure name to "Updated Adventure Name"
      Then the adventure is updated successfully
      And the adventure name should be "Updated Adventure Name"

    Scenario: Reject update with empty name
      Given my adventure has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "Adventure name is required"

  Rule: Published adventures must be public

    Scenario: Update adventure to published and public
      Given my adventure has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the adventure is updated successfully
      And the adventure should be publicly visible

    Scenario: Reject update to published without public
      Given my adventure has IsPublished=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published adventures must be public"

  @happy-path
  Scenario: Successfully update adventure type
    Given my adventure has type "Generic"
    When I update the adventure type to "DungeonCrawl"
    Then the adventure is updated successfully
    And the adventure type should be "DungeonCrawl"

  @happy-path
  Scenario: Successfully update adventure description
    Given my adventure has description "Old description"
    When I update the description to "New detailed adventure description"
    Then the adventure is updated successfully
    And the description should be "New detailed adventure description"

  @happy-path
  Scenario: Successfully update multiple adventure properties
    Given my adventure exists
    When I update the adventure with:
      | Field        | Value                     |
      | Name         | Revised Adventure         |
      | Type         | Investigation             |
      | Description  | Updated storyline         |
      | IsPublic     | true                      |
    Then the adventure is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent adventure
    Given no adventure exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update adventure "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @authorization
  Scenario: User cannot update adventure they don't own
    Given an adventure exists owned by another user
    When I attempt to update that adventure
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this adventure"

  @data-driven
  Scenario Outline: Update adventure to different types
    Given my adventure has type "Generic"
    When I update the adventure type to "<new_type>"
    Then the adventure is updated successfully
    And the adventure type should be "<new_type>"

    Examples:
      | new_type      |
      | OpenWorld     |
      | DungeonCrawl  |
      | Investigation |
      | Social        |
