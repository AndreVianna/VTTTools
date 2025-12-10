namespace VttTools.Assets.EndpointMappers;

public class AssetEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public AssetEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "<Pending>")]
    [SuppressMessage("Usage", "ASP0018:Unused route parameter", Justification = "<Pending>")]
    public void MapAssetManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapAssetEndpoints();

        // Assert
        // Check route group is created correctly
        _app.Received(1).MapGroup("/api/assets");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(6);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/assets/ => GetAssetsHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: GET /api/assets/{id:guid} => GetAssetByIdHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: POST /api/assets/ => CreateAssetHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: POST /api/assets/{id:guid}/clone => CloneAssetHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: PATCH /api/assets/{id:guid} => UpdateAssetHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: DELETE /api/assets/{id:guid} => DeleteAssetHandler");
    }
}