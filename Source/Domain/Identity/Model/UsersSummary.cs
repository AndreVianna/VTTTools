namespace VttTools.Identity.Model;

public record UsersSummary {
    public required int TotalUsers { get; init; }
    public required int TotalAdministrators { get; init; }
    public required int LockedUsers { get; init; }
    public required int UnconfirmedEmails { get; init; }
}