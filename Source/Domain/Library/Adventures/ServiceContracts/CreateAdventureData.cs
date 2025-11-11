namespace VttTools.Library.Adventures.ServiceContracts;

public record CreateAdventureData
    : Data {
    public Guid? WorldId { get; init; }
    public Guid? CampaignId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public AdventureStyle Style { get; init; }
    public Guid? BackgroundId { get; init; }
    public bool IsOneShot { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The adventure name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The adventure description cannot be null or empty.", nameof(Description));
        return result;
    }
}