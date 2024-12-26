namespace Domain.Contracts.Account;

public sealed record RegisterUserRequest {
    public required string Name { get; set; }
    public required string Email { get; init; }
    public required string Password { get; set; }
    public required string ConfirmationPage { get; set; }
    public string? ReturnUrl { get; set; }
}