namespace VttTools.GameService.Endpoints;

public class EpisodeEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();
    public EpisodeEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "<Pending>")]
    [SuppressMessage("Usage", "ASP0018:Unused route parameter", Justification = "<Pending>")]
    public void MapEpisodeManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapEpisodeEndpoints();

        // Assert
        // Check episodes endpoints
        _app.Received(1).MapGroup("/api/episodes");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(4);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/episodes/{id:guid} => GetEpisodeByIdHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: PATCH /api/episodes/{id:guid} => UpdateEpisodeHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: DELETE /api/episodes/{id:guid} => DeleteEpisodeHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: POST /api/episodes/{id:guid}/clone => CloneEpisodeHandler");
    }
}