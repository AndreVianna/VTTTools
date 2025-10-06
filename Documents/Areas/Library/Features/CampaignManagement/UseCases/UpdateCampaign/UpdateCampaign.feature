# Generated: 2025-10-02
# Use Case: Update Campaign

Feature: Update Campaign
  As a Game Master
  I want to update an existing campaign
  So that I can modify campaign properties and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own a campaign in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update campaign with valid new name
      Given my campaign has name "Original Campaign"
      When I update the campaign name to "Updated Campaign Name"
      Then the campaign is updated successfully
      And the campaign name should be "Updated Campaign Name"

    Scenario: Reject update with empty name
      Given my campaign has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "Campaign name is required"

  Rule: Published campaigns must be public

    Scenario: Update campaign to published and public
      Given my campaign has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the campaign is updated successfully
      And the campaign should be publicly visible

    Scenario: Reject update to published without public
      Given my campaign has IsPublished=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published campaigns must be public"

  @happy-path
  Scenario: Successfully update campaign description
    Given my campaign has description "Old description"
    When I update the description to "New detailed description"
    Then the campaign is updated successfully
    And the description should be "New detailed description"

  @happy-path
  Scenario: Successfully update multiple campaign properties
    Given my campaign exists
    When I update the campaign with:
      | Field        | Value                     |
      | Name         | Revised Campaign          |
      | Description  | Updated storyline         |
      | IsPublic     | true                      |
    Then the campaign is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent campaign
    Given no campaign exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update campaign "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Campaign not found"

  @authorization
  Scenario: User cannot update campaign they don't own
    Given a campaign exists owned by another user
    When I attempt to update that campaign
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this campaign"

  @edge-case
  Scenario: Update campaign with same values
    Given my campaign has name "Campaign Name"
    When I update with the same name "Campaign Name"
    Then the campaign is updated successfully
    And no actual changes is saved
