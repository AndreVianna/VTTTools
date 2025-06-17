namespace VttTools.Library.EndpointMappers;

public class SceneEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();
    public SceneEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapSceneManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapSceneEndpoints();

        // Assert
        // Check scenes endpoints
        _app.Received(1).MapGroup("/api/scenes");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        // NOTE: The actual implementation has 8 endpoints, not 5
        groupDataSource.Endpoints.Should().HaveCount(8);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid} => GetSceneByIdHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid} => UpdateSceneHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid} => DeleteSceneHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid}/assets => GetAssetsHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets/{assetId:guid} => AddAssetHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets/{number:int} => CloneAssetHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid}/assets/{number:int} => UpdateAssetHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid}/assets/{number:int} => RemoveAssetHandler");
    }
}