using VttTools.WebApp.Contracts.Library.Adventure;
using VttTools.WebApp.Contracts.Library.Scenes;

namespace VttTools.WebApp.Pages.Game.Schedule;

internal class GameSessionsInputModel {
    public string Subject { get; set; } = string.Empty;

    internal ICollection<AdventureListItem> Adventures { get; set; } = [];
    internal Guid AdventureId { get; set; } = Guid.Empty;

    internal ICollection<SceneListItem> Scenes { get; set; } = [];
    internal Guid SceneId { get; set; } = Guid.Empty;

    public InputError[] Errors { get; set; } = [];
}