# Generated: 2025-10-02
# Use Case: List Resources By Tag

Feature: List Resources By Tag
  As a Game Master
  I want to search resources by tag
  So that I can discover and organize media by categories I've defined

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational

  Rule: Tag parameter must be valid format

    Scenario: Accept valid tag search
      Given resources exist with tag "fantasy"
      When I request resources with tag "fantasy"
      Then I should receive only resources tagged with "fantasy"

    Scenario: Accept tag with spaces and hyphens
      Given resources exist with tag "dungeon-map"
      When I request resources with tag "dungeon-map"
      Then I should receive matching resources

    Scenario: Tag search is case-insensitive
      Given resource exists with tag "Fantasy"
      When I request resources with tag "fantasy"
      Then I should receive the resource
      And case should not affect results

  @happy-path
  Scenario: Successfully find resources by tag
    Given resources exist with tags:
      | id          | tags                        |
      | resource-1  | ["fantasy", "dungeon"]      |
      | resource-2  | ["sci-fi", "space"]         |
      | resource-3  | ["fantasy", "forest"]       |
    When I request resources with tag "fantasy"
    Then I should receive 2 resources
    And resource-1 and resource-3 should be in results
    And resource-2 should not be in results

  @happy-path
  Scenario: Empty result when no resources have tag
    Given no resources exist with tag "nonexistent-tag"
    When I request resources with tag "nonexistent-tag"
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle empty tag parameter
    Given I provide empty tag string
    When I attempt to request resources by tag
    Then I should see error with validation error
    And I should see error "Tag parameter cannot be empty"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request resources by tag
    Then I should see error with server error
    And I should see error "Failed to retrieve resources"

  @error-handling
  Scenario: Handle service timeout
    Given the Media service times out
    When I attempt to request resources by tag
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Authenticated users can search by tag
    Given I am authenticated
    And resources exist with tags
    When I request resources by tag
    Then I should receive matching resources

  @authorization
  Scenario: Unauthenticated user can search public resources
    Given I am not authenticated
    And public resources exist with tags
    When I request resources by tag
    Then I should receive publicly accessible tagged resources

  @edge-case
  Scenario: Resource with multiple tags matches single tag query
    Given resource exists with tags ["fantasy", "dungeon", "dark"]
    When I request resources with tag "dungeon"
    Then I should receive the resource
    And all tags should be included in response

  @edge-case
  Scenario: Tag search with special characters
    Given resource exists with tag "sci-fi_theme"
    When I request resources with tag "sci-fi_theme"
    Then I should receive the resource

  @pagination
  Scenario: Search by tag with pagination
    Given 100 resources exist with tag "popular"
    When I request resources with tag "popular" and page size 20
    Then I should receive 20 resources per page
    And all resources should have tag "popular"

  @sorting
  Scenario: Sort tagged resources
    Given resources exist with tag "dungeon":
      | path          | uploadedAt |
      | file1.png     | 2025-01-03 |
      | file2.png     | 2025-01-01 |
      | file3.png     | 2025-01-02 |
    When I request tagged resources sorted by upload date descending
    Then resources should be ordered: file1.png, file3.png, file2.png

  @performance
  Scenario: Tag search completes within threshold
    Given 1000 resources exist with various tags
    And 50 resources have tag "searchable"
    When I request resources with tag "searchable"
    Then the response should be received within 100ms
    And exactly 50 resources should be returned

  @integration
  Scenario: Tag updates are immediately searchable
    Given resource exists with tags ["old"]
    When I update tags to ["new", "updated"]
    And I search for resources with tag "updated"
    Then the resource should be found
    And search should reflect updated tags

  @data-driven
  Scenario Outline: Search with different tag formats
    Given resource exists with tag "<tag>"
    When I request resources with tag "<searchTag>"
    Then I should receive "<result>"

    Examples:
      | tag           | searchTag     | result  |
      | fantasy       | fantasy       | found   |
      | Fantasy       | fantasy       | found   |
      | dungeon-map   | dungeon-map   | found   |
      | dark theme    | dark theme    | found   |
      | fantasy       | sci-fi        | empty   |
