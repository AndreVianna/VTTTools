namespace VttTools.WebApp.Pages.Library.Scenes.Models;

internal class ScenesPageState {
    internal Guid AdventureId { get; set; }
    internal List<Scene> Scenes { get; set; } = [];

    internal ScenesInputModel CreateInput { get; set; } = new();

    internal bool IsEditing { get; set; }
    internal ScenesInputModel EditInput { get; set; } = new();
    public InputError[] Errors { get; set; } = [];
}