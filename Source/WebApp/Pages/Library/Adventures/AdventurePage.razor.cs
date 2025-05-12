namespace VttTools.WebApp.Pages.Library.Adventures;

public partial class AdventurePage {
    [Parameter]
    public string Action { get; set; } = "view";

    [Parameter]
    public string? Id { get; set; }

    private AdventureInputModel Adventure { get; set; } = new();
    private AdventureInputModel OriginalAdventure { get; set; } = new();
    private bool IsLoading { get; set; } = true;
    private bool IsShowingDeleteConfirmation { get; set; }
    private bool IsShowingDeleteSceneConfirmation { get; set; }
    private bool IsShowingUnsavedChangesConfirmation { get; set; }
    private Guid SceneToDelete { get; set; }
    private string? PendingNavigation { get; set; }
    private List<InputError> ValidationErrors { get; set; } = [];

    private bool IsCreateMode => Action.Equals("create", StringComparison.OrdinalIgnoreCase);
    private bool IsEditMode => Action.Equals("edit", StringComparison.OrdinalIgnoreCase)
                            || Action.Equals("clone", StringComparison.OrdinalIgnoreCase);
    private bool IsViewMode => Action.Equals("view", StringComparison.OrdinalIgnoreCase);
    private bool IsCloneMode => Action.Equals("clone", StringComparison.OrdinalIgnoreCase);

    private string PageTitle => (IsCreateMode, IsEditMode, IsCloneMode) switch {
        (true, _, _) => "Create Adventure",
        (_, true, false) => "Edit Adventure",
        (_, _, true) => "Clone Adventure",
        _ => "Adventure",
    };

    private bool HasChanges => !Adventure.Equals(OriginalAdventure);

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();

        if (IsCreateMode) {
            IsLoading = false;
            return;
        }

        if (Id == null || !Guid.TryParse(Id, out var adventureId)) {
            IsLoading = false;
            return;
        }

        try {
            IsLoading = true;

            var adventure = await LibraryClient.GetAdventureByIdAsync(adventureId);
            if (adventure != null) {
                // Map from domain model to input model
                Adventure = new() {
                    Id = adventure.Id,
                    Name = adventure.Name,
                    Description = adventure.Description,
                    Type = adventure.Type,
                    ImagePath = adventure.ImagePath,
                    IsVisible = adventure.IsVisible,
                    IsPublic = adventure.IsPublic,
                };

                // For a clone, change the name and clear the ID
                if (IsCloneMode) {
                    Adventure.Id = Guid.Empty;
                    Adventure.Name += " (Copy)";
                    Adventure.IsVisible = false;
                    Adventure.IsPublic = false;
                }

                // Keep original values for dirty checking
                OriginalAdventure = new() {
                    Id = Adventure.Id,
                    Name = Adventure.Name,
                    Description = Adventure.Description,
                    Type = Adventure.Type,
                    ImagePath = Adventure.ImagePath,
                    IsVisible = Adventure.IsVisible,
                    IsPublic = Adventure.IsPublic,
                    CampaignId = Adventure.CampaignId,
                                          };
            }
        }
        finally {
            IsLoading = false;
        }
    }

    private void NavigateBack() {
        if (HasChanges) {
            IsShowingUnsavedChangesConfirmation = true;
            PendingNavigation = "/adventures";
        }
        else {
            NavigationManager.NavigateTo("/adventures");
        }
    }

    private void NavigateTo(string url) {
        if (HasChanges) {
            IsShowingUnsavedChangesConfirmation = true;
            PendingNavigation = url;
        }
        else {
            NavigationManager.NavigateTo(url);
        }
    }

    private async Task SaveChanges() {
        // Validate before sending to server
        ValidationErrors.Clear();
        var context = new ValidationContext(Adventure);
        var results = new List<ValidationResult>();

        if (!Validator.TryValidateObject(Adventure, context, results, true)) {
            foreach (var result in results) {
                ValidationErrors.Add(new(result.ErrorMessage ?? "Validation error", [.. result.MemberNames]));
            }
            return;
        }

        if (IsCreateMode || IsCloneMode) {
            var request = new CreateAdventureRequest {
                Name = Adventure.Name,
                Description = Adventure.Description,
                Type = Adventure.Type,
                ImagePath = Adventure.ImagePath,
                IsVisible = Adventure.IsVisible,
                IsPublic = Adventure.IsPublic,
                CampaignId = Adventure.CampaignId,
                                                     };

            var result = await LibraryClient.CreateAdventureAsync(request);
            if (result.IsSuccessful) {
                NavigationManager.NavigateTo($"/adventure/view/{result.Value.Id}");
            }
            else {
                ValidationErrors = [.. result.Errors];
            }
        }
        else if (IsEditMode) {
            var request = new UpdateAdventureRequest {
                Name = Adventure.Name != OriginalAdventure.Name ? Adventure.Name : VttTools.Utilities.Optional<string>.None,
                Description = Adventure.Description != OriginalAdventure.Description ? Adventure.Description : VttTools.Utilities.Optional<string>.None,
                Type = Adventure.Type != OriginalAdventure.Type ? Adventure.Type : VttTools.Utilities.Optional<AdventureType>.None,
                IsVisible = Adventure.IsVisible != OriginalAdventure.IsVisible ? Adventure.IsVisible : VttTools.Utilities.Optional<bool>.None,
                IsPublic = Adventure.IsPublic != OriginalAdventure.IsPublic ? Adventure.IsPublic : VttTools.Utilities.Optional<bool>.None,
            };

            var result = await LibraryClient.UpdateAdventureAsync(Adventure.Id, request);
            if (result.IsSuccessful) {
                // Update original values to reflect saved state
                OriginalAdventure = new() {
                    Id = Adventure.Id,
                    Name = Adventure.Name,
                    Description = Adventure.Description,
                    Type = Adventure.Type,
                    ImagePath = Adventure.ImagePath,
                    IsVisible = Adventure.IsVisible,
                    IsPublic = Adventure.IsPublic,
                    CampaignId = Adventure.CampaignId,
                                          };

                // If we were handling a pending navigation
                if (!string.IsNullOrEmpty(PendingNavigation)) {
                    NavigationManager.NavigateTo(PendingNavigation);
                    PendingNavigation = null;
                }
            }
            else {
                ValidationErrors = [.. result.Errors];
            }
        }
    }

    private void DiscardChanges() {
        // Reset to original values
        Adventure = new() {
            Id = OriginalAdventure.Id,
            Name = OriginalAdventure.Name,
            Description = OriginalAdventure.Description,
            Type = OriginalAdventure.Type,
            ImagePath = OriginalAdventure.ImagePath,
            IsVisible = OriginalAdventure.IsVisible,
            IsPublic = OriginalAdventure.IsPublic,
            CampaignId = OriginalAdventure.CampaignId,
                          };

        ValidationErrors.Clear();
    }

    private void ShowDeleteConfirmation() => IsShowingDeleteConfirmation = true;

    private void HideDeleteConfirmation() => IsShowingDeleteConfirmation = false;

    private async Task DeleteAdventure() {
        HideDeleteConfirmation();
        if (Adventure.Id == Guid.Empty)
            return;
        var deleted = await LibraryClient.DeleteAdventureAsync(Adventure.Id);
        if (deleted)
            NavigationManager.NavigateTo("/adventures");
    }

    private void ShowDeleteSceneConfirmation(Guid sceneId) {
        SceneToDelete = sceneId;
        IsShowingDeleteSceneConfirmation = true;
    }

    private void HideDeleteSceneConfirmation() {
        IsShowingDeleteSceneConfirmation = false;
        SceneToDelete = Guid.Empty;
    }

    private async Task DeleteScene() {
        if (SceneToDelete == Guid.Empty || Adventure.Id == Guid.Empty)
            return;

        try {
            // TODO: Implement scene deletion when scene endpoints are available
            //var deleted = await LibraryClient.DeleteSceneAsync(Adventure.Id, SceneToDelete);

            // Reload the adventure to refresh the scenes list
            await OnInitializedAsync();
        }
        finally {
            HideDeleteSceneConfirmation();
        }
    }

    private async Task SaveAndContinue() {
        await SaveChanges();

        if (ValidationErrors.Count == 0 && !string.IsNullOrEmpty(PendingNavigation)) {
            NavigationManager.NavigateTo(PendingNavigation);
            PendingNavigation = null;
            IsShowingUnsavedChangesConfirmation = false;
        }
    }

    private void ContinueWithoutSaving() {
        if (!string.IsNullOrEmpty(PendingNavigation)) {
            NavigationManager.NavigateTo(PendingNavigation);
            PendingNavigation = null;
        }

        IsShowingUnsavedChangesConfirmation = false;
    }
}