namespace HttpServices.Identity.Contracts;

public sealed record PasswordSignInRequest
    : IValidatable {
    public required string Identifier { get; init; }
    public IdentifierType IdentifierType { get; init; } = IdentifierType.Email;
    public required string Password { get; init; }
    public string[] Claims { get; init; } = [];
    public bool RememberMe { get; init; }
    public string? ReturnUrl { get; init; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Identifier))
            result += new Error("The identifier is required.", nameof(Identifier));
        else if (IdentifierType == IdentifierType.Email && !Identifier.IsValidEmail())
            result += new Error("The identifier must be a valid email.", nameof(Identifier));
        else if (IdentifierType == IdentifierType.UserName && !Identifier.IsValidUserName())
            result += new Error("The identifier must be a valid username.", nameof(Identifier));
        if (string.IsNullOrWhiteSpace(Password))
            result += new Error("Password is required.", nameof(Password));
        return result;
    }
}