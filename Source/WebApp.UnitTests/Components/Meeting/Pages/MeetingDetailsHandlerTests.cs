using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public class MeetingDetailsHandlerTests {
    private readonly GameServiceClient _gameServiceClient = Substitute.For<GameServiceClient>();
    private readonly HttpClient _httpClient = Substitute.For<HttpClient>();
    private readonly CurrentUser _currentUser = new() { Id = Guid.NewGuid() };
    private readonly MeetingDetails.Handler _handler;
    private readonly Guid _meetingId = Guid.NewGuid();

    public MeetingDetailsHandlerTests() {
        _gameServiceClient.Api.Returns(_httpClient);
        _handler = new();
    }

    [Fact]
    public void Initialize_SetsStateProperties() {
        // Arrange
        var state = new MeetingDetails.PageState();

        // Act
        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        // Assert
        state.Id.Should().Be(_meetingId);
    }

    [Fact]
    public async Task TryLoadMeetingDetails_LoadsMeetingAndSetsProperties() {
        // Arrange
        var state = new MeetingDetails.PageState { Id = _meetingId };
        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        var player = new MeetingPlayer { UserId = _currentUser.Id, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUser.Id,
            Players = [player],
        };
        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(meeting);

        // Act
        var result = await _handler.TryLoadMeetingDetails(state);

        // Assert
        result.Should().BeTrue();
        state.Meeting.Should().BeEquivalentTo(meeting);
        state.IsGameMaster.Should().BeTrue();
    }

    [Fact]
    public async Task TryLoadMeetingDetails_ReturnsFalse_WhenMeetingIsNull() {
        // Arrange
        var state = new MeetingDetails.PageState { Id = _meetingId };
        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns((MeetingModel)null!);

        // Act
        var result = await _handler.TryLoadMeetingDetails(state);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void OpenEditMeetingDialog_PopulatesEditState() {
        // Arrange
        var state = new MeetingDetails.PageState {
            Meeting = new() { Subject = "Original Meeting Name" },
                                                 };

        // Act
        MeetingDetails.Handler.OpenEditMeetingDialog(state);

        // Assert
        state.ShowEditDialog.Should().BeTrue();
        state.EditMeetingSubject.Should().Be("Original Meeting Name");
        state.MeetingSubjectError.Should().BeEmpty();
    }

    [Fact]
    public void CloseEditMeetingDialog_SetsShowEditDialogToFalse() {
        // Arrange
        var state = new MeetingDetails.PageState {
            ShowEditDialog = true,
                                                 };

        // Act
        MeetingDetails.Handler.CloseEditMeetingDialog(state);

        // Assert
        state.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateMeeting_WithValidInput_UpdatesMeetingAndClosesDialog() {
        // Arrange
        var state = new MeetingDetails.PageState {
            Id = _meetingId,
            ShowEditDialog = true,
            EditMeetingSubject = "Updated Meeting Name",
                                                 };

        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        // Mock API response
        _httpClient.PutAsJsonAsync($"/api/meetings/{_meetingId}", Arg.Any<object>(), cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(new HttpResponseMessage(HttpStatusCode.OK));

        var updatedMeeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Updated Meeting Name",
                                              };
        _httpClient.GetFromJsonAsync<MeetingModel>($"/api/meetings/{_meetingId}", cancellationToken: Xunit.TestContext.Current.CancellationToken).Returns(updatedMeeting);

        // Act
        await _handler.UpdateMeeting(state);

        // Assert
        await _httpClient.Received(1).PutAsJsonAsync($"/api/meetings/{_meetingId}", Arg.Is<object>(obj => obj.ToString()!.Contains("Updated Meeting Name")), cancellationToken: Xunit.TestContext.Current.CancellationToken);

        state.ShowEditDialog.Should().BeFalse();
        state.Meeting.Should().BeEquivalentTo(updatedMeeting);
    }

    [Fact]
    public async Task UpdateMeeting_WithEmptyName_SetsErrorAndDoesNotUpdate() {
        // Arrange
        var state = new MeetingDetails.PageState {
            Id = _meetingId,
            ShowEditDialog = true,
            EditMeetingSubject = "",
                                                 };

        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        // Act
        await _handler.UpdateMeeting(state);

        // Assert
        await _httpClient.DidNotReceive().PutAsJsonAsync(Arg.Any<string>(), Arg.Any<object>(), cancellationToken: Xunit.TestContext.Current.CancellationToken);
        state.ShowEditDialog.Should().BeTrue();
        state.MeetingSubjectError.Should().NotBeEmpty();
    }

    [Fact]
    public async Task TryStartMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var state = new MeetingDetails.PageState { Id = _meetingId };
        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        var successResponse = new HttpResponseMessage(HttpStatusCode.OK);
        _httpClient.PostAsync($"/api/meetings/{_meetingId}/start", null, Xunit.TestContext.Current.CancellationToken).Returns(successResponse);

        // Act
        var result = await _handler.TryStartMeeting(state);

        // Assert
        result.Should().BeTrue();
        await _httpClient.Received(1).PostAsync($"/api/meetings/{_meetingId}/start", null, Xunit.TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task TryStartMeeting_ReturnsFalse_OnError() {
        // Arrange
        var state = new MeetingDetails.PageState { Id = _meetingId };
        _handler.Initialize(_currentUser, _gameServiceClient, _meetingId, state);

        _httpClient.PostAsync($"/api/meetings/{_meetingId}/start", null, Xunit.TestContext.Current.CancellationToken).Returns<HttpResponseMessage>(x => throw new HttpRequestException("Test error"));

        // Act
        var result = await _handler.TryStartMeeting(state);

        // Assert
        result.Should().BeFalse();
    }
}