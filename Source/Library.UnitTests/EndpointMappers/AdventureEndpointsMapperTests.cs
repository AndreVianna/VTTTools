namespace VttTools.Library.EndpointMappers;

public class AdventureEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public AdventureEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    public void MapAdventureManagementEndpoints_RegistersEndpoints() {
        // Act
        _app.MapAdventureEndpoints();

        // Assert
        _app.Received(1).MapGroup("/api/adventures");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(9);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/adventures/ => GetAdventuresHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: POST /api/adventures/ => CreateAdventureHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/clone => CloneAdventureHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: GET /api/adventures/{id:guid} => GetAdventureByIdHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: PATCH /api/adventures/{id:guid} => UpdateAdventureHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: DELETE /api/adventures/{id:guid} => DeleteAdventureHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: GET /api/adventures/{id:guid}/encounters => GetEncountersHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/encounters => AddNewEncounterHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/encounters/{encounterId:guid}/clone => AddClonedEncounterHandler");
    }
}