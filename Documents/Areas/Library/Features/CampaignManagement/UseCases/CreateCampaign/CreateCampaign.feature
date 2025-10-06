# Generated: 2025-10-02
# Use Case: Create Campaign

Feature: Create Campaign
  As a Game Master
  I want to create a new campaign
  So that I can organize adventures into connected storylines

  Background:
    Given I am authenticated as a Game Master
    And my user account exists in the Identity context
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Create campaign with valid name
      Given I provide campaign name "The Dragon's Hoard"
      When I create the campaign
      Then the campaign should be created with generated ID
      And the campaign name should be "The Dragon's Hoard"

    Scenario: Reject campaign with empty name
      Given I provide empty campaign name
      When I attempt to create the campaign
      Then I should see error with validation error
      And I should see error "Campaign name is required"

    Scenario: Reject campaign with name exceeding 128 characters
      Given I provide campaign name with 129 characters
      When I attempt to create the campaign
      Then I should see error with validation error
      And I should see error "Campaign name must not exceed 128 characters"

  Rule: Published campaigns must be public

    Scenario: Create published and public campaign
      Given I provide campaign with IsPublished=true and IsPublic=true
      When I create the campaign
      Then the campaign is created
      And the campaign should be marked as published
      And the campaign should be marked as public

    Scenario: Reject published campaign that is not public
      Given I provide campaign with IsPublished=true and IsPublic=false
      When I attempt to create the campaign
      Then I should see error with validation error
      And I should see error "Published campaigns must be public"

  Rule: Campaign can optionally belong to an epic

    Scenario: Create standalone campaign without epic
      Given I provide valid campaign data
      And I do not specify an epic ID
      When I create the campaign
      Then the campaign is created
      And the EpicId should be null
      And the campaign should be standalone

    Scenario: Create campaign within existing epic
      Given I own an epic with ID "550e8400-e29b-41d4-a716-446655440000"
      And I provide valid campaign data with that epic ID
      When I create the campaign
      Then the campaign is created
      And the EpicId should be "550e8400-e29b-41d4-a716-446655440000"

    Scenario: Reject campaign with non-existent epic ID
      Given I provide campaign with epic ID that doesn't exist
      When I attempt to create the campaign
      Then I should see error with not found error
      And I should see error "Epic not found"

  @happy-path
  Scenario: Successfully create campaign with all properties
    Given I provide valid campaign data:
      | Field        | Value                         |
      | Name         | The Lost Kingdom Campaign     |
      | Description  | A multi-adventure storyline   |
      | IsPublished  | false                         |
      | IsPublic     | false                         |
    When I create the campaign
    Then the campaign is saved in the database
    And a CampaignCreated domain action is logged
    And I should receive the campaign with generated ID

  @happy-path
  Scenario: Successfully create campaign with adventures collection
    Given I provide valid campaign data
    And I provide 4 valid adventures in the collection
    When I create the campaign
    Then the campaign is created
    And all 4 adventures is saved
    And each adventure should reference the campaign ID

  @error-handling
  Scenario: Handle campaign creation with invalid owner ID
    Given I provide campaign with owner ID that doesn't exist
    When I attempt to create the campaign
    Then I should see error with not found error
    And I should see error "Owner user not found"

  @error-handling
  Scenario: Handle campaign creation with invalid background resource
    Given I provide campaign with background resource that doesn't exist
    When I attempt to create the campaign
    Then I should see error with not found error
    And I should see error "Background resource not found or not an image"

  @edge-case
  Scenario: Create campaign with maximum description length
    Given I provide campaign with description of exactly 4096 characters
    When I create the campaign
    Then the campaign is created
    And the full description should be preserved

  @data-driven
  Scenario Outline: Validate campaign creation with epic associations
    Given I provide campaign with epic association <epic_status>
    When I create the campaign
    Then the result should be <result>
    And the EpicId should be <epic_value>

    Examples:
      | epic_status  | result  | epic_value |
      | not_provided | success | null       |
      | valid_epic   | success | set        |
      | invalid_epic | failure | n/a        |
