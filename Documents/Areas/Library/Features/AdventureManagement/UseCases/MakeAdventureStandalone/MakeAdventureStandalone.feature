# Generated: 2025-10-02
# Use Case: Make Adventure Standalone

Feature: Make Adventure Standalone
  As a Game Master
  I want to remove an adventure from its campaign
  So that I can make it an independent game module

  Background:
    Given I am authenticated as a Game Master
    And I own an adventure within a campaign
    

  Rule: Adventure must be in a campaign before making standalone

    Scenario: Successfully make campaign adventure standalone
      Given my adventure has CampaignId "550e8400-e29b-41d4-a716-446655440000"
      When I make the adventure standalone
      Then the adventure is updated successfully
      And the adventure CampaignId should be null

    Scenario: Reject making already standalone adventure standalone
      Given my adventure has null CampaignId
      When I attempt to make the adventure standalone
      Then I should see error with validation error
      And I should see error "Adventure is already standalone"

  @happy-path
  Scenario: Successfully make adventure with encounters standalone
    Given my adventure is in a campaign
    And the adventure has 6 encounters
    When I make the adventure standalone
    Then the adventure should become standalone
    And all 6 encounters should remain with the adventure
    And the CampaignId should be null
    And the adventure type should remain unchanged

  @happy-path
  Scenario: Successfully verify campaign after removing adventure
    Given a campaign has 4 adventures
    And I own one of those adventures
    When I make my adventure standalone
    Then the adventure is removed from campaign
    And the campaign should now have 3 adventures

  @error-handling
  Scenario: Handle making standalone for non-existent adventure
    Given no adventure exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to make adventure "999e8400-e29b-41d4-a716-446655440999" standalone
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @error-handling
  Scenario: Handle database failure during operation
    Given my adventure is in a campaign
    And the database is unavailable
    When I attempt to make the adventure standalone
    Then I should see error with server error
    And I should see error "Failed to update adventure"

  @authorization
  Scenario: User cannot make adventure standalone if they don't own it
    Given an adventure exists in a campaign owned by another user
    When I attempt to make that adventure standalone
    Then I should see error with forbidden error
    And I should see error "You are not authorized to modify this adventure"

  @edge-case
  Scenario: Make adventure standalone preserves all properties
    Given my adventure in a campaign has:
      | Property     | Value                   |
      | Name         | Test Adventure          |
      | Type         | Investigation           |
      | Description  | Test Description        |
      | IsPublished  | true                    |
      | IsPublic     | true                    |
    When I make the adventure standalone
    Then all adventure properties should remain unchanged
    And only the CampaignId should be set to null

  @integration
  Scenario: Make adventure standalone and verify it appears in standalone list
    Given I have 3 standalone adventures
    And I have 1 adventure in a campaign
    When I make the campaign adventure standalone
    Then I should now have 4 standalone adventures
    And the adventure should appear in standalone adventures query
