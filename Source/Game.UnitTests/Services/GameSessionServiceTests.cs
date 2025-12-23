
namespace VttTools.Game.Services;

public class GameSessionServiceTests {
    private readonly IGameSessionStorage _sessionStorage;
    private readonly GameSessionService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public GameSessionServiceTests() {
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _service = new(_sessionStorage);
        _ct = TestContext.Current.CancellationToken;
    }

    #region GetGameSessionsAsync

    [Fact]
    public async Task GetGameSessionsAsync_ReturnsGameSessionArray() {
        // Arrange
        var sessions = new GameSession[] {
            new() { Id = Guid.CreateVersion7(), Title = "Test GameSession 1", OwnerId = _userId },
            new() { Id = Guid.CreateVersion7(), Title = "Test GameSession 2", OwnerId = _userId },
                                     };
        _sessionStorage.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>()).Returns(sessions);

        // Act
        var result = await _service.GetGameSessionsAsync(_userId, _ct);

        // Assert
        result.Should().BeEquivalentTo(sessions);
        await _sessionStorage.Received(1).GetByUserIdAsync(_userId, Arg.Any<CancellationToken>());
    }

    #endregion GetGameSessionsAsync

    #region GetGameSessionByIdAsync

    [Fact]
    public async Task GetGameSessionByIdAsync_WithExistingId_ReturnsGameSession() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession { Id = sessionId, Title = "Test GameSession", OwnerId = _userId };
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.GetGameSessionByIdAsync(_userId, sessionId, _ct);

        // Assert
        result.Should().BeEquivalentTo(session);
        await _sessionStorage.Received(1).GetByIdAsync(sessionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetGameSessionByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.GetGameSessionByIdAsync(_userId, sessionId, _ct);

        // Assert
        result.Should().BeNull();
        await _sessionStorage.Received(1).GetByIdAsync(sessionId, Arg.Any<CancellationToken>());
    }

    #endregion GetGameSessionByIdAsync

    #region CreateGameSessionAsync

    [Fact]
    public async Task CreateGameSessionAsync_WithValidData_ReturnsSuccess() {
        // Arrange
        var encounterId = Guid.CreateVersion7();
        var data = new CreateGameSessionData {
            Title = "New GameSession",
            EncounterId = encounterId,
        };
        var createdGameSession = new GameSession {
            Title = "New GameSession",
            EncounterId = encounterId,
            OwnerId = _userId,
            Players = [new() { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.AddAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>())
            .Returns(createdGameSession);

        // Act
        var result = await _service.CreateGameSessionAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Title.Should().Be(data.Title);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.EncounterId.Should().Be(encounterId);
        result.Value.Players.Should().ContainSingle(p => p.UserId == _userId && p.Type == PlayerType.Master);

        await _sessionStorage.Received(1).AddAsync(
            Arg.Is<GameSession>(m => m.Title == data.Title && m.OwnerId == _userId && m.EncounterId == encounterId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateGameSessionAsync_WithInvalidData_ReturnsFailure() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = "", // Invalid empty title
            EncounterId = Guid.CreateVersion7(),
        };

        // Act
        var result = await _service.CreateGameSessionAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _sessionStorage.DidNotReceive().AddAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion CreateGameSessionAsync

    #region UpdateGameSessionAsync

    [Fact]
    public async Task UpdateGameSessionAsync_AsNonOwner_ReturnsForbidden() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
        };

        var data = new UpdateGameSessionData {
            Title = "Updated Title",
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(nonOwnerId, sessionId, data, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateGameSessionAsync_AsOwnerWithValidData_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "Old Title",
            OwnerId = _userId,
            EncounterId = Guid.CreateVersion7(),
        };

        var newEncounterId = Guid.CreateVersion7();
        var data = new UpdateGameSessionData {
            Title = "Updated Title",
            EncounterId = newEncounterId,
        };
        var expectedGameSession = new GameSession {
            Id = sessionId,
            Title = data.Title.Value,
            OwnerId = _userId,
            EncounterId = data.EncounterId.Value,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedGameSession);
    }

    [Fact]
    public async Task UpdateGameSessionAsync_AsOwnerWithPartialData_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        const string originalTitle = "Original Title";
        var session = new GameSession {
            Id = sessionId,
            Title = originalTitle,
            OwnerId = _userId,
            EncounterId = encounterId,
        };
        var data = new UpdateGameSessionData {
            Title = "Updated Title",
            // TemplateId not set
        };
        var expectedGameSession = new GameSession {
            Id = sessionId,
            Title = data.Title.Value,
            OwnerId = _userId,
            EncounterId = encounterId,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedGameSession);
    }

    [Fact]
    public async Task UpdateGameSessionAsync_AsOwnerWithEmptyData_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        const string originalTitle = "Original Title";
        var session = new GameSession {
            Id = sessionId,
            Title = originalTitle,
            OwnerId = _userId,
            EncounterId = encounterId,
        };

        // Empty update data with nothing set
        var data = new UpdateGameSessionData();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(session);
    }

    [Fact]
    public async Task UpdateGameSessionAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var data = new UpdateGameSessionData {
            Title = "Updated Title",
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateGameSessionAsync_WithInvalidData_ReturnsBadRequest(string? title) {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "Session Title",
            OwnerId = _userId,
            EncounterId = Guid.CreateVersion7(),
        };
        var data = new UpdateGameSessionData {
            Title = title!,
        };
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.Received().GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion UpdateGameSessionAsync

    #region DeleteGameSessionAsync

    [Fact]
    public async Task DeleteGameSessionAsync_AsOwner_DeletesGameSessionAndReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.DeleteGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).DeleteAsync(sessionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteGameSessionAsync_AsNonOwner_ReturnsForbiddenAndDoesNotDelete() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var nonOwnerId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.DeleteGameSessionAsync(nonOwnerId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteGameSessionAsync_WithNonExistentGameSession_ReturnsNotFoundAndDoesNotDelete() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.DeleteGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    #endregion DeleteGameSessionAsync

    #region JoinGameSessionAsync

    [Fact]
    public async Task JoinGameSessionAsync_WithNewPlayer_AddsPlayerAndReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var playerId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.JoinGameSessionAsync(playerId, sessionId, PlayerType.Player, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().Contain(p => p.UserId == playerId && p.Type == PlayerType.Player);
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(m => m.Players.Any(p => p.UserId == playerId && p.Type == PlayerType.Player)),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task JoinGameSessionAsync_WithExistingPlayer_ReturnsNoContentAndDoesNotAddDuplicate() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                      ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.JoinGameSessionAsync(_userId, sessionId, PlayerType.Player, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().ContainSingle(p => p.UserId == _userId); // Still only one entry for this user
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task JoinGameSessionAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.JoinGameSessionAsync(_userId, sessionId, PlayerType.Player, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion JoinGameSessionAsync

    #region LeaveGameSessionAsync

    [Fact]
    public async Task LeaveGameSessionAsync_WithPlayerInGameSession_RemovesPlayerAndReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var playerIdToRemove = Guid.CreateVersion7();
        var anotherPlayerId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = playerIdToRemove, Type = PlayerType.Player },
                new Participant { UserId = anotherPlayerId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.LeaveGameSessionAsync(playerIdToRemove, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().HaveCount(2);
        session.Players.Should().NotContain(p => p.UserId == playerIdToRemove);
        session.Players.Should().Contain(p => p.UserId == _userId);
        session.Players.Should().Contain(p => p.UserId == anotherPlayerId);
        await _sessionStorage.Received(1).UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LeaveGameSessionAsync_WithPlayerNotInGameSession_ReturnsNoContentAndDoesNotChangePlayers() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var otherPlayerId = Guid.CreateVersion7();
        var nonMemberPlayerId = Guid.CreateVersion7(); // This user is not in the game session
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = otherPlayerId, Type = PlayerType.Player },
            ],
        };
        var initialPlayerCount = session.Players.Count;

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.LeaveGameSessionAsync(nonMemberPlayerId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().HaveCount(initialPlayerCount);
        await _sessionStorage.Received(1).UpdateAsync(session, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LeaveGameSessionAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.LeaveGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion LeaveGameSessionAsync

    #region SetActiveEncounterAsync

    [Fact]
    public async Task SetActiveEncounterAsync_AsGameMaster_UpdatesEncounterAndReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var newEncounterId = Guid.CreateVersion7();
        var oldEncounterId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = Guid.CreateVersion7(), // Different owner for testing GM role
            EncounterId = oldEncounterId,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveEncounterAsync(_userId, sessionId, newEncounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.EncounterId == newEncounterId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEncounterAsync_AsNonGameMaster_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var playerId = Guid.CreateVersion7(); // User making the call is just a player
        var newEncounterId = Guid.CreateVersion7();
        var oldEncounterId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            EncounterId = oldEncounterId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = playerId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveEncounterAsync(playerId, sessionId, newEncounterId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.EncounterId.Should().Be(oldEncounterId); // Verify encounter not changed
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEncounterAsync_AsPlayerNotInGameSession_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var newEncounterId = Guid.CreateVersion7();
        var playerNotInGameSessionId = Guid.CreateVersion7(); // This user is not in the players list
        var oldEncounterId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            EncounterId = oldEncounterId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = Guid.CreateVersion7(), Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveEncounterAsync(playerNotInGameSessionId, sessionId, newEncounterId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue(); // Service checks IsGameSessionGameMaster, which includes IsInGameSession
        session.EncounterId.Should().Be(oldEncounterId);
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEncounterAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.SetActiveEncounterAsync(_userId, sessionId, encounterId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion SetActiveEncounterAsync

    #region StartGameSessionAsync

    [Fact]
    public async Task StartGameSessionAsync_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.Scheduled,
            OwnerId = Guid.CreateVersion7(), // Different owner
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master }, // Caller is GM
                new Participant { UserId = Guid.CreateVersion7(), Type = PlayerType.Player }
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StartGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.Status == GameSessionStatus.InProgress),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task StartGameSessionAsync_AsNonGameMaster_ReturnsForbidden() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var nonGmId = Guid.CreateVersion7(); // Caller is not GM
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId, // Different owner
            Status = GameSessionStatus.Scheduled,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = nonGmId, Type = PlayerType.Player }, // Caller is player
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StartGameSessionAsync(nonGmId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.Status.Should().Be(GameSessionStatus.Scheduled);
    }

    [Fact]
    public async Task StartGameSessionAsync_AsPlayerNotInGameSession_ReturnsForbidden() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var gmId = Guid.CreateVersion7();
        var playerNotInGameSessionId = Guid.CreateVersion7(); // Caller is not in players list
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId, // Different owner
            Status = GameSessionStatus.Scheduled,
            Players = [
                new Participant { UserId = gmId, Type = PlayerType.Master },
                new Participant { UserId = _userId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StartGameSessionAsync(playerNotInGameSessionId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.Status.Should().Be(GameSessionStatus.Scheduled);
    }

    [Fact]
    public async Task StartGameSessionAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.StartGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
    }

    #endregion StartGameSessionAsync

    #region StopGameSessionAsync

    [Fact]
    public async Task StopGameSessionAsync_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.InProgress,
            OwnerId = Guid.CreateVersion7(), // Different owner
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = Guid.CreateVersion7(), Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StopGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.Status == GameSessionStatus.Finished),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task StopGameSessionAsync_AsNonGameMaster_ReturnsForbidden() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var nonGmId = Guid.CreateVersion7(); // Caller is not GM
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.InProgress,
            OwnerId = _userId, // Different owner
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = nonGmId, Type = PlayerType.Player }, // Caller is player
                      ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StopGameSessionAsync(nonGmId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.Status.Should().Be(GameSessionStatus.InProgress);
    }

    [Fact]
    public async Task StopGameSessionAsync_AsPlayerNotInGameSession_ReturnsForbidden() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var gmId = Guid.CreateVersion7();
        var playerNotInGameSessionId = Guid.CreateVersion7(); // Caller is not in players list
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.InProgress,
            OwnerId = _userId, // Different owner
            Players = [
                new Participant { UserId = gmId, Type = PlayerType.Master },
                new Participant { UserId = _userId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StopGameSessionAsync(playerNotInGameSessionId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.Status.Should().Be(GameSessionStatus.InProgress);
    }

    [Fact]
    public async Task StopGameSessionAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.StopGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
    }

    #endregion StopGameSessionAsync

    #region Edge Cases and State Transitions

    [Fact]
    public async Task JoinGameSessionAsync_AsGameMaster_AddsGameMasterSuccessfully() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var newGmId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.JoinGameSessionAsync(newGmId, sessionId, PlayerType.Master, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().Contain(p => p.UserId == newGmId && p.Type == PlayerType.Master);
    }

    [Fact]
    public async Task LeaveGameSessionAsync_AsGameMaster_RemovesGameMasterSuccessfully() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var gmId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = gmId, Type = PlayerType.Master },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.LeaveGameSessionAsync(gmId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().NotContain(p => p.UserId == gmId);
        session.Players.Should().ContainSingle(p => p.UserId == _userId);
    }

    [Fact]
    public async Task StartGameSessionAsync_WhenAlreadyInProgress_StillUpdatesStatus() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.InProgress,
            OwnerId = Guid.CreateVersion7(),
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StartGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.Status == GameSessionStatus.InProgress),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task StopGameSessionAsync_WhenAlreadyFinished_StillUpdatesStatus() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.Finished,
            OwnerId = Guid.CreateVersion7(),
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.StopGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.Status == GameSessionStatus.Finished),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEncounterAsync_WithSameEncounter_UpdatesSuccessfully() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var encounterId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = Guid.CreateVersion7(),
            EncounterId = encounterId,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveEncounterAsync(_userId, sessionId, encounterId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.EncounterId == encounterId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateGameSessionAsync_WithoutEncounterId_CreatesWithEmptyGuid() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = "New GameSession",
        };
        var createdGameSession = new GameSession {
            Title = "New GameSession",
            EncounterId = Guid.Empty,
            OwnerId = _userId,
            Players = [new() { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.AddAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>())
            .Returns(createdGameSession);

        // Act
        var result = await _service.CreateGameSessionAsync(_userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        var encounterId = result.Value.EncounterId;
        (encounterId == null || encounterId == Guid.Empty).Should().BeTrue();
    }

    [Fact]
    public async Task UpdateGameSessionAsync_ClearEncounterId_UpdatesSuccessfully() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var oldEncounterId = Guid.CreateVersion7();
        var emptyGuid = Guid.Empty;
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            EncounterId = oldEncounterId,
        };

        var data = new UpdateGameSessionData {
            EncounterId = emptyGuid,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.EncounterId.Should().Be(emptyGuid);
    }

    [Fact]
    public async Task JoinGameSessionAsync_WithMultiplePlayers_MaintainsAllPlayers() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var player1Id = Guid.CreateVersion7();
        var player2Id = Guid.CreateVersion7();
        var player3Id = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = player1Id, Type = PlayerType.Player },
                new Participant { UserId = player2Id, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.JoinGameSessionAsync(player3Id, sessionId, PlayerType.Player, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().HaveCount(4);
        session.Players.Should().Contain(p => p.UserId == player3Id);
    }

    [Fact]
    public async Task LeaveGameSessionAsync_WithLastPlayer_RemovesSuccessfully() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = Guid.CreateVersion7(),
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.LeaveGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        session.Players.Should().BeEmpty();
    }

    [Fact]
    public async Task GetGameSessionsAsync_WithEmptyResult_ReturnsEmptyArray() {
        // Arrange
        var sessions = Array.Empty<GameSession>();
        _sessionStorage.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>()).Returns(sessions);

        // Act
        var result = await _service.GetGameSessionsAsync(_userId, _ct);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateGameSessionAsync_SetsDefaultDraftStatus() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = "New GameSession",
            EncounterId = Guid.CreateVersion7(),
        };

        GameSession? capturedSession = null;
        await _sessionStorage.AddAsync(Arg.Do<GameSession>(s => capturedSession = s), Arg.Any<CancellationToken>());

        // Act
        await _service.CreateGameSessionAsync(_userId, data, _ct);

        // Assert
        capturedSession.Should().NotBeNull();
        capturedSession!.Status.Should().Be(GameSessionStatus.Draft);
    }

    [Fact]
    public async Task UpdateGameSessionAsync_WithBothTitleAndEncounterId_UpdatesBothFields() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var oldEncounterId = Guid.CreateVersion7();
        var newEncounterId = Guid.CreateVersion7();
        var session = new GameSession {
            Id = sessionId,
            Title = "Old Title",
            OwnerId = _userId,
            EncounterId = oldEncounterId,
        };

        var data = new UpdateGameSessionData {
            Title = "New Title",
            EncounterId = newEncounterId,
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.UpdateGameSessionAsync(_userId, sessionId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Title.Should().Be("New Title");
        result.Value.EncounterId.Should().Be(newEncounterId);
    }

    #endregion Edge Cases and State Transitions
}