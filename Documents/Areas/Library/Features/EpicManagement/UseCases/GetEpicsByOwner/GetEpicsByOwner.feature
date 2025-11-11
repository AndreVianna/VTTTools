# Generated: 2025-10-02
# Use Case: Get Worlds By Owner

Feature: Get Worlds By Owner
  As a Game Master
  I want to retrieve all worlds I own
  So that I can view my complete library of story arcs

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve multiple owned worlds
    Given I own 5 worlds in my library
    When I request my worlds
    Then I should receive all 5 worlds
    And each world should include basic properties
    And worlds should be ordered by creation date

  @happy-path
  Scenario: Successfully retrieve worlds with campaign counts
    Given I own 3 worlds
    And the first world has 5 campaigns
    And the second world has 3 campaigns
    And the third world has no campaigns
    When I request my worlds
    Then I should receive all 3 worlds
    And the first world should show 5 campaigns
    And the second world should show 3 campaigns
    And the third world should show 0 campaigns

  @happy-path
  Scenario: Successfully retrieve empty list when no worlds owned
    Given I have no worlds in my library
    When I request my worlds
    Then I should receive an empty list
    And I should see message "No worlds found"

  @error-handling
  Scenario: Handle request with invalid owner ID
    Given I provide invalid owner ID format "not-a-guid"
    When I attempt to request worlds by owner
    Then I should see error with validation error
    And I should see error "Invalid owner ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given I own worlds in my library
    And the database is unavailable
    When I attempt to request my worlds
    Then I should see error with server error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: User can only see their own worlds
    Given I own 3 worlds
    And another user owns 5 worlds
    When I request my worlds
    Then I should receive only my 3 worlds
    And I should not see the other user's worlds

  @authorization
  Scenario: Unauthorized user cannot retrieve worlds
    Given I am not authenticated
    When I attempt to request worlds by owner
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Retrieve large number of owned worlds
    Given I own 100 worlds in my library
    When I request my worlds
    Then I should receive all 100 worlds
    And the response should be delivered within acceptable time

  @edge-case
  Scenario: Retrieve worlds with mixed visibility settings
    Given I own 3 worlds:
      | Name    | IsPublished | IsPublic |
      | World1   | true        | true     |
      | World2   | false       | false    |
      | World3   | false       | true     |
    When I request my worlds
    Then I should receive all 3 worlds
    And each world should display its visibility status

  @data-driven
  Scenario Outline: Retrieve worlds filtered by publication status
    Given I own <total> worlds
    And <published> worlds are published
    When I request my worlds filtered by IsPublished=<filter>
    Then I should receive <expected> worlds

    Examples:
      | total | published | filter | expected |
      | 10    | 6         | true   | 6        |
      | 10    | 6         | false  | 4        |
      | 0     | 0         | true   | 0        |
