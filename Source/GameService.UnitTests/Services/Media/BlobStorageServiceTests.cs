namespace VttTools.GameService.Services.Media;

public class BlobStorageServiceTests {
    private readonly BlobServiceClient _blobServiceClient = Substitute.For<BlobServiceClient>();
    private readonly BlobContainerClient _blobContainerClient = Substitute.For<BlobContainerClient>();
    private readonly BlobClient _blobClient = Substitute.For<BlobClient>();
    private readonly BlobStorageService _service;
    private readonly BlobContentInfo _blobContentInfo = Substitute.For<BlobContentInfo>();
    private readonly Response _response = Substitute.For<Response>();

    public BlobStorageServiceTests() {
        _blobServiceClient.GetBlobContainerClient("images").Returns(_blobContainerClient);
        _blobServiceClient.CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, Arg.Any<CancellationToken>())
                          .Returns(Response.FromValue(_blobContainerClient, _response));
        _blobContainerClient.GetBlobClient(Arg.Any<string>()).Returns(_blobClient);
        _blobClient.UploadAsync(Arg.Any<Stream>(), true, Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(_blobContentInfo, _response));
        _service = new(_blobServiceClient);
    }

    [Fact]
    public async Task UploadImageAsync_UploadsFileAndReturnsUrl() {
        // Arrange
        const string fileName = "test-image.png";
        var content = "test image content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        _blobContainerClient.ExistsAsync(Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(true, Substitute.For<Response>()));

        // Act
        var result = await _service.UploadImageAsync(stream, fileName, TestContext.Current.CancellationToken);

        // Assert
        result.Should().StartWith("/uploads/");
        result.Should().Contain("test-image_");
        result.Should().EndWith(".png");

        _blobServiceClient.Received(1).GetBlobContainerClient("images");
        await _blobClient.Received(1).UploadAsync(Arg.Any<Stream>(), true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UploadImageAsync_CreatesContainerIfNotExists() {
        // Arrange
        const string fileName = "test-image.png";
        var content = "test image content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        _blobContainerClient.ExistsAsync(Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(false, _response));

        // Act
        var result = await _service.UploadImageAsync(stream, fileName, TestContext.Current.CancellationToken);

        // Assert
        result.Should().StartWith("/uploads/");

        await _blobServiceClient.Received(1).CreateBlobContainerAsync("images", PublicAccessType.BlobContainer, null, Arg.Any<CancellationToken>());
        await _blobClient.Received(1).UploadAsync(Arg.Any<Stream>(), true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteImageAsync_DeletesFileFromBlobStorage() {
        // Arrange
        const string imageUrl = "/uploads/test-image_abc123.png";

        _blobClient.DeleteIfExistsAsync(
                DeleteSnapshotsOption.IncludeSnapshots,
                null,
                Arg.Any<CancellationToken>())
            .Returns(Response.FromValue(true, Substitute.For<Response>()));

        // Act
        await _service.DeleteImageAsync(imageUrl, TestContext.Current.CancellationToken);

        // Assert
        await _blobClient.Received(1).DeleteIfExistsAsync(
            DeleteSnapshotsOption.IncludeSnapshots,
            null,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteImageAsync_WithInvalidUrl_DoesNothing() {
        // Arrange
        const string imageUrl = "/invalid-path-with-no-filename";

        // Act
        await _service.DeleteImageAsync(imageUrl, TestContext.Current.CancellationToken);

        // Assert
        await _blobClient.DidNotReceive().DeleteIfExistsAsync(
            Arg.Any<DeleteSnapshotsOption>(),
            Arg.Any<BlobRequestConditions>(),
            Arg.Any<CancellationToken>());
    }
}