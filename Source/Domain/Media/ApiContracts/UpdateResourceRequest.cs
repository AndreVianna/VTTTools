namespace VttTools.Media.ApiContracts;

public record UpdateResourceRequest
    : Request {
    public Optional<ListPatcher<string>> Tags { get; init; }
}