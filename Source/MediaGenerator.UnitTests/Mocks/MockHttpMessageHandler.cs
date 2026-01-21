namespace VttTools.AssetImageManager.Mocks;

public sealed class MockHttpMessageHandler : HttpMessageHandler {
    private HttpStatusCode _statusCode = HttpStatusCode.OK;
    private string? _responseContent;
    private byte[]? _responseBytes;
    private string _contentType = "application/json";
    private Exception? _exceptionToThrow;

    public string LastRequestContent { get; private set; } = string.Empty;

    public void SetResponse(HttpStatusCode statusCode, string content, string contentType = "application/json") {
        _statusCode = statusCode;
        _responseContent = content;
        _responseBytes = null;
        _contentType = contentType;
        _exceptionToThrow = null;
    }

    public void SetResponse(HttpStatusCode statusCode, byte[] content, string contentType = "application/octet-stream") {
        _statusCode = statusCode;
        _responseBytes = content;
        _responseContent = null;
        _contentType = contentType;
        _exceptionToThrow = null;
    }

    public void SetException(Exception exception) => _exceptionToThrow = exception;

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
        if (request.Content != null) {
            LastRequestContent = await request.Content.ReadAsStringAsync(cancellationToken);
        }

        if (_exceptionToThrow != null) {
            throw _exceptionToThrow;
        }

        var response = new HttpResponseMessage(_statusCode);

        if (_responseBytes != null) {
            response.Content = new ByteArrayContent(_responseBytes);
            response.Content.Headers.ContentType = new(_contentType);
        }
        else if (_responseContent != null) {
            response.Content = new StringContent(_responseContent, System.Text.Encoding.UTF8, _contentType);
        }

        return response;
    }
}