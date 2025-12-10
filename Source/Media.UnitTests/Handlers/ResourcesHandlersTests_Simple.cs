using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

using VttTools.Media.ApiContracts;

namespace VttTools.Media.Handlers;

public class ResourcesHandlersTests_Simple {
    private readonly IResourceService _resourceService = Substitute.For<IResourceService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly CancellationToken _ct;

    public ResourcesHandlersTests_Simple() {
        var user = Substitute.For<ClaimsPrincipal>();
        var userId = Guid.CreateVersion7();
        user.FindFirst(Arg.Any<string>()).Returns((System.Security.Claims.Claim?)null);
        _httpContext.User.Returns(user);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task FilterResourcesHandler_WithValidRequest_CallsService() {
        var request = new ResourceFilterRequest {
            ResourceType = ResourceType.Background,
            SearchText = "test",
            Skip = 0,
            Take = 10,
        };
        var resources = new[] {
            new ResourceMetadata { Id = Guid.CreateVersion7(), FileName = "test.png" },
        };

        _resourceService.FindResourcesAsync(Arg.Any<Guid>(), Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns((resources, 1));

        var result = await ResourcesHandlers.FilterResourcesHandler(_httpContext, request, _resourceService, _ct);

        result.Should().NotBeNull();
        await _resourceService.Received(1).FindResourcesAsync(Arg.Any<Guid>(), Arg.Any<ResourceFilterData>(), _ct);
    }

    [Fact]
    public async Task DeleteResourceHandler_WithOwner_ReturnsNoContent() {
        var id = Guid.CreateVersion7();
        _resourceService.DeleteResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await ResourcesHandlers.DeleteResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task DeleteResourceHandler_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        _resourceService.DeleteResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        var result = await ResourcesHandlers.DeleteResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task DeleteResourceHandler_WithNonOwner_ReturnsForbid() {
        var id = Guid.CreateVersion7();
        _resourceService.DeleteResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotAllowed"));

        var result = await ResourcesHandlers.DeleteResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<ForbidHttpResult>();
    }

    [Fact]
    public async Task ServeResourceHandler_WithOwner_ReturnsFile() {
        var id = Guid.CreateVersion7();
        var stream = new MemoryStream("test content"u8.ToArray());
        var resource = new Resource {
            Stream = stream,
            ContentType = "image/png",
            FileName = "test.png",
        };

        _resourceService.ServeResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(resource);

        var result = await ResourcesHandlers.ServeResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<FileStreamHttpResult>();
    }

    [Fact]
    public async Task ServeResourceHandler_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        _resourceService.ServeResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns((Resource?)null);

        var result = await ResourcesHandlers.ServeResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetResourceInfoHandler_WithValidId_ReturnsOk() {
        var id = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            FileName = "test.png",
            ContentType = "image/png",
        };

        _resourceService.GetResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(resource);

        var result = await ResourcesHandlers.GetResourceInfoHandler(_httpContext, id, _resourceService, _ct);

        var okResult = result.Should().BeOfType<Ok<ResourceMetadata>>().Subject;
        okResult.Value.Should().BeEquivalentTo(resource);
    }

    [Fact]
    public async Task GetResourceInfoHandler_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        _resourceService.GetResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns((ResourceMetadata?)null);

        var result = await ResourcesHandlers.GetResourceInfoHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateResourceHandler_WithValidData_ReturnsNoContent() {
        var id = Guid.CreateVersion7();
        var request = new UpdateResourceRequest {
            Description = "Updated description",
            IsPublic = true,
        };

        _resourceService.UpdateResourceAsync(Arg.Any<Guid>(), id, Arg.Any<UpdateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await ResourcesHandlers.UpdateResourceHandler(_httpContext, id, request, _resourceService, _ct);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task UpdateResourceHandler_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var request = new UpdateResourceRequest {
            Description = "Updated description",
        };

        _resourceService.UpdateResourceAsync(Arg.Any<Guid>(), id, Arg.Any<UpdateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotFound"));

        var result = await ResourcesHandlers.UpdateResourceHandler(_httpContext, id, request, _resourceService, _ct);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task UpdateResourceHandler_WithNonOwner_ReturnsForbid() {
        var id = Guid.CreateVersion7();
        var request = new UpdateResourceRequest {
            Description = "Updated description",
        };

        _resourceService.UpdateResourceAsync(Arg.Any<Guid>(), id, Arg.Any<UpdateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("NotAllowed"));

        var result = await ResourcesHandlers.UpdateResourceHandler(_httpContext, id, request, _resourceService, _ct);

        result.Should().BeOfType<ForbidHttpResult>();
    }
}
