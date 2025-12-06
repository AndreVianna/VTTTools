namespace VttTools.Domain.Admin.ApiContracts;

public sealed record UnlockUserResponse : Response {
    public required bool Success { get; init; }
}