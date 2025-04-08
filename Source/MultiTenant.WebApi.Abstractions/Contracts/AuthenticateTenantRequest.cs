namespace WebApi.Contracts;

public sealed record AuthenticateTenantRequest
    : IValidatable {
    public required string Identifier { get; init; }
    public required string Secret { get; init; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Identifier))
            result += new Error($"The '{nameof(Identifier)}' is required.", nameof(Identifier));
        if (string.IsNullOrWhiteSpace(Secret))
            result += new Error($"The '{nameof(Secret)}' is required.", nameof(Secret));
        return result;
    }
}