# Generated: 2025-10-02
# Use Case: Move Adventure To Campaign

Feature: Move Adventure To Campaign
  As a Game Master
  I want to move a standalone adventure into a campaign
  So that I can reorganize my adventure hierarchy

  Background:
    Given I am authenticated as a Game Master
    And I own a standalone adventure
    And I own a campaign
    

  Rule: Adventure must be standalone before moving to campaign

    Scenario: Successfully move standalone adventure to campaign
      Given my adventure has null CampaignId
      And I own campaign with ID "550e8400-e29b-41d4-a716-446655440000"
      When I move the adventure to campaign "550e8400-e29b-41d4-a716-446655440000"
      Then the adventure is updated successfully
      And the adventure CampaignId should be "550e8400-e29b-41d4-a716-446655440000"

    Scenario: Reject moving adventure already in another campaign
      Given my adventure is in campaign "111e8400-e29b-41d4-a716-446655440111"
      And I own campaign "222e8400-e29b-41d4-a716-446655440222"
      When I attempt to move the adventure to campaign "222e8400-e29b-41d4-a716-446655440222"
      Then I should see error with validation error
      And I should see error "Adventure must be standalone before moving to campaign"

  @happy-path
  Scenario: Successfully move adventure with encounters to campaign
    Given my standalone adventure has 4 encounters
    And I own a campaign
    When I move the adventure to the campaign
    Then the adventure should be associated with the campaign
    And all 4 encounters should remain with the adventure
    And the adventure type should remain unchanged

  @error-handling
  Scenario: Handle move to non-existent campaign
    Given my standalone adventure exists
    And no campaign exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to move adventure to campaign "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @authorization
  Scenario: User cannot move adventure they don't own
    Given a standalone adventure exists owned by another user
    And I own a campaign
    When I attempt to move that adventure to my campaign
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this adventure"

  @authorization
  Scenario: User cannot move adventure to campaign they don't own
    Given I own a standalone adventure
    And a campaign exists owned by another user
    When I attempt to move my adventure to that campaign
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this campaign"

  @edge-case
  Scenario: Move adventure preserves all adventure properties
    Given my standalone adventure has:
      | Property     | Value                   |
      | Name         | Test Adventure          |
      | Type         | DungeonCrawl            |
      | Description  | Test Description        |
      | IsPublished  | true                    |
      | IsPublic     | true                    |
    When I move the adventure to a campaign
    Then all adventure properties should remain unchanged
    And only the CampaignId is updated

  @integration
  Scenario: Move adventure and verify campaign's adventure collection
    Given a campaign has 3 adventures
    And I own a standalone adventure
    When I move the standalone adventure to the campaign
    Then the campaign should now have 4 adventures
    And the moved adventure should appear in campaign's adventure collection
