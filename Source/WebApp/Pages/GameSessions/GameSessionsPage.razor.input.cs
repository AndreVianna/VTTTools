namespace VttTools.WebApp.Pages.GameSessions;

internal class GameSessionsInputModel {
    public string Subject { get; set; } = string.Empty;

    internal ICollection<Adventure> Adventures { get; set; } = [];
    internal Guid AdventureId { get; set; } = Guid.Empty;

    internal ICollection<Scene> Scenes { get; set; } = [];
    internal Guid SceneId { get; set; } = Guid.Empty;

    public InputError[] Errors { get; set; } = [];
}