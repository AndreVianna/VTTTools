# Generated: 2025-10-02
# Use Case: Create World

Feature: Create World
  As a Game Master
  I want to create a new world
  So that I can establish a top-level story arc for my campaigns

  Background:
    Given I am authenticated as a Game Master
    And my user account exists in the Identity context
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Create world with valid name
      Given I provide world name "The Sleepwalkers Saga"
      When I create the world
      Then the world should be created with generated ID
      And the world name should be "The Sleepwalkers Saga"

    Scenario: Reject world creation with empty name
      Given I provide empty world name
      When I attempt to create the world
      Then I should see error with validation error
      And I should see error "World name is required"
      And the world should not be persisted

    Scenario: Reject world creation with name exceeding 128 characters
      Given I provide world name with 129 characters
      When I attempt to create the world
      Then I should see error with validation error
      And I should see error "World name must not exceed 128 characters"
      And the world should not be persisted

  Rule: Description cannot exceed 4096 characters

    Scenario: Create world with maximum description length
      Given I provide world with description of exactly 4096 characters
      When I create the world
      Then the world is created
      And the full description should be preserved

    Scenario: Reject world with description exceeding maximum
      Given I provide world with description of 4097 characters
      When I attempt to create the world
      Then I should see error with validation error
      And I should see error "World description must not exceed 4096 characters"

  Rule: Published worlds must be public

    Scenario: Create published and public world
      Given I provide world with IsPublished=true and IsPublic=true
      When I create the world
      Then the world is created
      And the world should be marked as published
      And the world should be marked as public

    Scenario: Reject published world that is not public
      Given I provide world with IsPublished=true and IsPublic=false
      When I attempt to create the world
      Then I should see error with validation error
      And I should see error "Published worlds must be public"

  @happy-path
  Scenario: Successfully create world with all properties
    Given I provide valid world data:
      | Field        | Value                      |
      | Name         | Sleepwalkers Awakening     |
      | Description  | A multi-campaign world      |
      | IsPublished  | false                      |
      | IsPublic     | false                      |
    When I create the world
    Then the world is saved in the database
    And an WorldCreated domain action is logged
    And I should receive the world with generated ID
    And the world should be retrievable by ID

  @happy-path
  Scenario: Successfully create world with campaigns collection
    Given I provide valid world data
    And I provide 3 valid campaigns in the collection
    When I create the world
    Then the world is created
    And all 3 campaigns is saved
    And each campaign should reference the world ID
    And an WorldCreated domain action is logged

  @error-handling
  Scenario: Handle world creation with invalid owner ID
    Given I provide world with owner ID that doesn't exist
    When I attempt to create the world
    Then I should see error with not found error
    And I should see error "Owner user not found"
    And the world should not be persisted

  @error-handling
  Scenario: Handle world creation with invalid background resource
    Given I provide world with background resource ID that doesn't exist
    When I attempt to create the world
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"
    And the world should not be persisted

  @error-handling
  Scenario: Handle world creation with non-image background resource
    Given I provide world with background resource that is not an image
    When I attempt to create the world
    Then I should see error with validation error
    And I should see error "Background resource not found or not an image"

  @error-handling
  Scenario: Handle database persistence failure
    Given I provide valid world data
    And the database is unavailable
    When I attempt to create the world
    Then I should see error with server error
    And I should see error "Failed to create world"

  @authorization
  Scenario: Unauthorized user cannot create world
    Given I am not authenticated
    When I attempt to create an world
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Create world with optional background resource
    Given I provide valid world data
    And I provide valid image resource as background
    When I create the world
    Then the world is created
    And the background resource should be associated

  @edge-case
  Scenario: Create world without optional description
    Given I provide world name "Minimal World"
    And I do not provide description
    When I create the world
    Then the world is created
    And the description should be empty string

  @data-driven
  Scenario Outline: Validate world name lengths
    Given I provide world name with <length> characters
    When I create the world
    Then the result should be <result>

    Examples:
      | length | result  |
      | 1      | success |
      | 64     | success |
      | 128    | success |
      | 129    | failure |
      | 200    | failure |
