namespace HttpServices.Abstractions.Contracts.Client;

public sealed record GenerateTokenRequest : IValidatable {
    public string? Name { get; set; }
    public required string ClientId { get; set; }
    public required string ClientSecret { get; set; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(ClientId))
            result += new Error("ClientId is required.", nameof(ClientId));
        if (string.IsNullOrWhiteSpace(ClientSecret))
            result += new Error("ClientSecret is required.", nameof(ClientSecret));
        return result;
    }
}
