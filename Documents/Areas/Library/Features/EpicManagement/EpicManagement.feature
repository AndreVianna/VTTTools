# Generated: 2025-10-02
# Feature-level BDD for World Management
@feature @library @world-management
Feature: World Management
  As a Game Master
  I want to manage multi-campaign story arcs
  So that I can organize long-running game narratives

  Background:
    Given I am authenticated as a Game Master
    And I have access to the Library system

  Rule: World names must be between 1 and 128 characters

    @happy-path @business-rule
    Scenario: Create world with valid name
      Given I have a valid world name "The Dragon's Legacy Saga"
      When I create an world with this name
      Then my world is created successfully
      And I receive the world details with my name

    @error-handling @business-rule
    Scenario: Cannot create world with empty name
      Given I have an empty world name
      When I attempt to create an world
      Then my request is rejected
      And I receive a validation error indicating name is required

    @edge-case @business-rule
    Scenario: Cannot create world with name exceeding maximum length
      Given I have an world name with 129 characters
      When I attempt to create an world
      Then my request is rejected
      And I receive a validation error indicating name is too long

  @happy-path
  Scenario: Create world with campaigns and background
    Given I have a valid world titled "Chronicles of the Void"
    And I have a background resource reference
    And I have two campaigns to include
    When I create the world
    Then my world is created successfully
    And the world contains my two campaigns
    And the background resource is linked

  @happy-path
  Scenario: Retrieve my world details
    Given I have created an world titled "The Forgotten Realms"
    When I retrieve the world by its identifier
    Then I receive the complete world details
    And the details include all campaigns
    And the details include the background resource

  @happy-path
  Scenario: Update world properties
    Given I have an existing world titled "The Lost Kingdom"
    When I update the title to "The Restored Kingdom"
    And I update the description
    Then my world is updated successfully
    And I receive the updated world details

  @happy-path
  Scenario: Query all my worlds
    Given I have created three worlds
    When I request all my worlds
    Then I receive a list of three worlds
    And each world contains basic details

  @edge-case
  Scenario: Create world without campaigns
    Given I have a valid world titled "The Beginning"
    And I have no campaigns to include
    When I create the world
    Then my world is created successfully
    And the world contains an empty campaign collection

  @edge-case
  Scenario: Create world without background resource
    Given I have a valid world titled "Plain Story Arc"
    And I have no background resource
    When I create the world
    Then my world is created successfully
    And the world has no background resource linked

  @integration @cross-area
  Scenario: Cascade delete world with nested content
    Given I have an world with two campaigns
    And each campaign has three adventures
    And each adventure has multiple encounters
    When I delete the world
    Then the world is removed successfully
    And all campaigns are deleted
    And all adventures are deleted
    And all encounters are deleted

  @integration @cross-area
  Scenario: Cannot delete world referenced by active game session
    Given I have an world titled "The Ongoing War"
    And the world has a campaign in use by an active game session
    When I attempt to delete the world
    Then my request is rejected
    And I receive an error indicating active session dependency

  @error-handling @cross-area
  Scenario: Cannot create world with invalid owner reference
    Given I have a valid world structure
    But I specify a non-existent owner identifier
    When I attempt to create the world
    Then my request is rejected
    And I receive a validation error for owner reference

  @error-handling @cross-area
  Scenario: Cannot create world with invalid background resource
    Given I have a valid world structure
    But I specify a non-existent background resource identifier
    When I attempt to create the world
    Then my request is rejected
    And I receive a validation error for background resource

  @authorization
  Scenario: Cannot update another user's world
    Given another Game Master has created an world
    When I attempt to update their world
    Then my request is rejected
    And I receive an authorization error

  @authorization
  Scenario: Cannot delete another user's world
    Given another Game Master has created an world
    When I attempt to delete their world
    Then my request is rejected
    And I receive an authorization error

  @error-handling
  Scenario: Handle service failure during world creation
    Given I have a valid world structure
    When the service encounters an internal error during creation
    Then I receive an error response
    And I am informed to retry my request
