namespace WebApp.Services;

public class GameServiceClient(HttpClient client) {
    public HttpClient HttpClient { get; } = client;
    // Add methods here to call your API endpoints
}