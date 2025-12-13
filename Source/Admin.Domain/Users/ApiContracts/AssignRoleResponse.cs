namespace VttTools.Admin.Users.ApiContracts;

public sealed record AssignRoleResponse : Response {
    public required bool Success { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
}