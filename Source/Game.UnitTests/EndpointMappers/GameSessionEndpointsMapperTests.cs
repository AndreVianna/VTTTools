namespace VttTools.Game.EndpointMappers;

public class GameSessionEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public GameSessionEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "<Pending>")]
    [SuppressMessage("Usage", "ASP0018:Unused route parameter", Justification = "<Pending>")]
    public void MapGameSessionManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapGameSessionEndpoints();

        // Assert
        _app.Received(1).MapGroup("/api/sessions");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(10);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/sessions/ => GetGameSessionsHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: GET /api/sessions/{id:guid} => GetGameSessionByIdHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: POST /api/sessions/ => CreateGameSessionHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: PATCH /api/sessions/{id:guid} => UpdateGameSessionHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: DELETE /api/sessions/{id:guid} => DeleteGameSessionHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/sessions/{id:guid}/join => JoinGameSessionHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: POST /api/sessions/{id:guid}/leave => LeaveGameSessionHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/sessions/{id:guid}/encounters/{encounter:guid}/activate => ActivateEncounterHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/sessions/{id:guid}/start => StartGameSessionHandler");
        groupDataSource.Endpoints[9].DisplayName.Should().Be("HTTP: POST /api/sessions/{id:guid}/stop => StopGameSessionHandler");
    }
}