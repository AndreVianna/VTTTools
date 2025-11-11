# Generated: 2025-10-02
# Use Case: Clone Adventure

Feature: Clone Adventure
  As a Game Master
  I want to clone an existing adventure with all its encounters
  So that I can reuse adventure content for different game sessions

  Background:
    Given I am authenticated as a Game Master
    And I own an adventure in my library
    

  Rule: Cloning creates deep copy with new unique IDs

    Scenario: Clone adventure creates new unique ID
      Given my adventure has ID "550e8400-e29b-41d4-a716-446655440000"
      When I clone the adventure
      Then a new adventure should be created
      And the new adventure should have a different ID
      And the original adventure should remain unchanged

    Scenario: Clone adventure duplicates all encounters with new IDs
      Given my adventure has 5 encounters
      And each encounter has unique ID
      When I clone the adventure
      Then the cloned adventure should have 5 encounters
      And each cloned encounter should have a new unique ID
      And the original encounters should remain unchanged

  @happy-path
  Scenario: Successfully clone adventure with all properties
    Given my adventure has:
      | Property     | Value                      |
      | Name         | Original Adventure         |
      | Description  | Original description       |
      | Type         | DungeonCrawl               |
      | IsPublished  | true                       |
      | IsPublic     | true                       |
    When I clone the adventure
    Then the cloned adventure should have:
      | Property     | Value                      |
      | Name         | Original Adventure (Copy)  |
      | Description  | Original description       |
      | Type         | DungeonCrawl               |
      | IsPublished  | false                      |
      | IsPublic     | false                      |

  @happy-path
  Scenario: Successfully clone adventure with encounters containing assets
    Given my adventure has 3 encounters
    And the first encounter has 5 placed assets
    And the second encounter has 3 placed assets
    And the third encounter has 2 placed assets
    When I clone the adventure
    Then the cloned adventure should have 3 encounters
    And the first cloned encounter should have 5 placed assets
    And the second cloned encounter should have 3 placed assets
    And the third cloned encounter should have 2 placed assets
    And all asset placements should be duplicated

  @happy-path
  Scenario: Successfully clone adventure with stage and grid configurations
    Given my adventure has encounters with:
      | Encounter Properties        |
      | Stage background        |
      | Stage dimensions        |
      | Grid configuration      |
      | Grid size and offset    |
    When I clone the adventure
    Then all encounter stage configurations should be duplicated
    And all encounter grid configurations should be duplicated
    And all configurations should have correct values

  @happy-path
  Scenario: Successfully clone standalone adventure
    Given my adventure is standalone with null CampaignId
    When I clone the adventure
    Then the cloned adventure should also be standalone
    And the CampaignId should be null

  @happy-path
  Scenario: Successfully clone adventure in campaign
    Given my adventure is in campaign "550e8400-e29b-41d4-a716-446655440000"
    When I clone the adventure
    Then the cloned adventure should reference the same campaign
    And the CampaignId should be "550e8400-e29b-41d4-a716-446655440000"

  @error-handling
  Scenario: Handle cloning non-existent adventure
    Given no adventure exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to clone adventure "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Adventure not found"

  @error-handling
  Scenario: Handle database failure during clone
    Given my adventure exists with encounters
    And the database is unavailable
    When I attempt to clone the adventure
    Then I should see error with server error
    And I should see error "Failed to clone adventure"

  @authorization
  Scenario: User cannot clone adventure they don't own
    Given an adventure exists owned by another user
    When I attempt to clone that adventure
    Then I should see error with forbidden error
    And I should see error "You are not authorized to clone this adventure"

  @edge-case
  Scenario: Clone adventure with no encounters
    Given my adventure has no encounters
    When I clone the adventure
    Then the cloned adventure is created
    And the cloned adventure should have no encounters

  @edge-case
  Scenario: Clone adventure with maximum encounters
    Given my adventure has 50 encounters
    When I clone the adventure
    Then the cloned adventure should have 50 encounters
    And all encounters should be properly duplicated
    And the operation should complete within acceptable time

  @integration
  Scenario: Clone adventure and verify independence from original
    Given my adventure has 3 encounters
    When I clone the adventure
    And I update the original adventure name to "Original Modified"
    And I update the cloned adventure name to "Clone Modified"
    Then the original adventure should have name "Original Modified"
    And the cloned adventure should have name "Clone Modified"
    And changes should not affect each other
