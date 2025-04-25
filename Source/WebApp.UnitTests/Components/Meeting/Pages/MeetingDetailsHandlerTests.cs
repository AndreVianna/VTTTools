using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public class MeetingDetailsHandlerTests {
    private readonly IGameService _client = Substitute.For<IGameService>();
    private readonly Guid _currentUserId = Guid.NewGuid();
    private readonly MeetingDetails.Handler _handler = new();
    private readonly Guid _meetingId = Guid.NewGuid();

    [Fact]
    public async Task Initialize_SetsStateProperties() {
        // Arrange
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        _client.GetMeetingByIdAsync(_meetingId).Returns(meeting);

        // Act
        var state = await _handler.InitializeState(_meetingId, _currentUserId, _client);

        // Assert
        state.Should().NotBeNull();
    }

    [Fact]
    public async Task TryLoadMeetingDetails_LoadsMeetingAndSetsProperties() {
        // Arrange
        var state = new MeetingDetails.PageState(_meetingId);
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        _client.GetMeetingByIdAsync(_meetingId).Returns(meeting);

        // Act
        var result = await _handler.TryLoadMeetingDetails(state);

        // Assert
        result.Should().BeTrue();
        state.Meeting.Should().BeEquivalentTo(meeting);
        state.CanEdit.Should().BeTrue();
        state.CanStart.Should().BeTrue();
    }

    [Fact]
    public async Task TryLoadMeetingDetails_ReturnsFalse_WhenMeetingIsNull() {
        // Arrange
        var state = new MeetingDetails.PageState(_meetingId);
        _client.GetMeetingByIdAsync(_meetingId).Returns((MeetingModel?)null);

        // Act
        var result = await _handler.TryLoadMeetingDetails(state);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void OpenEditMeetingDialog_ClearErrorsResetsInputAndShowsDialog() {
        // Arrange
        var state = new MeetingDetails.PageState(_meetingId) {
            Meeting = new() { Subject = "Original Meeting Name" },
            Errors = [new("Some error.")],
            ShowEditDialog = false,
            Input = new(),
        };
        var expectedInput = new MeetingDetails.InputModel {
            Subject = "Original Meeting Name",
        };

        // Act
        MeetingDetails.Handler.OpenEditMeetingDialog(state);

        // Assert
        state.Input.Should().BeEquivalentTo(expectedInput);
        state.ShowEditDialog.Should().BeTrue();
        state.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CloseEditMeetingDialog_HidesDialog() {
        // Arrange
        var state = new MeetingDetails.PageState(_meetingId) {
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
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        var state = new MeetingDetails.PageState(_meetingId) {
            Meeting = meeting,
            ShowEditDialog = true,
            Input = new() {
                Subject = "Updated Meeting Name",
            },
        };
        var updatedMeeting = new MeetingModel {
            Id = meeting.Id,
            Subject = state.Input.Subject,
            OwnerId = meeting.OwnerId,
            Players = meeting.Players,
        };

        _client.UpdateMeetingAsync(_meetingId, Arg.Any<UpdateMeetingRequest>()).Returns(updatedMeeting);

        // Act
        await _handler.UpdateMeeting(state);

        // Assert
        state.ShowEditDialog.Should().BeFalse();
        state.Meeting.Should().BeEquivalentTo(updatedMeeting);
    }

    [Fact]
    public async Task UpdateMeeting_WithEmptyName_SetsErrorAndDoesNotUpdate() {
        // Arrange
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        var state = new MeetingDetails.PageState(_meetingId) {
            Meeting = meeting,
            ShowEditDialog = true,
            Input = new(),
        };

        // Act
        await _handler.UpdateMeeting(state);

        // Assert
        state.ShowEditDialog.Should().BeTrue();
        state.Errors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task TryStartMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        var state = new MeetingDetails.PageState(_meetingId) {
            Meeting = meeting,
            ShowEditDialog = true,
            Input = new(),
        };

        _client.StartMeetingAsync(_meetingId).Returns(true);

        // Act
        var result = await _handler.TryStartMeeting(state);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryStartMeeting_ReturnsFalse_OnError() {
        // Arrange
        var player = new MeetingPlayer { UserId = _currentUserId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _currentUserId,
            Players = [player],
        };
        var state = new MeetingDetails.PageState(_meetingId) {
            Meeting = meeting,
            ShowEditDialog = true,
            Input = new(),
        };

        _client.StartMeetingAsync(_meetingId).Returns(false);

        // Act
        var result = await _handler.TryStartMeeting(state);

        // Assert
        result.Should().BeFalse();
    }
}