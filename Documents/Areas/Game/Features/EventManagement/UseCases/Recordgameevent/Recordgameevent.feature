# Generated: 2025-10-03
# Use Case: Record Game Event
@use-case @game @event-management @real-time @signalr
Feature: Record Game Event
  As a system or session participant
  I want to record structured game events with JSON data
  So that game actions are logged for history and real-time broadcast

  Background:
    Given a game session exists
    And the session status is "InProgress"
    And SignalR connections are established

  Rule: Events are append-only and ordered by timestamp

    @happy-path @dice-roll
    Scenario: Record dice roll event with JSON data
      When I record a "DiceRoll" event with data:
        """
        {"rollType":"d20","result":15,"modifier":3,"total":18}
        """
      Then the event should be added to the session
      And the event timestamp should be recorded
      And the event should be broadcast to all participants via SignalR

    @happy-path @asset-movement
    Scenario: Record asset moved event
      When I record an "AssetMoved" event with data:
        """
        {"assetId":"token-789","fromPosition":{"x":5,"y":3},"toPosition":{"x":7,"y":5}}
        """
      Then the event should be added to the session
      And the event timestamp should be greater than previous events
      And the event should be broadcast to all participants

    @happy-path @status-change
    Scenario: Record status changed event
      When I record a "StatusChanged" event with data:
        """
        {"targetId":"character-101","statusEffect":"Poisoned","duration":3}
        """
      Then the event should be appended to the event log
      And the event should be broadcast via SignalR

    @happy-path @scene-change
    Scenario: Record scene changed event
      When I record a "SceneChanged" event with data:
        """
        {"previousSceneId":"scene-01","newSceneId":"scene-02"}
        """
      Then the event should be persisted with current timestamp
      And the event should be broadcast to all participants

    @happy-path @custom-event
    Scenario: Record custom event type
      When I record a "TreasureFound" event with data:
        """
        {"treasureId":"gold-chest-42","value":500,"rarity":"rare"}
        """
      Then the event should be stored in append-only log
      And the event should be broadcast to participants

  @business-rule @error-handling
  Scenario: Reject event with empty EventType
    When I attempt to record an event with empty EventType
    Then the request should fail with validation error
    And I should see error "EventType cannot be empty"

  @business-rule @error-handling
  Scenario Outline: Reject event when session not InProgress or Paused
    Given the session status is "<status>"
    When I attempt to record a "DiceRoll" event
    Then the request should fail with validation error
    And I should see error "Events can only be recorded for InProgress or Paused sessions"

    Examples:
      | status    |
      | Draft     |
      | Scheduled |
      | Finished  |
      | Cancelled |

  @edge-case
  Scenario: Can record event when session is Paused
    Given the session status is "Paused"
    When I record a "NoteAdded" event with data:
      """
      {"note":"Session paused for break"}
      """
    Then the event should be added successfully
    And the event should be broadcast to participants

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to record an event
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @edge-case @real-time
  Scenario: Multiple events maintain timestamp order
    When I record an "InitiativeRoll" event at time T1
    And I record another "InitiativeRoll" event at time T2
    And I record a "CombatStarted" event at time T3
    Then all events should be persisted in chronological order
    And the event log should show events ordered by timestamp ascending
    And all events should be broadcast in order
