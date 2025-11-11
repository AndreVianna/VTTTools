# Generated: 2025-10-02
# Use Case: Delete Campaign

Feature: Delete Campaign
  As a Game Master
  I want to delete a campaign
  So that I can remove unused storylines and all associated adventures

  Background:
    Given I am authenticated as a Game Master
    And I own a campaign in my library
    

  Rule: Deleting campaign cascades to all owned adventures

    Scenario: Delete campaign successfully cascades to adventures
      Given my campaign has 4 associated adventures
      When I delete the campaign
      Then the campaign is removed
      And all 4 adventures is removed
      And I should receive deletion confirmation

    Scenario: Delete campaign cascades to adventures and encounters
      Given my campaign has 3 adventures
      And the first adventure has 4 encounters
      And the second adventure has 2 encounters
      And the third adventure has 3 encounters
      When I delete the campaign
      Then the campaign is removed
      And all 3 adventures is removed
      And all 9 encounters is removed

  @happy-path
  Scenario: Successfully delete standalone campaign
    Given my campaign is standalone with null EpicId
    And the campaign has 2 adventures
    When I delete the campaign
    Then the campaign is removed
    And both adventures is removed
    And the campaign should not appear in standalone campaigns list

  @happy-path
  Scenario: Successfully delete campaign from epic
    Given my campaign is in an epic with 5 campaigns
    When I delete the campaign
    Then the campaign is removed
    And the epic should now have 4 campaigns
    And the epic should remain intact

  @happy-path
  Scenario: Successfully delete campaign with no adventures
    Given my campaign has no associated adventures
    When I delete the campaign
    Then the campaign is removed
    And I should receive deletion confirmation

  @error-handling
  Scenario: Handle deletion of non-existent campaign
    Given no campaign exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete campaign "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my campaign exists
    And the database is unavailable
    When I attempt to delete the campaign
    Then I should see error with server error
    And I should see error "Failed to delete campaign"
    And the campaign should remain in the database

  @authorization
  Scenario: User cannot delete campaign they don't own
    Given a campaign exists owned by another user
    When I attempt to delete that campaign
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this campaign"
    And the campaign should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete campaign
    Given I am not authenticated
    And a campaign exists
    When I attempt to delete the campaign
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published campaign
    Given my campaign is published and public
    And the campaign has 3 adventures
    When I delete the campaign
    Then the campaign is removed successfully
    And public users should no longer see the campaign
    And all adventures is removed

  @integration
  Scenario: Delete campaign preserves unrelated data integrity
    Given I own 2 campaigns
    And the first campaign has 3 adventures
    And the second campaign has 4 adventures
    When I delete the first campaign
    Then the first campaign and its 3 adventures is removed
    And the second campaign and its 4 adventures should remain intact
