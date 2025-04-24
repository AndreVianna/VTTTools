namespace VttTools.GameService.Handlers;

public class MeetingHandlersTests {
    private readonly IMeetingService _meetingService = Substitute.For<IMeetingService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.NewGuid();
    private static readonly Guid _meetingId = Guid.NewGuid();
    private static readonly Guid _episodeId = Guid.NewGuid();

    public MeetingHandlersTests() {
        // Setup user claims
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task CreateMeetingHandler_WithValidRequest_ReturnsCreatedResult() {
        // Arrange
        var request = new CreateMeetingRequest {
            Subject = "Test Meeting",
            EpisodeId = _episodeId,
        };

        var meeting = new Meeting {
            Id = _meetingId,
            Subject = "Test Meeting",
            EpisodeId = _episodeId,
            OwnerId = _userId,
        };

        _meetingService.CreateMeetingAsync(
            _userId,
            Arg.Is<CreateMeetingData>(d => d.Subject == request.Subject && d.EpisodeId == request.EpisodeId),
            Arg.Any<CancellationToken>())
            .Returns(Result.Success(meeting));

        // Act
        var result = await MeetingHandlers.CreateMeetingHandler(_httpContext, request, _meetingService);

        // Assert
        await _meetingService.Received(1).CreateMeetingAsync(
            _userId,
            Arg.Is<CreateMeetingData>(d => d.Subject == request.Subject && d.EpisodeId == request.EpisodeId),
            Arg.Any<CancellationToken>());

        var response = result.Should().BeOfType<Created<Meeting>>().Subject;
        response.Location.Should().Be($"/api/meetings/{meeting.Id}");
        response.Value.Should().Be(meeting);
    }

    [Fact]
    public async Task CreateMeetingHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new CreateMeetingRequest {
            Subject = "",
            EpisodeId = _episodeId,
        };

        var errors = new[] { new Error("Subject", "Cannot be empty") };

        _meetingService.CreateMeetingAsync(
            _userId,
            Arg.Any<CreateMeetingData>(),
            Arg.Any<CancellationToken>())
            .Returns(Result.Failure(errors));

        // Act
        var result = await MeetingHandlers.CreateMeetingHandler(_httpContext, request, _meetingService);

        // Assert
        await _meetingService.Received(1).CreateMeetingAsync(
            _userId,
            Arg.Any<CreateMeetingData>(),
            Arg.Any<CancellationToken>());

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task GetMeetingsHandler_ReturnsOkResult() {
        // Arrange
        var meetings = new[] {
            new Meeting { Id = Guid.NewGuid(), Subject = "Meeting 1", OwnerId = _userId },
            new Meeting { Id = Guid.NewGuid(), Subject = "Meeting 2", OwnerId = _userId },
        };

        _meetingService.GetMeetingsAsync(_userId, Arg.Any<CancellationToken>())
            .Returns(meetings);

        // Act
        var result = await MeetingHandlers.GetMeetingsHandler(_httpContext, _meetingService);

        // Assert
        await _meetingService.Received(1).GetMeetingsAsync(_userId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Meeting[]>>().Subject;
        response.Value.Should().BeEquivalentTo(meetings);
    }

    [Fact]
    public async Task GetMeetingByIdHandler_WithExistingId_ReturnsOkResult() {
        // Arrange
        var meeting = new Meeting { Id = _meetingId, Subject = "Test Meeting", OwnerId = _userId };

        _meetingService.GetMeetingByIdAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns(meeting);

        // Act
        var result = await MeetingHandlers.GetMeetingByIdHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).GetMeetingByIdAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<Ok<Meeting>>().Subject;
        response.Value.Should().Be(meeting);
    }

    [Fact]
    public async Task GetMeetingByIdHandler_WithNonExistingId_ReturnsNotFound() {
        // Arrange
        _meetingService.GetMeetingByIdAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns((Meeting?)null);

        // Act
        var result = await MeetingHandlers.GetMeetingByIdHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).GetMeetingByIdAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateMeetingHandler_WithValidRequest_ReturnsOkResult() {
        // Arrange
        var request = new UpdateMeetingRequest { Subject = "Updated Meeting" };

        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.UpdateMeetingAsync(
            _userId,
            _meetingId,
            Arg.Is<UpdateMeetingData>(d => d.Subject == request.Subject),
            Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.UpdateMeetingHandler(_httpContext, _meetingId, request, _meetingService);

        // Assert
        await _meetingService.Received(1).UpdateMeetingAsync(
            _userId,
            _meetingId,
            Arg.Is<UpdateMeetingData>(d => d.Subject == request.Subject),
            Arg.Any<CancellationToken>());

        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task UpdateMeetingHandler_WithInvalidRequest_ReturnsValidationProblem() {
        // Arrange
        var request = new UpdateMeetingRequest { Subject = "" };

        var errors = new[] { new Error("Subject", "Cannot be empty") };
        var badRequestResult = TypedResult.As(HttpStatusCode.BadRequest, errors);

        _meetingService.UpdateMeetingAsync(
            _userId,
            _meetingId,
            Arg.Any<UpdateMeetingData>(),
            Arg.Any<CancellationToken>())
            .Returns(badRequestResult);

        // Act
        var result = await MeetingHandlers.UpdateMeetingHandler(_httpContext, _meetingId, request, _meetingService);

        // Assert
        await _meetingService.Received(1).UpdateMeetingAsync(
            _userId,
            _meetingId,
            Arg.Any<UpdateMeetingData>(),
            Arg.Any<CancellationToken>());

        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task DeleteMeetingHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var noContentResult = TypedResult.As(HttpStatusCode.NoContent);

        _meetingService.DeleteMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns(noContentResult);

        // Act
        var result = await MeetingHandlers.DeleteMeetingHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).DeleteMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(204);
    }

    [Fact]
    public async Task JoinMeetingHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var request = new JoinMeetingRequest { JoinAs = PlayerType.Player };

        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.JoinMeetingAsync(_userId, _meetingId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.JoinMeetingHandler(_httpContext, _meetingId, request, _meetingService);

        // Assert
        await _meetingService.Received(1).JoinMeetingAsync(_userId, _meetingId, PlayerType.Player, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task JoinMeetingHandler_WithInvalidRequest_ReturnsBadRequestResult() {
        // Arrange
        var request = new JoinMeetingRequest { JoinAs = PlayerType.Player };

        var errorResult = TypedResult.As(HttpStatusCode.BadRequest, new Error("Some error."));

        _meetingService.JoinMeetingAsync(_userId, _meetingId, PlayerType.Player, Arg.Any<CancellationToken>())
            .Returns(errorResult);

        // Act
        var result = await MeetingHandlers.JoinMeetingHandler(_httpContext, _meetingId, request, _meetingService);

        // Assert
        await _meetingService.Received(1).JoinMeetingAsync(_userId, _meetingId, PlayerType.Player, Arg.Any<CancellationToken>());
        result.Should().BeOfType<ProblemHttpResult>();
    }

    [Fact]
    public async Task LeaveMeetingHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.LeaveMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.LeaveMeetingHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).LeaveMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ActivateEpisodeHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.SetActiveEpisodeAsync(_userId, _meetingId, _episodeId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.ActivateEpisodeHandler(_httpContext, _meetingId, _episodeId, _meetingService);

        // Assert
        await _meetingService.Received(1).SetActiveEpisodeAsync(_userId, _meetingId, _episodeId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task StartMeetingHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.StartMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.StartMeetingHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).StartMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task StopMeetingHandler_ReturnsCorrectStatusCode() {
        // Arrange
        var okResult = TypedResult.As(HttpStatusCode.OK);

        _meetingService.StopMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>())
            .Returns(okResult);

        // Act
        var result = await MeetingHandlers.StopMeetingHandler(_httpContext, _meetingId, _meetingService);

        // Assert
        await _meetingService.Received(1).StopMeetingAsync(_userId, _meetingId, Arg.Any<CancellationToken>());
        Assert.IsType<StatusCodeHttpResult>(result);
        var response = result.Should().BeOfType<StatusCodeHttpResult>().Subject;
        response.StatusCode.Should().Be(200);
    }
}