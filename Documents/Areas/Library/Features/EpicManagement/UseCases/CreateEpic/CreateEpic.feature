# Generated: 2025-10-02
# Use Case: Create Epic

Feature: Create Epic
  As a Game Master
  I want to create a new epic
  So that I can establish a top-level story arc for my campaigns

  Background:
    Given I am authenticated as a Game Master
    And my user account exists in the Identity context
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Create epic with valid name
      Given I provide epic name "The Sleepwalkers Saga"
      When I create the epic
      Then the epic should be created with generated ID
      And the epic name should be "The Sleepwalkers Saga"

    Scenario: Reject epic creation with empty name
      Given I provide empty epic name
      When I attempt to create the epic
      Then I should see error with validation error
      And I should see error "Epic name is required"
      And the epic should not be persisted

    Scenario: Reject epic creation with name exceeding 128 characters
      Given I provide epic name with 129 characters
      When I attempt to create the epic
      Then I should see error with validation error
      And I should see error "Epic name must not exceed 128 characters"
      And the epic should not be persisted

  Rule: Description cannot exceed 4096 characters

    Scenario: Create epic with maximum description length
      Given I provide epic with description of exactly 4096 characters
      When I create the epic
      Then the epic is created
      And the full description should be preserved

    Scenario: Reject epic with description exceeding maximum
      Given I provide epic with description of 4097 characters
      When I attempt to create the epic
      Then I should see error with validation error
      And I should see error "Epic description must not exceed 4096 characters"

  Rule: Published epics must be public

    Scenario: Create published and public epic
      Given I provide epic with IsPublished=true and IsPublic=true
      When I create the epic
      Then the epic is created
      And the epic should be marked as published
      And the epic should be marked as public

    Scenario: Reject published epic that is not public
      Given I provide epic with IsPublished=true and IsPublic=false
      When I attempt to create the epic
      Then I should see error with validation error
      And I should see error "Published epics must be public"

  @happy-path
  Scenario: Successfully create epic with all properties
    Given I provide valid epic data:
      | Field        | Value                      |
      | Name         | Sleepwalkers Awakening     |
      | Description  | A multi-campaign epic      |
      | IsPublished  | false                      |
      | IsPublic     | false                      |
    When I create the epic
    Then the epic is saved in the database
    And an EpicCreated domain action is logged
    And I should receive the epic with generated ID
    And the epic should be retrievable by ID

  @happy-path
  Scenario: Successfully create epic with campaigns collection
    Given I provide valid epic data
    And I provide 3 valid campaigns in the collection
    When I create the epic
    Then the epic is created
    And all 3 campaigns is saved
    And each campaign should reference the epic ID
    And an EpicCreated domain action is logged

  @error-handling
  Scenario: Handle epic creation with invalid owner ID
    Given I provide epic with owner ID that doesn't exist
    When I attempt to create the epic
    Then I should see error with not found error
    And I should see error "Owner user not found"
    And the epic should not be persisted

  @error-handling
  Scenario: Handle epic creation with invalid background resource
    Given I provide epic with background resource ID that doesn't exist
    When I attempt to create the epic
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"
    And the epic should not be persisted

  @error-handling
  Scenario: Handle epic creation with non-image background resource
    Given I provide epic with background resource that is not an image
    When I attempt to create the epic
    Then I should see error with validation error
    And I should see error "Background resource not found or not an image"

  @error-handling
  Scenario: Handle database persistence failure
    Given I provide valid epic data
    And the database is unavailable
    When I attempt to create the epic
    Then I should see error with server error
    And I should see error "Failed to create epic"

  @authorization
  Scenario: Unauthorized user cannot create epic
    Given I am not authenticated
    When I attempt to create an epic
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Create epic with optional background resource
    Given I provide valid epic data
    And I provide valid image resource as background
    When I create the epic
    Then the epic is created
    And the background resource should be associated

  @edge-case
  Scenario: Create epic without optional description
    Given I provide epic name "Minimal Epic"
    And I do not provide description
    When I create the epic
    Then the epic is created
    And the description should be empty string

  @data-driven
  Scenario Outline: Validate epic name lengths
    Given I provide epic name with <length> characters
    When I create the epic
    Then the result should be <result>

    Examples:
      | length | result  |
      | 1      | success |
      | 64     | success |
      | 128    | success |
      | 129    | failure |
      | 200    | failure |
