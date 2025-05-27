namespace VttTools.Assets.ApiContracts;

public record CloneAssetRequest
    : Request {
    public Optional<string> Name { get; init; }
    public Optional<Display> Display { get; set; }
}
