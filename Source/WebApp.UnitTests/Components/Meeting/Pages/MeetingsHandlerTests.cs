using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public class MeetingsHandlerTests {
    private readonly GameServiceClient _gameServiceClient = Substitute.For<GameServiceClient>();
    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
    private readonly Meetings.Handler _handler;

    public MeetingsHandlerTests() {
        _gameServiceClient.Api.Returns(_httpClient);
        _handler = new();
    }

    [Fact]
    public async Task InitializeAsync_LoadsMeetings_And_ReturnsPageState() {
        // Arrange
        var meetings = new[] {
            new MeetingModel { Id = Guid.NewGuid(), Subject = "Meeting 1" },
            new MeetingModel { Id = Guid.NewGuid(), Subject = "Meeting 2" },
                             };

        _httpClient.GetFromJsonAsync<MeetingModel[]>("/api/meetings", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(meetings);

        // Act
        var state = await _handler.InitializeAsync(_gameServiceClient);

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

        _httpClient.GetFromJsonAsync<Adventure[]>("/api/adventures", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(adventures);

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
        var meeting = new MeetingModel { Id = Guid.NewGuid(), Subject = "New Meeting" };
        var successResponse = new HttpResponseMessage(HttpStatusCode.Created) {
            Content = JsonContent.Create(meeting),
                                                                              };

        _httpClient.PostAsJsonAsync("/api/meetings", Arg.Any<CreateMeetingRequest>(), cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(successResponse);

        // Act
        await _handler.CreateMeeting(state);

        // Assert
        await _httpClient.Received(1).PostAsJsonAsync("/api/meetings", Arg.Is<CreateMeetingRequest>(req =>
                req.Subject == "New Meeting" &&
                req.EpisodeId == episodeId), cancellationToken: Xunit.TestContext.Current.CancellationToken);

        state.ShowCreateDialog.Should().BeFalse();
        state.Meetings.Should().Contain(meeting);
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

        // Act
        await _handler.CreateMeeting(state);

        // Assert
        await _httpClient.DidNotReceive().PostAsJsonAsync(Arg.Any<string>(), Arg.Any<object>(), cancellationToken: Xunit.TestContext.Current.CancellationToken);
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
        await _httpClient.DidNotReceive().PostAsJsonAsync(Arg.Any<string>(), Arg.Any<object>(), cancellationToken: Xunit.TestContext.Current.CancellationToken);
        state.ShowEpisodeError.Should().BeTrue();
        state.ShowCreateDialog.Should().BeTrue();
    }

    [Fact]
    public async Task TryJoinMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var meetingId = Guid.NewGuid();
        var successResponse = new HttpResponseMessage(HttpStatusCode.OK);

        _httpClient.PostAsync($"/api/meetings/{meetingId}/join", null, Xunit.TestContext.Current.CancellationToken).Returns(successResponse);

        // Act
        var result = await _handler.TryJoinMeeting(meetingId);

        // Assert
        result.Should().BeTrue();
        await _httpClient.Received(1).PostAsync($"/api/meetings/{meetingId}/join", null, Xunit.TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task TryJoinMeeting_ReturnsFalse_OnApiError() {
        // Arrange
        var meetingId = Guid.NewGuid();

        _httpClient.PostAsync($"/api/meetings/{meetingId}/join", null, Xunit.TestContext.Current.CancellationToken).Returns<HttpResponseMessage>(x => throw new HttpRequestException("Test error"));

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

        var state = new Meetings.PageState {
            Meetings = [meeting],
                                           };

        var successResponse = new HttpResponseMessage(HttpStatusCode.OK);
        _httpClient.DeleteAsync($"/api/meetings/{meetingId}", Xunit.TestContext.Current.CancellationToken).Returns(successResponse);

        // Set up mock for DisplayConfirmation
        typeof(Meetings).GetMethod("DisplayConfirmation", BindingFlags.NonPublic | BindingFlags.Static)!
            .Invoke(null, [ "Are you sure you want to delete this meeting?" ]);

        // Act
        await _handler.DeleteMeeting(state, meetingId);

        // Assert
        await _httpClient.Received(1).DeleteAsync($"/api/meetings/{meetingId}", Xunit.TestContext.Current.CancellationToken);
        state.Meetings.Should().NotContain(meeting);
    }

    [Fact]
    public async Task ReloadAdventureEpisodes_WithValidAdventureId_LoadsEpisodes() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodes = new[] {
            new Episode { Id = Guid.NewGuid(), Name = "Episode 1" },
            new Episode { Id = Guid.NewGuid(), Name = "Episode 2" },
                             };

        var state = new Meetings.PageState();

        _httpClient.GetFromJsonAsync<Episode[]>($"/api/adventures/{adventureId}/episodes", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(episodes);

        // Act
        await _handler.ReloadAdventureEpisodes(state, adventureId.ToString());

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
        await _handler.ReloadAdventureEpisodes(state, "invalid-guid");

        // Assert
        state.SelectedAdventureId.Should().BeNull();
    }
}