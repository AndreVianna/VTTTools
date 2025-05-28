using VttTools.WebApp.Contracts.Library.Adventure;
using VttTools.WebApp.Server.Shared.Models;

namespace VttTools.WebApp.Server.Pages.Library.Adventure.Details;

internal class AdventurePageState {
    public DetailsPageMode Mode { get; set; }
    internal string? ImageUrl { get; set; }

    internal AdventureDetails Original { get; set; } = new();
    internal AdventureDetails Input { get; set; } = new();
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
    public string NextPage { get; set; } = string.Empty;
    public bool ExecutePendingAction { get; set; }
    public bool SaveChanges { get; set; }
}