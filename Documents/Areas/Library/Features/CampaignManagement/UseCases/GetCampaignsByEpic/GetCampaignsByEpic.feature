# Generated: 2025-10-02
# Use Case: Get Campaigns By Epic

Feature: Get Campaigns By Epic
  As a Game Master
  I want to retrieve all campaigns within an epic
  So that I can view epic's campaign structure

  Background:
    Given I am authenticated as a Game Master
    

  @happy-path
  Scenario: Successfully retrieve campaigns for epic
    Given an epic exists with ID "550e8400-e29b-41d4-a716-446655440000"
    And the epic has 4 campaigns
    When I request campaigns for epic "550e8400-e29b-41d4-a716-446655440000"
    Then I should receive all 4 campaigns
    And each campaign should reference the correct epic ID

  @happy-path
  Scenario: Successfully retrieve empty list for epic with no campaigns
    Given an epic exists with no campaigns
    When I request campaigns for that epic
    Then I should receive an empty list
    And I should see message "No campaigns found for this epic"

  @happy-path
  Scenario: Successfully retrieve standalone campaigns
    Given I own 3 standalone campaigns
    When I request campaigns with null epic ID
    Then I should receive all 3 standalone campaigns
    And each campaign should have null EpicId

  @error-handling
  Scenario: Handle request for non-existent epic
    Given no epic exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I request campaigns for epic "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle request with invalid epic ID format
    Given I provide invalid epic ID "not-a-guid"
    When I attempt to request campaigns for that epic
    Then I should see error with validation error
    And I should see error "Invalid epic ID format"

  @authorization
  Scenario: User can only see campaigns they own within epic
    Given an epic exists with 5 campaigns
    And I own 3 of those campaigns
    And another user owns 2 campaigns in the same epic
    When I request campaigns for that epic
    Then I should receive only my 3 campaigns

  @edge-case
  Scenario: Retrieve campaigns for epic with mixed visibility
    Given an epic has 4 campaigns:
      | Name       | IsPublished | IsPublic |
      | Campaign1  | true        | true     |
      | Campaign2  | false       | false    |
      | Campaign3  | false       | true     |
      | Campaign4  | true        | true     |
    When I request campaigns for that epic
    Then I should receive all 4 campaigns
    And each should display its visibility status

  @data-driven
  Scenario Outline: Query campaigns by epic association
    Given I own <in_epic> campaigns within an epic
    And I own <standalone> standalone campaigns
    When I request campaigns for <query_type>
    Then I should receive <expected> campaigns

    Examples:
      | in_epic | standalone | query_type | expected |
      | 5       | 3          | epic       | 5        |
      | 5       | 3          | null_epic  | 3        |
      | 0       | 3          | epic       | 0        |
