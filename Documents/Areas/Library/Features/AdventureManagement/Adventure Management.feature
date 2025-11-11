# Generated: 2025-10-02
# Feature: Adventure Management

Feature: Adventure Management
  As a Game Master
  I want to manage individual game modules with multiple encounters
  So that I can create complete adventures within or outside campaigns

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Adventure name is required and cannot exceed 128 characters

    Scenario: Create adventure with valid name length
      Given I provide adventure name "The Dragon's Lair"
      When I create the adventure
      Then the adventure is created
      And I should see the adventure in my library

    Scenario: Reject adventure with empty name
      Given I provide empty adventure name
      When I attempt to create the adventure
      Then I should see error
      And I should see error "Adventure name is required"

    Scenario: Reject adventure with name exceeding maximum length
      Given I provide adventure name with 129 characters
      When I attempt to create the adventure
      Then I should see error
      And I should see error "Adventure name must not exceed 128 characters"

  Rule: Published adventures must be public

    Scenario: Accept published adventure that is public
      Given I provide adventure with IsPublished=true and IsPublic=true
      When I create the adventure
      Then the adventure is created
      And the adventure should be publicly visible

    Scenario: Reject published adventure that is not public
      Given I provide adventure with IsPublished=true and IsPublic=false
      When I attempt to create the adventure
      Then I should see error
      And I should see error "Published adventures must be public"

  @happy-path
  Scenario: Successfully create standalone adventure
    Given I provide valid adventure details
    And I set adventure type to "DungeonCrawl"
    When I create the adventure
    Then the adventure should be created as standalone
    And the CampaignId should be null

  @happy-path
  Scenario: Successfully create adventure within campaign
    Given I own a campaign
    And I provide valid adventure details
    When I create the adventure within the campaign
    Then the adventure is created
    And the adventure should reference the campaign ID

  @happy-path
  Scenario: Successfully clone adventure with all encounters
    Given I have an adventure with 5 encounters
    When I clone the adventure
    Then a new adventure should be created
    And all 5 encounters should be duplicated
    And the clone should have unique IDs

  @happy-path
  Scenario: Successfully move adventure to campaign
    Given I have a standalone adventure
    And I own a campaign
    When I move the adventure to the campaign
    Then the adventure should be associated with the campaign
    And the CampaignId should be set correctly

  @happy-path
  Scenario: Successfully make adventure standalone
    Given I have an adventure within a campaign
    When I make the adventure standalone
    Then the adventure is removed from the campaign
    And the CampaignId should be null

  @edge-case
  Scenario: Create adventure with each adventure type
    Given I create adventures of each type:
      | Type          |
      | Generic       |
      | OpenWorld     |
      | DungeonCrawl  |
      | Investigation |
      | Social        |
      | Combat        |
      | Exploration   |
    Then all adventures is created
    And each should have the correct type assigned
