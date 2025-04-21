namespace VttTools.GameService.Endpoints;

public class MeetingEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public MeetingEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "<Pending>")]
    [SuppressMessage("Usage", "ASP0018:Unused route parameter", Justification = "<Pending>")]
    public void MapMeetingManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapMeetingEndpoints();

        // Assert
        _app.Received(1).MapGroup("/api/meetings");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(10);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/meetings/ => GetMeetingsHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: GET /api/meetings/{id:guid} => GetMeetingByIdHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: POST /api/meetings/ => CreateMeetingHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: PATCH /api/meetings/{id:guid} => UpdateMeetingHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: DELETE /api/meetings/{id:guid} => DeleteMeetingHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/meetings/{id:guid}/join => JoinMeetingHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: POST /api/meetings/{id:guid}/leave => LeaveMeetingHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/meetings/{id:guid}/episodes/{episode:guid}/activate => ActivateEpisodeHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/meetings/{id:guid}/start => StartMeetingHandler");
        groupDataSource.Endpoints[9].DisplayName.Should().Be("HTTP: POST /api/meetings/{id:guid}/stop => StopMeetingHandler");
    }
}