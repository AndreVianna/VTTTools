# Generated: 2025-10-02
# Use Case: Create Adventure

Feature: Create Adventure
  As a Game Master
  I want to create a new adventure
  So that I can build individual game modules with encounters

  Background:
    Given I am authenticated as a Game Master
    And my user account exists in the Identity context
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Create adventure with valid name
      Given I provide adventure name "The Lost Temple"
      When I create the adventure
      Then the adventure should be created with generated ID
      And the adventure name should be "The Lost Temple"

    Scenario: Reject adventure with empty name
      Given I provide empty adventure name
      When I attempt to create the adventure
      Then I should see error with validation error
      And I should see error "Adventure name is required"

    Scenario: Reject adventure with name exceeding 128 characters
      Given I provide adventure name with 129 characters
      When I attempt to create the adventure
      Then I should see error with validation error
      And I should see error "Adventure name must not exceed 128 characters"

  Rule: Published adventures must be public

    Scenario: Create published and public adventure
      Given I provide adventure with IsPublished=true and IsPublic=true
      When I create the adventure
      Then the adventure is created
      And the adventure should be marked as published
      And the adventure should be marked as public

    Scenario: Reject published adventure that is not public
      Given I provide adventure with IsPublished=true and IsPublic=false
      When I attempt to create the adventure
      Then I should see error with validation error
      And I should see error "Published adventures must be public"

  Rule: Adventure must have a valid type

    Scenario: Create adventure with valid type
      Given I provide adventure with type "DungeonCrawl"
      When I create the adventure
      Then the adventure is created
      And the adventure type should be "DungeonCrawl"

    Scenario: Reject adventure with invalid type
      Given I provide adventure with invalid type "InvalidType"
      When I attempt to create the adventure
      Then I should see error with validation error
      And I should see error "Invalid adventure type"

  @happy-path
  Scenario: Successfully create adventure with all properties
    Given I provide valid adventure data:
      | Field        | Value                      |
      | Name         | The Forgotten Dungeon      |
      | Description  | A perilous dungeon crawl   |
      | Type         | DungeonCrawl               |
      | IsPublished  | false                      |
      | IsPublic     | false                      |
    When I create the adventure
    Then the adventure is saved in the database
    And an AdventureCreated domain action is logged
    And I should receive the adventure with generated ID

  @happy-path
  Scenario: Successfully create adventure with encounters collection
    Given I provide valid adventure data
    And I provide 6 valid encounters in the collection
    When I create the adventure
    Then the adventure is created
    And all 6 encounters is saved
    And each encounter should reference the adventure ID

  @happy-path
  Scenario: Successfully create standalone adventure
    Given I provide valid adventure data
    And I do not specify a campaign ID
    When I create the adventure
    Then the adventure is created
    And the CampaignId should be null

  @happy-path
  Scenario: Successfully create adventure within campaign
    Given I own a campaign with ID "550e8400-e29b-41d4-a716-446655440000"
    And I provide valid adventure data with that campaign ID
    When I create the adventure
    Then the adventure is created
    And the CampaignId should be "550e8400-e29b-41d4-a716-446655440000"

  @error-handling
  Scenario: Handle adventure creation with non-existent campaign
    Given I provide adventure with campaign ID that doesn't exist
    When I attempt to create the adventure
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @data-driven
  Scenario Outline: Create adventures with different types
    Given I provide adventure with type "<type>"
    When I create the adventure
    Then the adventure is created
    And the adventure type should be "<type>"

    Examples:
      | type          |
      | Generic       |
      | OpenWorld     |
      | DungeonCrawl  |
      | Investigation |
      | Social        |
      | Combat        |
      | Exploration   |
