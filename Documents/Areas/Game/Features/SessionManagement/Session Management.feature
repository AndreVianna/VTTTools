# Generated: 2025-10-03
# Feature-level BDD for Session Management - Cross-use-case user journeys
@feature @game @session-management
Feature: Session Management
  As a Game Master
  I want to create and manage game sessions with full lifecycle control
  So that I can orchestrate live gameplay sessions with participants, encounters, and events

  Background:
    Given I am authenticated as a Game Master
    And the game session service is available

  Rule: Session status must follow lifecycle progression

    @happy-path @integration
    Scenario: Successfully create and manage complete session lifecycle
      When I create a new game session with title "Dragon's Lair Campaign"
      Then my session is created with status "Draft"
      And my session includes me as a Master participant
      When I schedule my session for next Friday at 7 PM
      Then my session status changes to "Scheduled"
      When I start my scheduled session
      Then my session status changes to "InProgress"
      When I pause my active session
      Then my session status changes to "Paused"
      When I resume my paused session
      Then my session status changes to "InProgress"
      When I finish my active session
      Then my session status changes to "Finished"

    @business-rule
    Scenario: Successfully transition session from Draft to Scheduled
      Given I have a game session in "Draft" status
      When I schedule my session for tomorrow at 6 PM
      Then my session status changes to "Scheduled"
      And my scheduled start time is set to tomorrow at 6 PM

    @business-rule
    Scenario: Successfully transition session from Scheduled to InProgress
      Given I have a game session in "Scheduled" status
      When I start my scheduled session
      Then my session status changes to "InProgress"
      And my session start timestamp is recorded

    @business-rule
    Scenario: Successfully pause an active session
      Given I have a game session in "InProgress" status
      When I pause my active session
      Then my session status changes to "Paused"
      And my session pause timestamp is recorded

    @business-rule
    Scenario: Successfully resume a paused session
      Given I have a game session in "Paused" status
      When I resume my paused session
      Then my session status changes to "InProgress"
      And my session resume timestamp is recorded

    @business-rule
    Scenario: Successfully finish an active session
      Given I have a game session in "InProgress" status
      When I finish my active session
      Then my session status changes to "Finished"
      And my session end timestamp is recorded

    @business-rule
    Scenario: Successfully cancel a scheduled session
      Given I have a game session in "Scheduled" status
      When I cancel my scheduled session
      Then my session status changes to "Cancelled"
      And my session cancellation timestamp is recorded

    @business-rule @error-handling
    Scenario: Cannot skip lifecycle states during transition
      Given I have a game session in "Draft" status
      When I attempt to start my session without scheduling it first
      Then I receive an error indicating invalid status transition
      And my session remains in "Draft" status

    @business-rule @error-handling
    Scenario: Cannot transition from invalid status
      Given I have a game session in "Finished" status
      When I attempt to pause my finished session
      Then I receive an error indicating invalid status transition
      And my session remains in "Finished" status

    @business-rule @error-handling
    Scenario: Cannot resume a session that is not paused
      Given I have a game session in "InProgress" status
      When I attempt to resume my active session
      Then I receive an error indicating session is not paused
      And my session remains in "InProgress" status

  Rule: Only Draft sessions can be permanently deleted

    @business-rule
    Scenario: Successfully delete a Draft session
      Given I have a game session in "Draft" status
      When I delete my draft session
      Then my session is permanently removed
      And my session no longer appears in my session list

    @business-rule @error-handling
    Scenario: Cannot permanently delete non-Draft sessions
      Given I have a game session in "Scheduled" status
      When I attempt to delete my scheduled session
      Then I receive an error indicating only Draft sessions can be deleted
      And my session remains in "Scheduled" status

  @integration
  Scenario: Successfully assign active encounter during session
    Given I have a game session in "InProgress" status
    And I have a encounter named "Throne Room" in my library
    When I set "Throne Room" as the active encounter for my session
    Then my session active encounter is set to "Throne Room"
    And participants can view the active encounter

  @integration
  Scenario: Game Master is automatically added as Master participant
    When I create a new game session with title "Starter Adventure"
    Then my session is created with status "Draft"
    And my session includes me as a Master participant
    And my participant role is "Master"

  @integration
  Scenario: Successfully retrieve active sessions
    Given I have 3 game sessions with status "InProgress"
    And I have 2 game sessions with status "Scheduled"
    When I retrieve all active sessions
    Then I receive 3 active sessions
    And all returned sessions have status "InProgress"

  @integration
  Scenario: Successfully list sessions by owner
    Given I own 5 game sessions
    And another Game Master owns 3 game sessions
    When I retrieve my game sessions
    Then I receive 5 sessions
    And all returned sessions are owned by me
