# Generated: 2025-10-02
# Use Case: Get World By ID

Feature: Get World By ID
  As a Game Master
  I want to retrieve an world by its ID
  So that I can view world details and associated campaigns

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve existing world
    Given an world exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the world has name "Sleepwalkers Saga"
    When I request the world by ID "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive the world details
    And the world name should be "Sleepwalkers Saga"
    And the world should include all properties

  @happy-path
  Scenario: Successfully retrieve world with associated campaigns
    Given an world exists with 3 associated campaigns
    When I request the world by its ID
    Then I should receive the world details
    And I should see all 3 campaigns in the collection
    And each campaign should reference the correct world ID

  @happy-path
  Scenario: Successfully retrieve world with background resource
    Given an world exists with background resource
    When I request the world by its ID
    Then I should receive the world details
    And the background resource details should be included

  @error-handling
  Scenario: Handle request for non-existent world
    Given no world exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request the world by ID "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "World not found"

  @error-handling
  Scenario: Handle request with invalid ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to request the world
    Then I should see error with validation error
    And I should see error "Invalid world ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given an world exists in the database
    And the database is unavailable
    When I attempt to request the world by its ID
    Then I should see error with server error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthorized user cannot retrieve private world
    Given I am not authenticated
    And a private world exists
    When I attempt to request the world by its ID
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Retrieve world with no campaigns
    Given an world exists with no associated campaigns
    When I request the world by its ID
    Then I should receive the world details
    And the campaigns collection should be empty

  @edge-case
  Scenario: Retrieve world with minimal data
    Given an world exists with only required fields populated
    When I request the world by its ID
    Then I should receive the world details
    And optional fields should have default values

  @data-driven
  Scenario Outline: Retrieve worlds with different visibility settings
    Given an world exists with IsPublished=<published> and IsPublic=<public>
    And I am authenticated as <role>
    When I request the world by its ID
    Then the result should be <result>

    Examples:
      | published | public | role         | result  |
      | true      | true   | Game Master  | success |
      | true      | true   | Player       | success |
      | false     | false  | Game Master  | success |
      | false     | false  | Player       | failure |
