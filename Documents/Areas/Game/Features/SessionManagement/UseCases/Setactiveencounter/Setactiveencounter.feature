# Generated: 2025-10-03
# Use Case: Set Active Encounter
@use-case @game @session-management @cross-area
Feature: Set Active Encounter
  As a Game Master
  I want to set or change the active encounter for a game session
  So that I can control which tactical map is displayed during gameplay

  Background:
    Given I am authenticated as a Game Master
    And I have a game session
    And multiple encounters exist in the Library

  Rule: Encounter ID must reference existing Encounter if provided

    @happy-path
    Scenario: Successfully set active encounter for session
      Given the session has no active encounter
      And a encounter exists in the Library
      When I set the active encounter for the session
      Then the request should succeed
      And the session should have the assigned encounter
      And I should receive confirmation

    @happy-path
    Scenario: Successfully change active encounter
      Given the session has an active encounter assigned
      And a different encounter exists in the Library
      When I change the active encounter to the new encounter
      Then the request should succeed
      And the session should have the new encounter assigned

    @happy-path
    Scenario: Successfully clear active encounter
      Given the session has an active encounter assigned
      When I clear the active encounter
      Then the request should succeed
      And the session should have no active encounter

    @business-rule @cross-area
    Scenario: Cannot set non-existent encounter
      Given a encounter ID that does not exist in the Library
      When I attempt to set that encounter as active
      Then the request should fail with validation error
      And I should see error "Encounter with ID does not exist"
      And the session encounter should remain unchanged

  @authorization @error-handling
  Scenario: Non-owner cannot set active encounter
    Given the session is owned by another Game Master
    And a encounter exists in the Library
    When I attempt to set the active encounter
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can modify the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to set an active encounter
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case @cross-area
  Scenario: GM can use encounter from another GM's library
    Given a encounter exists owned by another Game Master
    And the encounter is available in the Library
    When I set that encounter as active for my session
    Then the request should succeed
    And the session should reference the cross-owner encounter
