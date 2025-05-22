using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

public class AssetsServerHttpClientTests {
    private static readonly JsonSerializerOptions _options = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
    };

    [Fact]
    public async Task GetAssetsAsync_WhenApiReturnsAssets_ReturnsAssetArray() {
        // Arrange
        var expectedAssets = new Asset[] {
            new() { Id = Guid.NewGuid(), Name = "Asset 1", OwnerId = Guid.NewGuid() },
            new() { Id = Guid.NewGuid(), Name = "Asset 2", OwnerId = Guid.NewGuid() },
        };

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/assets");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedAssets),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsServerHttpClient(httpClient, _options);

        // Act
        var result = await client.GetAssetsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedAssets);
    }

    [Fact]
    public async Task CreateAssetAsync_WhenSuccessful_ReturnsAssetId() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new CreateAssetRequest {
            Name = "New Asset",
        };
        var expectedResponse = new Asset {
            Id = assetId,
            Name = "New Asset",
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be("/api/assets");

            var response = new HttpResponseMessage(HttpStatusCode.Created) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsServerHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateAssetAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task UpdateAssetAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new UpdateAssetRequest {
            Name = "Updated Asset",
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Put);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/assets/{assetId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsServerHttpClient(httpClient, _options);

        // Act
        var result = await client.UpdateAssetAsync(assetId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAssetAsync_WhenSuccessful_ReturnsTrue() {
        // Arrange
        var assetId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Delete);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/assets/{assetId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsServerHttpClient(httpClient, _options);

        // Act
        var result = await client.DeleteAssetAsync(assetId);

        // Assert
        result.Should().BeTrue();
    }
}