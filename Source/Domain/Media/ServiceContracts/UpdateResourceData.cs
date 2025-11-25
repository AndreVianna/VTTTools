namespace VttTools.Media.ServiceContracts;

public record UpdateResourceData
    : Data {
    public Optional<string?> Description { get; init; }
    public Optional<Map<HashSet<string>>> Attributes { get; set; }
}