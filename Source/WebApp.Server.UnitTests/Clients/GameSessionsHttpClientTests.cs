namespace VttTools.WebApp.Clients;

public class GameSessionsHttpClientTests {
    private static readonly JsonSerializerOptions _options = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = {
                new JsonStringEnumConverter(),
                new OptionalConverterFactory(),
            },
    };

    [Fact]
    public async Task GetGameSessionsAsync_WhenApiReturnsGameSessions_ReturnsGameSessionArray() {
        // Arrange
        var owner1 = Guid.NewGuid();
        var owner2 = Guid.NewGuid();
        var expectedGameSessions = new GameSession[] {
            new() { Id = Guid.NewGuid(), Title = "GameSession 1", OwnerId = owner1, Status = GameSessionStatus.Draft, Players = [] },
            new() { Id = Guid.NewGuid(), Title = "GameSession 2", OwnerId = owner2, Status = GameSessionStatus.Draft, Players = [] },
        };

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/sessions");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedGameSessions),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.GetGameSessionsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Should().BeEquivalentTo(new GameSessionListItem {
            Id = expectedGameSessions[0].Id,
            Title = expectedGameSessions[0].Title,
            OwnerId = expectedGameSessions[0].OwnerId,
            Status = expectedGameSessions[0].Status,
            PlayerCount = expectedGameSessions[0].Players.Count,
        });
        result[1].Should().BeEquivalentTo(new GameSessionListItem {
            Id = expectedGameSessions[1].Id,
            Title = expectedGameSessions[1].Title,
            OwnerId = expectedGameSessions[1].OwnerId,
            Status = expectedGameSessions[1].Status,
            PlayerCount = expectedGameSessions[1].Players.Count,
        });
    }

    [Fact]
    public async Task GetGameSessionsAsync_WhenApiReturnsNull_ThrowsArgumentNullException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Get);
            request.RequestUri!.PathAndQuery.Should().Be("/api/sessions");
            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create<GameSession[]>(null!),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act & Assert
        // NOTE: Implementation uses IsNotNull() which throws ArgumentNullException for null API responses
        var act = client.GetGameSessionsAsync;
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task GetGameSessionsAsync_WhenApiCallFails_ThrowsException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((_, _) => Task.FromException<HttpResponseMessage>(new HttpRequestException("Network error")));

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act & Assert
        var act = client.GetGameSessionsAsync;
        await act.Should().ThrowAsync<HttpRequestException>().WithMessage("Network error");
    }

    [Fact]
    public async Task CreateGameSessionAsync_WhenSuccessful_ReturnsGameSessionId() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var sceneId = Guid.NewGuid();
        var request = new CreateGameSessionRequest {
            Title = "New GameSession",
            SceneId = sceneId,
        };
        var ownerId = Guid.NewGuid();
        var expectedResponse = new GameSession {
            Id = sessionId,
            Title = "New GameSession",
            OwnerId = ownerId,
            SceneId = sceneId,
            Status = GameSessionStatus.Draft,
            Players = [],
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Post);
            requestMessage.RequestUri!.PathAndQuery.Should().Be("/api/sessions");

            var response = new HttpResponseMessage(HttpStatusCode.Created) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateGameSessionAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(new GameSessionListItem {
            Id = expectedResponse.Id,
            Title = expectedResponse.Title,
            OwnerId = expectedResponse.OwnerId,
            Status = expectedResponse.Status,
            PlayerCount = expectedResponse.Players.Count,
        });
    }

    [Fact]
    public async Task CreateGameSessionAsync_WhenFails_ReturnsFailureResult() {
        // Arrange
        var request = new CreateGameSessionRequest {
            Title = "New GameSession",
            SceneId = Guid.NewGuid(),
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
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.CreateGameSessionAsync(request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors[0].Message.Should().Be("Failed to create session.");
    }

    [Fact]
    public async Task UpdateGameSessionAsync_WhenSuccessful_ReturnsSuccessResult() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var request = new UpdateGameSessionRequest {
            Title = "Updated GameSession",
            SceneId = Guid.NewGuid(),
        };
        var ownerId = Guid.NewGuid();
        var expectedResponse = new GameSession {
            Id = sessionId,
            Title = "Updated GameSession",
            OwnerId = ownerId,
            SceneId = request.SceneId.Value,
            Status = GameSessionStatus.Draft,
            Players = [],
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Patch);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/sessions/{sessionId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.UpdateGameSessionAsync(sessionId, request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateGameSessionAsync_WhenFails_ReturnsFailureResult() {
        // Arrange
        var sessionId = Guid.NewGuid();
        var request = new UpdateGameSessionRequest {
            Title = "Updated GameSession",
            SceneId = Guid.NewGuid(),
        };

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.UpdateGameSessionAsync(sessionId, request);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(1);
        result.Errors[0].Message.Should().Be("Failed to update session.");
    }

    [Fact]
    public async Task DeleteGameSessionAsync_WhenSuccessful_ReturnsTrue() {
        // Arrange
        var sessionId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((request, _) => {
            request.Method.Should().Be(HttpMethod.Delete);
            request.RequestUri!.PathAndQuery.Should().Be($"/api/sessions/{sessionId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.DeleteGameSessionAsync(sessionId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteGameSessionAsync_WhenFails_ReturnsFalse() {
        // Arrange
        var sessionId = Guid.NewGuid();

        var mockHandler = new MockHttpMessageHandler((_, _) => {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameSessionsHttpClient(httpClient, _options);

        // Act
        var result = await client.DeleteGameSessionAsync(sessionId);

        // Assert
        result.Should().BeFalse();
    }
}