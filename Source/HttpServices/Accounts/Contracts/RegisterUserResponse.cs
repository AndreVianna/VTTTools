namespace HttpServices.Accounts.Contracts;

public sealed record RegisterUserResponse {
    public required string Id { get; init; }
    public bool RequiresAccountConfirmation { get; set; }
    public string? AccountConfirmationToken { get; set; }
}