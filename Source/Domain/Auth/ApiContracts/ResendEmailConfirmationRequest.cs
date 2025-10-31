namespace VttTools.Auth.ApiContracts;

public record ResendEmailConfirmationRequest : Request {
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; init; } = string.Empty;
}
