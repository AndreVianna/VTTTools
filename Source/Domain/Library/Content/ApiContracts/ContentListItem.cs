
namespace VttTools.Library.Content.ApiContracts;

public record ContentListItem {
    public Guid Id { get; init; }
    public ContentType Type { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsPublished { get; init; }
    public Guid OwnerId { get; init; }

    public AdventureStyle? Style { get; init; }
    public bool? IsOneShot { get; init; }
    public int? SceneCount { get; init; }
    public Resource? Background { get; init; }
}