using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Pages.Meeting;

public class MeetingDetailsPageHandlerTests {
    private readonly Guid _meetingId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly IGameService _service = Substitute.For<IGameService>();
    private readonly MeetingDetailsPage.Handler _handler;

    public MeetingDetailsPageHandlerTests() {
        _handler = new(_meetingId, _userId, _service);
    }

    [Fact]
    public async Task Initialize_WithValidMeetingId_ReturnsHandler() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _service.GetMeetingByIdAsync(_meetingId).Returns(meeting);

        // Act
        var handler = await MeetingDetailsPage.Handler.InitializeAsync(_meetingId, _userId, _service);

        // Assert
        handler.Should().NotBeNull();
    }

    [Fact]
    public async Task Initialize_WithInvalidMeetingId_ReturnsNull() {
        // Arrange
        _service.GetMeetingByIdAsync(_meetingId).Returns((MeetingModel?)null);

        // Act
        var handler = await MeetingDetailsPage.Handler.InitializeAsync(_meetingId, _userId, _service);

        // Assert
        handler.Should().BeNull();
    }

    [Fact]
    public async Task TryLoadMeetingDetails_LoadsMeetingAndSetsProperties() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _service.GetMeetingByIdAsync(_meetingId).Returns(meeting);

        // Act
        var result = await _handler.TryLoadMeetingDetails();

        // Assert
        result.Should().BeTrue();
        _handler.State.Meeting.Should().BeEquivalentTo(meeting);
        _handler.State.CanEdit.Should().BeTrue();
        _handler.State.CanStart.Should().BeTrue();
    }

    [Fact]
    public async Task TryLoadMeetingDetails_ReturnsFalse_WhenMeetingIsNull() {
        // Arrange
        _service.GetMeetingByIdAsync(_meetingId).Returns((MeetingModel?)null);

        // Act
        var result = await _handler.TryLoadMeetingDetails();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void OpenEditMeetingDialog_ClearErrorsResetsInputAndShowsDialog() {
        // Arrange
        _handler.State.Meeting = new() { Subject = "Original Meeting Name" };
        _handler.State.Input.Errors = [new("Some error.")];
        _handler.State.ShowEditDialog = false;
        _handler.State.Input = new();
        var expectedInput = new MeetingDetailsPage.InputModel {
            Subject = "Original Meeting Name",
        };

        // Act
        _handler.OpenEditMeetingDialog();

        // Assert
        _handler.State.Input.Should().BeEquivalentTo(expectedInput);
        _handler.State.ShowEditDialog.Should().BeTrue();
        _handler.State.Input.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CloseEditMeetingDialog_HidesDialog() {
        // Arrange
        _handler.State.ShowEditDialog = true;

        // Act
        _handler.CloseEditMeetingDialog();

        // Assert
        _handler.State.ShowEditDialog.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateMeeting_WithValidInput_UpdatesMeetingAndClosesDialog() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        _handler.State.Meeting = new() {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _handler.State.ShowEditDialog = true;
        _handler.State.Input = new() {
            Subject = "Updated Meeting Name",
        };
        var updatedMeeting = new MeetingModel {
            Id = _handler.State.Meeting.Id,
            Subject = _handler.State.Input.Subject,
            OwnerId = _handler.State.Meeting.OwnerId,
            Players = _handler.State.Meeting.Players,
        };

        _service.UpdateMeetingAsync(_meetingId, Arg.Any<UpdateMeetingRequest>()).Returns(updatedMeeting);

        // Act
        await _handler.UpdateMeeting();

        // Assert
        _handler.State.ShowEditDialog.Should().BeFalse();
        _handler.State.Meeting.Should().BeEquivalentTo(updatedMeeting);
    }

    [Fact]
    public async Task UpdateMeeting_WithEmptyName_SetsErrorAndDoesNotUpdate() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        _handler.State.Meeting = new() {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _handler.State.ShowEditDialog = true;
        _handler.State.Input = new();
        _service.UpdateMeetingAsync(_meetingId, Arg.Any<UpdateMeetingRequest>()).Returns(Result.Failure("Some error."));

        // Act
        await _handler.UpdateMeeting();

        // Assert
        _handler.State.ShowEditDialog.Should().BeTrue();
        _handler.State.Input.Errors.Should().NotBeEmpty();
        _handler.State.Input.Errors[0].Message.Should().Be("Some error.");
    }

    [Fact]
    public async Task TryStartMeeting_CallsApiAndReturnsResult() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _handler.State.Meeting = meeting;
        _handler.State.ShowEditDialog = true;
        _handler.State.Input = new();

        _service.StartMeetingAsync(_meetingId).Returns(true);

        // Act
        var result = await _handler.TryStartMeeting();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TryStartMeeting_ReturnsFalse_OnError() {
        // Arrange
        var player = new MeetingPlayer { UserId = _userId, Type = PlayerType.Master };
        var meeting = new MeetingModel {
            Id = _meetingId,
            Subject = "Test Meeting",
            OwnerId = _userId,
            Players = [player],
        };
        _handler.State.Meeting = meeting;
        _handler.State.ShowEditDialog = true;
        _handler.State.Input = new();

        _service.StartMeetingAsync(_meetingId).Returns(false);

        // Act
        var result = await _handler.TryStartMeeting();

        // Assert
        result.Should().BeFalse();
    }
}