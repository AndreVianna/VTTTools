using System.Net;
using System.Net.Http.Json;

namespace VttTools.Admin.Resources.Clients;

public sealed class MediaServiceClientTests {
    private readonly IHttpClientFactory _mockHttpClientFactory;
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ILogger<MediaServiceClient> _mockLogger;
    private readonly Guid _masterUserId;

    public MediaServiceClientTests() {
        _mockHttpClientFactory = Substitute.For<IHttpClientFactory>();
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _mockLogger = Substitute.For<ILogger<MediaServiceClient>>();
        _masterUserId = Guid.CreateVersion7();

        _mockOptions.Value.Returns(new PublicLibraryOptions {
            MasterUserId = _masterUserId,
        });
    }

    #region ListUnpublishedResourcesAsync Tests

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WithValidRequest_ReturnsSuccess() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var mediaResponse = new {
            Items = new[] {
                new {
                    Id = resourceId,
                    Role = ResourceRole.Portrait,
                    FileName = "test.png",
                    ContentType = "image/png",
                    FileSize = 1024UL,
                },
            },
            TotalCount = 1,
            Skip = 0,
            Take = 50,
        };

        var httpClient = CreateHttpClient(HttpStatusCode.OK, mediaResponse);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest {
            Skip = 0,
            Take = 50,
        };

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Items.Should().HaveCount(1);
        result.Value.Items[0].Id.Should().Be(resourceId);
        result.Value.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WithAllFilters_BuildsCorrectQueryString() {
        // Arrange
        var mediaResponse = new {
            Items = Array.Empty<object>(),
            TotalCount = 0,
            Skip = 10,
            Take = 20,
        };

        var httpClient = CreateHttpClient(HttpStatusCode.OK, mediaResponse);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest {
            Role = ResourceRole.Portrait,
            SearchText = "dragon",
            Skip = 10,
            Take = 20,
        };

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        httpClient.RequestedUrl.Should().Contain("resourceType=Portrait");
        httpClient.RequestedUrl.Should().Contain("contentKind=Character");
        httpClient.RequestedUrl.Should().Contain("category=Fantasy");
        httpClient.RequestedUrl.Should().Contain("searchText=dragon");
        httpClient.RequestedUrl.Should().Contain("isPublished=false");
        httpClient.RequestedUrl.Should().Contain("isPublic=true");
        httpClient.RequestedUrl.Should().Contain("skip=10");
        httpClient.RequestedUrl.Should().Contain("take=20");
    }

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WithoutIsPublishedFilter_DefaultsToFalse() {
        // Arrange
        var mediaResponse = new {
            Items = Array.Empty<object>(),
            TotalCount = 0,
            Skip = 0,
            Take = 50,
        };

        var httpClient = CreateHttpClient(HttpStatusCode.OK, mediaResponse);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest {
            Skip = 0,
            Take = 50,
        };

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        httpClient.RequestedUrl.Should().Contain("isPublished=false");
    }

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WithSpecialCharacters_EscapesQueryParams() {
        // Arrange
        var mediaResponse = new {
            Items = Array.Empty<object>(),
            TotalCount = 0,
            Skip = 0,
            Take = 50,
        };

        var httpClient = CreateHttpClient(HttpStatusCode.OK, mediaResponse);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest {
            SearchText = "dragon & knight",
        };

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        httpClient.RequestedUrl.Should().Contain("dragon%20%26%20knight");
    }

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WhenHttpRequestFails_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.InternalServerError, "Server error");
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest();

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Server error");
    }

    [Fact]
    public async Task ListUnpublishedResourcesAsync_WhenResponseIsNull_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.OK, null);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var request = new ResourceFilterRequest();

        // Act
        var result = await client.ListUnpublishedResourcesAsync(request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Failed to parse response");
    }

    #endregion

    #region UploadResourceAsync Tests

    [Fact]
    public async Task UploadResourceAsync_WithValidData_ReturnsSuccess() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var uploadResponse = new { Id = resourceId };

        var httpClient = CreateHttpClient(HttpStatusCode.OK, uploadResponse);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var data = new byte[] { 1, 2, 3, 4 };

        // Act
        var result = await client.UploadResourceAsync(
            data,
            "test.png",
            "image/png",
            ResourceRole.Portrait,
            TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(resourceId);
    }

    [Fact]
    public async Task UploadResourceAsync_WhenUploadFails_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.BadRequest, "Invalid file");
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var data = new byte[] { 1, 2, 3, 4 };

        // Act
        var result = await client.UploadResourceAsync(
            data,
            "test.png",
            "image/png",
            ResourceRole.Portrait,
            TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Invalid file");
    }

    [Fact]
    public async Task UploadResourceAsync_WhenResponseIsNull_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.OK, null);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var data = new byte[] { 1, 2, 3, 4 };

        // Act
        var result = await client.UploadResourceAsync(
            data,
            "test.png",
            "image/png",
            ResourceRole.Portrait,
            TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Failed to parse upload response");
    }

    #endregion

    #region UpdateResourceAsync Tests

    [Fact]
    public async Task UpdateResourceAsync_WithValidRequest_ReturnsSuccess() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.OK, new { });
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();
        var request = new UpdateResourceRequest();

        // Act
        var result = await client.UpdateResourceAsync(resourceId, request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        httpClient.RequestedUrl.Should().Contain($"/api/resources/{resourceId}");
    }

    [Fact]
    public async Task UpdateResourceAsync_AddsUserIdHeader() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.OK, new { });
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();
        var request = new UpdateResourceRequest();

        // Act
        await client.UpdateResourceAsync(resourceId, request, TestContext.Current.CancellationToken);

        // Assert
        httpClient.DefaultRequestHeaders.Contains("X-User-Id").Should().BeTrue();
        httpClient.DefaultRequestHeaders.GetValues("X-User-Id").Should().Contain(_masterUserId.ToString());
    }

    [Fact]
    public async Task UpdateResourceAsync_WhenUpdateFails_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.NotFound, "Resource not found");
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();
        var request = new UpdateResourceRequest();

        // Act
        var result = await client.UpdateResourceAsync(resourceId, request, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Resource not found");
    }

    #endregion

    #region DeleteResourceAsync Tests

    [Fact]
    public async Task DeleteResourceAsync_WithValidId_ReturnsSuccess() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.NoContent, null);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();

        // Act
        var result = await client.DeleteResourceAsync(resourceId, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        httpClient.RequestedUrl.Should().Contain($"/api/resources/{resourceId}");
    }

    [Fact]
    public async Task DeleteResourceAsync_AddsUserIdHeader() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.NoContent, null);
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();

        // Act
        await client.DeleteResourceAsync(resourceId, TestContext.Current.CancellationToken);

        // Assert
        httpClient.DefaultRequestHeaders.Contains("X-User-Id").Should().BeTrue();
        httpClient.DefaultRequestHeaders.GetValues("X-User-Id").Should().Contain(_masterUserId.ToString());
    }

    [Fact]
    public async Task DeleteResourceAsync_WhenDeleteFails_ReturnsFailure() {
        // Arrange
        var httpClient = CreateHttpClient(HttpStatusCode.NotFound, "Resource not found");
        _mockHttpClientFactory.CreateClient("MediaService").Returns(httpClient);

        var client = new MediaServiceClient(_mockHttpClientFactory, _mockOptions, _mockLogger);
        var resourceId = Guid.CreateVersion7();

        // Act
        var result = await client.DeleteResourceAsync(resourceId, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Resource not found");
    }

    #endregion

    #region Helper Methods

    private static TestHttpClient CreateHttpClient(HttpStatusCode statusCode, object? responseContent) {
        var client = new TestHttpClient(statusCode, responseContent);
        return client;
    }

    private sealed class TestHttpClient : HttpClient {
        public string? RequestedUrl { get; private set; }

        public TestHttpClient(HttpStatusCode statusCode, object? responseContent)
            : base(new TestMessageHandler(statusCode, responseContent)) {
            BaseAddress = new("http://localhost");
        }

        public new Task<HttpResponseMessage> GetAsync(string requestUri, CancellationToken cancellationToken) {
            RequestedUrl = requestUri;
            return base.GetAsync(requestUri, cancellationToken);
        }

        public new Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content, CancellationToken cancellationToken) {
            RequestedUrl = requestUri;
            return base.PostAsync(requestUri, content, cancellationToken);
        }

        public new Task<HttpResponseMessage> PatchAsync(string requestUri, HttpContent content, CancellationToken cancellationToken) {
            RequestedUrl = requestUri;
            return base.PatchAsync(requestUri, content, cancellationToken);
        }

        public new Task<HttpResponseMessage> DeleteAsync(string requestUri, CancellationToken cancellationToken) {
            RequestedUrl = requestUri;
            return base.DeleteAsync(requestUri, cancellationToken);
        }
    }

    private sealed class TestMessageHandler(HttpStatusCode statusCode, object? responseContent) : HttpMessageHandler {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
            var response = new HttpResponseMessage(statusCode);
            if (responseContent is not null) {
                response.Content = responseContent is string stringContent
                    ? new StringContent(stringContent)
                    : JsonContent.Create(responseContent, options: JsonDefaults.Options);
            }
            return Task.FromResult(response);
        }
    }

    #endregion
}
