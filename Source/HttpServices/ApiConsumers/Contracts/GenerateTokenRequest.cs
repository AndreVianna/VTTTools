namespace HttpServices.ApiConsumers.Contracts;

public sealed record GenerateTokenRequest : IValidatable {
    public string? Name { get; set; }
    public required string ApiConsumerId { get; set; }
    public required string ApiConsumerSecret { get; set; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(ApiConsumerId))
            result += new Error("ApiConsumerId is required.", nameof(ApiConsumerId));
        if (string.IsNullOrWhiteSpace(ApiConsumerSecret))
            result += new Error("ApiConsumerSecret is required.", nameof(ApiConsumerSecret));
        return result;
    }
}
