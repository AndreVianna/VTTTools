namespace Domain.Contracts.Account;

public sealed record RegisterUserRequest : IValidatable {
    public required string Name { get; set; }
    public required string Email { get; init; }
    public required string Password { get; set; }
    public required string ConfirmationUrl { get; set; }
    public string? ReturnUrl { get; set; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("Type is required.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Email)) {
            result += new Error("Email is required.", nameof(Email));
        }
        else {
            if (!Email.IsValidEmail())
                result += new Error("Email is invalid.", nameof(Email));
        }
        if (string.IsNullOrWhiteSpace(Password)) {
            result += new Error("Password is required.", nameof(Password));
        }
        if (string.IsNullOrWhiteSpace(ConfirmationUrl))
            result += new Error("Confirmation URL is required.", nameof(ConfirmationUrl));
        return result;
    }
}