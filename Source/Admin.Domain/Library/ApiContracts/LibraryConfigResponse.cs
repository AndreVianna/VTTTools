namespace VttTools.Admin.Library.ApiContracts;

public sealed record LibraryConfigResponse : Response {
    public required Guid MasterUserId { get; init; }
}