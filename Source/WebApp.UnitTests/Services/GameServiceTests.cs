namespace VttTools.WebApp.Services;

internal sealed class MockHttpMessageHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler)
    : HttpMessageHandler {
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => handler(request, cancellationToken);
}

public class GameServiceTests {
    [Fact]
    public async Task GetAdventuresAsync_WhenApiReturnsAdventures_ReturnsAdventureArray() {
        // Arrange
        var expectedAdventures = new Adventure[]
        {
            new() { Name = "Adventure 1", OwnerId = Guid.NewGuid() },
            new() { Name = "Adventure 2", OwnerId = Guid.NewGuid() },
        };

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/adventures");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedAdventures),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.GetAdventuresAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedAdventures);
    }

    [Fact]
    public async Task GetAdventuresAsync_WhenApiReturnsNull_ReturnsEmptyArray() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/adventures");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create<Adventure[]>(null!),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.GetAdventuresAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAdventuresAsync_WhenApiCallFails_ThrowsException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((_, _) => Task.FromException<HttpResponseMessage>(new HttpRequestException("Network error")));

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act & Assert
        var act = client.GetAdventuresAsync;
        await act.Should().ThrowAsync<HttpRequestException>().WithMessage("Network error");
    }

    [Fact]
    public async Task CreateAdventureAsync_WhenSuccessful_ReturnsAdventureId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Visibility = Visibility.Public,
        };
        var expectedResponse = new Adventure {
            Name = "New Adventure",
            OwnerId = Guid.NewGuid(),
            Visibility = Visibility.Public,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be("/api/adventures");

            var response = new HttpResponseMessage(HttpStatusCode.Created) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.CreateAdventureAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task CreateAdventureAsync_WhenFails_ReturnsFailureResult() {
        // Arrange
        var request = new CreateAdventureRequest {
            Name = "New Adventure",
            Visibility = Visibility.Public,
        };

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.BadRequest) {
                Content = new StringContent("Invalid request"),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.CreateAdventureAsync(request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors.First().Message.Should().Be("Failed to create adventure.");
    }

    [Fact]
    public async Task UpdateAdventureAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest {
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Put);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.UpdateAdventureAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAdventureAsync_WhenFails_ReturnsFailureResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest {
            Name = "Updated Adventure",
            Visibility = Visibility.Public,
        };

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.UpdateAdventureAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors.First().Message.Should().Be("Failed to update adventure.");
    }

    [Fact]
    public async Task DeleteAdventureAsync_WhenSuccessful_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Delete);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.DeleteAdventureAsync(adventureId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAdventureAsync_WhenFails_ReturnsFalse() {
        // Arrange
        var adventureId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.DeleteAdventureAsync(adventureId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetEpisodesAsync_WhenApiReturnsEpisodes_ReturnsEpisodeArray() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var expectedEpisodes = new Episode[]
        {
            new() { Id = Guid.NewGuid(), Name = "Episode 1", ParentId = adventureId },
            new() { Id = Guid.NewGuid(), Name = "Episode 2", ParentId = adventureId },
        };

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/episodes");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedEpisodes),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.GetEpisodesAsync(adventureId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedEpisodes);
    }

    [Fact]
    public async Task CreateEpisodeAsync_WhenSuccessful_ReturnsEpisodeId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var episodeId = Guid.NewGuid();
        var request = new CreateEpisodeRequest {
            Name = "New Episode",
            AdventureId = adventureId,
        };
        var expectedResponse = new Episode {
            Name = "New Episode",
            OwnerId = Guid.NewGuid(),
            ParentId = adventureId,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/episodes");

            var response = new HttpResponseMessage(HttpStatusCode.Created) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.CreateEpisodeAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task UpdateEpisodeAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var request = new UpdateEpisodeRequest {
            Name = "Updated Episode",
            Visibility = Visibility.Public,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Put);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/episodes/{episodeId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.UpdateEpisodeAsync(episodeId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteEpisodeAsync_WhenSuccessful_ReturnsTrue() {
        // Arrange
        var episodeId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Delete);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/episodes/{episodeId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.DeleteEpisodeAsync(episodeId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CloneEpisodeAsync_WhenSuccessful_ReturnsClonedEpisodeId() {
        // Arrange
        var episodeId = Guid.NewGuid();
        var request = new CloneEpisodeRequest {
            Name = "Updated Episode",
        };
        var expectedResponse = new Episode {
            Name = "Updated Episode",
            OwnerId = Guid.NewGuid(),
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/episodes/{episodeId}/clone");

            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.CloneEpisodeAsync(episodeId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task GetAssetsAsync_WhenApiReturnsAssets_ReturnsAssetArray() {
        // Arrange
        var expectedAssets = new Asset[]
        {
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
        var client = new GameService(httpClient);

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
        var client = new GameService(httpClient);

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
        var client = new GameService(httpClient);

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
        var client = new GameService(httpClient);

        // Act
        var result = await client.DeleteAssetAsync(assetId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CloneAdventureAsync_WhenSuccessful_ReturnsClonedAdventureId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new CloneAdventureRequest {
            Name = "Updated Adventure",
        };
        var expectedResponse = new Adventure {
            Name = "Updated Adventure",
            OwnerId = Guid.NewGuid(),
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/clone");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameService(httpClient);

        // Act
        var result = await client.CloneAdventureAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }
}