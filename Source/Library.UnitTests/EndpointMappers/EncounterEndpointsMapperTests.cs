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

        // Total endpoints: 5 (CRUD + Create) + 4 (Actors) + 4 (Objects) + 4 (Effects) = 17
        // Note: Structural elements (Walls, Regions, Lights, Elements, Sounds) are now on Stage
        groupDataSource.Endpoints.Should().HaveCount(17);

        // Verify some key endpoints exist (not all, to keep the test maintainable)
        var endpointNames = groupDataSource.Endpoints.Select(e => e.DisplayName).ToList();

        // Encounter CRUD
        endpointNames.Should().Contain(n => n!.Contains("GetEncountersHandler"));
        endpointNames.Should().Contain(n => n!.Contains("GetEncounterByIdHandler"));
        endpointNames.Should().Contain(n => n!.Contains("UpdateEncounterHandler"));
        endpointNames.Should().Contain(n => n!.Contains("DeleteEncounterHandler"));

        // Game Elements (Actors, Objects, Effects - these stay on Encounter)
        endpointNames.Should().Contain(n => n!.Contains("GetActorsHandler"));
        endpointNames.Should().Contain(n => n!.Contains("AddActorHandler"));
        endpointNames.Should().Contain(n => n!.Contains("GetObjectsHandler"));
        endpointNames.Should().Contain(n => n!.Contains("AddObjectHandler"));
        endpointNames.Should().Contain(n => n!.Contains("GetEffectsHandler"));
        endpointNames.Should().Contain(n => n!.Contains("AddEffectHandler"));
    }
}