namespace VttTools.AI.UnitTests.Mocks;

public class MockTextProvider : ITextProvider {
    public AiProviderType ProviderType { get; set; } = AiProviderType.OpenAi;
    public TextGenerationResponse? ResponseToReturn { get; set; }
    public string? ErrorToReturn { get; set; }
    public TextGenerationData? LastData { get; private set; }

    public Task<Result<TextGenerationResponse>> GenerateAsync(TextGenerationData data, CancellationToken ct = default) {
        LastData = data;
        if (ErrorToReturn != null)
            return Task.FromResult(Result.Failure<TextGenerationResponse>(null!, ErrorToReturn));

        var response = ResponseToReturn ?? new TextGenerationResponse {
            GeneratedText = "Generated text response",
            Category = data.Category,
            Provider = ProviderType,
            Model = data.Model ?? "gpt-4o",
            InputTokens = 100,
            OutputTokens = 50,
            TotalTokens = 150,
            Cost = 0.001m,
            Duration = TimeSpan.FromMilliseconds(500),
        };
        return Task.FromResult(Result.Success(response));
    }
}
