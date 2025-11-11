# Generated: 2025-10-02
# Feature: Campaign Management

Feature: Campaign Management
  As a Game Master
  I want to manage multi-adventure storylines
  So that I can organize connected adventures within or outside worlds

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Campaign name is required and cannot exceed 128 characters

    Scenario: Create campaign with valid name length
      Given I provide campaign name "The Lost Kingdom"
      When I create the campaign
      Then the campaign is created
      And I should see the campaign in my library

    Scenario: Reject campaign with empty name
      Given I provide empty campaign name
      When I attempt to create the campaign
      Then I should see error
      And I should see error "Campaign name is required"

    Scenario: Reject campaign with name exceeding maximum length
      Given I provide campaign name with 129 characters
      When I attempt to create the campaign
      Then I should see error
      And I should see error "Campaign name must not exceed 128 characters"

  Rule: Published campaigns must be public

    Scenario: Accept published campaign that is public
      Given I provide campaign with IsPublished=true and IsPublic=true
      When I create the campaign
      Then the campaign is created
      And the campaign should be publicly visible

    Scenario: Reject published campaign that is not public
      Given I provide campaign with IsPublished=true and IsPublic=false
      When I attempt to create the campaign
      Then I should see error
      And I should see error "Published campaigns must be public"

  @happy-path
  Scenario: Successfully create standalone campaign
    Given I provide valid campaign details
    And I do not associate with an world
    When I create the campaign
    Then the campaign should be created as standalone
    And the WorldId should be null

  @happy-path
  Scenario: Successfully create campaign within world
    Given I own an world
    And I provide valid campaign details
    When I create the campaign within the world
    Then the campaign is created
    And the campaign should reference the world ID

  @happy-path
  Scenario: Successfully move campaign to world
    Given I have a standalone campaign
    And I own an world
    When I move the campaign to the world
    Then the campaign should be associated with the world
    And the WorldId should be set correctly

  @happy-path
  Scenario: Successfully make campaign standalone
    Given I have a campaign within an world
    When I make the campaign standalone
    Then the campaign is removed from the world
    And the WorldId should be null

  @happy-path
  Scenario: Successfully delete campaign with cascade
    Given a campaign exists with 3 adventures
    When I delete the campaign
    Then the campaign is removed
    And all 3 adventures is removed

  @error-handling
  Scenario: Handle campaign creation with invalid owner
    Given I provide campaign with non-existent owner ID
    When I attempt to create the campaign
    Then I should see error
    And I should see error "Owner user not found"

  @authorization
  Scenario: User cannot modify campaign they don't own
    Given a campaign exists owned by another user
    When I attempt to update that campaign
    Then I should see error
    And I should see error "You are not authorized"

  @edge-case
  Scenario: Retrieve campaigns for world with no campaigns
    Given I own an world with no campaigns
    When I request campaigns for that world
    Then I should receive an empty list
