namespace VttTools.WebApp.Pages.Meeting;

public class MeetingsPageHandlerTests
    : WebAppTestContext {
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task InitializeAsync_LoadsMeetings() {
        // Arrange & Act
        var handler = await CreateInitializedHandler();

        // Assert
        handler.Should().NotBeNull();
        handler.State.Meetings.Should().NotBeEmpty();
    }

    [Fact]
    public async Task OpenCreateMeetingDialog_LoadsAdventuresAndResetState() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventures = new[] {
            new Adventure { Name = "Adventure 1" },
        };
        _service.GetAdventuresAsync().Returns(adventures);

        // Act
        await handler.StartMeetingCreating();

        // Assert
        handler.State.IsCreating.Should().BeTrue();
        handler.State.Input.Subject.Should().BeEmpty();
        handler.State.Input.AdventureId.Should().Be(adventures[0].Id);
        handler.State.Input.Episodes.Should().BeEmpty();
        handler.State.Input.EpisodeId.Should().BeEmpty();
        handler.State.Input.Adventures.Should().BeEquivalentTo(adventures);
        handler.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task CloseCreateMeetingDialog_SetShowCreateDialogToFalse() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.IsCreating = true;

        // Act
        handler.EndMeetingCreating();

        // Assert
        handler.State.IsCreating.Should().BeFalse();
    }

    [Fact]
    public async Task CreateMeeting_WithValidData_CreatesMeetingAndClosesDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var episodeId = Guid.NewGuid();
        handler.State.IsCreating = true;
        handler.State.Input.Subject = "New Meeting";
        handler.State.Input.EpisodeId = episodeId;

        // Setup response
        var expectedMeeting = new MeetingModel { Id = Guid.NewGuid(), Subject = "New Meeting" };
        _service.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(expectedMeeting);

        // Act
        await handler.SaveCreatedMeeting();

        // Assert
        handler.State.IsCreating.Should().BeFalse();
        handler.State.Meetings.Should().Contain(expectedMeeting);
    }

    [Fact]
    public async Task CreateMeeting_WithValidationError_SetsErrorAndDoesNotCreate() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var episodeId = Guid.NewGuid();
        handler.State.IsCreating = true;
        handler.State.Input.Subject = string.Empty;
        handler.State.Input.EpisodeId = episodeId;
        _service.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.SaveCreatedMeeting();

        // Assert
        handler.State.IsCreating.Should().BeTrue();
        handler.State.Input.Errors.Should().NotBeEmpty();
        handler.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryJoinMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var meetingId = Guid.NewGuid();
        _service.JoinMeetingAsync(meetingId).Returns(true);

        // Act
        var result = await handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinMeeting_ReturnsFalse_OnApiError() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var meetingId = Guid.NewGuid();
        _service.JoinMeetingAsync(meetingId).Returns(false);

        // Act
        var result = await handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteMeeting_RemovesMeetingAndReloadsState() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var meetingId = Guid.NewGuid();
        var meeting = new MeetingModel { Id = meetingId, Subject = "Meeting to Delete" };

        handler.State.Meetings = [meeting];

        // Act
        await handler.DeleteMeeting(meetingId);

        // Assert
        handler.State.Meetings.Should().NotContain(meeting);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithValidAdventureId_LoadsEpisodes() {
        // Arrange
        var handler = await CreateInitializedHandler();
        var adventureId = Guid.NewGuid();
        var episodes = new[] {
            new Episode { Name = "Episode 1" },
            new Episode { Name = "Episode 2" },
        };
        _service.GetEpisodesAsync(adventureId).Returns(episodes);

        // Act
        await handler.LoadEpisodes(adventureId);

        // Assert
        handler.State.Input.Episodes.Should().BeEquivalentTo(episodes);
        handler.State.Input.EpisodeId.Should().Be(episodes[0].Id);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithInvalidAdventureId_ClearSelectedId() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.Input.AdventureId = Guid.NewGuid();

        // Act
        await handler.LoadEpisodes(Guid.Empty);

        // Assert
        handler.State.Input.Episodes.Should().BeEmpty();
        handler.State.Input.EpisodeId.Should().BeEmpty();
    }

    private async Task<MeetingsPageHandler> CreateInitializedHandler(bool isAuthorized = true, bool isConfigured = true) {
        var meetings = new[] {
            new MeetingModel { Subject = "Meeting 1" },
            new MeetingModel { Subject = "Meeting 2" },
        };
        if (isAuthorized) EnsureAuthenticated();
        var handler = new MeetingsPageHandler(HttpContext, NavigationManager, CurrentUser!, NullLoggerFactory.Instance);
        _service.GetMeetingsAsync().Returns(meetings);
        if (isConfigured) await handler.ConfigureAsync(_service);
        return handler;
    }
}