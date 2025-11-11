# Generated: 2025-10-03
# Use case BDD for Create-Game-Session
@use-case @game @session-management @api-endpoint
Feature: Create-Game-Session
  As a Game Master
  I want to create a new game session
  So that I can organize and manage tabletop RPG meetings with players

  Background:
    Given I am authenticated as a Game Master
    And the game session service is available

  Rule: Title must not be empty

    Scenario: Create game session with valid title
      When I create a game session with title "Dragon Heist Campaign"
      Then my session is created successfully
      And the session title is "Dragon Heist Campaign"
      And the session status is "Draft"
      And I am the session owner

    Scenario: Create game session with empty title
      When I create a game session with title ""
      Then I receive a 400 Bad Request error
      And the error message is "Title must not be empty"

  Rule: Title must not exceed 128 characters

    Scenario: Create game session with title under maximum length
      When I create a game session with title "Waterdeep Dragon Heist: A Thrilling Adventure in the City of Splendors"
      Then my session is created successfully
      And the session title is "Waterdeep Dragon Heist: A Thrilling Adventure in the City of Splendors"

    Scenario: Create game session with title at exactly 128 characters
      When I create a game session with title "The Lost Mines of Phandelver: An World Quest Through Dangerous Dungeons and Treacherous Terrain Filled With Ancient Mysteries"
      Then my session is created successfully
      And the title length is exactly 128 characters

    Scenario: Create game session with title exceeding maximum length
      When I create a game session with title "The Lost Mines of Phandelver: An World Quest Through Dangerous Dungeons and Treacherous Terrain Filled With Ancient Mysteries and Hidden Treasures Beyond Imagination"
      Then I receive a 400 Bad Request error
      And the error message is "Title must not exceed 128 characters"

  Scenario: Successfully create game session with all defaults
    When I create a game session with title "Curse of Strahd"
    Then my session is created successfully
    And the session has a unique identifier
    And I am the session owner
    And the session status is "Draft"
    And the session has no active encounter
    And the session was created with the current timestamp

  Scenario: Game Master is automatically assigned as Master participant
    When I create a game session with title "Tomb of Annihilation"
    Then my session is created successfully
    And I am a participant in the session
    And my participant role is "Master"
    And the session has exactly one participant

  Scenario: Create game session when owner identity is invalid
    Given my authentication context references a non-existent user
    When I create a game session with title "Storm King's Thunder"
    Then I receive a 404 Not Found error
    And the error message is "User not found"

  Scenario: Create game session when persistence fails
    Given the game session repository is unavailable
    When I create a game session with title "Out of the Abyss"
    Then I receive a 500 Internal Server Error
    And the error message is "Failed to create game session"
