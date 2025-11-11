# Generated: 2025-10-03
# Use Case: Set Active Scene
@use-case @game @session-management @cross-area
Feature: Set Active Scene
  As a Game Master
  I want to set or change the active scene for a game session
  So that I can control which tactical map is displayed during gameplay

  Background:
    Given I am authenticated as a Game Master
    And I have a game session
    And multiple scenes exist in the Library

  Rule: Scene ID must reference existing Scene if provided

    @happy-path
    Scenario: Successfully set active scene for session
      Given the session has no active scene
      And a scene exists in the Library
      When I set the active scene for the session
      Then the request should succeed
      And the session should have the assigned scene
      And I should receive confirmation

    @happy-path
    Scenario: Successfully change active scene
      Given the session has an active scene assigned
      And a different scene exists in the Library
      When I change the active scene to the new scene
      Then the request should succeed
      And the session should have the new scene assigned

    @happy-path
    Scenario: Successfully clear active scene
      Given the session has an active scene assigned
      When I clear the active scene
      Then the request should succeed
      And the session should have no active scene

    @business-rule @cross-area
    Scenario: Cannot set non-existent scene
      Given a scene ID that does not exist in the Library
      When I attempt to set that scene as active
      Then the request should fail with validation error
      And I should see error "Scene with ID does not exist"
      And the session scene should remain unchanged

  @authorization @error-handling
  Scenario: Non-owner cannot set active scene
    Given the session is owned by another Game Master
    And a scene exists in the Library
    When I attempt to set the active scene
    Then the request should fail with authorization error
    And I should see error "Only the Game Master can modify the session"

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to set an active scene
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case @cross-area
  Scenario: GM can use scene from another GM's library
    Given a scene exists owned by another Game Master
    And the scene is available in the Library
    When I set that scene as active for my session
    Then the request should succeed
    And the session should reference the cross-owner scene
