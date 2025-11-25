namespace VttTools.Library.EndpointMappers;

public class EncounterEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();
    public EncounterEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapEncounterManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapEncounterEndpoints();

        // Assert
        _app.Received(1).MapGroup("/api/encounters");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(24);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/encounters/{id:guid} => GetEncounterByIdHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid} => UpdateEncounterHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid} => DeleteEncounterHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: GET /api/encounters/{id:guid}/assets => GetAssetsHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/assets => BulkUpdateAssetsHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/assets/clone => BulkCloneAssetsHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/assets => BulkDeleteAssetsHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/assets => BulkAddAssetsHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/assets/{assetId:guid} => AddAssetHandler");
        groupDataSource.Endpoints[9].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/assets/{index:int}/clone => CloneAssetHandler");
        groupDataSource.Endpoints[10].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/assets/{index:int} => UpdateAssetHandler");
        groupDataSource.Endpoints[11].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/assets/{index:int} => RemoveAssetHandler");
        groupDataSource.Endpoints[12].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/walls => AddWallHandler");
        groupDataSource.Endpoints[13].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/walls/{index:int} => UpdateWallHandler");
        groupDataSource.Endpoints[14].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/walls/{index:int} => RemoveWallHandler");
        groupDataSource.Endpoints[15].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/regions => AddRegionHandler");
        groupDataSource.Endpoints[16].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/regions/{index:int} => UpdateRegionHandler");
        groupDataSource.Endpoints[17].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/regions/{index:int} => RemoveRegionHandler");
        groupDataSource.Endpoints[18].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/sources => AddSourceHandler");
        groupDataSource.Endpoints[19].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/sources/{index:int} => UpdateSourceHandler");
        groupDataSource.Endpoints[20].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/sources/{index:int} => RemoveSourceHandler");
        groupDataSource.Endpoints[21].DisplayName.Should().Be("HTTP: POST /api/encounters/{id:guid}/openings => PlaceOpeningHandler");
        groupDataSource.Endpoints[22].DisplayName.Should().Be("HTTP: PATCH /api/encounters/{id:guid}/openings/{index:int} => UpdateOpeningHandler");
        groupDataSource.Endpoints[23].DisplayName.Should().Be("HTTP: DELETE /api/encounters/{id:guid}/openings/{index:int} => RemoveOpeningHandler");
    }
}