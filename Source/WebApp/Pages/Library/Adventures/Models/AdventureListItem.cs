namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed record AdventureListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdventureType Type { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public int ScenesCount { get; set; }
    public Guid OwnerId { get; set; }
    public string? ImageUrl { get; set; }
}