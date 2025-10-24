namespace VttTools.Library.Adventures.ServiceContracts;

public record UpdatedAdventureData
    : Data {
    public Optional<Guid?> CampaignId { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<AdventureStyle> Style { get; init; }
    public Optional<Guid?> BackgroundId { get; init; }
    public Optional<bool> IsOneShot { get; init; }
    public Optional<bool> IsListed { get; init; }
    public Optional<bool> IsPublic { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the adventure name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the adventure description cannot be null or empty.", nameof(Description));
        return result;
    }
}