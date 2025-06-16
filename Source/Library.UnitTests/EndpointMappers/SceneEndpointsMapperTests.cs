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
        groupDataSource.Endpoints.Should().HaveCount(5);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid} => GetSceneByIdHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid} => UpdateSceneHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid}/assets => GetAssetsHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets => AddNewAssetHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid}/assets/{assetId:guid} => RemoveAssetHandler");
    }
}