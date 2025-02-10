namespace HttpServices.Abstractions.Contracts.Account;

public record RegisterUserRequest : IValidatable {
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Password { get; set; }
    public required string ConfirmationUrl { get; set; }
    public string? ReturnUrl { get; set; }

    public virtual Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Email)) {
            result += new ValidationError("Email is required.", nameof(Email));
        }
        else {
            if (!Email.IsValidEmail())
                result += new ValidationError("Email is invalid.", nameof(Email));
        }
        if (string.IsNullOrWhiteSpace(Password)) {
            result += new ValidationError("Password is required.", nameof(Password));
        }
        if (string.IsNullOrWhiteSpace(ConfirmationUrl))
            result += new ValidationError("Confirmation URL is required.", nameof(ConfirmationUrl));
        return result;
    }
}