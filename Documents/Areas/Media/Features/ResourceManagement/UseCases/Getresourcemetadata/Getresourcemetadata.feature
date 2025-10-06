# Generated: 2025-10-02
# Use Case: Get Resource Metadata

Feature: Get Resource Metadata
  As a Game Master
  I want to retrieve resource metadata by ID
  So that I can access resource properties for display and validation

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational

  Rule: Resource ID must be valid and exist in system

    Scenario: Retrieve existing resource metadata
      Given resource exists with ID "resource-123"
      When I request metadata for "resource-123"
      Then I should receive resource metadata
      And metadata should include ID, type, path, and dimensions

    Scenario: Reject request with non-existent resource ID
      Given no resource exists with ID "nonexistent-resource"
      When I attempt to request metadata for "nonexistent-resource"
      Then I should see error with not found error
      And I should see error "Resource with ID {resourceId} not found"

    Scenario: Reject request with invalid ID format
      Given I provide invalid Guid "not-a-guid"
      When I attempt to request metadata
      Then I should see error with validation error
      And I should see error "Resource ID cannot be empty"

  @happy-path
  Scenario: Successfully retrieve complete image metadata
    Given resource exists with properties:
      | id          | resource-complete-123 |
      | type        | Image                 |
      | path        | Image/guid/dragon.png |
      | width       | 1920                  |
      | height      | 1080                  |
      | fileSize    | 2097152               |
      | contentType | image/png             |
    When I request the metadata
    Then I should receive all properties
    And width should be 1920
    And height should be 1080
    And content type should be "image/png"

  @happy-path
  Scenario: Retrieve video metadata with encoding
    Given resource exists with type "Video"
    And resource has encoding "H.264"
    When I request the metadata
    Then metadata should include video encoding
    And all video properties should be returned

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request metadata
    Then I should see error with server error
    And I should see error "Failed to retrieve resource metadata"

  @error-handling
  Scenario: Handle service timeout
    Given the Media service times out
    When I attempt to request metadata
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot retrieve metadata
    Given I am not authenticated
    And a resource exists
    When I attempt to request metadata
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Retrieve metadata for resource with no tags
    Given resource exists without tags
    When I request the metadata
    Then tags array should be empty
    And other metadata should be complete

  @integration
  Scenario: Metadata retrieval used by Assets for validation
    Given resource "resource-456" exists with type "Image"
    When Assets area queries resource metadata
    Then metadata should be returned
    And Assets can validate resource type is Image

  @performance
  Scenario: Metadata retrieval completes within threshold
    Given resource exists with ID "resource-perf-test"
    When I request the metadata
    Then the response should be received within 100ms

  @data-driven
  Scenario Outline: Retrieve metadata for different resource types
    Given resource exists with type "<type>"
    When I request the metadata
    Then type should be "<type>"
    And metadata should include type-specific properties

    Examples:
      | type      |
      | Image     |
      | Animation |
      | Video     |
