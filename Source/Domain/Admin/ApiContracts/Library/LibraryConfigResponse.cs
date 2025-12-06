namespace VttTools.Domain.Admin.ApiContracts.Library;

public sealed record LibraryConfigResponse : Response {
    public required Guid MasterUserId { get; init; }
}