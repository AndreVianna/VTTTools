namespace HttpServices.Abstractions.Contracts.Account;

public sealed record RegisterUserResponse {
    public required string Id { get; init; }

    public bool RequiresConfirmation { get; set; }
}