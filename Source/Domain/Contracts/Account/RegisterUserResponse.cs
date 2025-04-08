namespace Domain.Contracts.Account;

public sealed record RegisterUserResponse {
    public required Guid Id { get; init; }
    public bool RequiresConfirmation { get; set; }
}