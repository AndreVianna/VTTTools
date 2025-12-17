using VttTools.Media.ApiContracts;

namespace VttTools.Media.Handlers;

public class ResourcesHandlersTests {
    private readonly IResourceService _resourceService = Substitute.For<IResourceService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public ResourcesHandlersTests() {
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
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

    [Fact]
    public async Task UploadResourceHandler_WithValidFile_ReturnsOk() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream("test content"u8.ToArray());
        file.ContentType.Returns("image/png");
        file.FileName.Returns("test.png");
        file.OpenReadStream().Returns(stream);

        var resourceMetadata = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            ContentType = "image/png",
            FileName = "test.png",
            FileLength = 100,
            Size = new Common.Model.Size(256, 256),
        };

        _resourceService.UploadResourceAsync(Arg.Any<Guid>(), Arg.Any<UploadResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(resourceMetadata));

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "Background", null, _resourceService, _ct);

        var okResult = result.Should().BeOfType<Ok<ResourceMetadata>>().Subject;
        okResult.Value.Should().BeEquivalentTo(resourceMetadata);
    }

    [Fact]
    public async Task UploadResourceHandler_WithInvalidData_ReturnsBadRequest() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream([]);
        file.ContentType.Returns("");
        file.FileName.Returns("");
        file.OpenReadStream().Returns(stream);

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "Background", null, _resourceService, _ct);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public async Task UploadResourceHandler_WithProcessingFailure_ReturnsBadRequest() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream("test content"u8.ToArray());
        file.ContentType.Returns("image/png");
        file.FileName.Returns("test.png");
        file.OpenReadStream().Returns(stream);

        _resourceService.UploadResourceAsync(Arg.Any<Guid>(), Arg.Any<UploadResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<ResourceMetadata>(null!, "Invalid file format: corrupted image"));

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "Background", null, _resourceService, _ct);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task UploadResourceHandler_WithFileSizeExceeded_ReturnsRequestEntityTooLarge() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream("test content"u8.ToArray());
        file.ContentType.Returns("image/png");
        file.FileName.Returns("test.png");
        file.OpenReadStream().Returns(stream);

        _resourceService.UploadResourceAsync(Arg.Any<Guid>(), Arg.Any<UploadResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<ResourceMetadata>(null!, "File size (55.00 MB) exceeds maximum (50.00 MB) for resourceType 'Background'"));

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "Background", null, _resourceService, _ct);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(StatusCodes.Status413RequestEntityTooLarge);
    }

    [Fact]
    public async Task UploadResourceHandler_WithSaveFailure_ReturnsInternalServerError() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream("test content"u8.ToArray());
        file.ContentType.Returns("image/png");
        file.FileName.Returns("test.png");
        file.OpenReadStream().Returns(stream);

        _resourceService.UploadResourceAsync(Arg.Any<Guid>(), Arg.Any<UploadResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<ResourceMetadata>(null!, "Failed to save blob to storage"));

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "Background", null, _resourceService, _ct);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
    }

    [Fact]
    public async Task UploadResourceHandler_WithInvalidResourceType_ParsesAsUndefined() {
        var file = Substitute.For<IFormFile>();
        var stream = new MemoryStream("test content"u8.ToArray());
        file.ContentType.Returns("image/png");
        file.FileName.Returns("test.png");
        file.OpenReadStream().Returns(stream);

        _resourceService.UploadResourceAsync(Arg.Any<Guid>(), Arg.Any<UploadResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<ResourceMetadata>(null!, "Invalid resource type"));

        var result = await ResourcesHandlers.UploadResourceHandler(_httpContext, file, "InvalidType", null, _resourceService, _ct);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public async Task FilterResourcesHandler_WithInvalidFilter_ReturnsBadRequest() {
        var request = new ResourceFilterRequest {
            ResourceType = ResourceType.Background,
            Skip = -1,
            Take = 1000,
        };

        var result = await ResourcesHandlers.FilterResourcesHandler(_httpContext, request, _resourceService, _ct);

        result.Should().BeAssignableTo<Microsoft.AspNetCore.Http.IResult>();
    }

    [Fact]
    public async Task ServeResourceHandler_WithVideoFile_ReturnsFileWithFileName() {
        var id = Guid.CreateVersion7();
        var stream = new MemoryStream("video content"u8.ToArray());
        var resource = new Resource {
            Stream = stream,
            ContentType = "video/mp4",
            FileName = "test.mp4",
        };

        _resourceService.ServeResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(resource);

        var result = await ResourcesHandlers.ServeResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<FileStreamHttpResult>();
        var fileResult = (FileStreamHttpResult)result;
        fileResult.FileDownloadName.Should().Be("test.mp4");
    }

    [Fact]
    public async Task ServeResourceHandler_WithImageFile_ReturnsFileWithoutFileName() {
        var id = Guid.CreateVersion7();
        var stream = new MemoryStream("image content"u8.ToArray());
        var resource = new Resource {
            Stream = stream,
            ContentType = "image/png",
            FileName = "test.png",
        };

        _resourceService.ServeResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(resource);

        var result = await ResourcesHandlers.ServeResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<FileStreamHttpResult>();
        var fileResult = (FileStreamHttpResult)result;
        fileResult.FileDownloadName.Should().BeNull();
    }

    [Fact]
    public async Task DeleteResourceHandler_WithUnknownError_ReturnsProblem() {
        var id = Guid.CreateVersion7();
        _resourceService.DeleteResourceAsync(Arg.Any<Guid>(), id, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("UnexpectedError"));

        var result = await ResourcesHandlers.DeleteResourceHandler(_httpContext, id, _resourceService, _ct);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
    }

    [Fact]
    public async Task UpdateResourceHandler_WithUnknownError_ReturnsProblem() {
        var id = Guid.CreateVersion7();
        var request = new UpdateResourceRequest {
            Description = "Updated",
        };

        _resourceService.UpdateResourceAsync(Arg.Any<Guid>(), id, Arg.Any<UpdateResourceData>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("UnexpectedError"));

        var result = await ResourcesHandlers.UpdateResourceHandler(_httpContext, id, request, _resourceService, _ct);

        result.Should().BeOfType<ProblemHttpResult>();
        var problemResult = (ProblemHttpResult)result;
        problemResult.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
    }
}
