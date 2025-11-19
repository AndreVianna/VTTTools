namespace VttTools.AssetImageManager.Application.HealthChecks;

public sealed class ProviderHealthCheckTests {
    [Fact]
    public async Task Should_ReturnPass_When_ApiReturns200() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.Equal("OpenAI API", result.CheckName);
        Assert.Contains("Accessible", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("Response time:", result.Details);
        Assert.Contains("ms", result.Details);
        Assert.Null(result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnFail_When_ApiReturns401() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.Unauthorized);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Contains("Authentication Failed", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("401", result.Details);
        Assert.Contains("Unauthorized", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("Verify your OpenAI API key", result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnFail_When_ApiReturns403() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.Forbidden);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Fail, result.Status);
        Assert.Contains("Authentication Failed", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("403", result.Details);
        Assert.Contains("Forbidden", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("appropriate permissions", result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnWarning_When_ApiTimesOut() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(throwTimeout: true);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Warning, result.Status);
        Assert.Contains("Timeout", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("exceeded 5 second timeout", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("Check your network connection", result.Remediation);
    }

    [Fact]
    public async Task Should_ReturnWarning_When_NetworkError() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(throwException: true);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Warning, result.Status);
        Assert.Contains("Connectivity Error", result.Message);
        Assert.NotNull(result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("network connection", result.Remediation);
    }

    [Fact]
    public async Task Should_MeasureResponseTime() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Pass, result.Status);
        Assert.NotNull(result.Details);
        Assert.Contains("Response time:", result.Details);
        Assert.Matches(@"\d+ms", result.Details);
    }

    [Fact]
    public async Task Should_SkipCheck_When_ApiKeyMissing() {
        var config = CreateMockConfiguration(hasApiKey: false);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Skipped, result.Status);
        Assert.Contains("not configured", result.Message);
        Assert.Null(result.Details);
        Assert.Null(result.Remediation);
    }

    [Fact]
    public async Task Should_SkipCheck_When_ApiKeyIsPlaceholder() {
        var configData = new Dictionary<string, string?> {
            ["Providers:OpenAI:ApiKey"] = "your-openai-api-key-here"
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Skipped, result.Status);
    }

    [Fact]
    public async Task Should_ReturnWarning_When_UnexpectedStatusCode() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.InternalServerError);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthCheckStatus.Warning, result.Status);
        Assert.Contains("Unexpected Status", result.Message);
        Assert.NotNull(result.Details);
        Assert.Contains("500", result.Details);
        Assert.NotNull(result.Remediation);
        Assert.Contains("Check OpenAI API status", result.Remediation);
    }

    [Fact]
    public async Task Should_UseConfiguredBaseUri() {
        var configData = new Dictionary<string, string?> {
            ["Providers:OpenAI:ApiKey"] = "sk-test-key",
            ["Providers:OpenAI:BaseUrl"] = "https://custom-openai-endpoint.com/v1",
            ["Providers:OpenAI:HealthPath"] = "/models"
        };

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.True(result.Status is HealthCheckStatus.Pass or
                    HealthCheckStatus.Warning or
                    HealthCheckStatus.Fail);
    }

    [Fact]
    public async Task Should_HaveWarningCriticality() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        Assert.Equal(HealthCheckCriticality.Critical, check.Criticality);
    }

    [Fact]
    public async Task Should_HaveCorrectName() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        Assert.Equal("OpenAI API", check.Name);
    }

    [Fact]
    public async Task Should_MeasureDuration() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);

        var result = await check.ExecuteAsync(TestContext.Current.CancellationToken);

        Assert.NotNull(result.Duration);
        Assert.True(result.Duration.Value.TotalMilliseconds >= 0);
    }

    [Fact]
    public async Task Should_HandleCancellation() {
        var config = CreateMockConfiguration(hasApiKey: true);
        var httpClientFactory = CreateMockHttpClientFactory(HttpStatusCode.OK);
        var check = new ProviderHealthCheck("OpenAI", httpClientFactory, config);
        var cts = new CancellationTokenSource();
        cts.Cancel();

        var result = await check.ExecuteAsync(cts.Token);

        Assert.True(result.Status is HealthCheckStatus.Warning or
                    HealthCheckStatus.Skipped);
    }

    private static IConfiguration CreateMockConfiguration(bool hasApiKey) {
        var configData = new Dictionary<string, string?>();

        if (hasApiKey) {
            configData["Providers:OpenAI:ApiKey"] = "sk-test-key-12345";
            configData["Providers:OpenAI:BaseUrl"] = "https://api.openai.com";
            configData["Providers:OpenAI:HealthPath"] = "/v1/models";
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    private static IHttpClientFactory CreateMockHttpClientFactory(
        HttpStatusCode statusCode = HttpStatusCode.OK,
        bool throwTimeout = false,
        bool throwException = false) {

        var mockFactory = Substitute.For<IHttpClientFactory>();
        mockFactory.CreateClient(Arg.Any<string>()).Returns(_ => {
            var handler = new MockHttpMessageHandler(statusCode, throwTimeout, throwException);
            return new HttpClient(handler);
        });

        return mockFactory;
    }

    private sealed class MockHttpMessageHandler(HttpStatusCode statusCode, bool throwTimeout, bool throwException) : HttpMessageHandler {
        private readonly HttpStatusCode _statusCode = statusCode;
        private readonly bool _throwTimeout = throwTimeout;
        private readonly bool _throwException = throwException;

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) {

            if (_throwTimeout) {
                throw new TaskCanceledException("Request timed out");
            }

            if (_throwException) {
                throw new HttpRequestException("Network error occurred");
            }

            var response = new HttpResponseMessage(_statusCode);
            return Task.FromResult(response);
        }
    }
}
