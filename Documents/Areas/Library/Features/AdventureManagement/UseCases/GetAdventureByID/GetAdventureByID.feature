# Generated: 2025-10-02
# Use Case: Get Adventure By ID

Feature: Get Adventure By ID
  As a Game Master
  I want to retrieve an adventure by its ID
  So that I can view adventure details and associated encounters

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve existing adventure
    Given an adventure exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the adventure has name "The Crystal Caverns"
    When I request the adventure by ID "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive the adventure details
    And the adventure name should be "The Crystal Caverns"

  @happy-path
  Scenario: Successfully retrieve adventure with associated encounters
    Given an adventure exists with 8 associated encounters
    When I request the adventure by its ID
    Then I should receive the adventure details
    And I should see all 8 encounters in the collection
    And each encounter should reference the correct adventure ID

  @happy-path
  Scenario: Successfully retrieve adventure with campaign association
    Given an adventure exists within a campaign
    When I request the adventure by its ID
    Then I should receive the adventure details
    And the campaign ID should be included
    And the adventure type should be displayed

  @happy-path
  Scenario: Successfully retrieve standalone adventure
    Given a standalone adventure exists
    When I request the adventure by its ID
    Then I should receive the adventure details
    And the CampaignId should be null

  @error-handling
  Scenario: Handle request for non-existent adventure
    Given no adventure exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request the adventure by ID "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @error-handling
  Scenario: Handle request with invalid ID format
    Given I provide invalid ID format "not-a-guid"
    When I attempt to request the adventure
    Then I should see error with validation error
    And I should see error "Invalid adventure ID format"

  @edge-case
  Scenario: Retrieve adventure with no encounters
    Given an adventure exists with no associated encounters
    When I request the adventure by its ID
    Then I should receive the adventure details
    And the encounters collection should be empty

  @data-driven
  Scenario Outline: Retrieve adventures with different types
    Given an adventure exists with type "<type>"
    When I request the adventure by its ID
    Then I should receive the adventure details
    And the adventure type should be "<type>"

    Examples:
      | type          |
      | Generic       |
      | DungeonCrawl  |
      | OpenWorld     |
      | Investigation |
