namespace WebApp.Services;

public class GameServiceClient {
    public GameServiceClient(HttpClient client) {
        HttpClient = client;
    }

    public HttpClient HttpClient { get; }
    // Add methods here to call your API endpoints
}