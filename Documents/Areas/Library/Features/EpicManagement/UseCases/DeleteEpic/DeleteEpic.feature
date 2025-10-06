# Generated: 2025-10-02
# Use Case: Delete Epic

Feature: Delete Epic
  As a Game Master
  I want to delete an epic
  So that I can remove unused story arcs and all associated content

  Background:
    Given I am authenticated as a Game Master
    And I own an epic in my library
    

  Rule: Deleting epic cascades to all owned campaigns

    Scenario: Delete epic successfully cascades to campaigns
      Given my epic has 3 associated campaigns
      When I delete the epic
      Then the epic is removed
      And all 3 campaigns is removed
      And I should receive deletion confirmation

    Scenario: Delete epic cascades to campaigns and adventures
      Given my epic has 2 campaigns
      And the first campaign has 3 adventures
      And the second campaign has 2 adventures
      When I delete the epic
      Then the epic is removed
      And both campaigns is removed
      And all 5 adventures is removed

    Scenario: Delete epic cascades through entire hierarchy
      Given my epic has complete content hierarchy:
        | Level      | Count |
        | Campaigns  | 2     |
        | Adventures | 4     |
        | Scenes     | 8     |
      When I delete the epic
      Then the epic is removed
      And all campaigns is removed
      And all adventures is removed
      And all scenes is removed

  @happy-path
  Scenario: Successfully delete epic with no campaigns
    Given my epic has no associated campaigns
    When I delete the epic
    Then the epic is removed
    And I should receive deletion confirmation

  @happy-path
  Scenario: Successfully delete epic and verify removal
    Given my epic has ID "550e8400-e29b-41d4-a716-446655440000"
    When I delete the epic
    Then the epic is removed
    And attempting to retrieve epic "550e8400-e29b-41d4-a716-446655440000" should fail
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle deletion of non-existent epic
    Given no epic exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to delete epic "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Epic not found"

  @error-handling
  Scenario: Handle database failure during deletion
    Given my epic exists
    And the database is unavailable
    When I attempt to delete the epic
    Then I should see error with server error
    And I should see error "Failed to delete epic"
    And the epic should remain in the database

  @authorization
  Scenario: User cannot delete epic they don't own
    Given an epic exists owned by another user
    When I attempt to delete that epic
    Then I should see error with forbidden error
    And I should see error "You are not authorized to delete this epic"
    And the epic should remain in the database

  @authorization
  Scenario: Unauthorized user cannot delete epic
    Given I am not authenticated
    And an epic exists
    When I attempt to delete the epic
    Then I should see error with unauthorized error
    And I should be prompted to log in

  @edge-case
  Scenario: Delete published epic
    Given my epic is published and public
    When I delete the epic
    Then the epic is removed successfully
    And public users should no longer see the epic

  @edge-case
  Scenario: Attempt to delete already deleted epic
    Given my epic was recently deleted
    When I attempt to delete the epic again
    Then I should see error with not found error
    And I should see error "Epic not found"

  @integration
  Scenario: Delete epic preserves unrelated data integrity
    Given my epic has 2 campaigns
    And I own another separate epic with 3 campaigns
    When I delete the first epic
    Then the first epic and its 2 campaigns is removed
    And the second epic and its 3 campaigns should remain intact
