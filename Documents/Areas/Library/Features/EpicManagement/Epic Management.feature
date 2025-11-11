# Generated: 2025-10-02
# Feature: World Management

Feature: World Management
  As a Game Master
  I want to manage multi-campaign story arcs
  So that I can organize large-scale narrative content

  Background:
    Given I am authenticated as a Game Master
    

  Rule: World name is required and cannot exceed 128 characters

    Scenario: Create world with valid name length
      Given I provide world name "Sleepwalkers: The Awakening"
      When I create the world
      Then the world is created
      And I should see the world in my library

    Scenario: Reject world with empty name
      Given I provide empty world name
      When I attempt to create the world
      Then I should see error
      And I should see error "World name is required"

    Scenario: Reject world with name exceeding maximum length
      Given I provide world name with 129 characters
      When I attempt to create the world
      Then I should see error
      And I should see error "World name must not exceed 128 characters"

  Rule: Published worlds must be public

    Scenario: Accept published world that is public
      Given I provide world with IsPublished=true and IsPublic=true
      When I create the world
      Then the world is created
      And the world should be publicly visible

    Scenario: Reject published world that is not public
      Given I provide world with IsPublished=true and IsPublic=false
      When I attempt to create the world
      Then I should see error
      And I should see error "Published worlds must be public"

  @happy-path
  Scenario: Successfully create complete world with campaigns
    Given I provide valid world details
    And I provide 3 valid campaigns
    When I create the world
    Then the world should be saved
    And all 3 campaigns should be associated with the world
    And I should see confirmation

  @happy-path
  Scenario: Successfully retrieve world by ID
    Given an world exists in my library
    When I request the world by its ID
    Then I should receive the world details
    And I should see all associated campaigns

  @happy-path
  Scenario: Successfully update world properties
    Given an world exists in my library
    When I update the world name to "Revised Story Arc"
    Then the world is updated
    And I should see the new name

  @happy-path
  Scenario: Successfully delete world with cascade
    Given an world exists with 2 campaigns
    When I delete the world
    Then the world is removed
    And all associated campaigns is removed
    And all adventures under campaigns is removed

  @error-handling
  Scenario: Handle world creation with invalid owner
    Given I provide world with non-existent owner ID
    When I attempt to create the world
    Then I should see error
    And I should see error "Owner user not found"

  @error-handling
  Scenario: Handle world creation with invalid background resource
    Given I provide world with non-existent background resource
    When I attempt to create the world
    Then I should see error
    And I should see error "Background resource not found or not an image"

  @authorization
  Scenario: Unauthorized user cannot create world
    Given I am not authenticated
    When I attempt to create an world
    Then I should see error
    And I should be redirected to login

  @edge-case
  Scenario: Create world with maximum description length
    Given I provide world with description of 4096 characters
    When I create the world
    Then the world is created
    And the full description should be preserved

  @edge-case
  Scenario: Retrieve worlds for owner with no worlds
    Given I have no worlds in my library
    When I request my worlds
    Then I should receive an empty list
    And I should see message "No worlds found"
