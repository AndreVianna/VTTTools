namespace Domain.Contracts.SignIn;

public sealed record PasswordSignInRequest : IValidatable {
    public required string Email { get; init; }
    public required string Password { get; init; }
    public bool RememberMe { get; init; }
    public string? ReturnUrl { get; init; }

    public Result Validate(IMap? context = null) {
        var result = new Result();
        if (string.IsNullOrWhiteSpace(Email)) {
            result += new ValidationError("Email is required.", nameof(Email));
        }
        else {
            if (!Email.IsValidEmail())
                result += new ValidationError("Email is invalid.", nameof(Email));
        }
        if (string.IsNullOrWhiteSpace(Password))
            result += new ValidationError("Password is required.", nameof(Password));
        return result;
    }
}
