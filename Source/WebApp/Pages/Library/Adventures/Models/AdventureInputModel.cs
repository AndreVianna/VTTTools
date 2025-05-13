namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed class AdventureInputModel {
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdventureType Type { get; set; } = AdventureType.OpenWorld;
    public string? ImagePath { get; set; }
    public bool IsVisible { get; set; }
    public bool IsPublic { get; set; }
}