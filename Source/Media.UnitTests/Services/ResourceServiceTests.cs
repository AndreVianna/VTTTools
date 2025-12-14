using Microsoft.Extensions.Logging;

namespace VttTools.Media.Services;

public class ResourceServiceTests {
    private readonly IBlobStorage _blobStorage = Substitute.For<IBlobStorage>();
    private readonly IMediaStorage _mediaStorage = Substitute.For<IMediaStorage>();
    private readonly IMediaProcessorService _mediaProcessor = Substitute.For<IMediaProcessorService>();
    private readonly ILogger<ResourceService> _logger = Substitute.For<ILogger<ResourceService>>();
    private readonly ResourceService _service;
    private readonly CancellationToken _ct;

    public ResourceServiceTests() {
        _blobStorage.SaveAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success("uploaded-path"));
        _service = new(_blobStorage, _mediaStorage, _mediaProcessor, _logger);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task UploadResourceAsync_WithValidData_UploadsAndReturnsResourceFile() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test-image.png",
            Stream = new MemoryStream("test content"u8.ToArray()),
        };
        var processedMedia = new ProcessedMedia {
            Stream = new MemoryStream("processed content"u8.ToArray()),
            ContentType = "image/png",
            FileName = "test-image.png",
            FileLength = 100,
            Size = new Common.Model.Size(256, 256),
            Duration = TimeSpan.Zero,
            Thumbnail = null,
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(processedMedia));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ContentType.Should().Be("image/png");
        await _blobStorage.Received(1).SaveAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
        await _mediaStorage.Received(1).AddAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
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
        await _blobStorage.DidNotReceive().SaveAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithOwner_DeletesResource() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.RemoveAsync(resource.Path, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        var result = await _service.DeleteResourceAsync(ownerId, id, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _blobStorage.Received(1).RemoveAsync(resource.Path, Arg.Any<CancellationToken>());
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
        await _blobStorage.DidNotReceive().RemoveAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithNonOwner_ReturnsNotAllowed() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.DeleteResourceAsync(requesterId, id, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _blobStorage.DidNotReceive().RemoveAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateResourceAsync_WithOwner_UpdatesResource() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            Description = "Original description",
        };
        var updateData = new UpdateResourceData {
            Description = Optional<string?>.Some("Updated description"),
            Features = Optional<Map<HashSet<string>>>.Some([.. new Dictionary<string, HashSet<string>> { ["key1"] = ["tag1"] }]),
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.UpdateResourceAsync(ownerId, id, updateData, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _mediaStorage.Received(1).UpdateAsync(
            Arg.Is<ResourceMetadata>(r => r.Description == "Updated description"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateResourceAsync_WithNonOwner_ReturnsNotAllowed() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
        };
        var updateData = new UpdateResourceData {
            Description = Optional<string?>.Some("Updated description"),
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.UpdateResourceAsync(requesterId, id, updateData, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _mediaStorage.DidNotReceive().UpdateAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ServeResourceAsync_WithOwner_ReturnsResourceData() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path.png",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = false,
            FileLength = 12345,
            Size = new Common.Model.Size(100, 100),
        };

        var content = "test image content"u8.ToArray();
        var stream = new MemoryStream(content);
        var downloadResult = new Storage.ResourceDownloadResult {
            Content = stream,
            ContentType = "image/png",
            Metadata = new Dictionary<string, string> {
                ["FileName"] = "test.png",
                ["FileLength"] = "12345",
                ["Width"] = "100",
                ["Height"] = "100",
                ["Duration"] = "00:00:00",
            },
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetAsync(resource.Path, Arg.Any<CancellationToken>()).Returns(downloadResult);

        var result = await _service.ServeResourceAsync(ownerId, id, _ct);

        result.Should().NotBeNull();
        result.ContentType.Should().Be("image/png");
        result.FileName.Should().Be("test.png");
    }

    [Fact]
    public async Task ServeResourceAsync_WithPublicResource_ReturnsResourceData() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path.png",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = true,
            FileLength = 12345,
        };

        var content = "test image content"u8.ToArray();
        var stream = new MemoryStream(content);
        var downloadResult = new Storage.ResourceDownloadResult {
            Content = stream,
            ContentType = "image/png",
            Metadata = new Dictionary<string, string> {
                ["FileName"] = "test.png",
                ["FileLength"] = "12345",
                ["Width"] = "0",
                ["Height"] = "0",
                ["Duration"] = "00:00:00",
            },
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetAsync(resource.Path, Arg.Any<CancellationToken>()).Returns(downloadResult);

        var result = await _service.ServeResourceAsync(requesterId, id, _ct);

        result.Should().NotBeNull();
        result.ContentType.Should().Be("image/png");
    }

    [Fact]
    public async Task ServeResourceAsync_WithPrivateResourceAndNonOwner_ReturnsNull() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path.png",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = false,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.ServeResourceAsync(requesterId, id, _ct);

        result.Should().BeNull();
        await _blobStorage.DidNotReceive().GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetResourceAsync_WithOwner_ReturnsResourceInfo() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path.png",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = false,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(ownerId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
        result.FileName.Should().Be("test.png");
    }

    [Fact]
    public async Task GetResourceAsync_WithPrivateResourceAndNonOwner_ReturnsNull() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path.png",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = false,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task FindResourcesAsync_WithOwnerId_FiltersCorrectly() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            OwnerId = userId,
            Skip = 0,
            Take = 10,
        };
        var resources = new[] {
            new ResourceMetadata { Id = Guid.CreateVersion7(), FileName = "test1.png", OwnerId = userId },
            new ResourceMetadata { Id = Guid.CreateVersion7(), FileName = "test2.png", OwnerId = userId },
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns((resources, 2));

        (var items, var totalCount) = await _service.FindResourcesAsync(userId, filter, _ct);

        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
    }

    [Fact]
    public async Task UploadResourceAsync_WithMediaProcessorFailure_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
            ResourceType = ResourceType.Background,
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<ProcessedMedia>(null!, "Image processing failed"));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Image processing failed");
        await _blobStorage.DidNotReceive().SaveAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithBlobStorageFailure_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
            ResourceType = ResourceType.Background,
        };
        var processedMedia = new ProcessedMedia {
            Stream = new MemoryStream("processed"u8.ToArray()),
            ContentType = "image/png",
            FileName = "test.png",
            FileLength = 100,
            Size = new Common.Model.Size(256, 256),
            Duration = TimeSpan.Zero,
            Thumbnail = null,
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(processedMedia));
        _blobStorage.SaveAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<string>(null!, "Blob storage error"));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Blob storage error");
        await _mediaStorage.DidNotReceive().AddAsync(Arg.Any<ResourceMetadata>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithThumbnail_SavesThumbnail() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
            ResourceType = ResourceType.Background,
        };
        var thumbnail = "thumbnail data"u8.ToArray();
        var processedMedia = new ProcessedMedia {
            Stream = new MemoryStream("processed"u8.ToArray()),
            ContentType = "image/png",
            FileName = "test.png",
            FileLength = 100,
            Size = new Common.Model.Size(256, 256),
            Duration = TimeSpan.Zero,
            Thumbnail = thumbnail,
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(processedMedia));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _blobStorage.Received(1).SaveThumbnailAsync(Arg.Any<string>(), Arg.Is<byte[]>(b => b.Length == thumbnail.Length), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithEmptyThumbnail_DoesNotSaveThumbnail() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
            ResourceType = ResourceType.Background,
        };
        var processedMedia = new ProcessedMedia {
            Stream = new MemoryStream("processed"u8.ToArray()),
            ContentType = "image/png",
            FileName = "test.png",
            FileLength = 100,
            Size = new Common.Model.Size(256, 256),
            Duration = TimeSpan.Zero,
            Thumbnail = [],
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(processedMedia));

        var result = await _service.UploadResourceAsync(userId, data, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _blobStorage.DidNotReceive().SaveThumbnailAsync(Arg.Any<string>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadResourceAsync_WithException_ReturnsFailure() {
        var userId = Guid.CreateVersion7();
        var data = new UploadResourceData {
            ContentType = "image/png",
            FileName = "test.png",
            Stream = new MemoryStream("test"u8.ToArray()),
            ResourceType = ResourceType.Background,
        };

        _mediaProcessor.ProcessAsync(Arg.Any<ResourceType>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<Result<ProcessedMedia>>(new Exception("Unexpected error")));

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
            .Returns(([], 0));

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
            .Returns(([], 0));

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
            .Returns(([], 0));

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.Take == 1),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithDifferentOwnerIdInFilter_SetsIsPublicTrue() {
        var userId = Guid.CreateVersion7();
        var otherUserId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            OwnerId = otherUserId,
            Skip = 0,
            Take = 10,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.IsPublic == true && f.OwnerId == otherUserId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task FindResourcesAsync_WithNoOwnerIdInFilter_SetsCurrentUserId() {
        var userId = Guid.CreateVersion7();
        var filter = new ResourceFilterData {
            OwnerId = null,
            Skip = 0,
            Take = 10,
        };

        _mediaStorage.FilterAsync(Arg.Any<ResourceFilterData>(), Arg.Any<CancellationToken>())
            .Returns(([], 0));

        await _service.FindResourcesAsync(userId, filter, _ct);

        await _mediaStorage.Received(1).FilterAsync(
            Arg.Is<ResourceFilterData>(f => f.OwnerId == userId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ServeResourceAsync_WithNotFoundResource_ReturnsNull() {
        var id = Guid.CreateVersion7();
        var userId = Guid.CreateVersion7();

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ResourceMetadata?)null);

        var result = await _service.ServeResourceAsync(userId, id, _ct);

        result.Should().BeNull();
        await _blobStorage.DidNotReceive().GetAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ServeResourceAsync_WithBlobNotFound_ReturnsNull() {
        var id = Guid.CreateVersion7();
        var userId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = userId,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.GetAsync(resource.Path, Arg.Any<CancellationToken>()).Returns((ResourceDownloadResult?)null);

        var result = await _service.ServeResourceAsync(userId, id, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetResourceAsync_WithPublicPublishedResourceAndNonOwner_ReturnsResource() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = true,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetResourceAsync_WithPublicUnpublishedResourceAndNonOwner_ReturnsNull() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            IsPublic = true,
            IsPublished = false,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        var result = await _service.GetResourceAsync(requesterId, id, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateResourceAsync_WithNotFound_ReturnsNotFound() {
        var id = Guid.CreateVersion7();
        var userId = Guid.CreateVersion7();
        var updateData = new UpdateResourceData {
            Description = Optional<string?>.Some("New description"),
        };

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
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
            Description = "Original",
            IsPublic = false,
        };
        var updateData = new UpdateResourceData {
            Description = Optional<string?>.Some("Updated"),
            IsPublic = Optional<bool>.None,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);

        await _service.UpdateResourceAsync(ownerId, id, updateData, _ct);

        await _mediaStorage.Received(1).UpdateAsync(
            Arg.Is<ResourceMetadata>(r => r.Description == "Updated" && !r.IsPublic),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteResourceAsync_WithBlobStorageFailure_ReturnsFailure() {
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = id,
            Path = "images/test/path",
            ResourceType = ResourceType.Background,
            FileName = "test.png",
            ContentType = "image/png",
            OwnerId = ownerId,
        };

        _mediaStorage.FindByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobStorage.RemoveAsync(resource.Path, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Blob deletion failed"));

        var result = await _service.DeleteResourceAsync(ownerId, id, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("Blob deletion failed");
        await _mediaStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}