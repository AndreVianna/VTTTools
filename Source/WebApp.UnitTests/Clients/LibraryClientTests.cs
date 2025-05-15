namespace VttTools.WebApp.Clients;

public class LibraryClientTests {
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
        var client = new LibraryClient(httpClient);

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
        var client = new LibraryClient(httpClient);

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
        var client = new LibraryClient(httpClient);

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
            Description = "Adventure description",
            Type = AdventureType.Survival,
        };
        var expectedResponse = new AdventureListItem {
            Id = adventureId,
            Name = "New Adventure",
            OwnerId = Guid.NewGuid(),
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsListed = false,
            IsPublic = false,
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
        var client = new LibraryClient(httpClient);

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
            Description = "Adventure description",
            Type = AdventureType.Survival,
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
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.CreateAdventureAsync(request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors[0].Message.Should().Be("Failed to create adventure.");
    }

    [Fact]
    public async Task UpdateAdventureAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var request = new UpdateAdventureRequest {
            Name = "Updated Adventure",
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsListed = true,
            IsPublic = true,
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
        var client = new LibraryClient(httpClient);

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
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsListed = true,
            IsPublic = true,
        };

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.UpdateAdventureAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors[0].Message.Should().Be("Failed to update adventure.");
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
        var client = new LibraryClient(httpClient);

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
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.DeleteAdventureAsync(adventureId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetScenesAsync_WhenApiReturnsScenes_ReturnsSceneArray() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var expectedScenes = new Scene[]
                             {
                                 new() { Id = Guid.NewGuid(), Name = "Scene 1", AdventureId = adventureId },
                                 new() { Id = Guid.NewGuid(), Name = "Scene 2", AdventureId = adventureId },
                             };

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/scenes");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedScenes),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.GetScenesAsync(adventureId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedScenes);
    }

    [Fact]
    public async Task CreateSceneAsync_WhenSuccessful_ReturnsSceneId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddNewSceneRequest {
            Name = "New Scene",
            Description = "Scene description",
        };
        var expectedResponse = new Scene {
            Id = sceneId,
            Name = "New Scene",
            OwnerId = Guid.NewGuid(),
            AdventureId = adventureId,
            Description = "Scene description",
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/scenes");

            var response = new HttpResponseMessage(HttpStatusCode.Created) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.CreateSceneAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }

    [Fact]
    public async Task UpdateSceneAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var sceneId = Guid.NewGuid();
        var request = new UpdateSceneRequest {
            Name = "Updated Scene",
            Description = "Updated description",
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Put);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/scenes/{sceneId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.UpdateSceneAsync(sceneId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task RemoveSceneAsync_WhenSuccessful_ReturnsTrue() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Delete);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/scenes/{sceneId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.RemoveSceneAsync(adventureId, sceneId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CloneSceneAsync_WhenSuccessful_ReturnsClonedSceneId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var originalId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new AddClonedSceneRequest {
            TemplateId = originalId,
            Name = "Updated Scene",
        };
        var expectedResponse = new Scene {
            Id = sceneId,
            Name = "Updated Scene",
            AdventureId = adventureId,
            OwnerId = Guid.NewGuid(),
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/scenes/clone");

            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.CloneSceneAsync(adventureId, request);

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
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.GetAssetsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedAssets);
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
        var client = new LibraryClient(httpClient);

        // Act
        var result = await client.CloneAdventureAsync(adventureId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
    }
}