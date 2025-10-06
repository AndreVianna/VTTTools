# Generated: 2025-10-02
# Use Case: List All Resources

Feature: List All Resources
  As a Game Master or administrator
  I want to view all media resources in the system
  So that I can perform administrative operations and manage the media library

  Background:
    Given I am authenticated as an administrator
    And the Media storage service is operational

  Rule: Only administrators can list all resources

    Scenario: Admin can list all resources
      Given I am authenticated as an admin
      And multiple resources exist with different types
      When I request all resources
      Then I should receive the complete resource list

    Scenario: Non-admin user cannot list all resources
      Given I am authenticated as a regular user (not admin)
      When I attempt to request all resources
      Then I should see error with forbidden error
      And I should see error "Access denied - admin role required"

  @happy-path
  Scenario: Successfully retrieve all resources
    Given resources exist in the system:
      | id          | type      | path                    |
      | resource-1  | Image     | Image/guid1/image.png   |
      | resource-2  | Video     | Video/guid2/video.mp4   |
      | resource-3  | Animation | Animation/guid3/anim.gif|
    And I am authenticated as an admin
    When I request all resources
    Then I should receive 3 resources
    And the list should include all resource metadata

  @happy-path
  Scenario: Empty result when no resources exist
    Given no resources exist in the system
    And I am authenticated as an admin
    When I request all resources
    Then I should receive an empty array
    And I should receive 200 OK status

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request all resources
    Then I should see error with server error
    And I should see error "Failed to retrieve resources"

  @error-handling
  Scenario: Handle service timeout
    Given the Media service times out
    When I attempt to request all resources
    Then I should see error with timeout error
    And I should see error "Service temporarily unavailable"

  @authorization
  Scenario: Unauthenticated user cannot list all resources
    Given I am not authenticated
    When I attempt to request all resources
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: List includes resources of all types
    Given resources exist:
      | type      | count |
      | Image     | 10    |
      | Video     | 5     |
      | Animation | 3     |
    And I am authenticated as an admin
    When I request all resources
    Then I should receive 18 resources total
    And all three types should be represented

  @edge-case
  Scenario: List handles large resource collections
    Given 1000 resources exist in the system
    And I am authenticated as an admin
    When I request all resources
    Then I should receive all 1000 resources
    And the response should complete within 2 seconds

  @pagination
  Scenario: List resources with pagination
    Given 100 resources exist
    And I am authenticated as an admin
    When I request resources with page size 20
    Then I should receive 20 resources per page
    And pagination metadata should indicate total count of 100

  @sorting
  Scenario: Sort resources by upload date
    Given resources exist with different upload dates:
      | path          | uploadedAt |
      | file1.png     | 2025-01-03 |
      | file2.png     | 2025-01-01 |
      | file3.png     | 2025-01-02 |
    And I am authenticated as an admin
    When I request all resources sorted by upload date descending
    Then resources should be ordered: file1.png, file3.png, file2.png

  @filtering
  Scenario: Filter resources by type
    Given resources exist with different types
    And I am authenticated as an admin
    When I request all resources filtered by type "Image"
    Then I should receive only Image resources

  @performance
  Scenario: List operation completes within threshold
    Given 500 resources exist
    And I am authenticated as an admin
    When I request all resources
    Then the response should be received within 1 second

  @data-driven
  Scenario Outline: List resources with different user roles
    Given I am authenticated with role "<role>"
    When I attempt to request all resources
    Then the result should be "<result>"

    Examples:
      | role        | result    |
      | admin       | success   |
      | game_master | forbidden |
      | player      | forbidden |
