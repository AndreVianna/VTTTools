using VttTools.WebApp.Contracts.Library.Scenes;

namespace VttTools.WebApp.Contracts.Library.Adventure;

public sealed class AdventureDetails {
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdventureType Type { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
    public SceneListItem[] Scenes { get; set; } = [];
}