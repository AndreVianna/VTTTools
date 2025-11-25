namespace VttTools.Media.ApiContracts;

public record UpdateResourceRequest
    : Request {
    public Optional<string?> Description { get; init; }
    public Optional<ListPatcher<string>> Tags { get; init; }
}