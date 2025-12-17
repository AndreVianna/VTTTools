namespace VttTools.Http;

public sealed class InternalApiKeyHandler(
    IOptions<InternalApiOptions> options,
    ILogger<InternalApiKeyHandler> logger)
    : DelegatingHandler {
    private readonly InternalApiOptions _options = options.Value;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) {

        var hasApiKey = !string.IsNullOrEmpty(_options.ApiKey);
        var hasServiceName = !string.IsNullOrEmpty(_options.ServiceName);

        logger.LogInformation(
            "Sending internal API request - HasApiKey: {HasApiKey}, ServiceName: {ServiceName}, Uri: {Uri}",
            hasApiKey,
            _options.ServiceName,
            request.RequestUri);

        if (hasApiKey)
            request.Headers.Add("X-Api-Key", _options.ApiKey);

        if (hasServiceName)
            request.Headers.Add("X-Service-Name", _options.ServiceName);

        return base.SendAsync(request, cancellationToken);
    }
}
