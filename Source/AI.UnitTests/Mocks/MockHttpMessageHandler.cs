namespace VttTools.AI.Mocks;

public class MockHttpMessageHandler(HttpStatusCode statusCode)
    : HttpMessageHandler {
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {
        var response = new HttpResponseMessage(statusCode);
        return Task.FromResult(response);
    }
}

public class MockHttpMessageHandler<T>(HttpStatusCode statusCode, T content)
    : HttpMessageHandler
    where T : notnull {
    private readonly string _responseContent = JsonSerializer.Serialize(content);

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {
        var response = new HttpResponseMessage(statusCode) {
            Content = new StringContent(_responseContent, Encoding.UTF8, "application/json")
        };
        return Task.FromResult(response);
    }
}
