namespace VttTools.Media.EndpointMappers;

public class ResourcesEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();
    public ResourcesEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapApplicationEndpoints_RegistersEndpoints() {
        _app.MapResourcesEndpoints();

        _app.Received(1).MapGroup("/api/resources");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(3);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: POST /api/resources/ => UploadFileHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: GET /api/resources/{id:guid} => DownloadFileHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: DELETE /api/resources/{id:guid} => DeleteFileHandler");
    }
}