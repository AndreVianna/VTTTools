# Generated: 2025-10-02
# Use Case: Move Campaign To World

Feature: Move Campaign To World
  As a Game Master
  I want to move a standalone campaign into an world
  So that I can reorganize my campaign hierarchy

  Background:
    Given I am authenticated as a Game Master
    And I own a standalone campaign
    And I own an world
    

  Rule: Campaign must be standalone before moving to world

    Scenario: Successfully move standalone campaign to world
      Given my campaign has null WorldId
      And I own world with ID "550e8400-e29b-41d4-a716-446655440000"
      When I move the campaign to world "550e8400-e29b-41d4-a716-446655440000"
      Then the campaign is updated successfully
      And the campaign WorldId should be "550e8400-e29b-41d4-a716-446655440000"

    Scenario: Reject moving campaign already in another world
      Given my campaign is in world "111e8400-e29b-41d4-a716-446655440111"
      And I own world "222e8400-e29b-41d4-a716-446655440222"
      When I attempt to move the campaign to world "222e8400-e29b-41d4-a716-446655440222"
      Then I should see error with validation error
      And I should see error "Campaign must be standalone before moving to world"

  @happy-path
  Scenario: Successfully move campaign with adventures to world
    Given my standalone campaign has 3 adventures
    And I own an world
    When I move the campaign to the world
    Then the campaign should be associated with the world
    And all 3 adventures should remain with the campaign

  @error-handling
  Scenario: Handle move to non-existent world
    Given my standalone campaign exists
    And no world exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to move campaign to world "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "World not found"

  @error-handling
  Scenario: Handle move with invalid world ID format
    Given my standalone campaign exists
    When I attempt to move campaign to world "not-a-guid"
    Then I should see error with validation error
    And I should see error "Invalid world ID format"

  @authorization
  Scenario: User cannot move campaign they don't own
    Given a standalone campaign exists owned by another user
    And I own an world
    When I attempt to move that campaign to my world
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this campaign"

  @authorization
  Scenario: User cannot move campaign to world they don't own
    Given I own a standalone campaign
    And an world exists owned by another user
    When I attempt to move my campaign to that world
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this world"

  @edge-case
  Scenario: Move campaign preserves all campaign properties
    Given my standalone campaign has:
      | Property     | Value                   |
      | Name         | Test Campaign           |
      | Description  | Test Description        |
      | IsPublished  | true                    |
      | IsPublic     | true                    |
    When I move the campaign to an world
    Then all campaign properties should remain unchanged
    And only the WorldId is updated

  @integration
  Scenario: Move campaign and verify world's campaign collection
    Given an world has 2 campaigns
    And I own a standalone campaign
    When I move the standalone campaign to the world
    Then the world should now have 3 campaigns
    And the moved campaign should appear in world's campaign collection
