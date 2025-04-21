namespace VttTools.GameService.Services.Game;

public class MeetingServiceTests {
    private readonly IMeetingStorage _meetingStorage;
    private readonly MeetingService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public MeetingServiceTests() {
        _meetingStorage = Substitute.For<IMeetingStorage>();
        _service = new(_meetingStorage);
    }

    [Fact]
    public async Task GetMeetingsAsync_CallsStorage() {
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

    [Fact]
    public async Task GetMeetingAsync_CallsStorage() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting { Id = meetingId, Subject = "Test Meeting", OwnerId = _userId };
        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.GetMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(meeting);
        await _meetingStorage.Received(1).GetByIdAsync(meetingId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateMeetingAsync_WithValidData_CreatesMeeting() {
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

        await _meetingStorage.Received(1).AddAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
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

    [Fact]
    public async Task UpdateMeetingAsync_WithOwnerAndValidData_UpdatesMeeting() {
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

        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_WithPartialData_OnlyUpdatesProvidedFields() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Original Subject",
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

        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateMeetingAsync_WithNonOwner_ReturnsForbidden() {
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

    [Fact]
    public async Task DeleteMeetingAsync_WithOwner_DeletesMeeting() {
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
    public async Task DeleteMeetingAsync_WithNonOwner_ReturnsForbidden() {
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
    public async Task JoinMeetingAsync_AddsPlayerToMeeting() {
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
        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task JoinMeetingAsync_WithExistingPlayer_DoesNotAddDuplicate() {
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
        meeting.Players.Should().ContainSingle(p => p.UserId == _userId);
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LeaveMeetingAsync_RemovesPlayerFromMeeting() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [
                new MeetingPlayer { UserId = _userId, Type = PlayerType.Master },
                new MeetingPlayer { UserId = playerId, Type = PlayerType.Player },
                      ],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.LeaveMeetingAsync(playerId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.Players.Should().NotContain(p => p.UserId == playerId);
        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEpisodeAsync_AsGameMaster_UpdatesEpisode() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var newEpisodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            EpisodeId = Guid.NewGuid(),
            Players = [new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.SetActiveEpisodeAsync(_userId, meetingId, newEpisodeId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
        meeting.EpisodeId.Should().Be(newEpisodeId);
        await _meetingStorage.Received(1).UpdateAsync(meeting, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetActiveEpisodeAsync_AsNonGameMaster_ReturnsForbidden() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var newEpisodeId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            EpisodeId = Guid.NewGuid(),
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
        await _meetingStorage.DidNotReceive().UpdateAsync(Arg.Any<Meeting>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task StartMeetingAsync_AsGameMaster_Succeeds() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StartMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task StopMeetingAsync_AsGameMaster_Succeeds() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Meeting {
            Id = meetingId,
            Subject = "Meeting",
            OwnerId = _userId,
            Players = [new MeetingPlayer { UserId = _userId, Type = PlayerType.Master }],
        };

        _meetingStorage.GetByIdAsync(meetingId, Arg.Any<CancellationToken>()).Returns(meeting);

        // Act
        var result = await _service.StopMeetingAsync(_userId, meetingId, TestContext.Current.CancellationToken);

        // Assert
        result.Status.Should().Be(HttpStatusCode.NoContent);
    }
}