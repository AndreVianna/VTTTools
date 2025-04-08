namespace Domain.Contracts.Account;

public sealed record FindUserResponse {
    public required Guid Id { get; init; }
    public required string Identifier { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public string? PhoneNumber { get; init; }
}
