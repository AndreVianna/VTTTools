using UpdateAssetRequest = VttTools.Assets.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

public class AssetsHttpClientTests {
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
        var owner1 = Guid.NewGuid();
        var owner2 = Guid.NewGuid();
        var expectedAssets = new Asset[] {
            new() { Id = Guid.NewGuid(), Name = "Asset 1", OwnerId = owner1, Type = AssetType.Character, Description = "Asset 1 desc", IsPublished = false, IsPublic = false },
            new() { Id = Guid.NewGuid(), Name = "Asset 2", OwnerId = owner2, Type = AssetType.Object, Description = "Asset 2 desc", IsPublished = true, IsPublic = true },
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
        var client = new AssetsHttpClient(httpClient, _options);

        // Act
        var result = await client.GetAssetsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Should().BeEquivalentTo(new AssetListItem {
            Id = expectedAssets[0].Id,
            Name = expectedAssets[0].Name,
            Type = expectedAssets[0].Type,
        });
        result[1].Should().BeEquivalentTo(new AssetListItem {
            Id = expectedAssets[1].Id,
            Name = expectedAssets[1].Name,
            Type = expectedAssets[1].Type,
        });
    }

    [Fact]
    public async Task GetAssetsAsync_WhenApiReturnsNull_ThrowsArgumentNullException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/assets");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create<Asset[]>(null!),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsHttpClient(httpClient, _options);

        // Act & Assert
        // NOTE: Implementation uses IsNotNull() which throws ArgumentNullException for null API responses
        var act = client.GetAssetsAsync;
        await act.Should().ThrowAsync<ArgumentNullException>();
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
            OwnerId = Guid.NewGuid(),
            Type = AssetType.Token,
            Description = "New asset description",
            IsPublished = false,
            IsPublic = false,
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
        var client = new AssetsHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateAssetAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(new AssetListItem {
            Id = expectedResponse.Id,
            Name = expectedResponse.Name,
            Type = expectedResponse.Type,
        });
    }

    [Fact]
    public async Task UpdateAssetAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var assetId = Guid.NewGuid();
        var request = new UpdateAssetRequest {
            Name = "Updated Asset",
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Patch);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/assets/{assetId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AssetsHttpClient(httpClient, _options);

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
        var client = new AssetsHttpClient(httpClient, _options);

        // Act
        var result = await client.DeleteAssetAsync(assetId);

        // Assert
        result.Should().BeTrue();
    }
}