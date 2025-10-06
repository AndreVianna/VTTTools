# Generated: 2025-10-02
# Use Case: Update Resource Tags

Feature: Update Resource Tags
  As a Game Master
  I want to modify resource tags
  So that I can organize and categorize my media library

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational

  Rule: Tags must be valid format (alphanumeric with spaces/hyphens, max 50 chars each)

    Scenario: Accept valid tags
      Given resource "resource-123" exists
      And I provide tags ["fantasy", "dungeon-map", "dark theme"]
      When I update the resource tags
      Then the tags is updated successfully

    Scenario: Reject tags exceeding maximum length
      Given resource "resource-123" exists
      And I provide tag with 51 characters
      When I attempt to update the resource tags
      Then I should see error with validation error
      And I should see error "Tag length cannot exceed 50 characters"

    Scenario: Accept empty tags array
      Given resource "resource-123" exists with tags
      And I provide empty tags array
      When I update the resource tags
      Then tags should be cleared
      And resource should have no tags

  Rule: Resource must exist to update tags

    Scenario: Update tags for existing resource
      Given resource "resource-123" exists
      And I provide new tags
      When I update the resource tags
      Then the tags is updated successfully

    Scenario: Reject update for non-existent resource
      Given no resource exists with ID "nonexistent-resource"
      When I attempt to update tags for "nonexistent-resource"
      Then I should see error with not found error
      And I should see error "Resource with ID {resourceId} not found"

  @happy-path
  Scenario: Successfully update resource tags
    Given resource exists with ID "resource-123"
    And resource has tags ["old", "tags"]
    And I provide new tags ["fantasy", "dungeon", "map"]
    When I update the resource tags
    Then tags should be ["fantasy", "dungeon", "map"]
    And old tags should be replaced

  @happy-path
  Scenario: Add tags to resource without tags
    Given resource exists with no tags
    And I provide tags ["new", "tags"]
    When I update the resource tags
    Then resource should have 2 tags
    And tags should be searchable

  @error-handling
  Scenario: Handle invalid resource ID
    Given I provide empty Guid
    When I attempt to update tags
    Then I should see error with validation error
    And I should see error "Resource ID cannot be empty"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to update tags
    Then I should see error with server error
    And I should see error "Failed to update resource tags"

  @error-handling
  Scenario: Handle service timeout
    Given the Media service times out
    When I attempt to update tags
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot update tags
    Given I am not authenticated
    And a resource exists
    When I attempt to update tags
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Clear all tags from resource
    Given resource exists with tags ["tag1", "tag2", "tag3"]
    And I provide empty tags array
    When I update the resource tags
    Then resource should have no tags
    And tags array should be empty

  @edge-case
  Scenario: Update with duplicate tags
    Given resource exists
    And I provide tags ["fantasy", "fantasy", "dungeon"]
    When I update the resource tags
    Then duplicate tags is removed
    And final tags should be ["fantasy", "dungeon"]

  @edge-case
  Scenario: Update with maximum number of tags
    Given resource exists
    And I provide 20 tags
    When I update the resource tags
    Then all 20 tags is saved
    And tags should be retrievable

  @integration
  Scenario: Updated tags are searchable via List Resources By Tag
    Given resource exists with ID "resource-123"
    When I update tags to ["searchable", "test"]
    Then the resource should be findable by tag "searchable"
    And List Resources By Tag should return the resource

  @performance
  Scenario: Tag update completes within threshold
    Given resource exists
    And I provide 10 tags
    When I update the resource tags
    Then the operation should complete within 200ms

  @data-driven
  Scenario Outline: Validate tag format requirements
    Given resource exists
    And I provide tag "<tag>"
    When I attempt to update the resource tags
    Then the result should be "<result>"

    Examples:
      | tag                          | result  |
      | fantasy                      | success |
      | dungeon-map                  | success |
      | dark theme                   | success |
      | tag_with_underscore          | success |
      | tag123                       | success |
      | tag-with-51-characters-exceeds-max-length-limit-x | error   |
      |                              | error   |
