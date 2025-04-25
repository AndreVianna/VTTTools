namespace VttTools.WebApp.Components.Meeting.Pages;

public class MeetingsHandlerTests {
    private readonly IGameService _client = Substitute.For<IGameService>();
    private readonly Meetings.Handler _handler = new();

    [Fact]
    public async Task InitializeAsync_LoadsMeetings_And_ReturnsPageState() {
        // Arrange
        var meetings = new[] {
            new Model.Game.Meeting { Id = Guid.NewGuid(), Subject = "Meeting 1" },
            new Model.Game.Meeting { Id = Guid.NewGuid(), Subject = "Meeting 2" },
        };
        _client.GetMeetingsAsync().Returns(meetings);

        // Act
        var state = await _handler.InitializeAsync(_client);

        // Assert
        state.Should().NotBeNull();
        state.Meetings.Should().BeEquivalentTo(meetings);
    }

    [Fact]
    public async Task OpenCreateMeetingDialog_LoadsAdventuresAndResetState() {
        // Arrange
        var state = new Meetings.PageState();

        var adventures = new[] {
            new Adventure { Id = Guid.NewGuid(), Name = "Adventure 1" },
        };
        _client.GetAdventuresAsync().Returns(adventures);

        // Act
        await _handler.OpenCreateMeetingDialog(state);

        // Assert
        state.ShowCreateDialog.Should().BeTrue();
        state.NewMeetingSubject.Should().BeEmpty();
        state.MeetingSubjectError.Should().BeEmpty();
        state.SelectedAdventureId.Should().BeNull();
        state.Episodes.Should().BeEmpty();
        state.SelectedEpisodeId.Should().BeNull();
        state.ShowEpisodeError.Should().BeFalse();
        state.Adventures.Should().BeEquivalentTo(adventures);
    }

    [Fact]
    public void CloseCreateMeetingDialog_SetShowCreateDialogToFalse() {
        // Arrange
        var state = new Meetings.PageState {
            ShowCreateDialog = true,
        };

        // Act
        Meetings.Handler.CloseCreateMeetingDialog(state);

        // Assert
        state.ShowCreateDialog.Should().BeFalse();
    }

    [Fact]
    public async Task CreateMeeting_WithValidData_CreatesMeetingAndClosesDialog() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var state = new Meetings.PageState {
            ShowCreateDialog = true,
            NewMeetingSubject = "New Meeting",
            SelectedEpisodeId = episodeId,
        };

        // Setup response
        var expectedMeeting = new Model.Game.Meeting { Id = Guid.NewGuid(), Subject = "New Meeting" };
        _client.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(expectedMeeting);

        // Act
        await _handler.CreateMeeting(state);

        // Assert
        state.ShowCreateDialog.Should().BeFalse();
        state.Meetings.Should().Contain(expectedMeeting);
        state.NewMeetingSubject.Should().BeEmpty();
        state.SelectedEpisodeId.Should().BeNull();
    }

    [Fact]
    public async Task CreateMeeting_WithMissingSubject_SetsErrorAndDoesNotCreate() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var state = new Meetings.PageState {
            ShowCreateDialog = true,
            NewMeetingSubject = "",  // Empty subject
            SelectedEpisodeId = episodeId,
        };
        _client.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await _handler.CreateMeeting(state);

        // Assert
        state.MeetingSubjectError.Should().NotBeEmpty();
        state.ShowCreateDialog.Should().BeTrue();
    }

    [Fact]
    public async Task CreateMeeting_WithMissingEpisode_SetsErrorAndDoesNotCreate() {
        // Arrange
        var state = new Meetings.PageState {
            ShowCreateDialog = true,
            NewMeetingSubject = "Valid Subject",
            SelectedEpisodeId = null, // Missing episode
        };

        // Act
        await _handler.CreateMeeting(state);

        // Assert
        state.ShowEpisodeError.Should().BeTrue();
        state.ShowCreateDialog.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var meetingId = Guid.NewGuid();

        // Act
        var result = await _handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinMeeting_ReturnsFalse_OnApiError() {
        // Arrange
        var meetingId = Guid.NewGuid();

        // Act
        var result = await _handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteMeeting_RemovesMeetingAndReloadsState() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new Model.Game.Meeting { Id = meetingId, Subject = "Meeting to Delete" };

        var state = new Meetings.PageState {
            Meetings = [meeting],
        };

        // Set up mock for DisplayConfirmation
        typeof(Meetings).GetMethod("DisplayConfirmation", BindingFlags.NonPublic | BindingFlags.Static)!
            .Invoke(null, ["Are you sure you want to delete this meeting?"]);

        // Act
        await _handler.DeleteMeeting(state, meetingId);

        // Assert
        state.Meetings.Should().NotContain(meeting);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithValidAdventureId_LoadsEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodes = new[] {
            new Episode { Name = "Episode 1" },
            new Episode { Name = "Episode 2" },
        };
        _client.GetEpisodesAsync(adventureId).Returns(episodes);

        var state = new Meetings.PageState();

        // Act
        await _handler.ReloadAdventureEpisodes(state, adventureId);

        // Assert
        state.SelectedAdventureId.Should().Be(adventureId);
        state.Episodes.Should().BeEquivalentTo(episodes);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithInvalidAdventureId_ClearSelectedId() {
        // Arrange
        var state = new Meetings.PageState {
            SelectedAdventureId = Guid.NewGuid(),
        };

        // Act
        await _handler.ReloadAdventureEpisodes(state, null);

        // Assert
        state.SelectedAdventureId.Should().BeNull();
    }
}