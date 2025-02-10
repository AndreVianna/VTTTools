namespace HttpServices.Abstractions.Contracts.Client;

public sealed record GenerateTokenRequest : IValidatable {
    public required string ClientId { get; set; }
    public required string ClientSecret { get; set; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(ClientId))
            result += new ValidationError("ClientId is required.", nameof(ClientId));
        if (string.IsNullOrWhiteSpace(ClientSecret))
            result += new ValidationError("ClientSecret is required.", nameof(ClientSecret));
        return result;
    }
}
