namespace WebApi.Contracts;

public sealed record SignOutRequest
    : IValidatable {
    public required string Identifier { get; init; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Identifier))
            result += new Error("The identifier is required.", nameof(Identifier));
        return result;
    }
}
