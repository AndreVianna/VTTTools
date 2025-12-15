using VttTools.MediaGenerator.Infrastructure.Clients.OpenAi;

namespace VttTools.AssetImageManager.Infrastructure.Clients.OpenAi;

public class OpenAiHttpClientHelperTests {
    private readonly IHttpClientFactory _httpClientFactory = Substitute.For<IHttpClientFactory>();
    private readonly IConfiguration _config = Substitute.For<IConfiguration>();
    private readonly OpenAiHttpClientHelper _helper;

    public OpenAiHttpClientHelperTests() {
        _helper = new OpenAiHttpClientHelper(_httpClientFactory, _config);
    }

    [Fact]
    public void CreateAuthenticatedClient_WithValidConfig_ReturnsConfiguredClient() {
        _config["Providers:OpenAI:BaseUrl"].Returns("https://api.openai.com");
        _config["Providers:OpenAI:ApiKey"].Returns("test-api-key");
        _httpClientFactory.CreateClient().Returns(new HttpClient());

        var result = _helper.CreateAuthenticatedClient();

        result.Should().NotBeNull();
        result.BaseAddress.Should().Be(new Uri("https://api.openai.com"));
        result.DefaultRequestHeaders.Authorization.Should().NotBeNull();
        result.DefaultRequestHeaders.Authorization!.Scheme.Should().Be("Bearer");
        result.DefaultRequestHeaders.Authorization.Parameter.Should().Be("test-api-key");
    }

    [Fact]
    public void CreateAuthenticatedClient_WithMissingBaseUrl_ThrowsException() {
        _config["Providers:OpenAI:BaseUrl"].Returns((string?)null);
        _httpClientFactory.CreateClient().Returns(new HttpClient());

        var act = () => _helper.CreateAuthenticatedClient();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*base url not configured*");
    }

    [Fact]
    public void CreateAuthenticatedClient_WithMissingApiKey_ThrowsException() {
        _config["Providers:OpenAI:BaseUrl"].Returns("https://api.openai.com");
        _config["Providers:OpenAI:ApiKey"].Returns((string?)null);
        _httpClientFactory.CreateClient().Returns(new HttpClient());

        var act = () => _helper.CreateAuthenticatedClient();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*API key is not configured*");
    }

    [Fact]
    public void GetEndpoint_WithValidModel_ReturnsEndpoint() {
        _config["Providers:OpenAI:gpt-5"].Returns("/v1/chat/completions");

        var result = _helper.GetEndpoint("gpt-5");

        result.Should().Be("/v1/chat/completions");
    }

    [Fact]
    public void GetEndpoint_WithMissingModel_ThrowsException() {
        _config["Providers:OpenAI:unknown-model"].Returns((string?)null);

        var act = () => _helper.GetEndpoint("unknown-model");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*endpoint is not configured*");
    }

    [Fact]
    public void GetTextPricingCalculator_WithGpt51_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetTextPricingCalculator("gpt-5.1");

        calculator.InputCostPerM.Should().Be(1.25);
        calculator.OutputCostPerM.Should().Be(10.0);
    }

    [Fact]
    public void GetTextPricingCalculator_WithGpt5_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetTextPricingCalculator("gpt-5");

        calculator.InputCostPerM.Should().Be(1.25);
        calculator.OutputCostPerM.Should().Be(10.0);
    }

    [Fact]
    public void GetTextPricingCalculator_WithGpt5Mini_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetTextPricingCalculator("gpt-5-mini");

        calculator.InputCostPerM.Should().Be(0.25);
        calculator.OutputCostPerM.Should().Be(2.0);
    }

    [Fact]
    public void GetTextPricingCalculator_WithGpt5Nano_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetTextPricingCalculator("gpt-5-nano");

        calculator.InputCostPerM.Should().Be(0.05);
        calculator.OutputCostPerM.Should().Be(0.40);
    }

    [Fact]
    public void GetTextPricingCalculator_WithUnknownModel_ThrowsException() {
        var act = () => OpenAiHttpClientHelper.GetTextPricingCalculator("unknown-model");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Unknown model*");
    }

    [Fact]
    public void GetImagePricingCalculator_WithGptImage1_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetImagePricingCalculator("gpt-image-1");

        calculator.InputCostPerM.Should().Be(10.0);
        calculator.OutputCostPerM.Should().Be(40.0);
    }

    [Fact]
    public void GetImagePricingCalculator_WithGptImage1Mini_ReturnsCorrectPricing() {
        var calculator = OpenAiHttpClientHelper.GetImagePricingCalculator("gpt-image-1-mini");

        calculator.InputCostPerM.Should().Be(2.5);
        calculator.OutputCostPerM.Should().Be(8.0);
    }

    [Fact]
    public void GetImagePricingCalculator_WithUnknownModel_ThrowsException() {
        var act = () => OpenAiHttpClientHelper.GetImagePricingCalculator("unknown-model");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Unknown model*");
    }
}

public class OpenAiPricingCalculatorTests {
    [Fact]
    public void Calculate_WithZeroTokens_ReturnsZeroCost() {
        var calculator = new OpenAiPricingCalculator(1.25, 10.0);

        var result = calculator.Calculate(0, 0);

        result.InputTokens.Should().Be(0);
        result.OutputTokens.Should().Be(0);
        result.TotalTokens.Should().Be(0);
        result.InputCost.Should().Be(0);
        result.OutputCost.Should().Be(0);
        result.TotalCost.Should().Be(0);
    }

    [Fact]
    public void Calculate_WithInputTokensOnly_CalculatesCorrectCost() {
        var calculator = new OpenAiPricingCalculator(1.25, 10.0);

        var result = calculator.Calculate(1000000, 0);

        result.InputTokens.Should().Be(1000000);
        result.OutputTokens.Should().Be(0);
        result.TotalTokens.Should().Be(1000000);
        result.InputCost.Should().BeApproximately(1.25, 0.001);
        result.OutputCost.Should().Be(0);
        result.TotalCost.Should().BeApproximately(1.25, 0.001);
    }

    [Fact]
    public void Calculate_WithOutputTokensOnly_CalculatesCorrectCost() {
        var calculator = new OpenAiPricingCalculator(1.25, 10.0);

        var result = calculator.Calculate(0, 1000000);

        result.InputTokens.Should().Be(0);
        result.OutputTokens.Should().Be(1000000);
        result.TotalTokens.Should().Be(1000000);
        result.InputCost.Should().Be(0);
        result.OutputCost.Should().BeApproximately(10.0, 0.001);
        result.TotalCost.Should().BeApproximately(10.0, 0.001);
    }

    [Fact]
    public void Calculate_WithBothTokenTypes_CalculatesCorrectCost() {
        var calculator = new OpenAiPricingCalculator(1.25, 10.0);

        var result = calculator.Calculate(500000, 500000);

        result.InputTokens.Should().Be(500000);
        result.OutputTokens.Should().Be(500000);
        result.TotalTokens.Should().Be(1000000);
        result.InputCost.Should().BeApproximately(0.625, 0.001);
        result.OutputCost.Should().BeApproximately(5.0, 0.001);
        result.TotalCost.Should().BeApproximately(5.625, 0.001);
    }

    [Fact]
    public void Calculate_WithSmallTokenCounts_CalculatesCorrectCost() {
        var calculator = new OpenAiPricingCalculator(1.25, 10.0);

        var result = calculator.Calculate(100, 100);

        result.InputTokens.Should().Be(100);
        result.OutputTokens.Should().Be(100);
        result.TotalTokens.Should().Be(200);
        result.InputCost.Should().BeApproximately(0.000125, 0.000001);
        result.OutputCost.Should().BeApproximately(0.001, 0.000001);
        result.TotalCost.Should().BeApproximately(0.001125, 0.000001);
    }
}
