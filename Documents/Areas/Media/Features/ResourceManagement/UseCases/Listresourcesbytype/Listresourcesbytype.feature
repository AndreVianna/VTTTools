# Generated: 2025-10-02
# Use Case: List Resources By Type

Feature: List Resources By Type
  As a Game Master
  I want to filter resources by media type
  So that I can find specific categories of media for my game

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational

  Rule: Type parameter must be valid ResourceType enum value

    Scenario: Accept valid resource type
      Given resources exist with type "Image"
      When I request resources filtered by type "Image"
      Then I should receive only Image resources

    Scenario: Reject invalid resource type
      Given I provide invalid type "InvalidType"
      When I attempt to request resources by type
      Then I should see error with validation error
      And I should see error listing valid resource types

  @happy-path
  Scenario: Successfully filter resources by Image type
    Given resources exist:
      | id          | type      |
      | resource-1  | Image     |
      | resource-2  | Video     |
      | resource-3  | Image     |
      | resource-4  | Animation |
    When I request resources filtered by type "Image"
    Then I should receive 2 Image resources
    And resource-2 and resource-4 should not be in results

  @happy-path
  Scenario: Empty result when no resources of type exist
    Given no resources exist of type "Video"
    When I request resources filtered by type "Video"
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request resources by type
    Then I should see error with server error
    And I should see error "Failed to retrieve resources"

  @error-handling
  Scenario: Handle service timeout
    Given the Media service times out
    When I attempt to request resources by type
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Authenticated users can filter by type
    Given I am authenticated
    And resources exist of type "Animation"
    When I request resources filtered by type "Animation"
    Then I should receive Animation resources

  @authorization
  Scenario: Unauthenticated user can filter public resources
    Given I am not authenticated
    And public resources exist
    When I request resources filtered by type
    Then I should receive publicly accessible resources only

  @edge-case
  Scenario: Filter returns all three valid types
    Given resources exist for all types
    When I filter by "Image", "Video", and "Animation" sequentially
    Then each query should return only resources of specified type

  @pagination
  Scenario: Filter by type with pagination
    Given 100 resources exist of type "Image"
    When I request Image resources with page size 25
    Then I should receive 25 resources per page
    And all resources should be of type "Image"

  @sorting
  Scenario: Sort filtered resources
    Given resources exist of type "Image":
      | path             |
      | zebra.png        |
      | apple.png        |
      | dragon.png       |
    When I request Image resources sorted by path ascending
    Then resources should be ordered: apple.png, dragon.png, zebra.png

  @performance
  Scenario: Type filter query completes within threshold
    Given 500 resources exist with various types
    And 200 resources are of type "Image"
    When I request resources filtered by type "Image"
    Then the response should be received within 500ms
    And exactly 200 resources should be returned

  @data-driven
  Scenario Outline: Filter by different resource types
    Given resources exist with type "<resourceType>"
    When I request resources filtered by type "<resourceType>"
    Then I should receive only resources of type "<resourceType>"

    Examples:
      | resourceType |
      | Image        |
      | Video        |
      | Animation    |
