namespace WebApi.Contracts;

public sealed record PasswordSignInRequest
    : IValidatable {
    public required string Identifier { get; init; }
    public required string Password { get; init; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Identifier))
            result += new Error("The identifier is required.", nameof(Identifier));
        if (string.IsNullOrWhiteSpace(Password))
            result += new Error("Password is required.", nameof(Password));
        return result;
    }
}