namespace VttTools.Media.Model;

public sealed record ResourceClassification(
    string ContentKind,
    string Category,
    string Type,
    string? Subtype) {
    public ResourceClassification() : this(string.Empty, string.Empty, string.Empty, null) { }
}