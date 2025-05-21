namespace VttTools.WebApp.Pages.Library.Adventure.Details;

public sealed record SceneListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
