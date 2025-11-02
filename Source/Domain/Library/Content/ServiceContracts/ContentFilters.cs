
namespace VttTools.Library.Content.ServiceContracts;

public record ContentFilters {
    public Guid? After { get; init; }
    public int Limit { get; init; } = 20;

    public ContentType? ContentType { get; init; }

    public bool? IsOneShot { get; init; }
    public int? MinSceneCount { get; init; }
    public int? MaxSceneCount { get; init; }

    public AdventureStyle? Style { get; init; }

    public bool? IsPublished { get; init; }
    public string? Search { get; init; }
    public string? Owner { get; init; }
}