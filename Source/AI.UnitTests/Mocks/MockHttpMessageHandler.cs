namespace VttTools.AI.Mocks;

public class MockHttpMessageHandler : HttpMessageHandler {
    private readonly HttpStatusCode? _defaultStatusCode;

    public HttpResponseMessage? ResponseToReturn { get; set; }
    public string? LastRequestContent { get; private set; }

    public MockHttpMessageHandler() { }

    public MockHttpMessageHandler(HttpStatusCode statusCode) {
        _defaultStatusCode = statusCode;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {
        if (request.Content is not null) {
            LastRequestContent = await request.Content.ReadAsStringAsync(cancellationToken);
        }

        return ResponseToReturn is not null ? ResponseToReturn : new HttpResponseMessage(_defaultStatusCode ?? HttpStatusCode.OK);
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