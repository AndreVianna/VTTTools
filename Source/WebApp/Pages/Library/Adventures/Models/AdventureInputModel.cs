namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed class AdventureInputModel {
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdventureType Type { get; set; }
    public bool IsListed { get; set; }
    public bool IsPublic { get; set; }
}