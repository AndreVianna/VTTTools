namespace HttpServices.Abstractions.Contracts.Account;

public sealed record FindUserResponse {
    public required string Id { get; init; }
    public required string Identifier { get; init; }
    public required string Email { get; init; }
    public string? UserName { get; init; }
    public string? Name { get; init; }
}
