# Generated: 2025-10-02
# Feature-level BDD for Epic Management
@feature @library @epic-management
Feature: Epic Management
  As a Game Master
  I want to manage multi-campaign story arcs
  So that I can organize long-running game narratives

  Background:
    Given I am authenticated as a Game Master
    And I have access to the Library system

  Rule: Epic names must be between 1 and 128 characters

    @happy-path @business-rule
    Scenario: Create epic with valid name
      Given I have a valid epic name "The Dragon's Legacy Saga"
      When I create an epic with this name
      Then my epic is created successfully
      And I receive the epic details with my name

    @error-handling @business-rule
    Scenario: Cannot create epic with empty name
      Given I have an empty epic name
      When I attempt to create an epic
      Then my request is rejected
      And I receive a validation error indicating name is required

    @edge-case @business-rule
    Scenario: Cannot create epic with name exceeding maximum length
      Given I have an epic name with 129 characters
      When I attempt to create an epic
      Then my request is rejected
      And I receive a validation error indicating name is too long

  @happy-path
  Scenario: Create epic with campaigns and background
    Given I have a valid epic titled "Chronicles of the Void"
    And I have a background resource reference
    And I have two campaigns to include
    When I create the epic
    Then my epic is created successfully
    And the epic contains my two campaigns
    And the background resource is linked

  @happy-path
  Scenario: Retrieve my epic details
    Given I have created an epic titled "The Forgotten Realms"
    When I retrieve the epic by its identifier
    Then I receive the complete epic details
    And the details include all campaigns
    And the details include the background resource

  @happy-path
  Scenario: Update epic properties
    Given I have an existing epic titled "The Lost Kingdom"
    When I update the title to "The Restored Kingdom"
    And I update the description
    Then my epic is updated successfully
    And I receive the updated epic details

  @happy-path
  Scenario: Query all my epics
    Given I have created three epics
    When I request all my epics
    Then I receive a list of three epics
    And each epic contains basic details

  @edge-case
  Scenario: Create epic without campaigns
    Given I have a valid epic titled "The Beginning"
    And I have no campaigns to include
    When I create the epic
    Then my epic is created successfully
    And the epic contains an empty campaign collection

  @edge-case
  Scenario: Create epic without background resource
    Given I have a valid epic titled "Plain Story Arc"
    And I have no background resource
    When I create the epic
    Then my epic is created successfully
    And the epic has no background resource linked

  @integration @cross-area
  Scenario: Cascade delete epic with nested content
    Given I have an epic with two campaigns
    And each campaign has three adventures
    And each adventure has multiple encounters
    When I delete the epic
    Then the epic is removed successfully
    And all campaigns are deleted
    And all adventures are deleted
    And all encounters are deleted

  @integration @cross-area
  Scenario: Cannot delete epic referenced by active game session
    Given I have an epic titled "The Ongoing War"
    And the epic has a campaign in use by an active game session
    When I attempt to delete the epic
    Then my request is rejected
    And I receive an error indicating active session dependency

  @error-handling @cross-area
  Scenario: Cannot create epic with invalid owner reference
    Given I have a valid epic structure
    But I specify a non-existent owner identifier
    When I attempt to create the epic
    Then my request is rejected
    And I receive a validation error for owner reference

  @error-handling @cross-area
  Scenario: Cannot create epic with invalid background resource
    Given I have a valid epic structure
    But I specify a non-existent background resource identifier
    When I attempt to create the epic
    Then my request is rejected
    And I receive a validation error for background resource

  @authorization
  Scenario: Cannot update another user's epic
    Given another Game Master has created an epic
    When I attempt to update their epic
    Then my request is rejected
    And I receive an authorization error

  @authorization
  Scenario: Cannot delete another user's epic
    Given another Game Master has created an epic
    When I attempt to delete their epic
    Then my request is rejected
    And I receive an authorization error

  @error-handling
  Scenario: Handle service failure during epic creation
    Given I have a valid epic structure
    When the service encounters an internal error during creation
    Then I receive an error response
    And I am informed to retry my request
