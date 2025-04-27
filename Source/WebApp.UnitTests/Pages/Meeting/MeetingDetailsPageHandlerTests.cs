namespace VttTools.WebApp.Pages.Meeting;

public class MeetingDetailsPageHandlerTests {
    private readonly Guid _meetingId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly IGameService _service = Substitute.For<IGameService>();

    [Fact]
    public async Task Initialize_WithValidMeetingId_ReturnsHandler() {
        // Arrange
        var handler = await CreateInitializedHandler();

        // Act
        var result = await handler.TryInitializeAsync(_meetingId, _userId, _service);

        // Assert
        result.Should().BeTrue();
        handler.State.Meeting.Should().NotBeNull();
        handler.State.CanEdit.Should().BeTrue();
        handler.State.CanStart.Should().BeTrue();
    }

    [Fact]
    public async Task Initialize_WithInvalidMeetingId_ReturnsNull() {
        // Arrange
        _service.GetMeetingByIdAsync(_meetingId).Returns((MeetingModel?)null);
        var handler = new MeetingDetailsPageHandler();

        // Act
        var result = await handler.TryInitializeAsync(_meetingId, _userId, _service);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task OpenEditMeetingDialog_ClearErrorsResetsInputAndShowsDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();

        // Arrange
        var expectedInput = new MeetingDetailsPageInputModel {
            Subject = "Test Meeting",
        };

        // Act
        handler.OpenEditMeetingDialog();

        // Assert
        handler.State.Input.Should().BeEquivalentTo(expectedInput);
        handler.State.ShowEditDialog.Should().BeTrue();
    }

    [Fact]
    public async Task CloseEditMeetingDialog_HidesDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;

        // Act
        handler.CloseEditMeetingDialog();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateMeeting_WithValidInput_UpdatesMeetingAndClosesDialog() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;
        handler.State.Input = new() {
            Subject = "Updated Meeting Name",
        };
        var updatedMeeting = new MeetingModel {
            Id = handler.State.Meeting.Id,
            Subject = handler.State.Input.Subject,
            OwnerId = handler.State.Meeting.OwnerId,
            Players = handler.State.Meeting.Players,
        };

        _service.UpdateMeetingAsync(_meetingId, Arg.Any<UpdateMeetingRequest>()).Returns(updatedMeeting);

        // Act
        await handler.UpdateMeeting();

        // Assert
        handler.State.ShowEditDialog.Should().BeFalse();
        handler.State.Meeting.Should().BeEquivalentTo(updatedMeeting);
    }

    [Fact]
    public async Task UpdateMeeting_WithValidationError_SetsErrorsAndDoesNotUpdate() {
        // Arrange
        var handler = await CreateInitializedHandler();
        handler.State.ShowEditDialog = true;
        _service.UpdateMeetingAsync(_meetingId, Arg.Any<UpdateMeetingRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await handler.UpdateMeeting();

        // Assert
        handler.State.ShowEditDialog.Should().BeTrue();
        handler.State.Input.Errors.Should().NotBeEmpty();
        handler.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryStartMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var handler = await CreateInitializedHandler();
        _service.StartMeetingAsync(_meetingId).Returns(true);

        // Act
        var result = await handler.TryStartMeeting();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryStartMeeting_ReturnsFalse_OnError() {
        // Arrange
        var handler = await CreateInitializedHandler();
        _service.StartMeetingAsync(_meetingId).Returns(false);

        // Act
        var result = await handler.TryStartMeeting();

        // Assert
        result.Should().BeFalse();
    }

    private async Task<MeetingDetailsPageHandler> CreateInitializedHandler() {
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _service.GetMeetingByIdAsync(_meetingId).Returns(meeting);
        var handler = new MeetingDetailsPageHandler();
        await handler.TryInitializeAsync(_meetingId, _userId, _service);
        return handler;
    }
}