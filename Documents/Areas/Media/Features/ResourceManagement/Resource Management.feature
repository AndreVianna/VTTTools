# Generated: 2025-10-02
# Feature: Resource Management

Feature: Resource Management
  As a Game Master
  I want to manage media resources for images, animations, and videos
  So that I can store and organize media files used throughout the application

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational
    

  Rule: Resource path must be unique across all resources

    Scenario: Accept resource with unique path
      Given no resource exists with path "images/dragon-token.png"
      When I upload a file that generates path "images/dragon-token.png"
      Then the resource is created
      And the path should be unique

    Scenario: Reject duplicate path (handled by GUID-based generation)
      Given resources are uploaded with same filename
      When multiple uploads occur
      Then each resource should have unique GUID-based path
      And no path collisions should occur

  Rule: Resource type must match file content type

    Scenario: Accept image file with Image type
      Given I upload PNG file with content type "image/png"
      And I specify type "Image"
      When I upload the resource
      Then the resource is created
      And the type should match content

    Scenario: Reject image file with wrong type
      Given I upload PNG file with content type "image/png"
      And I specify type "Video"
      When I attempt to upload the resource
      Then I should see error with validation error
      And I should see error "File content type does not match specified resource type"

  @happy-path
  Scenario: Successfully upload image resource with metadata extraction
    Given I have a PNG image file (1920x1080, 2MB)
    When I upload the file as type "Image"
    Then the resource should be uploaded to blob storage
    And resource metadata should be created
    And metadata should include width 1920 and height 1080
    And file size should be recorded as 2MB

  @happy-path
  Scenario: Upload resource with tags for organization
    Given I have an image file
    And I provide tags ["fantasy", "dungeon", "dark"]
    When I upload the resource
    Then the resource should be created with tags
    And tags should be searchable

  @error-handling
  Scenario: Handle empty file stream
    Given I provide empty file stream
    When I attempt to upload the resource
    Then I should see error with validation error
    And I should see error "File stream is empty or null"

  @error-handling
  Scenario: Handle file size exceeding limit
    Given I upload image file exceeding 50MB limit
    When I attempt to upload the resource
    Then I should see error with payload too large error
    And I should see error "File size exceeds maximum allowed size of 50MB"

  @error-handling
  Scenario: Handle metadata extraction failure
    Given I upload corrupted image file
    When I attempt to upload the resource
    Then I should see error with unprocessable entity error
    And I should see error "Failed to extract metadata from file"

  @error-handling
  Scenario: Handle blob storage upload failure
    Given blob storage is unavailable
    When I attempt to upload a resource
    Then I should see error with bad gateway error
    And I should see error "Failed to upload file to storage"

  @error-handling
  Scenario: Handle transaction rollback on entity creation failure
    Given resource uploads to blob storage successfully
    And database entity creation fails
    When the upload completes
    Then the blob storage file is removed
    And I should see error "Failed to save resource metadata. Upload rolled back."

  @edge-case
  Scenario: Upload resource with maximum allowed file size
    Given I upload image file at exactly 50MB
    When I upload the resource
    Then the resource is created
    And file size should be recorded correctly

  @edge-case
  Scenario: Upload video resource with encoding metadata
    Given I upload MP4 video (1280x720, 10MB, H.264)
    And I specify type "Video"
    When I upload the resource
    Then the resource is created
    And metadata should include encoding "H.264"

  @integration
  Scenario: Uploaded resource can be referenced by Assets
    Given I upload image resource successfully
    And resource ID is "resource-123"
    When Assets area queries resource "resource-123"
    Then the resource should be retrievable
    And resource type should be "Image"

  @integration
  Scenario: Resource deletion checks cross-area references
    Given resource "resource-456" exists
    And Asset "asset-789" references resource "resource-456"
    When I attempt to delete resource "resource-456"
    Then I should see error with conflict error
    And I should see error indicating asset usage

  @authorization
  Scenario: Unauthorized user cannot upload resources
    Given I am not authenticated
    When I attempt to upload a resource
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @performance
  Scenario: Resource upload completes within threshold
    Given I upload 10MB image file
    When I upload the resource
    Then metadata extraction should complete within 1 second
    And total upload should complete within 15 seconds

  @data-driven
  Scenario Outline: Upload different media types
    Given I upload file with type "<fileType>" and content type "<contentType>"
    And I specify resource type "<resourceType>"
    When I upload the resource
    Then the result should be "<result>"

    Examples:
      | fileType | contentType | resourceType | result  |
      | PNG      | image/png   | Image        | success |
      | JPEG     | image/jpeg  | Image        | success |
      | MP4      | video/mp4   | Video        | success |
      | GIF      | image/gif   | Animation    | success |
      | PNG      | image/png   | Video        | error   |
      | MP4      | video/mp4   | Image        | error   |
