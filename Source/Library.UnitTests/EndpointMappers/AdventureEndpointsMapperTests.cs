﻿namespace VttTools.Library.EndpointMappers;

public class AdventureEndpointsMapperTests {
    private readonly IEndpointRouteBuilder _app = Substitute.For<IEndpointRouteBuilder>();

    public AdventureEndpointsMapperTests() {
        _app.DataSources.Returns([]);
    }

    [Fact]
    [SuppressMessage("CodeQuality", "IDE0079:Remove unnecessary suppression", Justification = "<Pending>")]
    [SuppressMessage("Usage", "ASP0018:Unused route parameter", Justification = "<Pending>")]
    public void MapAdventureManagementEndpoints_RegistersEndpoints() {
        // Arrange

        // Act
        _app.MapAdventureEndpoints();

        // Assert
        // Check route group is created correctly
        _app.Received(1).MapGroup("/api/adventures");
        _app.DataSources.Should().HaveCount(1);
        var groupDataSource = _app.DataSources.First();
        groupDataSource.Endpoints.Should().HaveCount(10);
        groupDataSource.Endpoints[0].DisplayName.Should().Be("HTTP: GET /api/adventures/ => GetAdventuresHandler");
        groupDataSource.Endpoints[1].DisplayName.Should().Be("HTTP: POST /api/adventures/ => CreateAdventureHandler");
        groupDataSource.Endpoints[2].DisplayName.Should().Be("HTTP: GET /api/adventures/{id:guid} => GetAdventureByIdHandler");
        groupDataSource.Endpoints[3].DisplayName.Should().Be("HTTP: PATCH /api/adventures/{id:guid} => UpdateAdventureHandler");
        groupDataSource.Endpoints[4].DisplayName.Should().Be("HTTP: DELETE /api/adventures/{id:guid} => DeleteAdventureHandler");
        groupDataSource.Endpoints[5].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/clone => CloneAdventureHandler");
        groupDataSource.Endpoints[6].DisplayName.Should().Be("HTTP: GET /api/adventures/{id:guid}/scenes => GetScenesHandler");
        groupDataSource.Endpoints[7].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/scenes => CreateSceneHandler");
        groupDataSource.Endpoints[8].DisplayName.Should().Be("HTTP: POST /api/adventures/{id:guid}/scenes/clone => AddClonedSceneHandler");
        groupDataSource.Endpoints[9].DisplayName.Should().Be("HTTP: DELETE /api/adventures/{id:guid}/scenes/{sceneId:guid} => RemoveSceneHandler");
    }
}