using VttTools.Common.Model;

namespace VttTools.Game.Services;

public class GameSessionServiceTests {
    private readonly IGameSessionStorage _sessionStorage;
    private readonly GameSessionService _service;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly CancellationToken _ct;

    public GameSessionServiceTests() {
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _service = new(_sessionStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    #region GetGameSessionsAsync

    [Fact]
    public async Task GetGameSessionsAsync_ReturnsGameSessionArray() {
        // Arrange
        var sessions = new GameSession[] {
            new() { Id = Guid.NewGuid(), Title = "Test GameSession 1", OwnerId = _userId },
            new() { Id = Guid.NewGuid(), Title = "Test GameSession 2", OwnerId = _userId },
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
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
        var sceneId = Guid.NewGuid();
        var data = new CreateGameSessionData {
            Title = "New GameSession",
            SceneId = sceneId,
        };
        var createdGameSession = new GameSession {
            Title = "New GameSession",
            SceneId = sceneId,
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
        result.Value.SceneId.Should().Be(sceneId);
        result.Value.Players.Should().ContainSingle(p => p.UserId == _userId && p.Type == PlayerType.Master);

        await _sessionStorage.Received(1).AddAsync(
            Arg.Is<GameSession>(m => m.Title == data.Title && m.OwnerId == _userId && m.SceneId == sceneId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateGameSessionAsync_WithInvalidData_ReturnsFailure() {
        // Arrange
        var data = new CreateGameSessionData {
            Title = "", // Invalid empty title
            SceneId = Guid.NewGuid(),
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
        var sessionId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "Old Title",
            OwnerId = _userId,
            SceneId = Guid.NewGuid(),
        };

        var newSceneId = Guid.NewGuid();
        var data = new UpdateGameSessionData {
            Title = "Updated Title",
            SceneId = newSceneId,
        };
        var expectedGameSession = new GameSession {
            Id = sessionId,
            Title = data.Title.Value,
            OwnerId = _userId,
            SceneId = data.SceneId.Value,
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
        var sessionId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        const string originalTitle = "Original Title";
        var session = new GameSession {
            Id = sessionId,
            Title = originalTitle,
            OwnerId = _userId,
            SceneId = sceneId,
        };
        var data = new UpdateGameSessionData {
            Title = "Updated Title",
            // TemplateId not set
        };
        var expectedGameSession = new GameSession {
            Id = sessionId,
            Title = data.Title.Value,
            OwnerId = _userId,
            SceneId = sceneId,
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
        var sessionId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        const string originalTitle = "Original Title";
        var session = new GameSession {
            Id = sessionId,
            Title = originalTitle,
            OwnerId = _userId,
            SceneId = sceneId,
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "Session Title",
            OwnerId = _userId,
            SceneId = Guid.NewGuid(),
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var playerIdToRemove = Guid.NewGuid();
        var anotherPlayerId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var otherPlayerId = Guid.NewGuid();
        var nonMemberPlayerId = Guid.NewGuid(); // This user is not in the game session
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
        var sessionId = Guid.NewGuid();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.LeaveGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion LeaveGameSessionAsync

    #region SetActiveSceneAsync

    [Fact]
    public async Task SetActiveSceneAsync_AsGameMaster_UpdatesSceneAndReturnsNoContent() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var newSceneId = Guid.NewGuid();
        var oldSceneId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = Guid.NewGuid(), // Different owner for testing GM role
            SceneId = oldSceneId,
            Players = [new Participant { UserId = _userId, Type = PlayerType.Master }],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveSceneAsync(_userId, sessionId, newSceneId, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _sessionStorage.Received(1).UpdateAsync(
            Arg.Is<GameSession>(s => s.Id == sessionId && s.SceneId == newSceneId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveSceneAsync_AsNonGameMaster_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var playerId = Guid.NewGuid(); // User making the call is just a player
        var newSceneId = Guid.NewGuid();
        var oldSceneId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            SceneId = oldSceneId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = playerId, Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveSceneAsync(playerId, sessionId, newSceneId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        session.SceneId.Should().Be(oldSceneId); // Verify scene not changed
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveSceneAsync_AsPlayerNotInGameSession_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var newSceneId = Guid.NewGuid();
        var playerNotInGameSessionId = Guid.NewGuid(); // This user is not in the players list
        var oldSceneId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            OwnerId = _userId,
            SceneId = oldSceneId,
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = Guid.NewGuid(), Type = PlayerType.Player },
            ],
        };

        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

        // Act
        var result = await _service.SetActiveSceneAsync(playerNotInGameSessionId, sessionId, newSceneId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue(); // Service checks IsGameSessionGameMaster, which includes IsInGameSession
        session.SceneId.Should().Be(oldSceneId);
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveSceneAsync_WithNonExistentGameSession_ReturnsNotFound() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.SetActiveSceneAsync(_userId, sessionId, sceneId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
        await _sessionStorage.DidNotReceive().UpdateAsync(Arg.Any<GameSession>(), Arg.Any<CancellationToken>());
    }

    #endregion SetActiveSceneAsync

    #region StartGameSessionAsync

    [Fact]
    public async Task StartGameSessionAsync_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.Scheduled,
            OwnerId = Guid.NewGuid(), // Different owner
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master }, // Caller is GM
                new Participant { UserId = Guid.NewGuid(), Type = PlayerType.Player }
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
        var sessionId = Guid.NewGuid();
        var nonGmId = Guid.NewGuid(); // Caller is not GM
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
        var sessionId = Guid.NewGuid();
        var gmId = Guid.NewGuid();
        var playerNotInGameSessionId = Guid.NewGuid(); // Caller is not in players list
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
        var sessionId = Guid.NewGuid();
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
        var sessionId = Guid.NewGuid();
        var session = new GameSession {
            Id = sessionId,
            Title = "GameSession",
            Status = GameSessionStatus.InProgress,
            OwnerId = Guid.NewGuid(), // Different owner
            Players = [
                new Participant { UserId = _userId, Type = PlayerType.Master },
                new Participant { UserId = Guid.NewGuid(), Type = PlayerType.Player },
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
        var sessionId = Guid.NewGuid();
        var nonGmId = Guid.NewGuid(); // Caller is not GM
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
        var sessionId = Guid.NewGuid();
        var gmId = Guid.NewGuid();
        var playerNotInGameSessionId = Guid.NewGuid(); // Caller is not in players list
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
        var sessionId = Guid.NewGuid();
        _sessionStorage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((GameSession?)null);

        // Act
        var result = await _service.StopGameSessionAsync(_userId, sessionId, _ct);

        // Assert
        result.HasErrors.Should().BeTrue();
    }

    #endregion StopGameSessionAsync
}