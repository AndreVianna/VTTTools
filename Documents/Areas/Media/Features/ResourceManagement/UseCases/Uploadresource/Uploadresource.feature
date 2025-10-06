# Generated: 2025-10-02
# Use Case: Upload Resource

Feature: Upload Resource
  As a Game Master
  I want to upload media files to blob storage
  So that I can store images, animations, and videos for use in my games

  Background:
    Given I am authenticated as a Game Master
    And the Media storage service is operational
    

  Rule: Resource path must be unique (enforced via GUID-based generation)

    Scenario: Generate unique path for each upload
      Given I upload file "dragon.png"
      When the resource is processed
      Then a unique GUID-based path is generated
      And the path format should be "{type}/{guid}/{filename}"

    Scenario: Multiple uploads with same filename get unique paths
      Given I upload file "token.png" twice
      When both uploads are processed
      Then each should have different GUID in path
      And no path collision should occur

  Rule: Resource type must match file content type

    Scenario: Accept image with correct type
      Given I upload PNG file with content type "image/png"
      And I specify type "Image"
      When I upload the resource
      Then the resource is created

    Scenario: Reject type mismatch
      Given I upload video file with content type "video/mp4"
      And I specify type "Image"
      When I attempt to upload the resource
      Then I should see error with validation error
      And I should see error "File content type 'video/mp4' does not match specified resource type 'Image'"

    Scenario: Accept video with correct type
      Given I upload MP4 file with content type "video/mp4"
      And I specify type "Video"
      When I upload the resource
      Then the resource is created

  Rule: File size cannot exceed configured maximum

    Scenario: Accept file within size limit
      Given I upload image file of 10MB
      And the maximum size is 50MB
      When I upload the resource
      Then the resource is created

    Scenario: Reject file exceeding size limit
      Given I upload image file of 60MB
      And the maximum size is 50MB
      When I attempt to upload the resource
      Then I should see error with payload too large error
      And I should see error "File size exceeds maximum allowed size of 50MB"

  @happy-path
  Scenario: Successfully upload image with metadata extraction
    Given I have PNG image file with properties:
      | width       | 1920            |
      | height      | 1080            |
      | fileSize    | 2MB             |
      | contentType | image/png       |
    And I specify type "Image"
    When I upload the resource
    Then the file should be uploaded to blob storage
    And resource entity should be created
    And metadata should include extracted properties
    And resource ID is generated

  @happy-path
  Scenario: Upload resource with tags
    Given I have image file "fantasy-map.png"
    And I provide tags ["fantasy", "map", "dungeon"]
    When I upload the resource
    Then the resource is created
    And the tags is saved with resource

  @error-handling
  Scenario: Handle empty file stream
    Given I provide empty file stream
    When I attempt to upload the resource
    Then I should see error with bad request error
    And I should see error "File stream is empty or null"

  @error-handling
  Scenario: Handle invalid file name
    Given I provide file stream without filename
    When I attempt to upload the resource
    Then I should see error with bad request error
    And I should see error "File name is invalid or missing extension"

  @error-handling
  Scenario: Handle metadata extraction failure
    Given I upload corrupted image file
    When I attempt to upload the resource
    Then I should see error with unprocessable entity error
    And I should see error "Failed to extract metadata from file. File may be corrupted."

  @error-handling
  Scenario: Handle blob storage upload failure
    Given blob storage is unavailable
    When I attempt to upload a resource
    Then I should see error with bad gateway error
    And I should see error "Failed to upload file to storage. Please try again."

  @error-handling
  Scenario: Rollback on entity creation failure
    Given file uploads to blob storage successfully
    And database entity creation fails
    When the operation completes
    Then the blob storage file is removed
    And I should see error "Failed to save resource metadata. Upload rolled back."

  @authorization
  Scenario: Unauthenticated user cannot upload resources
    Given I am not authenticated
    When I attempt to upload a resource
    Then I should see error with unauthorized error
    And I should receive 401 status code

  @edge-case
  Scenario: Upload file at maximum size limit
    Given I upload image file at exactly 50MB
    When I upload the resource
    Then the resource is created
    And file size should be 50MB

  @edge-case
  Scenario: Upload video with encoding metadata
    Given I upload MP4 video file with properties:
      | width       | 1280         |
      | height      | 720          |
      | fileSize    | 10MB         |
      | encoding    | H.264        |
      | contentType | video/mp4    |
    And I specify type "Video"
    When I upload the resource
    Then metadata should include encoding "H.264"
    And all video properties should be extracted

  @edge-case
  Scenario: Upload animated GIF as Animation type
    Given I upload GIF file with content type "image/gif"
    And I specify type "Animation"
    When I upload the resource
    Then the resource is created
    And type should be "Animation"

  @integration
  Scenario: Transaction ensures synchronization between blob and entity
    Given I upload valid image file
    When the upload is processed
    Then file should be in blob storage
    And entity should be in database
    And path should match between both

  @performance
  Scenario: Metadata extraction completes within threshold
    Given I upload 5MB image file
    When I upload the resource
    Then metadata extraction should complete within 1 second
    And total operation should complete within 10 seconds

  @performance
  Scenario: Large file upload completes within threshold
    Given I upload 100MB video file
    When I upload the resource
    Then the upload should complete within 30 seconds

  @data-driven
  Scenario Outline: Upload different file types with validation
    Given I upload file with content type "<contentType>"
    And I specify resource type "<resourceType>"
    When I upload the resource
    Then the result should be "<result>"

    Examples:
      | contentType | resourceType | result  |
      | image/png   | Image        | success |
      | image/jpeg  | Image        | success |
      | image/gif   | Animation    | success |
      | video/mp4   | Video        | success |
      | video/webm  | Video        | success |
      | image/png   | Video        | error   |
      | video/mp4   | Image        | error   |
      | audio/mp3   | Image        | error   |
