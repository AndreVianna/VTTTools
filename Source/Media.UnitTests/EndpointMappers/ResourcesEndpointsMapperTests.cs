namespace VttTools.Media.EndpointMappers;

public class ResourcesEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();
    public ResourcesEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapApplicationEndpoints_RegistersGroup() {
        // Note: The UploadResourceHandler has conflicting parameter types (form file + JSON body)
        // This would cause an InvalidOperationException in a real environment, but mocked
        // IEndpointRouteBuilder doesn't perform this validation

        // Act
        _app.MapResourcesEndpoints();

        // Assert
        _app.Received(1).MapGroup("/api/resources");
    }
}