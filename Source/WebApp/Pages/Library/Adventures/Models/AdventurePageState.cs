namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal class AdventurePageState {
    public DetailsPageMode Mode { get; set; }
    internal AdventureInputModel Original { get; set; } = new();
    internal AdventureInputModel Input { get; set; } = new();
    internal string? ImageUrl { get; set; }
    public InputError[] Errors { get; set; } = [];

    public bool DeleteConfirmationModalIsVisible { get; set; }

    public bool DeleteSceneConfirmationModalIsVisible { get; set; }
    public Guid SceneToDelete { get; set; }

    public bool HasChanges
        => Input.Name != Original.Name
        || Input.Description != Original.Description
        || Input.Type != Original.Type
        || Input.IsPublished != Original.IsPublished
        || Input.IsPublic != Original.IsPublic;
    public bool PendingChangesModalIsVisible { get; set; }
    public Func<Task> PendingAction { get; set; } = null!;
}