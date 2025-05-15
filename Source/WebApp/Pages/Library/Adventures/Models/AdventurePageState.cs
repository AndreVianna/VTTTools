namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal class AdventurePageState {
    internal AdventureInputModel Input { get; set; } = new();
    internal AdventureInputModel Original { get; set; } = new();
    internal string? ImageUrl { get; set; }

    public SceneListItem[] Scenes { get; set; } = [];
    public InputError[] Errors { get; set; } = [];

    public bool UnsavedChangesModalIsVisible { get; set; }
    public bool DeleteConfirmationModalIsVisible { get; set; }
    public bool DeleteSceneConfirmationModalIsVisible { get; set; }
    public bool DiscardChangesModalIsVisible { get; set; }

    public Guid SceneToDelete { get; set; }
    public string? PendingNavigationUrl { get; set; }

    public DetailsPageMode Mode { get; set; }

    public bool HasChanges
        => Input.Name != Original.Name
        || Input.Description != Original.Description
        || Input.Type != Original.Type
        || Input.IsListed != Original.IsListed
        || Input.IsPublic != Original.IsPublic;
}