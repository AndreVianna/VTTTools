using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public class MeetingsHandlerTests {
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly Meetings.Handler _handler;

    public MeetingsHandlerTests() {
        _handler = new(_service);
    }

    [Fact]
    public async Task InitializeAsync_LoadsMeetings_And_ReturnsPageState() {
        // Arrange
        var meetings = new[] {
            new MeetingModel { Subject = "Meeting 1" },
            new MeetingModel { Subject = "Meeting 2" },
        };
        _service.GetMeetingsAsync().Returns(meetings);

        // Act
        var handler = await Meetings.Handler.InitializeAsync(_service);

        // Assert
        handler.Should().NotBeNull();
        handler.State.Meetings.Should().BeEquivalentTo(meetings);
    }

    [Fact]
    public async Task OpenCreateMeetingDialog_LoadsAdventuresAndResetState() {
        // Arrange
        var adventures = new[] {
            new Adventure { Name = "Adventure 1" },
        };
        _service.GetAdventuresAsync().Returns(adventures);

        // Act
        await _handler.OpenCreateMeetingDialog();

        // Assert
        _handler.State.ShowCreateDialog.Should().BeTrue();
        _handler.State.Input.Subject.Should().BeEmpty();
        _handler.State.Input.AdventureId.Should().Be(adventures.First().Id);
        _handler.State.Input.Episodes.Should().BeEmpty();
        _handler.State.Input.EpisodeId.Should().BeEmpty();
        _handler.State.Input.Adventures.Should().BeEquivalentTo(adventures);
        _handler.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CloseCreateMeetingDialog_SetShowCreateDialogToFalse() {
        // Arrange
        _handler.State.ShowCreateDialog = true;

        // Act
        _handler.CloseCreateMeetingDialog();

        // Assert
        _handler.State.ShowCreateDialog.Should().BeFalse();
    }

    [Fact]
    public async Task CreateMeeting_WithValidData_CreatesMeetingAndClosesDialog() {
        // Arrange
        var episodeId = Guid.NewGuid();
        _handler.State.ShowCreateDialog = true;
        _handler.State.Input.Subject = "New Meeting";
        _handler.State.Input.EpisodeId = episodeId;

        // Setup response
        var expectedMeeting = new MeetingModel { Id = Guid.NewGuid(), Subject = "New Meeting" };
        _service.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(expectedMeeting);

        // Act
        await _handler.CreateMeeting();

        // Assert
        _handler.State.ShowCreateDialog.Should().BeFalse();
        _handler.State.Meetings.Should().Contain(expectedMeeting);
    }

    [Fact]
    public async Task CreateMeeting_WithValidationError_SetsErrorAndDoesNotCreate() {
        // Arrange
        var episodeId = Guid.NewGuid();
        _handler.State.ShowCreateDialog = true;
        _handler.State.Input.Subject = string.Empty;
        _handler.State.Input.EpisodeId = episodeId;
        _service.CreateMeetingAsync(Arg.Any<CreateMeetingRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await _handler.CreateMeeting();

        // Assert
        _handler.State.ShowCreateDialog.Should().BeTrue();
        _handler.State.Input.Errors.Should().NotBeEmpty();
        _handler.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryJoinMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _service.JoinMeetingAsync(meetingId).Returns(true);

        // Act
        var result = await _handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinMeeting_ReturnsFalse_OnApiError() {
        // Arrange
        var meetingId = Guid.NewGuid();
        _service.JoinMeetingAsync(meetingId).Returns(false);

        // Act
        var result = await _handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteMeeting_RemovesMeetingAndReloadsState() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var meeting = new MeetingModel { Id = meetingId, Subject = "Meeting to Delete" };

        _handler.State.Meetings = [meeting];

        // Set up mock for DisplayConfirmation
        typeof(Meetings).GetMethod("DisplayConfirmation", BindingFlags.NonPublic | BindingFlags.Static)!
            .Invoke(null, ["Are you sure you want to delete this meeting?"]);

        // Act
        await _handler.DeleteMeeting(meetingId);

        // Assert
        _handler.State.Meetings.Should().NotContain(meeting);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithValidAdventureId_LoadsEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodes = new[] {
            new Episode { Name = "Episode 1" },
            new Episode { Name = "Episode 2" },
        };
        _service.GetEpisodesAsync(adventureId).Returns(episodes);

        // Act
        await _handler.LoadEpisodes(adventureId);

        // Assert
        _handler.State.Input.Episodes.Should().BeEquivalentTo(episodes);
        _handler.State.Input.EpisodeId.Should().Be(episodes.First().Id);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithInvalidAdventureId_ClearSelectedId() {
        // Arrange
        _handler.State.Input.AdventureId = Guid.NewGuid();

        // Act
        await _handler.LoadEpisodes(Guid.Empty);

        // Assert
        _handler.State.Input.Episodes.Should().BeEmpty();
        _handler.State.Input.EpisodeId.Should().BeEmpty();
    }
}