# Generated: 2025-10-02
# Use Case: Get Campaigns By World

Feature: Get Campaigns By World
  As a Game Master
  I want to retrieve all campaigns within an world
  So that I can view world's campaign structure

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve campaigns for world
    Given an world exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the world has 4 campaigns
    When I request campaigns for world "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive all 4 campaigns
    And each campaign should reference the correct world ID

  @happy-path
  Scenario: Successfully retrieve empty list for world with no campaigns
    Given an world exists with no campaigns
    When I request campaigns for that world
    Then I should receive an empty list
    And I should see message "No campaigns found for this world"

  @happy-path
  Scenario: Successfully retrieve standalone campaigns
    Given I own 3 standalone campaigns
    When I request campaigns with null world ID
    Then I should receive all 3 standalone campaigns
    And each campaign should have null WorldId

  @error-handling
  Scenario: Handle request for non-existent world
    Given no world exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request campaigns for world "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "World not found"

  @error-handling
  Scenario: Handle request with invalid world ID format
    Given I provide invalid world ID "not-a-guid"
    When I attempt to request campaigns for that world
    Then I should see error with validation error
    And I should see error "Invalid world ID format"

  @authorization
  Scenario: User can only see campaigns they own within world
    Given an world exists with 5 campaigns
    And I own 3 of those campaigns
    And another user owns 2 campaigns in the same world
    When I request campaigns for that world
    Then I should receive only my 3 campaigns

  @edge-case
  Scenario: Retrieve campaigns for world with mixed visibility
    Given an world has 4 campaigns:
      | Name       | IsPublished | IsPublic |
      | Campaign1  | true        | true     |
      | Campaign2  | false       | false    |
      | Campaign3  | false       | true     |
      | Campaign4  | true        | true     |
    When I request campaigns for that world
    Then I should receive all 4 campaigns
    And each should display its visibility status

  @data-driven
  Scenario Outline: Query campaigns by world association
    Given I own <in_world> campaigns within an world
    And I own <standalone> standalone campaigns
    When I request campaigns for <query_type>
    Then I should receive <expected> campaigns

    Examples:
      | in_world | standalone | query_type | expected |
      | 5       | 3          | world       | 5        |
      | 5       | 3          | null_world  | 3        |
      | 0       | 3          | world       | 0        |
