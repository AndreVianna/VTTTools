# Generated: 2025-10-02
# Use Case: Make Campaign Standalone

Feature: Make Campaign Standalone
  As a Game Master
  I want to remove a campaign from its world
  So that I can make it an independent storyline

  Background:
    Given I am authenticated as a Game Master
    And I own a campaign within an world
    

  Rule: Campaign must be in an world before making standalone

    Scenario: Successfully make world campaign standalone
      Given my campaign has WorldId "550e8400-e29b-41d4-a716-446655440000"
      When I make the campaign standalone
      Then the campaign is updated successfully
      And the campaign WorldId should be null

    Scenario: Reject making already standalone campaign standalone
      Given my campaign has null WorldId
      When I attempt to make the campaign standalone
      Then I should see error with validation error
      And I should see error "Campaign is already standalone"

  @happy-path
  Scenario: Successfully make campaign with adventures standalone
    Given my campaign is in an world
    And the campaign has 4 adventures
    When I make the campaign standalone
    Then the campaign should become standalone
    And all 4 adventures should remain with the campaign
    And the WorldId should be null

  @happy-path
  Scenario: Successfully verify world after removing campaign
    Given an world has 5 campaigns
    And I own one of those campaigns
    When I make my campaign standalone
    Then the campaign is removed from world
    And the world should now have 4 campaigns

  @error-handling
  Scenario: Handle making standalone for non-existent campaign
    Given no campaign exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to make campaign "999e8400-e29b-41d4-a716-446655440999" standalone
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @error-handling
  Scenario: Handle database failure during operation
    Given my campaign is in an world
    And the database is unavailable
    When I attempt to make the campaign standalone
    Then I should see error with server error
    And I should see error "Failed to update campaign"

  @authorization
  Scenario: User cannot make campaign standalone if they don't own it
    Given a campaign exists in an world owned by another user
    When I attempt to make that campaign standalone
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this campaign"

  @edge-case
  Scenario: Make campaign standalone preserves all properties
    Given my campaign in an world has:
      | Property     | Value                   |
      | Name         | Test Campaign           |
      | Description  | Test Description        |
      | IsPublished  | true                    |
      | IsPublic     | true                    |
    When I make the campaign standalone
    Then all campaign properties should remain unchanged
    And only the WorldId should be set to null

  @integration
  Scenario: Make campaign standalone and verify it appears in standalone list
    Given I have 2 standalone campaigns
    And I have 1 campaign in an world
    When I make the world campaign standalone
    Then I should now have 3 standalone campaigns
    And the campaign should appear in standalone campaigns query
