namespace VttTools.Auth.ApiContracts;

public record LoginRequest : Request {
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; init; } = string.Empty;

    public bool RememberMe { get; init; }
}