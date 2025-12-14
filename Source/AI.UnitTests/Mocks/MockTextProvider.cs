namespace VttTools.AI.Mocks;

public class MockTextProvider : ITextProvider {
    public string Name { get; set; } = "OpenAi";
    public TextGenerationResponse? ResponseToReturn { get; set; }
    public string? ErrorToReturn { get; set; }
    public TextGenerationData? LastData { get; private set; }

    public Task<Result<TextGenerationResponse>> GenerateAsync(TextGenerationData data, CancellationToken ct = default) {
        LastData = data;
        if (ErrorToReturn != null)
            return Task.FromResult(Result.Failure<TextGenerationResponse>(null!, ErrorToReturn));

        var response = ResponseToReturn ?? new TextGenerationResponse {
            GeneratedText = "Generated text response",
            ContentType = data.ContentType,
            Provider = Name,
            Model = data.Model ?? "gpt-4o",
            InputTokens = 100,
            OutputTokens = 50,
            Cost = 0.001m,
            Elapsed = TimeSpan.FromMilliseconds(500),
        };
        return Task.FromResult(Result.Success(response));
    }
}
