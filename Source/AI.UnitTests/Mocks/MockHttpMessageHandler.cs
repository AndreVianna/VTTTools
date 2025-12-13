
namespace VttTools.AI.UnitTests.Mocks;

public class MockHttpMessageHandler : HttpMessageHandler {
    private HttpStatusCode _statusCode = HttpStatusCode.OK;
    private string _responseContent = string.Empty;

    public void SetupResponse(HttpStatusCode statusCode) {
        _statusCode = statusCode;
        _responseContent = string.Empty;
    }

    public void SetupResponse<T>(HttpStatusCode statusCode, T content) {
        _statusCode = statusCode;
        _responseContent = JsonSerializer.Serialize(content);
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {
        var response = new HttpResponseMessage(_statusCode);

        if (!string.IsNullOrEmpty(_responseContent)) {
            response.Content = new StringContent(_responseContent, Encoding.UTF8, "application/json");
        }

        return Task.FromResult(response);
    }
}
