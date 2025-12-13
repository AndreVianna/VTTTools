namespace VttTools.Admin.Users.ApiContracts;

public sealed record UserStatsResponse : Response {
    public required int TotalAdministrators { get; init; }
    public required int TotalUsers { get; init; }
    public required int LockedUsers { get; init; }
    public required int UnconfirmedEmails { get; init; }
}