namespace VttTools.Domain.Admin.ApiContracts.Library;

public sealed record LibraryContentSearchResponse : Response {
    public required IReadOnlyList<LibraryContentResponse> Content { get; init; }
    public required int TotalCount { get; init; }
    public required bool HasMore { get; init; }
}
