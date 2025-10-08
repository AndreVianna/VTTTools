namespace VttTools.Media.Services;

public class AzureResourceServiceTests {
    private readonly BlobServiceClient _blobServiceClient = Substitute.For<BlobServiceClient>();
    private readonly BlobContainerClient _blobContainerClient = Substitute.For<BlobContainerClient>();
    private readonly BlobClient _blobClient = Substitute.For<BlobClient>();
    private readonly AzureResourceService _service;
    private readonly BlobContentInfo _blobContentInfo = Substitute.For<BlobContentInfo>();
    private readonly Response _response = Substitute.For<Response>();
    private readonly CancellationToken _ct;
    private readonly IMediaStorage _mediaStorage = Substitute.For<IMediaStorage>();

    public AzureResourceServiceTests() {
        _blobServiceClient.GetBlobContainerClient("images").Returns(_blobContainerClient);
        _blobServiceClient.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, Arg.Any<CancellationToken>())
                          .Returns(Response.FromValue(_blobContainerClient, _response));
        _blobContainerClient.GetBlobClient(Arg.Any<string>()).Returns(_blobClient);
        _blobClient.UploadAsync(Arg.Any<Stream>(), Arg.Any<BlobUploadOptions>(), Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(_blobContentInfo, _response));
        _service = new(_blobServiceClient, _mediaStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task UploadImageAsync_UploadsFileAndReturnsUrl() {
        // Arrange
        var id = Guid.NewGuid();
        const string fileName = "test-image.png";
        var file = new AddResourceData {
            Path = $"images/{id}/{fileName}",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                FileLength = 12345,
                ImageSize = new(100, 100),
                Duration = TimeSpan.Zero,
                FileName = fileName,
            },
        };
        var content = "test image content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        _blobContainerClient.ExistsAsync(Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(true, Substitute.For<Response>()));

        // Act
        var result = await _service.SaveResourceAsync(file, stream, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        _blobServiceClient.Received(1).GetBlobContainerClient("images");
        await _blobClient.Received(1).UploadAsync(Arg.Any<Stream>(), Arg.Any<BlobUploadOptions>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadImageAsync_CreatesContainerIfNotExists() {
        // Arrange
        var id = Guid.NewGuid();
        const string fileName = "test-image.png";
        var file = new AddResourceData {
            Path = $"images/{id}/{fileName}",
            Metadata = new ResourceMetadata {
                ContentType = "image/png",
                FileLength = 12345,
                ImageSize = new(100, 100),
                Duration = TimeSpan.Zero,
                FileName = fileName,
            },
        };
        var content = "test image content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        _blobContainerClient.ExistsAsync(Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(false, _response));

        // Act
        var result = await _service.SaveResourceAsync(file, stream, _ct);

        // Assert
        result.IsSuccessful.Should().BeTrue();

        await _blobServiceClient.Received(1).CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, Arg.Any<CancellationToken>());
        await _blobClient.Received(1).UploadAsync(Arg.Any<Stream>(), Arg.Any<BlobUploadOptions>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteImageAsync_DeletesFileFromBlobStorage() {
        // Arrange
        var id = Guid.NewGuid();
        var resource = new Resource {
            Id = id,
            Path = "test/path",
            Type = ResourceType.Image,
            Metadata = new ResourceMetadata {
                FileName = "test.png",
                ContentType = "image/png",
            },
        };

        _mediaStorage.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(resource);
        _blobClient.DeleteIfExistsAsync(
                DeleteSnapshotsOption.IncludeSnapshots,
                null,
                Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(true, Substitute.For<Response>()));

        // Act
        await _service.DeleteResourceAsync(id, _ct);

        // Assert
        await _blobClient.Received(1).DeleteIfExistsAsync(
            DeleteSnapshotsOption.IncludeSnapshots,
            null,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteImageAsync_WithInvalidId_DoesNothing() {
        // Arrange
        var id = Guid.NewGuid();

        _mediaStorage.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((Resource?)null);

        // Act
        var result = await _service.DeleteResourceAsync(id, _ct);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _blobClient.DidNotReceive().DeleteIfExistsAsync(
            Arg.Any<DeleteSnapshotsOption>(),
            Arg.Any<BlobRequestConditions>(),
            Arg.Any<CancellationToken>());
    }
}