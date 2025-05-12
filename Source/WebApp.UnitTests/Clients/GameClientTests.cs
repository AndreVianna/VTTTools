namespace VttTools.WebApp.Clients;

public class GameClientTests {
    [Fact]
    public async Task GetGameSessionsAsync_WhenApiReturnsGameSessions_ReturnsGameSessionArray() {
        // Arrange
        var expectedGameSessions = new GameSession[]
        {
            new() { Title = "GameSession 1", OwnerId = Guid.NewGuid() },
            new() { Title = "GameSession 2", OwnerId = Guid.NewGuid() },
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
        var client = new GameClient(httpClient);

        // Act
        var result = await client.GetGameSessionsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedGameSessions);
    }

    [Fact]
    public async Task GetGameSessionsAsync_WhenApiReturnsNull_ReturnsEmptyArray() {
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
        var client = new GameClient(httpClient);

        // Act
        var result = await client.GetGameSessionsAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetGameSessionsAsync_WhenApiCallFails_ThrowsException() {
        // Arrange
        var mockHandler = new MockHttpMessageHandler((_, _) => Task.FromException<HttpResponseMessage>(new HttpRequestException("Network error")));

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameClient(httpClient);

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
        var expectedResponse = new GameSession {
            Id = sessionId,
            Title = "New GameSession",
            OwnerId = Guid.NewGuid(),
            SceneId = sceneId,
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
        var client = new GameClient(httpClient);

        // Act
        var result = await client.CreateGameSessionAsync(request);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(expectedResponse);
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
        var client = new GameClient(httpClient);

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
        var expectedResponse = new GameSession {
            Id = sessionId,
            Title = "Updated GameSession",
            SceneId = request.SceneId.Value,
        };

        var mockHandler = new MockHttpMessageHandler((requestMessage, _) => {
            requestMessage.Method.Should().Be(HttpMethod.Put);
            requestMessage.RequestUri!.PathAndQuery.Should().Be($"/api/sessions/{sessionId}");

            var response = new HttpResponseMessage(HttpStatusCode.OK) {
                Content = JsonContent.Create(expectedResponse),
            };
            return Task.FromResult(response);
        });

        var httpClient = new HttpClient(mockHandler) {
            BaseAddress = new("http://host.com"),
        };
        var client = new GameClient(httpClient);

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
        var client = new GameClient(httpClient);

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
        var client = new GameClient(httpClient);

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
        var client = new GameClient(httpClient);

        // Act
        var result = await client.DeleteGameSessionAsync(sessionId);

        // Assert
        result.Should().BeFalse();
    }
}