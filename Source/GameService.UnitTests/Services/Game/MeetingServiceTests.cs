namespace VttTools.GameService.Services.Game;

public class MeetingServiceTests {
    private readonly IMeetingStorage _meetingStorage;
    private readonly MeetingService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public MeetingServiceTests() {
        _meetingStorage = Substitute.For<IMeetingStorage>();
        _service = new(_meetingStorage);
    }

    #region GetMeetingsAsync

    [Fact]
    public async Task GetMeetingsAsync_ReturnsMeetingArray() {
        // Arrange
        var meetings = new Meeting[] {
            new() { Id = Guid.NewGuid(), Subject = "Test Meeting 1", OwnerId = _userId },
            new() { Id = Guid.NewGuid(), Subject = "Test Meeting 2", OwnerId = _userId },
                                     };
        _meetingStorage.GetByUserIdAsync(_userId, Arg.Any<CancellationToken>()).Returns(meetings);

        // Act
        var result = await _service.GetMeetingsAsync(_userId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(meetings);
        await _meetingStorage.Received(1).GetByUserIdAsync(_userId, Arg.Any<CancellationToken>());
    }

    #endregion GetMeetingsAsync

    #region GetMeetingByIdAsync

    [Fact]
    public async Task GetMeetingByIdAsync_WithExistingId_ReturnsMeeting() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting { Id = meetingId, Subject = "Test Meeting", OwnerId = _userId };
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.GetMeetingByIdAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(meeting);
        await _meetingStorage.Received(1).GetByIdAsync(meetingId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetMeetingByIdAsync_WithNonExistingId_ReturnsNull() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.GetMeetingByIdAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
        await _meetingStorage.Received(1).GetByIdAsync(meetingId, Arg.Any<CancellationToken>());
    }

    #endregion GetMeetingByIdAsync

    #region CreateMeetingAsync

    [Fact]
    public async Task CreateMeetingAsync_WithValidData_ReturnsSuccess() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var data = new CreateMeetingData {
            Subject = "New Meeting",
            EpisodeId = episodeId,
        };

        _meetingStorage.AddAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.CreateMeetingAsync(_userId, data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Subject.Should().Be(data.Subject);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.EpisodeId.Should().Be(episodeId);
        result.Value.Players.Should().ContainSingle(p => p.UserId == _userId && p.Type == PlayerType.Master);

        await _meetingStorage.Received(1).AddAsync(
            Arg.Is<Meeting>(m => m.Subject == data.Subject && m.OwnerId == _userId && m.EpisodeId == episodeId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateMeetingAsync_WithInvalidData_ReturnsFailure() {
        // Arrange
        var data = new CreateMeetingData {
            Subject = "", // Invalid empty subject
            EpisodeId = Guid.NewGuid(),
        };

        // Act
        var result = await _service.CreateMeetingAsync(_userId, data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _meetingStorage.DidNotReceive().AddAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    #endregion CreateMeetingAsync

    #region UpdateMeetingAsync

    [Fact]
    public async Task UpdateMeetingAsync_AsNonOwner_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
        };

        var data = new UpdateMeetingData {
            Subject = "Updated Subject",
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.UpdateMeetingAsync(nonOwnerId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_AsOwnerWithValidData_ReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Old Subject",
            OwnerId = _userId,
            EpisodeId = Guid.NewGuid(),
        };

        var newEpisodeId = Guid.NewGuid();
        var data = new UpdateMeetingData {
            Subject = "Updated Subject",
            EpisodeId = newEpisodeId,
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.UpdateMeetingAsync(_userId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);

        meeting.Subject.Should().Be(data.Subject.Value);
        meeting.EpisodeId.Should().Be(newEpisodeId);

        await _meetingStorage.Received(1).UpdateAsync(
            Arg.Is<Meeting>(m => m.Id == meetingId && m.Subject == data.Subject.Value && m.EpisodeId == newEpisodeId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_AsOwnerWithPartialData_ReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        const string originalSubject = "Original Subject";
        var meeting = new Meeting {
            Id = meetingId,
            Subject = originalSubject,
            OwnerId = _userId,
            EpisodeId = episodeId,
        };

        var data = new UpdateMeetingData {
            Subject = "Updated Subject",
            // EpisodeId not set
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.UpdateMeetingAsync(_userId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);

        meeting.Subject.Should().Be(data.Subject.Value);
        meeting.EpisodeId.Should().Be(episodeId); // Unchanged

        await _meetingStorage.Received(1).UpdateAsync(
            Arg.Is<Meeting>(m => m.Id == meetingId && m.Subject == data.Subject.Value && m.EpisodeId == episodeId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_AsOwnerWithEmptyData_ReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        const string originalSubject = "Original Subject";
        var meeting = new Meeting {
            Id = meetingId,
            Subject = originalSubject,
            OwnerId = _userId,
            EpisodeId = episodeId,
        };

        // Empty update data with nothing set
        var data = new UpdateMeetingData();

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.UpdateMeetingAsync(_userId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);

        // Verify no properties were changed
        meeting.Subject.Should().Be(originalSubject);
        meeting.EpisodeId.Should().Be(episodeId);

        await _meetingStorage.Received(1).UpdateAsync(
            Arg.Is<Meeting>(m => m.Id == meetingId && m.Subject == originalSubject && m.EpisodeId == episodeId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var data = new UpdateMeetingData {
            Subject = "Updated Subject",
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.UpdateMeetingAsync(_userId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateMeetingAsync_WithInvalidData_ReturnsBadRequest(string? subject) {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting Subject",
            OwnerId = _userId,
            EpisodeId = Guid.NewGuid(),
        };
        var data = new UpdateMeetingData {
            Subject = subject!,
        };
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.UpdateMeetingAsync(_userId, meetingId, data, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.BadRequest);
        await _meetingStorage.Received().GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    #endregion UpdateMeetingAsync

    #region DeleteMeetingAsync

    [Fact]
    public async Task DeleteMeetingAsync_AsOwner_DeletesMeetingAndReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.DeleteMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        await _meetingStorage.Received(1).DeleteAsync(meetingId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteMeetingAsync_AsNonOwner_ReturnsForbiddenAndDoesNotDelete() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var nonOwnerId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.DeleteMeetingAsync(nonOwnerId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        await _meetingStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteMeetingAsync_WithNonExistentMeeting_ReturnsNotFoundAndDoesNotDelete() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.DeleteMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
        await _meetingStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    #endregion DeleteMeetingAsync

    #region JoinMeetingAsync

    [Fact]
    public async Task JoinMeetingAsync_WithNewPlayer_AddsPlayerAndReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.JoinMeetingAsync(playerId, meetingId, PlayerType.Player, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Players.Should().Contain(p => p.UserId == playerId && p.Type == PlayerType.Player);
        await _meetingStorage.Received(1).UpdateAsync(
            Arg.Is<Meeting>(m => m.Players.Any(p => p.UserId == playerId && p.Type == PlayerType.Player)),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task JoinMeetingAsync_WithExistingPlayer_ReturnsNoContentAndDoesNotAddDuplicate() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                      ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.JoinMeetingAsync(_userId, meetingId, PlayerType.Player, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Players.Should().ContainSingle(p => p.UserId == _userId); // Still only one entry for this user
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task JoinMeetingAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.JoinMeetingAsync(_userId, meetingId, PlayerType.Player, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    #endregion JoinMeetingAsync

    #region LeaveMeetingAsync

    [Fact]
    public async Task LeaveMeetingAsync_WithPlayerInMeeting_RemovesPlayerAndReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var playerIdToRemove = Guid.NewGuid();
        var anotherPlayerId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = playerIdToRemove, Type = PlayerType.Player },
                new MeetingPlayer { UserId = anotherPlayerId, Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.LeaveMeetingAsync(playerIdToRemove, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Players.Should().HaveCount(2);
        meeting.Players.Should().NotContain(p => p.UserId == playerIdToRemove);
        meeting.Players.Should().Contain(p => p.UserId == _userId);
        meeting.Players.Should().Contain(p => p.UserId == anotherPlayerId);
        await _meetingStorage.Received(1).UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LeaveMeetingAsync_WithPlayerNotInMeeting_ReturnsNoContentAndDoesNotChangePlayers() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var otherPlayerId = Guid.NewGuid();
        var nonMemberPlayerId = Guid.NewGuid(); // This user is not in the meeting
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = otherPlayerId, Type = PlayerType.Player },
            ],
        };
        var initialPlayerCount = meeting.Players.Count;

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.LeaveMeetingAsync(nonMemberPlayerId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Players.Should().HaveCount(initialPlayerCount);
        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LeaveMeetingAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.LeaveMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    #endregion LeaveMeetingAsync

    #region SetActiveEpisodeAsync

    [Fact]
    public async Task SetActiveEpisodeAsync_AsGameMaster_UpdatesEpisodeAndReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var newEpisodeId = Guid.NewGuid();
        var oldEpisodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = Guid.NewGuid(), // Different owner for testing GM role
            EpisodeId = oldEpisodeId,
            Players = [new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.SetActiveEpisodeAsync(_userId, meetingId, newEpisodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.EpisodeId.Should().Be(newEpisodeId);
        await _meetingStorage.Received(1).UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEpisodeAsync_AsNonGameMaster_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var playerId = Guid.NewGuid(); // User making the call is just a player
        var newEpisodeId = Guid.NewGuid();
        var oldEpisodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            EpisodeId = oldEpisodeId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = playerId, Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.SetActiveEpisodeAsync(playerId, meetingId, newEpisodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        meeting.EpisodeId.Should().Be(oldEpisodeId); // Verify episode not changed
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEpisodeAsync_AsPlayerNotInMeeting_ReturnsForbiddenAndDoesNotUpdate() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var newEpisodeId = Guid.NewGuid();
        var playerNotInMeetingId = Guid.NewGuid(); // This user is not in the players list
        var oldEpisodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            EpisodeId = oldEpisodeId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = Guid.NewGuid(), Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.SetActiveEpisodeAsync(playerNotInMeetingId, meetingId, newEpisodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden); // Service checks IsMeetingGameMaster, which includes IsInMeeting
        meeting.EpisodeId.Should().Be(oldEpisodeId);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEpisodeAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.SetActiveEpisodeAsync(_userId, meetingId, episodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    #endregion SetActiveEpisodeAsync

    #region StartMeetingAsync

    [Fact]
    public async Task StartMeetingAsync_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            Status = MeetingStatus.Scheduled,
            OwnerId = Guid.NewGuid(), // Different owner
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }, // Caller is GM
                new MeetingPlayer { UserId = Guid.NewGuid(), Type = PlayerType.Player }
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StartMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Status.Should().Be(MeetingStatus.InProgress);
    }

    [Fact]
    public async Task StartMeetingAsync_AsNonGameMaster_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var nonGmId = Guid.NewGuid(); // Caller is not GM
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId, // Different owner
            Status = MeetingStatus.Scheduled,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = nonGmId, Type = PlayerType.Player }, // Caller is player
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StartMeetingAsync(nonGmId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        meeting.Status.Should().Be(MeetingStatus.Scheduled);
    }

    [Fact]
    public async Task StartMeetingAsync_AsPlayerNotInMeeting_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var gmId = Guid.NewGuid();
        var playerNotInMeetingId = Guid.NewGuid(); // Caller is not in players list
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId, // Different owner
            Status = MeetingStatus.Scheduled,
            Players = [
                new MeetingPlayer { UserId = gmId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StartMeetingAsync(playerNotInMeetingId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        meeting.Status.Should().Be(MeetingStatus.Scheduled);
    }

    [Fact]
    public async Task StartMeetingAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.StartMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion StartMeetingAsync

    #region StopMeetingAsync

    [Fact]
    public async Task StopMeetingAsync_AsGameMaster_ReturnsNoContent() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            Status = MeetingStatus.InProgress,
            OwnerId = Guid.NewGuid(), // Different owner
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = Guid.NewGuid(), Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StopMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Status.Should().Be(MeetingStatus.Finished);
    }

    [Fact]
    public async Task StopMeetingAsync_AsNonGameMaster_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var nonGmId = Guid.NewGuid(); // Caller is not GM
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            Status = MeetingStatus.InProgress,
            OwnerId = _userId, // Different owner
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = nonGmId, Type = PlayerType.Player }, // Caller is player
                      ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StopMeetingAsync(nonGmId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        meeting.Status.Should().Be(MeetingStatus.InProgress);
    }

    [Fact]
    public async Task StopMeetingAsync_AsPlayerNotInMeeting_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var gmId = Guid.NewGuid();
        var playerNotInMeetingId = Guid.NewGuid(); // Caller is not in players list
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            Status = MeetingStatus.InProgress,
            OwnerId = _userId, // Different owner
            Players = [
                new MeetingPlayer { UserId = gmId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Player },
            ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StopMeetingAsync(playerNotInMeetingId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.Forbidden);
        meeting.Status.Should().Be(MeetingStatus.InProgress);
    }

    [Fact]
    public async Task StopMeetingAsync_WithNonExistentMeeting_ReturnsNotFound() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns((Meeting?)null);

        // Act
        var result = await _service.StopMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion StopMeetingAsync
}