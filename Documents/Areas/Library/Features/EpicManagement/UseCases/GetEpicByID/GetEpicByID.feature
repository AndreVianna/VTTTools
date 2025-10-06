# Generated: 2025-10-02
# Use Case: Get Epic By ID

Feature: Get Epic By ID
  As a Game Master
  I want to retrieve an epic by its ID
  So that I can view epic details and associated campaigns

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve existing epic
    Given an epic exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the epic has name "Sleepwalkers Saga"
    When I request the epic by ID "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive the epic details
    And the epic name should be "Sleepwalkers Saga"
    And the epic should include all properties

  @happy-path
  Scenario: Successfully retrieve epic with associated campaigns
    Given an epic exists with 3 associated campaigns
    When I request the epic by its ID
    Then I should receive the epic details
    And I should see all 3 campaigns in the collection
    And each campaign should reference the correct epic ID

  @happy-path
  Scenario: Successfully retrieve epic with background resource
    Given an epic exists with background resource
    When I request the epic by its ID
    Then I should receive the epic details
    And the background resource details should be included

  @error-handling
  Scenario: Handle request for non-existent epic
    Given no epic exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request the epic by ID "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle request with invalid ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to request the epic
    Then I should see error with validation error
    And I should see error "Invalid epic ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given an epic exists in the database
    And the database is unavailable
    When I attempt to request the epic by its ID
    Then I should see error with server error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthorized user cannot retrieve private epic
    Given I am not authenticated
    And a private epic exists
    When I attempt to request the epic by its ID
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Retrieve epic with no campaigns
    Given an epic exists with no associated campaigns
    When I request the epic by its ID
    Then I should receive the epic details
    And the campaigns collection should be empty

  @edge-case
  Scenario: Retrieve epic with minimal data
    Given an epic exists with only required fields populated
    When I request the epic by its ID
    Then I should receive the epic details
    And optional fields should have default values

  @data-driven
  Scenario Outline: Retrieve epics with different visibility settings
    Given an epic exists with IsPublished=<published> and IsPublic=<public>
    And I am authenticated as <role>
    When I request the epic by its ID
    Then the result should be <result>

    Examples:
      | published | public | role         | result  |
      | true      | true   | Game Master  | success |
      | true      | true   | Player       | success |
      | false     | false  | Game Master  | success |
      | false     | false  | Player       | failure |
