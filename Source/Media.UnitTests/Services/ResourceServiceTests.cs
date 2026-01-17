namespace VttTools.Media.Services;

public class ResourceServiceTests {
    private readonly IBlobStorage _blobStorage = Substitute.For<IBlobStorage>();
    private readonly IMediaStorage _mediaStorage = Substitute.For<IMediaStorage>();
    private readonly MediaProcessingQueue _processingQueue = new();
    private readonly ILogger<ResourceService> _logger = Substitute.For<ILogger<ResourceService>>();
    private readonly ResourceService _service;
    private readonly CancellationToken _ct;

    public ResourceServiceTests() {
        _blobStorage.SaveOriginalAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success("uploaded-path"));
        _service = new(_blobStorage, _mediaStorage, _processingQueue, _logger);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task UploadResourceAsync_WithValidData_SavesOriginalAndQueuesForProcessing() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Portrait,
            ContentType = "image/png",
            FileName = "test-image.png",
            Stream = new MemoryStream("test content"u8.ToArray()),
        };

        // Act
        var result = await _service.UploadResourceAsync(userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ContentType.Should().Be("image/png"); // PNG is already optimal, stays image/png
        result.Value.FileName.Should().Be("test-image.png");
        await _blobStorage.Received(1).SaveOriginalAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>());
        await _mediaStorage.Received(1).AddAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithValidData_SetsOwnerIdFromUserId() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Portrait,
            ContentType = "image/png",
            FileName = "test-image.png",
            Stream = new MemoryStream("test content"u8.ToArray()),
        };

        // Act
        var result = await _service.UploadResourceAsync(userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.OwnerId.Should().Be(userId);
        await _mediaStorage.Received(1).AddAsync(
            Arg.Is<ResourceMetadata>(r => r.OwnerId == userId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithInvalidData_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "",
            FileName = "",
            Stream = null,
        };

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Invalid upload data");
        await _blobStorage.DidNotReceive().SaveOriginalAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithOwner_DeletesResource() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.RemoveAsync(resource.Path, resource.FileName, resource.ContentType, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _service.DeleteResourceAsync(ownerId, id, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _blobStorage.Received(1).RemoveAsync(resource.Path, resource.FileName, resource.ContentType, Arg.Any<CancellationToken>());
        await _mediaStorage.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithNotFound_ReturnsFailure() {
        var id = Guid.CreateVersion7();
        var userId = Guid.CreateVersion7();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ResourceMetadata?)null);

        var result = await _service.DeleteResourceAsync(userId, id, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _blobStorage.DidNotReceive().RemoveAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithAnyUserId_DeletesResource() {
        // NOTE: Source has no ownership checks for DeleteResourceAsync - anyone can delete any resource
        var id = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.RemoveAsync(resource.Path, resource.FileName, resource.ContentType, Arg.Any<CancellationToken>()).Returns(Result.Success());

        var result = await _service.DeleteResourceAsync(requesterId, id, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _blobStorage.Received(1).RemoveAsync(resource.Path, resource.FileName, resource.ContentType, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateResourceAsync_WithOwner_UpdatesResource() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };
        var updateData = new UpdateResourceData();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.UpdateResourceAsync(ownerId, id, updateData, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _mediaStorage.Received(1).UpdateAsync(
            Arg.Any<ResourceMetadata>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateResourceAsync_WithAnyUserId_UpdatesResource() {
        // NOTE: Source has no ownership checks for UpdateResourceAsync - anyone can update any resource
        var id = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };
        var updateData = new UpdateResourceData();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.UpdateResourceAsync(requesterId, id, updateData, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _mediaStorage.Received(1).UpdateAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ServeResourceAsync_WithOwner_ReturnsResourceData() {
        var id = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
            FileSize = 12345,
            Dimensions = new(100, 100),
        };

        var content = "test image content"u8.ToArray();
        var stream = new MemoryStream(content);
        var downloadResult = new ResourceDownloadResult {
            Content = stream,
            ContentType = "image/png",
            Metadata = new() {
                ["FileName"] = "test.png",
                ["FileSize"] = "12345",
                ["Width"] = "100",
                ["Height"] = "100",
                ["Duration"] = "00:00:00",
            },
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetResourceWithFallbackAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(downloadResult);

        var result = await _service.ServeResourceAsync(id, _ct);

        result.Should().NotBeNull();
        result.ContentType.Should().Be("image/png");
        result.FileName.Should().Be($"{id}.png");
    }

    [Fact]
    public async Task ServeResourceAsync_WithPublicResource_ReturnsResourceData() {
        var id = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
            FileSize = 12345,
        };

        var content = "test image content"u8.ToArray();
        var stream = new MemoryStream(content);
        var downloadResult = new ResourceDownloadResult {
            Content = stream,
            ContentType = "image/png",
            Metadata = new() {
                ["FileName"] = "test.png",
                ["FileSize"] = "12345",
                ["Width"] = "0",
                ["Height"] = "0",
                ["Duration"] = "00:00:00",
            },
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetResourceWithFallbackAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(downloadResult);

        var result = await _service.ServeResourceAsync(id, _ct);

        result.Should().NotBeNull();
        result.ContentType.Should().Be("image/png");
    }

    [Fact]
    public async Task ServeResourceAsync_WithAnyResource_ReturnsResourceData() {
        // NOTE: Source has no ownership checks for ServeResourceAsync - all resources are accessible
        var id = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        var downloadResult = new ResourceDownloadResult {
            Content = new MemoryStream("content"u8.ToArray()),
            ContentType = "image/png",
            Metadata = new() {
                ["FileName"] = "test.png",
                ["FileSize"] = "1234",
                ["Width"] = "100",
                ["Height"] = "100",
                ["Duration"] = "00:00:00",
            },
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetResourceWithFallbackAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(downloadResult);

        var result = await _service.ServeResourceAsync(id, _ct);

        result.Should().NotBeNull();
        await _blobStorage.Received(1).GetResourceWithFallbackAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetResourceAsync_WithOwner_ReturnsResourceInfo() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(ownerId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
        result.FileName.Should().Be("test.png");
    }

    [Fact]
    public async Task GetResourceAsync_WithAnyUserId_ReturnsResource() {
        // NOTE: Source has no ownership checks for GetResourceAsync - all resources are accessible
        var id = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task FindResourcesAsync_WithOwnerId_FiltersCorrectly() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = 0,
            Take = 10,
        };
        var resources = new[] {
            new ResourceMetadata { Id = Guid.CreateVersion7(), FileName = "test1.png" },
            new ResourceMetadata { Id = Guid.CreateVersion7(), FileName = "test2.png" },
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = resources, TotalCount = 2 });

        var response = await _service.FindResourcesAsync(userId, filter, _ct);

        response.Items.Should().HaveCount(2);
        response.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task UploadResourceAsync_WithBlobStorageFailure_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Portrait,
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
        };

        _blobStorage.SaveOriginalAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<string>(null!, "Blob storage error"));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Blob storage error");
        await _mediaStorage.DidNotReceive().AddAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithException_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Portrait,
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
        };

        _blobStorage.SaveOriginalAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<Result<string>>(new InvalidOperationException("Unexpected error")));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Unexpected error during file upload");
    }

    [Fact]
    public async Task FindResourcesAsync_WithNegativeSkip_ClampsToZero() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = -10,
            Take = 50,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = [], TotalCount = 0 });

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.Skip == 0),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithTakeTooLarge_ClampsTo100() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = 0,
            Take = 500,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = [], TotalCount = 0 });

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.Take == 100),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithTakeTooSmall_ClampsTo1() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = 0,
            Take = 0,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = [], TotalCount = 0 });

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.Take == 1),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithDifferentOwnerIdInFilter_SetsIsPublicTrue() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = 0,
            Take = 10,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = [], TotalCount = 0 });

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Any<ResourceFilterData>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithNoOwnerIdInFilter_SetsCurrentUserId() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            Skip = 0,
            Take = 10,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(new ResourceFilterResponse { Items = [], TotalCount = 0 });

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Any<ResourceFilterData>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ServeResourceAsync_WithBlobNotFound_ReturnsNull() {
        var id = Guid.CreateVersion7();

        _blobStorage.GetResourceWithFallbackAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((ResourceDownloadResult?)null);

        var result = await _service.ServeResourceAsync(id, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetResourceAsync_WithPublicPublishedResourceAndNonOwner_ReturnsResource() {
        var id = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetResourceAsync_WithAnyResource_ReturnsResource() {
        // NOTE: Source has no ownership or publish status checks - all resources are accessible
        var id = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task UpdateResourceAsync_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var userId = Guid.CreateVersion7();
        var updateData = new UpdateResourceData();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ResourceMetadata?)null);

        var result = await _service.UpdateResourceAsync(userId, id, updateData, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
    }

    [Fact]
    public async Task UpdateResourceAsync_UpdatesOnlySetFields() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };
        var updateData = new UpdateResourceData();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        await _service.UpdateResourceAsync(ownerId, id, updateData, _ct);

        await _mediaStorage.Received(1).UpdateAsync(
            Arg.Any<ResourceMetadata>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithBlobStorageFailure_ReturnsFailure() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "bcde/01234567890abcdef",
            FileName = "test.png",
            ContentType = "image/png",
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.RemoveAsync(resource.Path, resource.FileName, resource.ContentType, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Blob deletion failed"));

        var result = await _service.DeleteResourceAsync(ownerId, id, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Blob deletion failed");
        await _mediaStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithWebmVideo_SetsPrimaryContentTypeToMp4() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Background,
            ContentType = "video/webm",
            FileName = "test-video.webm",
            Stream = new MemoryStream("test content"u8.ToArray()),
        };

        // Act
        var result = await _service.UploadResourceAsync(userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ContentType.Should().Be("video/mp4"); // PRIMARY format
        result.Value.FileName.Should().Be("test-video.webm"); // Original filename preserved
    }

    [Fact]
    public async Task UploadResourceAsync_WithJpegImage_SetsPrimaryContentTypeToPng() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            Role = ResourceRole.Portrait,
            ContentType = "image/jpeg",
            FileName = "test-image.jpg",
            Stream = new MemoryStream("test content"u8.ToArray()),
        };

        // Act
        var result = await _service.UploadResourceAsync(userId, data, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ContentType.Should().Be("image/png"); // PRIMARY format
        result.Value.FileName.Should().Be("test-image.jpg"); // Original filename preserved
    }
}
