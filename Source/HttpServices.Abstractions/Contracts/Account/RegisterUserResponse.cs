namespace HttpServices.Abstractions.Contracts.Account;

public sealed record RegisterUserResponse {
    public required string UserId { get; init; }

    public bool RequiresConfirmation { get; set; }
}