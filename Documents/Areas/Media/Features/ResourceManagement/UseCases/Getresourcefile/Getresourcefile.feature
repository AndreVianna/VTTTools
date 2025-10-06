# Generated: 2025-10-02
# Use Case: Get Resource File

Feature: Get Resource File
  As a Game Master or client application
  I want to stream media files from blob storage
  So that I can display and use media resources in the application

  Background:
    Given the Media storage service is operational
    

  Rule: Resource must exist in both database and blob storage

    Scenario: Stream existing resource file
      Given resource exists with ID "resource-123" and path "Image/guid/dragon.png"
      And file exists in blob storage at path
      When I request the resource file
      Then I should receive file stream
      And content type should match resource metadata

    Scenario: Reject request when resource not found in database
      Given no resource exists with ID "nonexistent-resource"
      When I attempt to request the file
      Then I should see error with not found error
      And I should see error "Resource with ID {resourceId} not found"

    Scenario: Handle missing file in blob storage
      Given resource exists in database with ID "resource-orphan"
      And file does not exist in blob storage
      When I attempt to request the file
      Then I should see error with not found error
      And I should see error "Resource file not found in storage"

  @happy-path
  Scenario: Successfully stream image file
    Given resource exists with type "Image"
    And file exists in blob storage
    When I request the resource file
    Then I should receive file stream
    And content type should be "image/png"
    And file should be streamable

  @happy-path
  Scenario: Stream video file for playback
    Given resource exists with type "Video"
    And file is 10MB MP4 video
    When I request the resource file
    Then I should receive video stream
    And content type should be "video/mp4"

  @error-handling
  Scenario: Handle blob storage unavailable
    Given resource exists in database
    And blob storage is unavailable
    When I attempt to request the file
    Then I should see error with service unavailable error
    And I should see error "Media storage is temporarily unavailable"

  @error-handling
  Scenario: Handle database connection failure
    Given the database is unavailable
    When I attempt to request a file
    Then I should see error with server error
    And I should see error "Failed to retrieve resource"

  @authorization
  Scenario: Public resources accessible without authentication
    Given resource exists and is publicly accessible
    And I am not authenticated
    When I request the resource file
    Then I should receive file stream

  @authorization
  Scenario: Authenticated users can access authorized resources
    Given resource exists requiring authentication
    And I am authenticated
    When I request the resource file
    Then I should receive file stream

  @edge-case
  Scenario: Stream large video file efficiently
    Given resource exists with 500MB video file
    When I request the resource file
    Then file should stream progressively
    And not load entirely into memory

  @performance
  Scenario: File stream starts within threshold
    Given resource exists with 10MB file
    When I request the resource file
    Then streaming should start within 1 second

  @integration
  Scenario: File served to Assets for display
    Given resource "resource-789" exists with image file
    When Assets area requests file for display
    Then file stream should be provided
    And image should be displayable

  @data-driven
  Scenario Outline: Stream different media types
    Given resource exists with type "<type>" and content type "<contentType>"
    When I request the resource file
    Then stream should have content type "<contentType>"

    Examples:
      | type      | contentType |
      | Image     | image/png   |
      | Image     | image/jpeg  |
      | Animation | image/gif   |
      | Video     | video/mp4   |
