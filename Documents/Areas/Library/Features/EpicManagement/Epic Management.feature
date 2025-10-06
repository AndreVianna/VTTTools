# Generated: 2025-10-02
# Feature: Epic Management

Feature: Epic Management
  As a Game Master
  I want to manage multi-campaign story arcs
  So that I can organize large-scale narrative content

  Background:
    Given I am authenticated as a Game Master
    

  Rule: Epic name is required and cannot exceed 128 characters

    Scenario: Create epic with valid name length
      Given I provide epic name "Sleepwalkers: The Awakening"
      When I create the epic
      Then the epic is created
      And I should see the epic in my library

    Scenario: Reject epic with empty name
      Given I provide empty epic name
      When I attempt to create the epic
      Then I should see error
      And I should see error "Epic name is required"

    Scenario: Reject epic with name exceeding maximum length
      Given I provide epic name with 129 characters
      When I attempt to create the epic
      Then I should see error
      And I should see error "Epic name must not exceed 128 characters"

  Rule: Published epics must be public

    Scenario: Accept published epic that is public
      Given I provide epic with IsPublished=true and IsPublic=true
      When I create the epic
      Then the epic is created
      And the epic should be publicly visible

    Scenario: Reject published epic that is not public
      Given I provide epic with IsPublished=true and IsPublic=false
      When I attempt to create the epic
      Then I should see error
      And I should see error "Published epics must be public"

  @happy-path
  Scenario: Successfully create complete epic with campaigns
    Given I provide valid epic details
    And I provide 3 valid campaigns
    When I create the epic
    Then the epic should be saved
    And all 3 campaigns should be associated with the epic
    And I should see confirmation

  @happy-path
  Scenario: Successfully retrieve epic by ID
    Given an epic exists in my library
    When I request the epic by its ID
    Then I should receive the epic details
    And I should see all associated campaigns

  @happy-path
  Scenario: Successfully update epic properties
    Given an epic exists in my library
    When I update the epic name to "Revised Story Arc"
    Then the epic is updated
    And I should see the new name

  @happy-path
  Scenario: Successfully delete epic with cascade
    Given an epic exists with 2 campaigns
    When I delete the epic
    Then the epic is removed
    And all associated campaigns is removed
    And all adventures under campaigns is removed

  @error-handling
  Scenario: Handle epic creation with invalid owner
    Given I provide epic with non-existent owner ID
    When I attempt to create the epic
    Then I should see error
    And I should see error "Owner user not found"

  @error-handling
  Scenario: Handle epic creation with invalid background resource
    Given I provide epic with non-existent background resource
    When I attempt to create the epic
    Then I should see error
    And I should see error "Background resource not found or not an image"

  @authorization
  Scenario: Unauthorized user cannot create epic
    Given I am not authenticated
    When I attempt to create an epic
    Then I should see error
    And I should be redirected to login

  @edge-case
  Scenario: Create epic with maximum description length
    Given I provide epic with description of 4096 characters
    When I create the epic
    Then the epic is created
    And the full description should be preserved

  @edge-case
  Scenario: Retrieve epics for owner with no epics
    Given I have no epics in my library
    When I request my epics
    Then I should receive an empty list
    And I should see message "No epics found"
