namespace HttpServices.Abstractions.Contracts.Account;

public sealed record FindUserResponse {
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
}
