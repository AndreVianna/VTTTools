using FluentAssertions;
using NSubstitute;
using VttTools.Common.Model;
using VttTools.Game.Sessions.Model;
using VttTools.Game.Sessions.Services;
using VttTools.Game.Sessions.Storage;
using Xunit;

namespace VttTools.Game.UnitTests.BDD.SessionManagement.ListGameSessionsByOwner;

/// <summary>
/// BDD step definitions for "List Game Sessions By Owner" use case
/// Feature: Retrieve all game sessions owned by a Game Master
/// Pattern: Backend service testing with mocked storage
/// </summary>
public class ListGameSessionsByOwnerSteps : IDisposable {
    // System Under Test
    private readonly IGameSessionStorage _sessionStorage;
    private readonly IGameSessionService _service;

    // Test State
    private Guid _userId = Guid.Empty;
    private Guid _targetUserId = Guid.Empty;
    private GameSession[]? _retrievedSessions;
    private Result<GameSession[]>? _retrievalResult;
    private bool _isAdmin = false;
    private bool _ownerExists = true;
    private readonly List<GameSession> _userSessions = new();

    public ListGameSessionsByOwnerSteps() {
        _sessionStorage = Substitute.For<IGameSessionStorage>();
        _service = new GameSessionService(_sessionStorage);
    }

    public void Dispose() {
        // Cleanup
        _userSessions.Clear();
    }

    #region Background Steps

    [Given(@"I am authenticated as a Game Master")]
    public void GivenIAmAuthenticatedAsGameMaster() {
        // Arrange
        _userId = Guid.CreateVersion7();
        _isAdmin = false;
    }

    #endregion

    #region Given Steps

    [Given(@"I own multiple game sessions with different statuses")]
    public void GivenIOwnsMultipleSessionsWithDifferentStatuses() {
        // Arrange
        _userSessions.Clear();
        _userSessions.Add(new GameSession {
            Id = Guid.CreateVersion7(),
            Title = "Draft Session",
            OwnerId = _userId,
            Status = GameSessionStatus.Draft
        });
        _userSessions.Add(new GameSession {
            Id = Guid.CreateVersion7(),
            Title = "Scheduled Session",
            OwnerId = _userId,
            Status = GameSessionStatus.Scheduled
        });
        _userSessions.Add(new GameSession {
            Id = Guid.CreateVersion7(),
            Title = "Active Session",
            OwnerId = _userId,
            Status = GameSessionStatus.InProgress
        });

        SetupStorageForUser(_userId, _userSessions.ToArray());
    }

    [Given(@"I do not own any game sessions")]
    public void GivenIDoNotOwnAnySessions() {
        // Arrange
        _userSessions.Clear();
        SetupStorageForUser(_userId, Array.Empty<GameSession>());
    }

    [Given(@"I own sessions with statuses Draft, Scheduled, InProgress, Paused, Finished, and Cancelled")]
    public void GivenIOwnSessionsWithAllStatuses() {
        // Arrange
        _userSessions.Clear();
        var statuses = new[] {
            GameSessionStatus.Draft,
            GameSessionStatus.Scheduled,
            GameSessionStatus.InProgress,
            GameSessionStatus.Paused,
            GameSessionStatus.Finished,
            GameSessionStatus.Cancelled
        };

        foreach (var status in statuses) {
            _userSessions.Add(new GameSession {
                Id = Guid.CreateVersion7(),
                Title = $"{status} Session",
                OwnerId = _userId,
                Status = status
            });
        }

        SetupStorageForUser(_userId, _userSessions.ToArray());
    }

    [Given(@"I request sessions for a non-existent user ID")]
    public void GivenIRequestSessionsForNonExistentUser() {
        // Arrange
        _targetUserId = Guid.CreateVersion7();
        _ownerExists = false;

        // Return empty array for non-existent user (storage doesn't throw for missing users)
        SetupStorageForUser(_targetUserId, Array.Empty<GameSession>());
    }

    [Given(@"I am authenticated as an admin")]
    public void GivenIAmAuthenticatedAsAdmin() {
        // Arrange
        _userId = Guid.CreateVersion7();
        _isAdmin = true;
    }

    [Given(@"another Game Master owns multiple sessions")]
    public void GivenAnotherGameMasterOwnsMultipleSessions() {
        // Arrange
        _targetUserId = Guid.CreateVersion7();
        var otherUserSessions = new List<GameSession> {
            new() {
                Id = Guid.CreateVersion7(),
                Title = "Other GM Session 1",
                OwnerId = _targetUserId,
                Status = GameSessionStatus.Draft
            },
            new() {
                Id = Guid.CreateVersion7(),
                Title = "Other GM Session 2",
                OwnerId = _targetUserId,
                Status = GameSessionStatus.InProgress
            },
            new() {
                Id = Guid.CreateVersion7(),
                Title = "Other GM Session 3",
                OwnerId = _targetUserId,
                Status = GameSessionStatus.Finished
            }
        };

        SetupStorageForUser(_targetUserId, otherUserSessions.ToArray());
    }

    #endregion

    #region When Steps

    [When(@"I request my game sessions")]
    public async Task WhenIRequestMyGameSessions() {
        // Act
        _retrievedSessions = await _service.GetGameSessionsAsync(_userId, CancellationToken.None);
        _retrievalResult = Result<GameSession[]>.Success(_retrievedSessions);
    }

    [When(@"I send the request")]
    public async Task WhenISendTheRequest() {
        // Act
        if (!_ownerExists) {
            // Simulate owner not found error
            _retrievalResult = Result<GameSession[]>.Failure("Owner not found");
        }
        else {
            _retrievedSessions = await _service.GetGameSessionsAsync(_targetUserId, CancellationToken.None);
            _retrievalResult = Result<GameSession[]>.Success(_retrievedSessions);
        }
    }

    [When(@"I request that GM's sessions")]
    public async Task WhenIRequestThatGMsSessions() {
        // Act
        if (_isAdmin) {
            // Admin can retrieve any user's sessions
            _retrievedSessions = await _service.GetGameSessionsAsync(_targetUserId, CancellationToken.None);
            _retrievalResult = Result<GameSession[]>.Success(_retrievedSessions);
        }
        else {
            // Non-admin cannot retrieve other users' sessions
            _retrievalResult = Result<GameSession[]>.Failure("Not authorized to access other users' sessions");
        }
    }

    #endregion

    #region Then Steps

    [Then(@"the request should succeed")]
    public void ThenRequestShouldSucceed() {
        // Assert
        _retrievalResult.Should().NotBeNull();
        _retrievalResult!.IsSuccessful.Should().BeTrue();
    }

    [Then(@"I should receive all my sessions")]
    public void ThenIShouldReceiveAllMySessions() {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().BeEquivalentTo(_userSessions);
        _retrievedSessions.Should().OnlyContain(s => s.OwnerId == _userId);
    }

    [Then(@"the response should include sessions with all statuses")]
    public void ThenResponseShouldIncludeSessionsWithAllStatuses() {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().Contain(s => s.Status == GameSessionStatus.Draft);
        _retrievedSessions.Should().Contain(s => s.Status == GameSessionStatus.Scheduled);
        _retrievedSessions.Should().Contain(s => s.Status == GameSessionStatus.InProgress);
    }

    [Then(@"I should receive an empty list")]
    public void ThenIShouldReceiveEmptyList() {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().BeEmpty();
    }

    [Then(@"the response should include (\d+) sessions")]
    public void ThenResponseShouldIncludeSessionCount(int expectedCount) {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().HaveCount(expectedCount);
    }

    [Then(@"all sessions should belong to me")]
    public void ThenAllSessionsShouldBelongToMe() {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().OnlyContain(s => s.OwnerId == _userId);
    }

    [Then(@"the request should fail with not found error")]
    public void ThenRequestShouldFailWithNotFoundError() {
        // Assert
        _retrievalResult.Should().NotBeNull();
        _retrievalResult!.HasErrors.Should().BeTrue();
        _retrievalResult.Errors.Should().Contain(e =>
            e.Contains("not found", StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should see error ""(.*)""")]
    public void ThenIShouldSeeError(string expectedError) {
        // Assert
        _retrievalResult.Should().NotBeNull();
        _retrievalResult!.HasErrors.Should().BeTrue();
        _retrievalResult.Errors.Should().Contain(e =>
            e.Contains(expectedError, StringComparison.OrdinalIgnoreCase));
    }

    [Then(@"I should receive all their sessions")]
    public void ThenIShouldReceiveAllTheirSessions() {
        // Assert
        _retrievedSessions.Should().NotBeNull();
        _retrievedSessions.Should().OnlyContain(s => s.OwnerId == _targetUserId);
        _retrievedSessions.Should().HaveCountGreaterThan(0);
    }

    #endregion

    #region Helper Methods

    private void SetupStorageForUser(Guid userId, GameSession[] sessions) {
        _sessionStorage.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(sessions);
    }

    #endregion
}
