namespace VttTools.WebApp.Contracts.Library.Scenes;

public sealed record SceneListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
