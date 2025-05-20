namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed record SceneListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
