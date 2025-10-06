# Generated: 2025-10-02
# Use Case: Get Campaign By ID

Feature: Get Campaign By ID
  As a Game Master
  I want to retrieve a campaign by its ID
  So that I can view campaign details and associated adventures

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve existing campaign
    Given a campaign exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the campaign has name "Dragon Quest Campaign"
    When I request the campaign by ID "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive the campaign details
    And the campaign name should be "Dragon Quest Campaign"

  @happy-path
  Scenario: Successfully retrieve campaign with associated adventures
    Given a campaign exists with 5 associated adventures
    When I request the campaign by its ID
    Then I should receive the campaign details
    And I should see all 5 adventures in the collection

  @happy-path
  Scenario: Successfully retrieve campaign with epic association
    Given a campaign exists within an epic
    When I request the campaign by its ID
    Then I should receive the campaign details
    And the epic ID should be included

  @happy-path
  Scenario: Successfully retrieve standalone campaign
    Given a standalone campaign exists
    When I request the campaign by its ID
    Then I should receive the campaign details
    And the EpicId should be null

  @error-handling
  Scenario: Handle request for non-existent campaign
    Given no campaign exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request the campaign by ID "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @error-handling
  Scenario: Handle request with invalid ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to request the campaign
    Then I should see error with validation error
    And I should see error "Invalid campaign ID format"

  @edge-case
  Scenario: Retrieve campaign with no adventures
    Given a campaign exists with no associated adventures
    When I request the campaign by its ID
    Then I should receive the campaign details
    And the adventures collection should be empty

  @data-driven
  Scenario Outline: Retrieve campaigns with different visibility settings
    Given a campaign exists with IsPublished=<published> and IsPublic=<public>
    And I am authenticated as <role>
    When I request the campaign by its ID
    Then the result should be <result>

    Examples:
      | published | public | role        | result  |
      | true      | true   | Game Master | success |
      | true      | true   | Player      | success |
      | false     | false  | Game Master | success |
      | false     | false  | Player      | failure |
