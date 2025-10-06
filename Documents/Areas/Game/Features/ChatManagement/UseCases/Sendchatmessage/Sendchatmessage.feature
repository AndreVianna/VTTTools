# Generated: 2025-10-03
# Use Case: Send Chat Message
@use-case @game @chat-management @real-time @signalr
Feature: Send Chat Message
  As a game session participant
  I want to send chat messages during gameplay
  So that I can communicate with other participants in real-time

  Background:
    Given I am authenticated as a session participant
    And I am participating in an active game session
    And the session status is "InProgress"

  Rule: Only participants can send messages

    @happy-path
    Scenario: Participant successfully sends text message
      Given the session has 3 participants
      When I send a text message "Let's start the encounter"
      Then my message should be added to the session
      And the message timestamp should be recorded
      And my message should be broadcast to all 3 participants in real-time
      And I should receive confirmation with the created message

    @authorization @error-handling
    Scenario: Non-participant cannot send message
      Given I am authenticated but not a participant in the session
      When I attempt to send a message "Hello"
      Then the request should fail with authorization error
      And I should see error "User is not a participant in this session"

  @happy-path
  Scenario: Participant sends command message
    Given I am participating in the session
    When I send a command message "/roll 1d20"
    Then my command should be added to the session
    And the message type should be "Command"
    And my command should be broadcast to all participants

  @edge-case
  Scenario: Send message during paused session
    Given the session status is "Paused"
    When I send a message "Waiting for everyone"
    Then my message should be added successfully
    And my message should be broadcast to all participants

  @business-rule @error-handling
  Scenario: Reject empty message
    When I attempt to send an empty message
    Then the request should fail with validation error
    And I should see error "Message content cannot be empty"

  @business-rule @error-handling
  Scenario Outline: Reject message to inactive session
    Given the session status is "<status>"
    When I attempt to send a message "Test"
    Then the request should fail with validation error
    And I should see error "Cannot send messages in <status> session"

    Examples:
      | status    |
      | Draft     |
      | Finished  |
      | Cancelled |

  @error-handling
  Scenario: Handle non-existent session
    Given the session does not exist
    When I attempt to send a message "Hello"
    Then the request should fail with not found error
    And I should see error "Game session not found"

  @real-time @edge-case
  Scenario: Messages broadcast in timestamp order
    Given the session has 2 participants
    And another participant is connected via SignalR
    When I send message "First message"
    And I send message "Second message"
    Then all messages should be broadcast in timestamp order
    And all participants should receive all messages in real-time
