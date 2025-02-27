namespace HttpServices.Abstractions.Contracts.SignIn;

public sealed record PasswordSignInRequest : IValidatable {
    public required string Email { get; init; }
    public required string Password { get; init; }
    public bool RememberMe { get; init; }
    public string? ReturnUrl { get; init; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Email)) {
            result += new Error("Email is required.", nameof(Email));
        }
        else {
            if (!Email.IsValidEmail())
                result += new Error("Email is invalid.", nameof(Email));
        }
        if (string.IsNullOrWhiteSpace(Password))
            result += new Error("Password is required.", nameof(Password));
        return result;
    }
}
