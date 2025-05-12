namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed class AdventureListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdventureType Type { get; set; } = AdventureType.OpenWorld;
    public string? ImagePath { get; set; }
    public bool IsVisible { get; set; }
    public bool IsPublic { get; set; }
    public int ScenesCount { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsOwned => OwnerId == Guid.Empty; // This will be set properly in handler
}