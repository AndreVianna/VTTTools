namespace VttTools.Http;

public sealed class InternalApiKeyHandler(IOptions<InternalApiOptions> options)
    : DelegatingHandler {
    private readonly InternalApiOptions _options = options.Value;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {
        if (!string.IsNullOrEmpty(_options.ApiKey))
            request.Headers.Add("X-Api-Key", _options.ApiKey);

        if (!string.IsNullOrEmpty(_options.ServiceName))
            request.Headers.Add("X-Service-Name", _options.ServiceName);

        return base.SendAsync(request, cancellationToken);
    }
}