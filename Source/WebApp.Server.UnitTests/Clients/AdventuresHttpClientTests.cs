namespace VttTools.WebApp.Clients;

public class AdventuresHttpClientTests {
    private static readonly JsonSerializerOptions _options = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
    };

    [Fact]
    public async Task GetAdventuresAsync_WhenApiReturnsAdventures_ReturnsAdventureArray() {
        // Arrange
        var owner1 = Guid.NewGuid();
        var owner2 = Guid.NewGuid();
        var expectedAdventures = new Adventure[] {
            new() { Id = Guid.NewGuid(), Name = "Adventure 1", OwnerId = owner1, Type = AdventureType.Survival, Description = "Test description", IsPublished = false, IsPublic = false, Scenes = [] },
            new() { Id = Guid.NewGuid(), Name = "Adventure 2", OwnerId = owner2, Type = AdventureType.OpenWorld, Description = "Test description 2", IsPublished = true, IsPublic = true, Scenes = [] },
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.GetAdventuresAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Should().BeEquivalentTo(new AdventureListItem {
            Id = expectedAdventures[0].Id,
            Name = expectedAdventures[0].Name,
            OwnerId = expectedAdventures[0].OwnerId,
            Type = expectedAdventures[0].Type,
            Description = expectedAdventures[0].Description,
            IsPublished = expectedAdventures[0].IsPublished,
            IsPublic = expectedAdventures[0].IsPublic,
            ScenesCount = expectedAdventures[0].Scenes.Count,
        });
        result[1].Should().BeEquivalentTo(new AdventureListItem {
            Id = expectedAdventures[1].Id,
            Name = expectedAdventures[1].Name,
            OwnerId = expectedAdventures[1].OwnerId,
            Type = expectedAdventures[1].Type,
            Description = expectedAdventures[1].Description,
            IsPublished = expectedAdventures[1].IsPublished,
            IsPublic = expectedAdventures[1].IsPublic,
            ScenesCount = expectedAdventures[1].Scenes.Count,
        });
    }

    [Fact]
    public async Task GetAdventuresAsync_WhenApiReturnsNull_ThrowsArgumentNullException() {
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act & Assert
        // NOTE: Implementation uses IsNotNull() which throws ArgumentNullException for null API responses
        var act = client.GetAdventuresAsync;
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task GetAdventuresAsync_WhenApiCallFails_ThrowsException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((_, _) => Task.FromException<HttpResponseMessage>(new HttpRequestException("Network error")));

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AdventuresHttpClient(httpClient, _options);

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
        var ownerId = Guid.NewGuid();
        var expectedResponse = new Adventure {
            Id = adventureId,
            Name = "New Adventure",
            OwnerId = ownerId,
            Description = "Adventure description",
            Type = AdventureType.Survival,
            IsPublished = false,
            IsPublic = false,
            Scenes = [],
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateAdventureAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(new AdventureListItem {
            Id = expectedResponse.Id,
            Name = expectedResponse.Name,
            OwnerId = expectedResponse.OwnerId,
            Description = expectedResponse.Description,
            Type = expectedResponse.Type,
            IsPublished = expectedResponse.IsPublished,
            IsPublic = expectedResponse.IsPublic,
            ScenesCount = expectedResponse.Scenes.Count,
        });
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
        var client = new AdventuresHttpClient(httpClient, _options);

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
            IsPublished = true,
            IsPublic = true,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Patch);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AdventuresHttpClient(httpClient, _options);

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
            IsPublished = true,
            IsPublic = true,
        };

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AdventuresHttpClient(httpClient, _options);

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
        var client = new AdventuresHttpClient(httpClient, _options);

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
        var client = new AdventuresHttpClient(httpClient, _options);

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
                                 new() { Id = Guid.NewGuid(), Name = "Scene 1"},
                                 new() { Id = Guid.NewGuid(), Name = "Scene 2"},
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.GetScenesAsync(adventureId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Should().BeEquivalentTo(new SceneListItem {
            Id = expectedScenes[0].Id,
            Name = expectedScenes[0].Name,
        });
        result[1].Should().BeEquivalentTo(new SceneListItem {
            Id = expectedScenes[1].Id,
            Name = expectedScenes[1].Name,
        });
    }

    [Fact]
    public async Task CreateSceneAsync_WhenSuccessful_ReturnsSceneId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var expectedResponse = new Scene {
            Id = sceneId,
            Name = "New Scene",
            Description = "Scene description",
            OwnerId = Guid.NewGuid(),
            IsPublished = false,
            Stage = new() {
                Background = new() {
                    Id = Guid.NewGuid(),
                    Type = ResourceType.Image,
                    Path = "/test/path.jpg",
                    Metadata = new() {
                        ImageSize = new(800, 600),
                        ContentType = "image/jpeg",
                        FileName = "test.jpg",
                        FileLength = 1024
                    }
                },
                ZoomLevel = 1.0f,
                Panning = new(0, 0)
            },
            Grid = new() {
                Type = GridType.Square,
                CellSize = new Vector2(50, 50),
                Offset = new Vector2(0, 0),
                Snap = true
            },
            Assets = []
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateSceneAsync(adventureId);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(expectedResponse.Name);
        result.Value.Description.Should().Be(expectedResponse.Description);
    }

    [Fact]
    public async Task DeleteSceneAsync_WhenSuccessful_ReturnsTrue() {
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
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.DeleteSceneAsync(adventureId, sceneId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CloneSceneAsync_WhenSuccessful_ReturnsClonedSceneId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var expectedResponse = new Scene {
            Id = sceneId,
            Name = "Updated Scene",
            Description = "Updated description",
            OwnerId = Guid.NewGuid(),
            IsPublished = false,
            Stage = new() {
                Background = new() {
                    Id = Guid.NewGuid(),
                    Type = ResourceType.Image,
                    Path = "/test/cloned.jpg",
                    Metadata = new() {
                        ImageSize = new(1024, 768),
                        ContentType = "image/jpeg",
                        FileName = "cloned.jpg",
                        FileLength = 2048
                    }
                },
                ZoomLevel = 1.5f,
                Panning = new(10, 20)
            },
            Grid = new() {
                Type = GridType.HexV,
                CellSize = new Vector2(60, 60),
                Offset = new Vector2(5, 5),
                Snap = false
            },
            Assets = []
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}/scenes/clone/{templateId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.CloneSceneAsync(adventureId, templateId);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Name.Should().Be(expectedResponse.Name);
    }

    [Fact]
    public async Task CloneAdventureAsync_WhenSuccessful_ReturnsClonedAdventureId() {
        // Arrange
        var adventureId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var expectedResponse = new Adventure {
            Id = Guid.NewGuid(),
            Name = "Updated Adventure",
            OwnerId = ownerId,
            Type = AdventureType.Survival,
            Description = "Cloned description",
            IsPublished = false,
            IsPublic = false,
            Scenes = [],
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/adventures/{adventureId}");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new AdventuresHttpClient(httpClient, _options);

        // Act
        var result = await client.CloneAdventureAsync(adventureId);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(new AdventureListItem {
            Id = expectedResponse.Id,
            Name = expectedResponse.Name,
            OwnerId = expectedResponse.OwnerId,
            Description = expectedResponse.Description,
            Type = expectedResponse.Type,
            IsPublished = expectedResponse.IsPublished,
            IsPublic = expectedResponse.IsPublic,
            ScenesCount = expectedResponse.Scenes.Count,
        });
    }
}