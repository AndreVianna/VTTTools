# Generated: 2025-10-02
# Use Case: Get Epics By Owner

Feature: Get Epics By Owner
  As a Game Master
  I want to retrieve all epics I own
  So that I can view my complete library of story arcs

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve multiple owned epics
    Given I own 5 epics in my library
    When I request my epics
    Then I should receive all 5 epics
    And each epic should include basic properties
    And epics should be ordered by creation date

  @happy-path
  Scenario: Successfully retrieve epics with campaign counts
    Given I own 3 epics
    And the first epic has 5 campaigns
    And the second epic has 3 campaigns
    And the third epic has no campaigns
    When I request my epics
    Then I should receive all 3 epics
    And the first epic should show 5 campaigns
    And the second epic should show 3 campaigns
    And the third epic should show 0 campaigns

  @happy-path
  Scenario: Successfully retrieve empty list when no epics owned
    Given I have no epics in my library
    When I request my epics
    Then I should receive an empty list
    And I should see message "No epics found"

  @error-handling
  Scenario: Handle request with invalid owner ID
    Given I provide invalid owner ID format "not-a-guid"
    When I attempt to request epics by owner
    Then I should see error with validation error
    And I should see error "Invalid owner ID format"

  @error-handling
  Scenario: Handle database connection failure
    Given I own epics in my library
    And the database is unavailable
    When I attempt to request my epics
    Then I should see error with server error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: User can only see their own epics
    Given I own 3 epics
    And another user owns 5 epics
    When I request my epics
    Then I should receive only my 3 epics
    And I should not see the other user's epics

  @authorization
  Scenario: Unauthorized user cannot retrieve epics
    Given I am not authenticated
    When I attempt to request epics by owner
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Retrieve large number of owned epics
    Given I own 100 epics in my library
    When I request my epics
    Then I should receive all 100 epics
    And the response should be delivered within acceptable time

  @edge-case
  Scenario: Retrieve epics with mixed visibility settings
    Given I own 3 epics:
      | Name    | IsPublished | IsPublic |
      | Epic1   | true        | true     |
      | Epic2   | false       | false    |
      | Epic3   | false       | true     |
    When I request my epics
    Then I should receive all 3 epics
    And each epic should display its visibility status

  @data-driven
  Scenario Outline: Retrieve epics filtered by publication status
    Given I own <total> epics
    And <published> epics are published
    When I request my epics filtered by IsPublished=<filter>
    Then I should receive <expected> epics

    Examples:
      | total | published | filter | expected |
      | 10    | 6         | true   | 6        |
      | 10    | 6         | false  | 4        |
      | 0     | 0         | true   | 0        |
