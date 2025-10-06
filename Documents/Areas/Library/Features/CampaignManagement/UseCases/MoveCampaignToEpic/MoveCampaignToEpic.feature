# Generated: 2025-10-02
# Use Case: Move Campaign To Epic

Feature: Move Campaign To Epic
  As a Game Master
  I want to move a standalone campaign into an epic
  So that I can reorganize my campaign hierarchy

  Background:
    Given I am authenticated as a Game Master
    And I own a standalone campaign
    And I own an epic
    

  Rule: Campaign must be standalone before moving to epic

    Scenario: Successfully move standalone campaign to epic
      Given my campaign has null EpicId
      And I own epic with ID "550e8400-e29b-41d4-a716-446655440000"
      When I move the campaign to epic "550e8400-e29b-41d4-a716-446655440000"
      Then the campaign is updated successfully
      And the campaign EpicId should be "550e8400-e29b-41d4-a716-446655440000"

    Scenario: Reject moving campaign already in another epic
      Given my campaign is in epic "111e8400-e29b-41d4-a716-446655440111"
      And I own epic "222e8400-e29b-41d4-a716-446655440222"
      When I attempt to move the campaign to epic "222e8400-e29b-41d4-a716-446655440222"
      Then I should see error with validation error
      And I should see error "Campaign must be standalone before moving to epic"

  @happy-path
  Scenario: Successfully move campaign with adventures to epic
    Given my standalone campaign has 3 adventures
    And I own an epic
    When I move the campaign to the epic
    Then the campaign should be associated with the epic
    And all 3 adventures should remain with the campaign

  @error-handling
  Scenario: Handle move to non-existent epic
    Given my standalone campaign exists
    And no epic exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to move campaign to epic "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle move with invalid epic ID format
    Given my standalone campaign exists
    When I attempt to move campaign to epic "not-a-guid"
    Then I should see error with validation error
    And I should see error "Invalid epic ID format"

  @authorization
  Scenario: User cannot move campaign they don't own
    Given a standalone campaign exists owned by another user
    And I own an epic
    When I attempt to move that campaign to my epic
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this campaign"

  @authorization
  Scenario: User cannot move campaign to epic they don't own
    Given I own a standalone campaign
    And an epic exists owned by another user
    When I attempt to move my campaign to that epic
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this epic"

  @edge-case
  Scenario: Move campaign preserves all campaign properties
    Given my standalone campaign has:
      | Property     | Value                   |
      | Name         | Test Campaign           |
      | Description  | Test Description        |
      | IsPublished  | true                    |
      | IsPublic     | true                    |
    When I move the campaign to an epic
    Then all campaign properties should remain unchanged
    And only the EpicId is updated

  @integration
  Scenario: Move campaign and verify epic's campaign collection
    Given an epic has 2 campaigns
    And I own a standalone campaign
    When I move the standalone campaign to the epic
    Then the epic should now have 3 campaigns
    And the moved campaign should appear in epic's campaign collection
