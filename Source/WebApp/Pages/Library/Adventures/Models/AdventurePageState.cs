namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal class AdventurePageState {
    internal AdventureInputModel Input { get; set; } = new();
    internal AdventureInputModel Original { get; set; } = new();

    public SceneListItem[] Scenes { get; set; } = [];
    public InputError[] Errors { get; set; } = [];

    public bool UnsavedChangesModalIsVisible { get; set; }
    public bool DeleteConfirmationModalIsVisible { get; set; }
    public bool DeleteSceneConfirmationModalIsVisible { get; set; }

    public Guid SceneToDelete { get; set; }
    public string? PendingNavigationUrl { get; set; }

    public DetailsPageMode Mode { get; set; }

    public bool HasChanges
        => Input.Name != Original.Name
        || Input.Description != Original.Description
        || Input.Type != Original.Type
        || Input.ImagePath != Original.ImagePath
        || Input.IsVisible != Original.IsVisible
        || Input.IsPublic != Original.IsPublic;
}