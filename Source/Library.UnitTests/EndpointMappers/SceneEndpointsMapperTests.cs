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
        groupDataSource.Endpoints.Should().HaveCount(12);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid} => GetSceneByIdHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid} => UpdateSceneHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid} => DeleteSceneHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: GET /api/scenes/{id:guid}/assets => GetAssetsHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid}/assets => BulkUpdateAssetsHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets/clone => BulkCloneAssetsHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid}/assets => BulkDeleteAssetsHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets => BulkAddAssetsHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets/{assetId:guid} => AddAssetHandler");
        groupDataSource.Endpoints[9].DisplayName.Should().Be("HTTP: POST /api/scenes/{id:guid}/assets/{number:int}/clone => CloneAssetHandler");
        groupDataSource.Endpoints[10].DisplayName.Should().Be("HTTP: PATCH /api/scenes/{id:guid}/assets/{number:int} => UpdateAssetHandler");
        groupDataSource.Endpoints[11].DisplayName.Should().Be("HTTP: DELETE /api/scenes/{id:guid}/assets/{number:int} => RemoveAssetHandler");
    }
}