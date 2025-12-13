using VttTools.Admin.Library.Handlers;

namespace VttTools.Admin.UnitTests.Handlers;

public sealed class CampaignAdminHandlersTests {
    private readonly ICampaignAdminService _mockService;

    public CampaignAdminHandlersTests() {
        _mockService = Substitute.For<ICampaignAdminService>();
    }

    private static LibraryContentResponse CreateLibraryContentResponse(Guid? id = null, string name = "Test", string description = "Test Description")
        => new() {
            Id = id ?? Guid.CreateVersion7(),
            OwnerId = Guid.CreateVersion7(),
            Name = name,
            Description = description,
            IsPublished = false,
            IsPublic = false,
            CreatedAt = DateTime.UtcNow
        };

    #region SearchHandler Tests

    [Fact]
    public async Task SearchHandler_WithValidRequest_ReturnsOk() {
        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };
        var response = new LibraryContentSearchResponse { Content = [], TotalCount = 0, HasMore = false };

        _mockService.SearchCampaignsAsync(Arg.Any<LibrarySearchRequest>(), Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.SearchHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentSearchResponse>>();
        var okResult = (Ok<LibraryContentSearchResponse>)result;
        okResult.Value.Should().Be(response);
    }

    [Fact]
    public async Task SearchHandler_WhenExceptionThrown_ReturnsProblem() {
        var request = new LibrarySearchRequest { Skip = 0, Take = 10 };

        _mockService.SearchCampaignsAsync(Arg.Any<LibrarySearchRequest>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.SearchHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region GetByIdHandler Tests

    [Fact]
    public async Task GetByIdHandler_WithValidId_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var response = CreateLibraryContentResponse(id, "Test Campaign");

        _mockService.GetCampaignByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentResponse>>();
    }

    [Fact]
    public async Task GetByIdHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();

        _mockService.GetCampaignByIdAsync(id, Arg.Any<CancellationToken>())
            .Returns((LibraryContentResponse?)null);

        var result = await CampaignAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetByIdHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.GetCampaignByIdAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.GetByIdHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region CreateHandler Tests

    [Fact]
    public async Task CreateHandler_WithValidRequest_ReturnsCreated() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New Campaign",
            Description = "Campaign Description"
        };
        var response = CreateLibraryContentResponse(name: request.Name, description: request.Description);

        _mockService.CreateCampaignAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
        var createdResult = (Created<LibraryContentResponse>)result;
        createdResult.Location.Should().Contain(response.Id.ToString());
    }

    [Fact]
    public async Task CreateHandler_WithInvalidData_ReturnsBadRequest() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "",
            Description = ""
        };

        _mockService.CreateCampaignAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Name is required"));

        var result = await CampaignAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task CreateHandler_WhenExceptionThrown_ReturnsProblem() {
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "Test",
            Description = "Test"
        };

        _mockService.CreateCampaignAsync(request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.CreateHandler(
            request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region UpdateHandler Tests

    [Fact]
    public async Task UpdateHandler_WithValidRequest_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated Campaign",
            Description = "Updated Description",
            IsPublished = true,
            IsPublic = false
        };
        var response = CreateLibraryContentResponse(id, request.Name!, request.Description!);

        _mockService.UpdateCampaignAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<LibraryContentResponse>>();
    }

    [Fact]
    public async Task UpdateHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated Campaign",
            Description = "Updated Description"
        };

        _mockService.UpdateCampaignAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.UpdateContentRequest {
            Name = "Updated Campaign",
            Description = "Updated Description"
        };

        _mockService.UpdateCampaignAsync(
            id, request.Name, request.Description, request.IsPublished, request.IsPublic,
            Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.UpdateHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region DeleteHandler Tests

    [Fact]
    public async Task DeleteHandler_WithValidId_ReturnsNoContent() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteCampaignAsync(id, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await CampaignAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteCampaignAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.DeleteCampaignAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.DeleteHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region TransferOwnershipHandler Tests

    [Fact]
    public async Task TransferOwnershipHandler_WithValidRequest_ReturnsNoContent() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = Guid.CreateVersion7() };

        _mockService.TransferCampaignOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await CampaignAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task TransferOwnershipHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "grant", TargetUserId = Guid.CreateVersion7() };

        _mockService.TransferCampaignOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task TransferOwnershipHandler_WithInvalidRequest_ReturnsBadRequest() {
        var id = Guid.CreateVersion7();
        var request = new TransferOwnershipRequest { Action = "invalid" };

        _mockService.TransferCampaignOwnershipAsync(id, request, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Invalid owner ID"));

        var result = await CampaignAdminHandlers.TransferOwnershipHandler(
            id, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region GetAdventuresHandler Tests

    [Fact]
    public async Task GetAdventuresHandler_WithValidCampaignId_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var adventures = new List<LibraryContentResponse> {
            CreateLibraryContentResponse(name: "Adventure 1"),
            CreateLibraryContentResponse(name: "Adventure 2")
        }.AsReadOnly();

        _mockService.GetAdventuresByCampaignIdAsync(id, Arg.Any<CancellationToken>())
            .Returns(adventures);

        var result = await CampaignAdminHandlers.GetAdventuresHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Ok<IReadOnlyList<LibraryContentResponse>>>();
        var okResult = (Ok<IReadOnlyList<LibraryContentResponse>>)result;
        okResult.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAdventuresHandler_WhenExceptionThrown_ReturnsProblem() {
        var id = Guid.CreateVersion7();

        _mockService.GetAdventuresByCampaignIdAsync(id, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.GetAdventuresHandler(
            id, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion

    #region CreateAdventureHandler Tests

    [Fact]
    public async Task CreateAdventureHandler_WithValidRequest_ReturnsCreated() {
        var campaignId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New Adventure",
            Description = "Adventure Description"
        };
        var response = CreateLibraryContentResponse(name: request.Name, description: request.Description);

        _mockService.CreateAdventureForCampaignAsync(
            campaignId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.CreateAdventureHandler(
            campaignId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
        var createdResult = (Created<LibraryContentResponse>)result;
        createdResult.Location.Should().Contain(campaignId.ToString());
        createdResult.Location.Should().Contain(response.Id.ToString());
    }

    [Fact]
    public async Task CreateAdventureHandler_WhenCampaignNotFound_ReturnsNotFound() {
        var campaignId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "New Adventure",
            Description = "Adventure Description"
        };

        _mockService.CreateAdventureForCampaignAsync(
            campaignId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.CreateAdventureHandler(
            campaignId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task CreateAdventureHandler_WithInvalidData_ReturnsBadRequest() {
        var campaignId = Guid.CreateVersion7();
        var request = new LibraryAdminHandlers.CreateContentRequest {
            Name = "",
            Description = ""
        };

        _mockService.CreateAdventureForCampaignAsync(
            campaignId, request.Name, request.Description, Arg.Any<CancellationToken>())
            .ThrowsAsync(new ArgumentException("Name is required"));

        var result = await CampaignAdminHandlers.CreateAdventureHandler(
            campaignId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeAssignableTo<IStatusCodeHttpResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    #endregion

    #region CloneAdventureHandler Tests

    [Fact]
    public async Task CloneAdventureHandler_WithValidRequest_ReturnsCreated() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var request = new CampaignAdminHandlers.CloneAdventureRequest("Cloned Adventure");
        var response = CreateLibraryContentResponse(name: "Cloned Adventure", description: "Cloned Description");

        _mockService.CloneAdventureAsync(campaignId, adventureId, request.Name, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.CloneAdventureHandler(
            campaignId, adventureId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
    }

    [Fact]
    public async Task CloneAdventureHandler_WithNullRequest_ReturnsCreated() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var response = CreateLibraryContentResponse(name: "Cloned Adventure", description: "Cloned Description");

        _mockService.CloneAdventureAsync(campaignId, adventureId, null, Arg.Any<CancellationToken>())
            .Returns(response);

        var result = await CampaignAdminHandlers.CloneAdventureHandler(
            campaignId, adventureId, null, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<Created<LibraryContentResponse>>();
    }

    [Fact]
    public async Task CloneAdventureHandler_WhenAdventureNotFound_ReturnsNotFound() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();
        var request = new CampaignAdminHandlers.CloneAdventureRequest("Cloned Adventure");

        _mockService.CloneAdventureAsync(campaignId, adventureId, request.Name, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.CloneAdventureHandler(
            campaignId, adventureId, request, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    #endregion

    #region RemoveAdventureHandler Tests

    [Fact]
    public async Task RemoveAdventureHandler_WithValidIds_ReturnsNoContent() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();

        _mockService.RemoveAdventureFromCampaignAsync(campaignId, adventureId, Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var result = await CampaignAdminHandlers.RemoveAdventureHandler(
            campaignId, adventureId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task RemoveAdventureHandler_WhenAdventureNotFound_ReturnsNotFound() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();

        _mockService.RemoveAdventureFromCampaignAsync(campaignId, adventureId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new KeyNotFoundException());

        var result = await CampaignAdminHandlers.RemoveAdventureHandler(
            campaignId, adventureId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task RemoveAdventureHandler_WhenExceptionThrown_ReturnsProblem() {
        var campaignId = Guid.CreateVersion7();
        var adventureId = Guid.CreateVersion7();

        _mockService.RemoveAdventureFromCampaignAsync(campaignId, adventureId, Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Test exception"));

        var result = await CampaignAdminHandlers.RemoveAdventureHandler(
            campaignId, adventureId, _mockService, TestContext.Current.CancellationToken);

        result.Should().BeOfType<ProblemHttpResult>();
    }

    #endregion
}
