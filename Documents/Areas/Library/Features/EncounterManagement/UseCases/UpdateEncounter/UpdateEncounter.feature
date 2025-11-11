# Generated: 2025-10-02
# Use Case: Update Encounter

Feature: Update Encounter
  As a Game Master
  I want to update an existing encounter
  So that I can modify encounter properties and publication status

  Background:
    Given I am authenticated as a Game Master
    And I own a encounter in my library
    

  Rule: Name is required and cannot exceed 128 characters

    Scenario: Update encounter with valid new name
      Given my encounter has name "Original Encounter"
      When I update the encounter name to "Updated Battle Arena"
      Then the encounter is updated successfully
      And the encounter name should be "Updated Battle Arena"

    Scenario: Reject update with empty name
      Given my encounter has name "Valid Name"
      When I attempt to update with empty name
      Then I should see error with validation error
      And I should see error "Encounter name is required"

  Rule: Published encounters must be public

    Scenario: Update encounter to published and public
      Given my encounter has IsPublished=false and IsPublic=false
      When I update to IsPublished=true and IsPublic=true
      Then the encounter is updated successfully
      And the encounter should be publicly visible

    Scenario: Reject update to published without public
      Given my encounter has IsPublished=false
      When I attempt to update to IsPublished=true and IsPublic=false
      Then I should see error with validation error
      And I should see error "Published encounters must be public"

  @happy-path
  Scenario: Successfully update encounter description
    Given my encounter has description "Old description"
    When I update the description to "New tactical map description"
    Then the encounter is updated successfully
    And the description should be "New tactical map description"

  @happy-path
  Scenario: Successfully update multiple encounter properties
    Given my encounter exists
    When I update the encounter with:
      | Field        | Value                  |
      | Name         | Revised Encounter          |
      | Description  | Updated battle map     |
      | IsPublic     | true                   |
    Then the encounter is updated successfully
    And all updated fields should reflect new values

  @error-handling
  Scenario: Handle update of non-existent encounter
    Given no encounter exists with ID "999e8400-e29b-41d4-a716-446655440999"
    When I attempt to update encounter "999e8400-e29b-41d4-a716-446655440999"
    Then I should see error with not found error
    And I should see error "Encounter not found"

  @authorization
  Scenario: User cannot update encounter they don't own
    Given a encounter exists owned by another user
    When I attempt to update that encounter
    Then I should see error with forbidden error
    And I should see error "You are not authorized to update this encounter"

  @edge-case
  Scenario: Update encounter preserves stage and grid configuration
    Given my encounter has configured stage and grid
    When I update the encounter name
    Then the encounter name is updated
    And the stage configuration should remain unchanged
    And the grid configuration should remain unchanged
